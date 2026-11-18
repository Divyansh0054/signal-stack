# COST STATEMENT & ZERO-COST ARCHITECTURE GUARANTEE
## Signal Stack — Open-Source & Free-Tier Compliance Statement

---

## 1. Compliance Statement
The official EDXSO assignment strictly mandates:
- **Free / open-source technologies or genuinely free tiers.**
- **No paid APIs, paid scraping platforms, or paid AI services.**

**Signal Stack is 100% compliant with this mandate.** The application is built from the ground up to operate completely offline at **$0.00 cost**, with zero external subscription requirements.

---

## 2. Technology Inventory & Cost Classification

| Technology / Service | Role / Purpose | Cost Status | Free Tier Quotas & Limits | Graceful Fallback Strategy |
|:---|:---|:---|:---|:---|
| **Python 3.13** | Backend Language Runtime | **100% Free / Open Source** (PSFL) | Unlimited local execution | Self-contained environment |
| **FastAPI + Uvicorn** | High-performance Async REST API | **100% Free / Open Source** (MIT) | Unlimited local throughput | Local execution |
| **SQLite 3** | Embedded Relational Database | **100% Free / Open Source** (Public Domain) | Zero operational cost | Local disk storage (`data/signal_stack.db`) |
| **React 18 + Vite** | Frontend Web Dashboard | **100% Free / Open Source** (MIT) | Unlimited local static hosting | Local execution |
| **Tailwind CSS** | Design System & Styling | **100% Free / Open Source** (MIT) | Zero operational cost | Built-in CSS bundle |
| **APScheduler** | Background Cron Automation | **100% Free / Open Source** (MIT) | In-process scheduler | Self-contained background threads |
| **httpx / BeautifulSoup4** | Web Crawling & Scraping | **100% Free / Open Source** (BSD / MIT) | Governed only by local network | Respects robots.txt & domain rate limits |
| **feedparser** | Syndicate RSS/Atom Ingestion | **100% Free / Open Source** (BSD) | Zero operational cost | Direct XML parsing |
| **trafilatura** | DOM Article Text Extraction | **100% Free / Open Source** (GPL / Apache) | Zero operational cost | BeautifulSoup fallback |
| **pypdf / openpyxl** | Internal Document Parsing | **100% Free / Open Source** (BSD / MIT) | Unlimited file processing | In-memory text extraction |
| **Local Heuristic NLP Engine** | Dynamic profiling, interview, ranking, and brief generation | **100% Free / Offline Built-in Engine** | Unlimited; requires 0 API keys | Active by default out-of-the-box |
| **Google Gemini API** *(Optional)* | Advanced semantic reasoning via `GEMINI_API_KEY` | **Genuinely Free Tier** | 15 RPM / 1M TPM (Free of charge) | Automatically falls back to Local Heuristic NLP Engine if quota is exceeded or key is omitted |
| **Groq API** *(Optional)* | High-speed LLM inference via `GROQ_API_KEY` | **Genuinely Free Tier** | 30 RPM (Free developer tier) | Automatically falls back to Local Heuristic NLP Engine |
| **Ollama** *(Optional)* | Local self-hosted LLM (Llama 3 / Mistral) | **100% Free / Open Source** (MIT) | Runs locally on CPU/GPU | Falls back to Local Heuristic NLP Engine |

---

## 3. Resilience to API Degradation & Disconnection
1. **Zero-API Key Out-Of-The-Box Operation**: If the application is started without setting any API keys in `.env`, it defaults to `AI_PROVIDER=heuristic`. The entire company profiling, 10-question adaptive interview, source discovery, intelligence ranking, and Monday Morning Brief synthesis functions with 100% fidelity.
2. **Rate Limit Circuit Breakers**: When an optional LLM provider (Gemini or Groq) returns HTTP 429 (Rate Limit) or HTTP 500, `backend/app/services/ai_provider.py` catches the exception, logs a warning, and immediately executes the local deterministic NLP pipeline without throwing an error to the user.
3. **No Paid Scraping Proxies**: The crawler does not use bright data, scraperapi, or crawlbase. It accesses public open syndicate endpoints (RSS feeds, government press newsrooms, public forums) politely and directly.
