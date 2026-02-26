import logging
import re


class TokenMaskingFilter(logging.Filter):
    PATTERN = re.compile(r"(access_token[=:]\s*)[^\s&\"']+")

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = self.PATTERN.sub(r"\1[REDACTED]", record.msg)
        if record.args:
            sanitized = []
            for arg in record.args:
                if isinstance(arg, str):
                    sanitized.append(
                        self.PATTERN.sub(r"\1[REDACTED]", arg)
                    )
                else:
                    sanitized.append(arg)
            record.args = tuple(sanitized)
        return True


def setup_logging(level: int = logging.INFO) -> None:
    logger = logging.getLogger("howzero_threads")
    logger.setLevel(level)

    handler = logging.StreamHandler()
    handler.setLevel(level)
    formatter = logging.Formatter(
        "[%(asctime)s] %(name)s %(levelname)s: %(message)s"
    )
    handler.setFormatter(formatter)
    handler.addFilter(TokenMaskingFilter())

    logger.addHandler(handler)
