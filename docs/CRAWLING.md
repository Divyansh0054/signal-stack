# CRAWLER & MONITORING ENGINE ARCHITECTURE
## Signal Stack — Automated Intelligence Collection Layer

---

## 1. Engine Objectives & Architectural Mandates
The **Signal Stack Monitoring Engine** is designed to continuously observe approved digital sources across Customers, Competitors, and Market categories without resorting to aggressive scraping, bot-network spoofing, or paywalled aggregators.

Key design imperatives:
1. **RFC 9309 Robots.txt Compliance**: Parsing and respecting site-level exclusions before executing any HTTP request.
2. **SSRF Hardening**: Pre-flight IP validation blocking any loopback, internal RFC 1918, or multicast subnet addresses.
3. **Controlled Rate Limiting & Backoff**: Enforcing a minimum 1.5-second inter-request delay per target hostname.
4. **Three-Tier Deduplication**: Filtering identical or derivative developments via URL canonicalization, SHA-256 token hashing, and Jaccard title token clustering.
5. **Continuous Telemetry & Health Tracking**: Recording HTTP status codes, network round-trip latency, failure tallies, and duplicate suppression metrics per source.

---

## 2. Crawler Pipeline Flow

```
[Target Source URL]
        │
        ▼
[SSRF & Host Resolution Check] ──(Private IP / Loopback)──> [ABORT: Security Violation]
        │ (Public IP Validated)
        ▼
[Robots.txt Parser & Cache] ────(Disallowed Path)─────────> [ABORT: Respecting Robots.txt]
        │ (Allowed)
        ▼
[Domain Rate-Limiter (1.5s)]
        │
        ▼
[HTTP GET Request (httpx)]
  ├── Timeout: 12.0s
  ├── Headers: User-Agent: SignalStackBot/1.0
  └── Status Evaluation (200, 301/302, 404, 500)
        │
        ▼
[Format Router]
  ├── XML / Atom / RSS ─────────> [FeedParser Service]
  ├── HTML Public WebPage ───────> [Trafilatura / BeautifulSoup4]
  └── Internal Document Stream ──> [Internal Document Processor]
        │
        ▼
[Extracted Raw Items]
        │
        ▼
[Deduplication Engine]
  ├── URL Normalization (Strip UTM, ref, fbclid)
  ├── SHA-256 Content Hash Comparison
  └── Jaccard Title Similarity (Threshold >= 0.80)
        ├── (Duplicate) ────────> [Mark is_duplicate = True; Increment Source Counter]
        └── (Unique) ───────────> [Save ContentItem; Trigger Intelligence Analysis Engine]
```

---

## 3. Implementation Details

### 3.1 SSRF Validation (`backend/app/services/web_extractor.py`)
All crawled URLs are resolved via `socket.getaddrinfo` to prevent DNS rebinding attacks. Resolved IP addresses are checked against `ipaddress.ip_address(ip).is_private` and `is_loopback`. Requests to `127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, and `169.254.0.0/16` are immediately aborted with HTTP 400.

### 3.2 Feed Parsing & Sanitization (`backend/app/services/feed_parser.py`)
Feeds from regulatory portals (e.g. UKVI, IRCC, Central Bank circulars) and trade media (e.g. The PIE News, Times Higher Education) are processed using `feedparser`. Publication timestamps are parsed via standard dateutil parsers with fallback to ingestion timestamps. HTML markup is stripped using `BeautifulSoup` to produce clean raw text strings and evidence snippets.

### 3.3 Deduplication Algorithms (`backend/app/services/deduplication_engine.py`)
1. **URL Normalization**: Strips parameters matching `utm_*`, `ref`, `fbclid`, `gclid`, `_ga`, downcases scheme and host, and normalizes trailing slashes.
2. **Content Hash**: Generates SHA-256 hash across lowercased, whitespace-collapsed token sequences.
3. **Fuzzy Similarity**: Employs tokenized Jaccard similarity:
   $$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
   If $J(A, B) \ge 0.80$, the item is linked as a duplicate of the original parent signal, preventing repeated alert noise in the executive briefing.

---

## 4. Source Health Lifecycle
Each source transitions through defined health states:
- **HEALTHY**: Last HTTP request returned 200 OK within 5000ms.
- **WARNING**: Experienced 1 or 2 consecutive network timeouts or 5xx server errors.
- **FAILED**: Experienced 3 or more consecutive failures or HTTP 404/410 dead link status.
- **INACTIVE**: Source has produced no new items over a 30-day window or has been manually disabled by an administrator.
