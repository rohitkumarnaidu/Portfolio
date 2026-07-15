import pytest
from app.middleware.pii_filter import PIIFilterMiddleware, sanitize_text


def test_sanitize_email():
    result = sanitize_text("Contact me at test@example.com")
    assert "[EMAIL]" in result
    assert "test@example.com" not in result


def test_sanitize_phone():
    result = sanitize_text("Call +1-234-567-8900")
    assert "[PHONE]" in result


def test_sanitize_ssn():
    result = sanitize_text("SSN: 123-45-6789")
    assert "[SSN]" in result
