from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    threads_app_id: str = ""
    threads_app_secret: str = ""
    threads_access_token: str = ""
    threads_user_id: str = ""
    api_base_url: str = "https://graph.threads.net/v1.0"

    # 토큰 갱신
    token_file: str = "data/token.json"

    # 이메일
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_to: str = ""

    # 상태 저장
    state_file: str = "data/state.json"
    rate_limit_file: str = "data/rate_limit.json"

    # 댓글 처리
    comments_summary_threshold: int = 50

    model_config = {"env_file": ".env", "env_prefix": ""}
