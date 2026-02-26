import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from howzero_threads.config import Settings

logger = logging.getLogger("howzero_threads.notifier.email")


def send_email(
    subject: str,
    body_html: str,
    settings: Settings | None = None,
) -> None:
    """HTML 이메일을 발송한다. TLS를 강제한다."""
    settings = settings or Settings()

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_user
    msg["To"] = settings.email_to
    msg.attach(MIMEText(body_html, "html"))

    context = ssl.create_default_context()
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls(context=context)
        server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(
            settings.smtp_user, settings.email_to, msg.as_string()
        )

    logger.info("이메일 발송 완료: %s → %s", subject, settings.email_to)
