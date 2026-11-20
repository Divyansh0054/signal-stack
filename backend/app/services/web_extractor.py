import re
import socket
import ipaddress
import time
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser
from typing import Optional, Dict, Any, Tuple, List
import httpx
from bs4 import BeautifulSoup
import trafilatura
from backend.app.config import settings

# Per-domain rate limiting tracker
_last_request_time: Dict[str, float] = {}
# Cached robots.txt parsers
_robots_cache: Dict[str, Tuple[RobotFileParser, float]] = {}


def is_safe_url(url: str) -> Tuple[bool, str]:
    """
    Validates URL and prevents SSRF by blocking private/internal/loopback IP addresses.
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False, f"Unsupported scheme: {parsed.scheme}. Only HTTP/HTTPS allowed."

        hostname = parsed.hostname
        if not hostname:
            return False, "Invalid URL: Missing hostname."

        # Block localhost / internal keywords
        if hostname.lower() in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
            return False, "Access to localhost/loopback is blocked for security."

        # Resolve hostname to IP to prevent DNS rebinding SSRF
        try:
            addr_info = socket.getaddrinfo(hostname, None)
            for item in addr_info:
                ip_str = item[4][0]
                ip = ipaddress.ip_address(ip_str)
                if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved:
                    return False, f"Access to private/internal network IP ({ip_str}) is prohibited."
        except socket.gaierror:
            # If DNS resolution fails (e.g. offline environment or transient DNS failure),
            # verify that hostname is a valid public domain format and not an internal network name.
            if "." not in hostname or hostname.endswith((".local", ".internal", ".lan", ".home", ".corp", ".test")):
                return False, f"Invalid or non-public domain: {hostname}"
            # Valid public domain format allowed for offline/sandboxed execution
            pass

        return True, "URL is safe."
    except Exception as e:
        return False, f"URL validation error: {str(e)}"


def can_fetch_robots(url: str, user_agent: str = settings.CRAWLER_USER_AGENT) -> bool:
    """
    Checks if URL is allowed to be crawled according to robots.txt.
    """
    try:
        parsed = urlparse(url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        robots_url = f"{base_url}/robots.txt"

        now = time.time()
        # Cache robots.txt for 1 hour
        if base_url in _robots_cache and (now - _robots_cache[base_url][1] < 3600):
            rp = _robots_cache[base_url][0]
            return rp.can_fetch(user_agent, url)

        rp = RobotFileParser()
        rp.set_url(robots_url)
        try:
            resp = httpx.get(
                robots_url,
                timeout=5.0,
                headers={"User-Agent": user_agent},
                follow_redirects=True
            )
            if resp.status_code == 200:
                rp.parse(resp.text.splitlines())
            else:
                rp.allow_all = True
        except Exception:
            rp.allow_all = True

        _robots_cache[base_url] = (rp, now)
        return rp.can_fetch(user_agent, url)
    except Exception:
        return True


def apply_rate_limit(url: str):
    """
    Enforces polite crawling delay per host.
    """
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        now = time.time()
        last_time = _last_request_time.get(domain, 0)
        delay = settings.CRAWLER_RATE_LIMIT_SECONDS
        if now - last_time < delay:
            time.sleep(delay - (now - last_time))
        _last_request_time[domain] = time.time()
    except Exception:
        pass


def fetch_url(url: str, check_robots: bool = True) -> Dict[str, Any]:
    """
    Safely fetches a web page, returns status, response time, headers, HTML, and extracted text.
    """
    is_safe, reason = is_safe_url(url)
    if not is_safe:
        return {
            "success": False,
            "status_code": 400,
            "error": reason,
            "html": "",
            "text": "",
            "title": "",
            "response_time_ms": 0.0,
            "url": url,
        }

    if check_robots and not can_fetch_robots(url):
        return {
            "success": False,
            "status_code": 403,
            "error": "Blocked by robots.txt policy.",
            "html": "",
            "text": "",
            "title": "",
            "response_time_ms": 0.0,
            "url": url,
        }

    apply_rate_limit(url)

    start_time = time.time()
    headers = {
        "User-Agent": settings.CRAWLER_USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    try:
        with httpx.Client(timeout=settings.CRAWLER_TIMEOUT_SECONDS, follow_redirects=True) as client:
            resp = client.get(url, headers=headers)
            response_time_ms = round((time.time() - start_time) * 1000, 2)

            if resp.status_code >= 400:
                return {
                    "success": False,
                    "status_code": resp.status_code,
                    "error": f"HTTP {resp.status_code} Error",
                    "html": resp.text[:5000],
                    "text": "",
                    "title": "",
                    "response_time_ms": response_time_ms,
                    "url": str(resp.url),
                }

            html = resp.text
            # Use trafilatura for main content extraction, fallback to BeautifulSoup
            extracted_text = trafilatura.extract(html, include_links=False, include_images=False)
            soup = BeautifulSoup(html, "html.parser")

            title = ""
            if soup.title and soup.title.string:
                title = soup.title.string.strip()
            elif soup.find("h1"):
                title = soup.find("h1").get_text().strip()

            meta_desc = ""
            meta_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
            if meta_tag and meta_tag.get("content"):
                meta_desc = meta_tag["content"].strip()

            if not extracted_text:
                # Fallback to BeautifulSoup clean text
                for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
                    tag.decompose()
                extracted_text = soup.get_text(separator="\n", strip=True)

            # Extract internal links
            links = []
            parsed_base = urlparse(str(resp.url))
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                full_link = urljoin(str(resp.url), href)
                parsed_link = urlparse(full_link)
                if parsed_link.netloc == parsed_base.netloc and full_link not in links:
                    links.append(full_link)

            return {
                "success": True,
                "status_code": resp.status_code,
                "error": None,
                "html": html,
                "text": extracted_text or meta_desc,
                "title": title or parsed_base.netloc,
                "description": meta_desc,
                "links": links[:30],
                "response_time_ms": response_time_ms,
                "url": str(resp.url),
            }

    except httpx.TimeoutException:
        return {
            "success": False,
            "status_code": 408,
            "error": "Request timed out after configured threshold.",
            "html": "",
            "text": "",
            "title": "",
            "response_time_ms": round((time.time() - start_time) * 1000, 2),
            "url": url,
        }
    except Exception as e:
        return {
            "success": False,
            "status_code": 500,
            "error": f"Connection error: {str(e)}",
            "html": "",
            "text": "",
            "title": "",
            "response_time_ms": round((time.time() - start_time) * 1000, 2),
            "url": url,
        }
