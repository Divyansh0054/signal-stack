import pytest
from backend.app.services.web_extractor import is_safe_url


def test_valid_public_https_url():
    is_safe, reason = is_safe_url("https://www.meetuniversity.com")
    assert is_safe is True
    assert "safe" in reason.lower()


def test_ssrf_blocked_localhost():
    is_safe, reason = is_safe_url("http://localhost:8000")
    assert is_safe is False
    assert "blocked" in reason.lower() or "prohibited" in reason.lower()


def test_ssrf_blocked_loopback_ip():
    is_safe, reason = is_safe_url("http://127.0.0.1:8080/admin")
    assert is_safe is False
    assert "prohibited" in reason.lower() or "blocked" in reason.lower()


def test_ssrf_blocked_private_network():
    is_safe, reason = is_safe_url("http://192.168.1.1/secret")
    assert is_safe is False
    assert "private" in reason.lower() or "prohibited" in reason.lower()


def test_invalid_scheme():
    is_safe, reason = is_safe_url("ftp://ftp.example.com/file")
    assert is_safe is False
    assert "scheme" in reason.lower()
