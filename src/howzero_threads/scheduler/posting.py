import logging

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from howzero_threads.api.auth import TokenManager
from howzero_threads.api.client import ThreadsClient
from howzero_threads.api.posts import create_post
from howzero_threads.config import Settings
from howzero_threads.notifier.email import send_email
from howzero_threads.pipeline.comments_to_email import run as run_pipeline
from howzero_threads.store.rate_limiter import RateLimiter

logger = logging.getLogger("howzero_threads.scheduler")


class HowzeroScheduler:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or Settings()
        self.client = ThreadsClient(self.settings)
        self.token_manager = TokenManager(self.settings)
        self.rate_limiter = RateLimiter(self.settings.rate_limit_file)
        self.scheduler = BlockingScheduler()

    def add_posting_job(
        self,
        cron: str,
        text: str,
        image_url: str | None = None,
    ) -> None:
        self.scheduler.add_job(
            self._safe_post,
            CronTrigger.from_crontab(cron),
            args=[text],
            kwargs={"image_url": image_url},
            max_instances=1,
            misfire_grace_time=300,
        )

    def add_comment_pipeline_job(
        self,
        media_ids: list[str],
        interval_minutes: int = 30,
    ) -> None:
        self.scheduler.add_job(
            self._run_comment_pipelines,
            IntervalTrigger(minutes=interval_minutes),
            args=[media_ids],
            max_instances=1,
            misfire_grace_time=600,
        )

    def add_token_refresh_job(self) -> None:
        self.scheduler.add_job(
            self._refresh_token,
            CronTrigger(hour=3, minute=0),
            max_instances=1,
        )

    def _safe_post(
        self, text: str, image_url: str | None = None
    ) -> None:
        if not self.rate_limiter.can_post():
            logger.warning("Rate limit 도달. 포스팅 스킵: %s", text[:30])
            return
        try:
            create_post(self.client, text, image_url=image_url)
            self.rate_limiter.record()
            logger.info(
                "포스팅 완료 (남은 횟수: %d): %s",
                self.rate_limiter.remaining(),
                text[:30],
            )
        except Exception:
            logger.exception("포스팅 실패: %s", text[:30])

    def _run_comment_pipelines(self, media_ids: list[str]) -> None:
        for media_id in media_ids:
            try:
                count = run_pipeline(media_id, self.client, self.settings)
                logger.info(
                    "댓글 파이프라인 완료: media_id=%s, 신규=%d건",
                    media_id,
                    count,
                )
            except Exception:
                logger.exception(
                    "댓글 파이프라인 실패: media_id=%s", media_id
                )

    def _refresh_token(self) -> None:
        try:
            new_token = self.token_manager.ensure_valid_token()
            self.client.update_access_token(new_token)
            logger.info("토큰 확인/갱신 완료")
        except Exception:
            logger.exception("토큰 갱신 실패")
            try:
                send_email(
                    "[Threads] 토큰 갱신 실패 알림",
                    "<p>Threads API 토큰 갱신에 실패했습니다. 수동 확인이 필요합니다.</p>",
                    self.settings,
                )
            except Exception:
                logger.exception("토큰 갱신 실패 알림 이메일 발송도 실패")

    def start(self) -> None:
        logger.info(
            "스케줄러 시작. 등록된 작업: %d건",
            len(self.scheduler.get_jobs()),
        )
        self.scheduler.start()
