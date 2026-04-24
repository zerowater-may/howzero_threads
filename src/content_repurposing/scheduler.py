"""WF5: 예약 게시 — Buffer API를 통한 멀티채널 콘텐츠 스케줄링.

변환된 콘텐츠를 Buffer API를 사용하여 각 채널에 예약 게시한다.
Buffer 미사용 시 Notion 캘린더에 게시 일정만 기록하는 fallback 모드 지원.

Usage:
    python -m content_repurposing.scheduler --content-dir ./output/repurposed/latest/ --mode buffer
    python -m content_repurposing.scheduler --content-dir ./output/repurposed/latest/ --mode dry-run
"""
import argparse
import json
from datetime import datetime, timedelta
from pathlib import Path

import httpx

from .config import RepurposingSettings


# 채널 → Buffer 프로필 매핑 (사용자 환경에 맞게 설정)
CHANNEL_BUFFER_MAP = {
    "threads": "threads",
    "linkedin": "linkedin",
    "x_thread": "twitter",
    "instagram_carousel": "instagram",
}

# 채널별 최적 게시 시간 (KST)
OPTIMAL_POST_TIMES = {
    "naver_blog": {"hour": 9, "minute": 0},      # 오전 출근 시간
    "web_blog_seo": {"hour": 10, "minute": 0},    # 오전 검색 피크
    "linkedin": {"hour": 8, "minute": 30},         # 출근 직전
    "x_thread": {"hour": 12, "minute": 0},         # 점심시간
    "threads": {"hour": 20, "minute": 0},           # 저녁 여가
    "instagram_carousel": {"hour": 19, "minute": 0},# 퇴근 후
    "newsletter": {"hour": 7, "minute": 30},        # 아침 이메일
    "brunch": {"hour": 11, "minute": 0},            # 브런치 독서 시간
}

# 게시 순서 (일~토 배분)
POST_SCHEDULE_DAYS = {
    "linkedin": 0,              # 월요일
    "naver_blog": 1,            # 화요일
    "x_thread": 2,              # 수요일
    "threads": 2,               # 수요일 (X와 같은 날)
    "web_blog_seo": 3,          # 목요일
    "instagram_carousel": 4,    # 금요일
    "newsletter": 5,            # 토요일
    "brunch": 6,                # 일요일
}


def build_schedule(
    content_dir: Path,
    start_date: datetime | None = None,
) -> list[dict]:
    """콘텐츠 디렉토리에서 파일을 읽어 게시 스케줄을 생성한다."""
    if start_date is None:
        # 다음 월요일부터 시작
        today = datetime.now()
        days_until_monday = (7 - today.weekday()) % 7
        if days_until_monday == 0:
            days_until_monday = 7
        start_date = today.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=days_until_monday)

    schedule = []

    for content_file in sorted(content_dir.glob("*.md")):
        if content_file.name.startswith("_"):
            continue

        channel = content_file.stem
        if channel not in POST_SCHEDULE_DAYS:
            continue

        day_offset = POST_SCHEDULE_DAYS[channel]
        post_time = OPTIMAL_POST_TIMES.get(channel, {"hour": 10, "minute": 0})
        scheduled_at = start_date + timedelta(days=day_offset)
        scheduled_at = scheduled_at.replace(hour=post_time["hour"], minute=post_time["minute"])

        content = content_file.read_text(encoding="utf-8")

        schedule.append({
            "channel": channel,
            "scheduled_at": scheduled_at.isoformat(),
            "content_file": str(content_file),
            "content_preview": content[:200] + "..." if len(content) > 200 else content,
            "content_full": content,
            "buffer_profile": CHANNEL_BUFFER_MAP.get(channel),
        })

    schedule.sort(key=lambda x: x["scheduled_at"])
    return schedule


def post_to_buffer(
    schedule_item: dict,
    settings: RepurposingSettings,
) -> dict:
    """Buffer API로 단일 콘텐츠를 예약 게시한다."""
    if not settings.buffer_access_token:
        raise ValueError("REPURPOSE_BUFFER_ACCESS_TOKEN이 설정되지 않았습니다")

    profile_type = schedule_item.get("buffer_profile")
    if not profile_type:
        return {"status": "skipped", "reason": f"Buffer 미지원 채널: {schedule_item['channel']}"}

    # Buffer API로 프로필 목록 조회
    with httpx.Client() as client:
        profiles_resp = client.get(
            "https://api.bufferapp.com/1/profiles.json",
            params={"access_token": settings.buffer_access_token},
            timeout=30,
        )
        profiles_resp.raise_for_status()
        profiles = profiles_resp.json()

    # 매칭 프로필 찾기
    target_profile = None
    for p in profiles:
        if p.get("service") == profile_type:
            target_profile = p
            break

    if not target_profile:
        return {"status": "skipped", "reason": f"Buffer에 {profile_type} 프로필 없음"}

    # 게시 예약
    content = schedule_item["content_full"]
    # Buffer는 텍스트 길이 제한이 있으므로 마크다운 헤더 제거
    clean_content = "\n".join(
        line for line in content.split("\n")
        if not line.startswith("#") and not line.startswith("---")
    ).strip()

    with httpx.Client() as client:
        resp = client.post(
            "https://api.bufferapp.com/1/updates/create.json",
            data={
                "access_token": settings.buffer_access_token,
                "profile_ids[]": target_profile["id"],
                "text": clean_content[:2000],
                "scheduled_at": schedule_item["scheduled_at"],
            },
            timeout=30,
        )
        resp.raise_for_status()
        result = resp.json()

    return {
        "status": "scheduled",
        "buffer_id": result.get("updates", [{}])[0].get("id", "unknown"),
        "profile": profile_type,
        "scheduled_at": schedule_item["scheduled_at"],
    }


def execute_schedule(
    schedule: list[dict],
    mode: str = "dry-run",
    settings: RepurposingSettings | None = None,
) -> list[dict]:
    """스케줄을 실행한다."""
    if settings is None:
        settings = RepurposingSettings()

    results = []
    for item in schedule:
        if mode == "dry-run":
            results.append({
                "channel": item["channel"],
                "scheduled_at": item["scheduled_at"],
                "status": "dry-run",
                "content_preview": item["content_preview"],
            })
        elif mode == "buffer":
            result = post_to_buffer(item, settings)
            result["channel"] = item["channel"]
            results.append(result)
        else:
            raise ValueError(f"지원하지 않는 모드: {mode}")

    return results


def save_schedule(
    schedule: list[dict],
    results: list[dict],
    output_dir: Path,
) -> Path:
    """스케줄 및 결과를 파일로 저장한다."""
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # 스케줄 저장
    schedule_path = output_dir / f"schedule_{timestamp}.json"
    schedule_clean = [{k: v for k, v in s.items() if k != "content_full"} for s in schedule]
    schedule_path.write_text(
        json.dumps(schedule_clean, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # 실행 결과 저장
    results_path = output_dir / f"results_{timestamp}.json"
    results_path.write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # 사람이 읽기 쉬운 요약
    summary_path = output_dir / f"schedule_{timestamp}.md"
    lines = ["# 콘텐츠 게시 스케줄\n"]
    lines.append(f"생성일: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
    lines.append("| 요일 | 시간 | 채널 | 상태 |")
    lines.append("|------|------|------|------|")

    weekdays_kr = ["월", "화", "수", "목", "금", "토", "일"]
    for item, result in zip(schedule, results):
        dt = datetime.fromisoformat(item["scheduled_at"])
        weekday = weekdays_kr[dt.weekday()]
        time_str = dt.strftime("%H:%M")
        status = result.get("status", "unknown")
        lines.append(f"| {weekday} | {time_str} | {item['channel']} | {status} |")

    summary_path.write_text("\n".join(lines), encoding="utf-8")

    print(f"스케줄 저장 완료! {output_dir}")
    print(f"  총 {len(schedule)}개 채널 예약")

    return output_dir


def main():
    parser = argparse.ArgumentParser(description="콘텐츠 예약 게시 스케줄러")
    parser.add_argument("--content-dir", required=True, help="변환된 콘텐츠 디렉토리")
    parser.add_argument("--mode", choices=["buffer", "dry-run"], default="dry-run", help="실행 모드")
    parser.add_argument("--output", default="./output/schedules", help="스케줄 출력 디렉토리")
    args = parser.parse_args()

    content_dir = Path(args.content_dir)
    if not content_dir.exists():
        print(f"오류: {content_dir} 디렉토리가 존재하지 않습니다")
        return

    settings = RepurposingSettings()
    schedule = build_schedule(content_dir)
    results = execute_schedule(schedule, args.mode, settings)
    save_schedule(schedule, results, Path(args.output))


if __name__ == "__main__":
    main()
