# SYSTEM ARCHITECTURE & TECHNICAL DESIGN
## Signal Stack — Company Intelligence & Executive Briefing Engine

---

## 1. Executive Architecture Overview

**Signal Stack** is an enterprise-grade, autonomous intelligence platform designed to continuously monitor external and internal signals for any enterprise, evaluate strategic business implications, and synthesize weekly executive decision briefs.

The system is constructed with a modular, decoupled architecture adhering to strict engineering principles:
1. **Dynamic Intelligence Generation**: Zero hardcoded competitor lists, question trees, or static RSS catalogues. Every asset is derived from live company discovery and business context.
2. **Strict Separation of Evidence and Interpretation**: Raw evidence (exact quoted text from live sources, publication timestamps, source URLs) is preserved immutably and separated from strategic AI interpretation (opportunity/threat classifications, impact scores, recommended actions).
3. **Pluggable AI & Open-Source Zero-Cost Guarantee**: Fully operable with zero paid APIs. Operates seamlessly using local heuristic NLP algorithms, while optionally supporting free-tier LLM providers (Google Gemini API free tier, Groq free tier, or local Ollama) through standard environment variables.
4. **Resilient Crawler & Monitoring Engine**: Complies with RFC 9309 (`robots.txt`), implements domain rate limiting, exponential backoff, SHA-256 deduplication, and strict SSRF protections preventing requests to private IP ranges.

```
                              ┌────────────────────────────────────────┐
                              │           React + Vite Frontend        │
                              │    (TypeScript, Tailwind CSS, Lucide)  │
                              └───────────────────┬────────────────────┘
                                                  │ REST / JSON (FastAPI)
                                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       FastAPI Backend API Layer                                  │
│  ┌───────────────────────┬────────────────────────┬──────────────────────┬────────────────────┐  │
│  │ Company & Profile API │ Adaptive Interview API │ Signal Stack/Sources │ Intelligence Feed  │  │
│  ├───────────────────────┼────────────────────────┼──────────────────────┼────────────────────┤  │
│  │ Monday Brief API      │ Document Processor API │ Automation/Scheduler │ Health & Audit API │  │
│  └───────────────────────┴────────────────────────┴──────────────────────┴────────────────────┘  │
└─────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                  │
                                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Core Application Services                                     │
│  ┌───────────────────────────┐  ┌───────────────────────────┐  ┌──────────────────────────────┐  │
│  │   Company Research Engine │  │ Adaptive Interview Engine │  │   Source Discovery Engine    │  │
│  │  (Web scraping & profiling)│  │ (Multi-turn dynamic Q&A)  │  │(Competitor & regulatory hubs)│  │
│  └─────────────┬─────────────┘  └─────────────┬─────────────┘  └──────────────┬───────────────┘  │
│                │                              │                               │                  │
│  ┌─────────────▼─────────────┐  ┌─────────────▼─────────────┐  ┌──────────────▼───────────────┐  │
│  │  Crawler / Monitor Engine │  │   Deduplication Engine    │  │  Intelligence Analysis Engine│  │
│  │(Safe HTTP, RSS, robots.txt)│ │(Canonical URL, Hash, Sim) │  │ (Evidence vs Interpretation) │  │
│  └─────────────┬─────────────┘  └─────────────┬─────────────┘  └──────────────┬───────────────┘  │
│                │                              │                               │                  │
│  ┌─────────────▼─────────────┐  ┌─────────────▼─────────────┐  ┌──────────────▼───────────────┐  │
│  │  Multi-Factor Rank Engine │  │ Brief Generation Engine   │  │  Document Processing Engine  │  │
│  │ (Impact, Urgency, Recency)│  │(10-Section Executive Brief│  │ (PDF, CSV, XLSX, TXT parse)  │  │
│  └─────────────┬─────────────┘  └─────────────┬─────────────┘  └──────────────┬───────────────┘  │
│                │                              │                               │                  │
│  ┌─────────────▼─────────────┐  ┌─────────────▼─────────────┐  ┌──────────────▼───────────────┐  │
│  │ Context Adaptation Engine │  │ APScheduler Automation    │  │ Pluggable AI / NLP Engine    │  │
│  │ (Dynamic pivot & audit)   │  │(Weekly Brief & Audit Jobs)│  │ (Gemini, Groq, Heuristic NLP)│  │
│  └───────────────────────────┘  └───────────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                  │
                                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  SQLite Relational Storage Layer                                 │
│  ┌───────────────┐  ┌──────────────────┐  ┌───────────────┐  ┌────────────────┐  ┌────────────┐  │
│  │   companies   │  │ company_profiles │  │  interview_q  │  │    sources     │  │source_health│ │
│  ├───────────────┤  ├──────────────────┤  ├───────────────┤  ├────────────────┤  ├────────────┤  │
│  │  crawl_runs   │  │  content_items   │  │ intel_signals │  │     briefs     │  │brief_action│  │
│  ├───────────────┤  ├──────────────────┤  ├───────────────┤  ├────────────────┤  ├────────────┤  │
│  │  competitors  │  │internal_documents│  │ scheduled_jobs│  │   audit_logs   │  │context_piv │  │
│  └───────────────┘  └──────────────────┘  └───────────────┘  └────────────────┘  └────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Specifications

### 2.1 Web Extractor & Controlled Crawler
- **Protocol**: HTTP/1.1 and HTTP/2 via `httpx`.
- **Safety**: 
  - Host validation prevents SSRF against IPv4 private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`) and link-local addresses.
  - Per-domain rate limiting with minimum 1.5s delay between consecutive requests to the same host.
  - Automatic `robots.txt` discovery and parsing (`urllib.robotparser`).
  - Standard compliant User-Agent identification: `SignalStackBot/1.0 (+https://github.com/edxso/signal-stack)`.
- **Feed Extraction**: Integrated RSS/Atom processing via `feedparser` with fallback to DOM structural extraction using `BeautifulSoup4`.

### 2.2 Deduplication Engine
Three-stage deduplication pipeline:
1. **URL Normalization**: Strips query tracking parameters (`utm_*`, `ref`, `fbclid`), canonicalizes schemes to HTTPS, strips trailing slashes, and checks indexed URL store.
2. **Content Hash**: Computes SHA-256 on normalized lowercase text tokens to reject identical reposts across syndication hubs.
3. **Fuzzy Similarity**: Employs Levenshtein distance and Jaccard token similarity (threshold $\ge 0.82$) on titles and lead paragraphs to cluster evolving news developments.

### 2.3 Transparent Intelligence Ranking Algorithm
Each intelligence signal $s$ is assigned a composite priority score $P(s) \in [0, 100]$:

$$P(s) = \left( w_r \cdot R(s) + w_i \cdot I(s) + w_u \cdot U(s) + w_c \cdot C(s) + w_n \cdot N(s) \right) \times \delta(t)$$

Where:
- $R(s) \in [0, 100]$: Strategic relevance to the company's business model.
- $I(s) \in [0, 100]$: Potential commercial or operational business impact.
- $U(s) \in [0, 100]$: Operational urgency / response window.
- $C(s) \in [0, 100]$: Source credibility index (official regulatory > peer-reviewed > reputable trade press > social).
- $N(s) \in [0, 100]$: Novelty score relative to historical signals.
- $\delta(t) = e^{-\lambda \Delta t}$: Exponential recency decay where $\Delta t$ is elapsed days and $\lambda = 0.05$.
- Weights: $w_r = 0.25, w_i = 0.25, w_u = 0.20, w_c = 0.15, w_n = 0.15$ ($\sum w = 1.0$).

Priority Tiers:
- **Critical**: Score $\ge 80$
- **High**: $65 \le \text{Score} < 80$
- **Medium**: $45 \le \text{Score} < 65$
- **Low**: $\text{Score} < 45$

### 2.4 Evidence vs. Interpretation Boundary
Every database record enforces a strict separation:
- `evidence_snippet`: Verbatim string extracted from source.
- `source_url`: Verifiable URL of publication.
- `publication_date`: Disclosed timestamp.
- `verification_status`: `VERIFIED`, `UNVERIFIED`, or `OFFICIAL_DISCLOSURE`.
- `interpretation`: The analytical assessment detailing *Why it matters*, *Affected business area*, *Strategic threat/opportunity rating*, and *Recommended operational action*.

---

## 3. Database Schema Blueprint

```sql
-- Core Company Entity
CREATE TABLE companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT NOT NULL UNIQUE,
    industry TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Intelligence Profile
CREATE TABLE company_profiles (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    business_description TEXT,
    products_services JSON,       -- Array of string items with evidence
    customer_segments JSON,       -- Array of target customer profiles
    geographic_markets JSON,      -- Target geographies
    positioning TEXT,
    business_model TEXT,
    strategic_themes JSON,
    verified_facts JSON,          -- Statements with exact citations
    assumptions JSON,             -- Inferred context requiring validation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adaptive Interview State & Questions
CREATE TABLE interview_questions (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    question_order INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_category TEXT NOT NULL, -- business_model, customer_pain, competitors, etc.
    context_rationale TEXT,          -- Why this question was chosen dynamically
    is_confidential_eligible BOOLEAN DEFAULT TRUE,
    is_skipped BOOLEAN DEFAULT FALSE,
    is_followup BOOLEAN DEFAULT FALSE,
    parent_question_id TEXT REFERENCES interview_questions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interview_answers (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL REFERENCES interview_questions(id),
    company_id TEXT NOT NULL REFERENCES companies(id),
    answer_text TEXT NOT NULL,
    derived_insights JSON,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discovered Competitors
CREATE TABLE competitors (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    website TEXT,
    offering_summary TEXT,
    competitor_type TEXT,            -- Direct, Indirect, Substitute
    why_it_matters TEXT NOT NULL,
    discovery_evidence TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monitored Intelligence Sources
CREATE TABLE sources (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,          -- Customers, Competitors, Market, Internal
    source_type TEXT NOT NULL,       -- RSS, WebPage, Regulatory, ReviewHub
    reason_for_inclusion TEXT NOT NULL,
    relevance_score FLOAT DEFAULT 80.0,
    credibility_rating TEXT DEFAULT 'HIGH', -- HIGH, MEDIUM, LOW
    expected_frequency TEXT DEFAULT 'WEEKLY',
    status TEXT DEFAULT 'APPROVED',  -- APPROVED, PENDING, DISABLED, REJECTED
    health_status TEXT DEFAULT 'HEALTHY', -- HEALTHY, WARNING, FAILED, INACTIVE
    last_checked_at TIMESTAMP,
    consecutive_failures INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raw Crawled Content Items
CREATE TABLE content_items (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(id),
    company_id TEXT NOT NULL REFERENCES companies(id),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    normalized_url TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    published_date TIMESTAMP,
    discovered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_text TEXT NOT NULL,
    snippet TEXT,
    is_duplicate BOOLEAN DEFAULT FALSE
);

-- Processed Intelligence Signals
CREATE TABLE intelligence_signals (
    id TEXT PRIMARY KEY,
    content_item_id TEXT REFERENCES content_items(id),
    company_id TEXT NOT NULL REFERENCES companies(id),
    source_id TEXT REFERENCES sources(id),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL,          -- Customers, Competitors, Market, Internal
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    publication_date TIMESTAMP,
    discovery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    evidence_snippet TEXT NOT NULL,
    verification_status TEXT NOT NULL, -- VERIFIED, UNVERIFIED, OFFICIAL
    evidence_strength TEXT NOT NULL,  -- HIGH, MEDIUM, LOW
    source_reliability TEXT NOT NULL, -- HIGH, MEDIUM, LOW
    strategic_relevance FLOAT NOT NULL,
    business_impact FLOAT NOT NULL,
    urgency FLOAT NOT NULL,
    novelty FLOAT NOT NULL,
    opportunity_threat TEXT NOT NULL,  -- OPPORTUNITY, THREAT, NEUTRAL
    affected_business_area TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    overall_priority TEXT NOT NULL,   -- CRITICAL, HIGH, MEDIUM, LOW
    ranking_score FLOAT NOT NULL,
    ranking_explanation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Executive Monday Morning Briefs
CREATE TABLE briefs (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    title TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monitoring_start TIMESTAMP NOT NULL,
    monitoring_end TIMESTAMP NOT NULL,
    executive_summary JSON NOT NULL,    -- Top 5 developments
    customer_signals JSON NOT NULL,
    competitor_intelligence JSON NOT NULL,
    market_intelligence JSON NOT NULL,
    internal_intelligence JSON NOT NULL,
    opportunities_identified JSON NOT NULL, -- Min 3 with action items
    risks_and_threats JSON NOT NULL,
    recommended_actions JSON NOT NULL,
    what_we_should_watch JSON NOT NULL,
    source_appendix JSON NOT NULL,
    raw_markdown TEXT NOT NULL,
    is_delivered BOOLEAN DEFAULT FALSE
);

-- Internal Documents Uploaded
CREATE TABLE internal_documents (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,         -- PDF, CSV, XLSX, TXT
    file_size_bytes INTEGER NOT NULL,
    extracted_summary TEXT,
    objections JSON,
    lost_deal_reasons JSON,
    product_requests JSON,
    sales_patterns JSON,
    emerging_risks JSON,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Background Automation Schedules & Execution Logs
CREATE TABLE scheduled_jobs (
    id TEXT PRIMARY KEY,
    job_type TEXT NOT NULL,          -- WEEKLY_BRIEF, MONTHLY_AUDIT
    company_id TEXT REFERENCES companies(id),
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    status TEXT DEFAULT 'ACTIVE',    -- ACTIVE, PAUSED, ERROR
    last_execution_status TEXT,      -- SUCCESS, FAILED
    error_message TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id),
    event_type TEXT NOT NULL,        -- AUDIT_RUN, CRAWL_RUN, DEAD_URL_DETECTED, CONTEXT_PIVOT
    message TEXT NOT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Automation & Scheduling Architecture

The system utilizes an in-process, thread-safe `APScheduler` instance initialized upon FastAPI startup:
- **Weekly Intelligence Brief Job**: Configured to run every Monday at 06:00 (local/configured timezone). Also exposable via immediate manual invocation (`POST /api/scheduler/run-brief/{company_id}`).
- **Monthly Source-Health Audit Job**: Configured to run on the 1st of every month at 02:00. Runs URL availability checks, dead link detection, duplicate source scanning, relevance reassessment, and logs results into `audit_logs`. Also exposable via manual trigger (`POST /api/scheduler/run-audit/{company_id}`).

---

## 5. Security & Isolation Controls
- **Zero Confidential Data Leakage**: Text extracted from internal documents (`internal_documents`) is marked `INTERNAL_CONFIDENTIAL` and is never sent to external search crawlers or public feeds.
- **SSRF Hardening**: All crawler targets pass through a DNS resolution filter that resolves the hostname to an IP and validates against RFC 1918 / loopback ranges.
- **Rate-Limiting & Polite Crawling**: Default backoff of 1.5 seconds per host with randomized jitter to prevent traffic bursts.
