import re
import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings

logger = structlog.get_logger(__name__)

EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+", re.UNICODE)

PHONE_PATTERN = re.compile(
    r"(?:\+?\d{1,3}[-.\s]?)?"       # optional country code
    r"\(?\d{3}\)?[-.\s]?"           # area code
    r"\d{3}[-.\s]?"                 # prefix
    r"\d{4}"                        # line number
    r"(?:\s*(?:ext|x|xtn)\s*\d{1,5})?",  # optional extension
    re.IGNORECASE,
)

IPV4_PATTERN = re.compile(
    r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}"
    r"(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b"
)

IPV6_PATTERN = re.compile(
    r"\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b"
    r"|\b(?:[0-9a-fA-F]{1,4}:){1,7}:"
    r"|\b(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}"
    r"|\b(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}"
    r"|\b(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}"
    r"|\b(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}"
    r"|\b(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}"
    r"|\b[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}"
    r"|\b:(?::[0-9a-fA-F]{1,4}){1,7}:?"
    r"|\bfe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+"
    r"|\b::(?:ffff(?::0{1,4})?:)?(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}"
    r"(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b",
)

CC_PATTERN = re.compile(r"\b(?:\d{4}[-\s]?){3}\d{4}\b")

SSN_PATTERN = re.compile(r"\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b")

API_KEY_PATTERN = re.compile(
    r"\b(sk-[a-zA-Z0-9]{20,}|"
    r"pk-[a-zA-Z0-9]{20,}|"
    r"[Bb]earer\s+[a-zA-Z0-9_\-]{20,}|"
    r"[Aa]pi[_-][Kk]ey[=:]\s*[a-zA-Z0-9_\-]{16,}|"
    r"[Aa][kK][-_]?[sS][kK][-_]?[a-zA-Z0-9]{16,}|"
    r"xox[bpsa]-[a-zA-Z0-9-]{10,})\b",
)


def luhn_check(digits: str) -> bool:
    clean = re.sub(r"\D", "", digits)
    if len(clean) not in (15, 16, 19):
        return False
    total = 0
    reverse = clean[::-1]
    for i, ch in enumerate(reverse):
        n = ord(ch) - 48
        if i % 2 == 1:
            n *= 2
            if n > 9:
                n -= 9
        total += n
    return total % 10 == 0


def sanitize_text(text: str) -> str:
    text = EMAIL_PATTERN.sub("[EMAIL]", text)
    text = PHONE_PATTERN.sub("[PHONE]", text)
    text = SSN_PATTERN.sub("[SSN]", text)
    text = API_KEY_PATTERN.sub("[API_KEY]", text)
    text = IPV4_PATTERN.sub("[IP]", text)
    text = IPV6_PATTERN.sub("[IP]", text)

    def _mask_cc(m: re.Match) -> str:
        raw = m.group(0)
        digits_only = re.sub(r"\D", "", raw)
        if luhn_check(digits_only):
            return "[CC]"
        return raw

    text = CC_PATTERN.sub(_mask_cc, text)
    return text


class PIIFilterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        if not getattr(settings, "PII_FILTER_ENABLED", True):
            return response

        content_type = response.headers.get("content-type", "")
        if "text" not in content_type and "json" not in content_type:
            return response

        body = b""
        async for chunk in response.body_iterator:
            body += chunk

        if not body:
            headers = dict(response.headers)
            headers.pop("content-length", None)
            return Response(content=b"", status_code=response.status_code, headers=headers)

        text = body.decode("utf-8", errors="replace")
        sanitized = sanitize_text(text)

        headers = dict(response.headers)
        headers.pop("content-length", None)

        if sanitized != text:
            logger.info("pii_filtered", original_len=len(body), sanitized_len=len(sanitized))

        return Response(content=sanitized, status_code=response.status_code, headers=headers)
