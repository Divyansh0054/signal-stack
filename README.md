# SIGNAL STACK — Company Intelligence & Executive Briefing Engine
### EDXSO AI Engineer Intern Assignment 1

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.13](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-sky.svg)](https://tailwindcss.com/)
[![Zero Cost](https://img.shields.io/badge/Cost-$0.00%20(Free%20Tier)-brightgreen.svg)](docs/COST.md)

---

## 1. Project Overview & Problem Statement
Modern enterprises operate in an environment of continuous flux: customers discuss friction in community forums, competitors launch aggressive pricing, immigration and regulatory agencies revise statutory rules, and internal CRM logs reflect hidden customer objections.

Most executive teams monitor these developments through fragmented manual browsing, ad-hoc LinkedIn scrolling, or expensive static news aggregators that merely summarize generic articles without connecting developments to business decisions.

**Signal Stack** transforms any enterprise into a continuously monitored intelligence asset:
1. **Understands the Business Dynamically**: Crawls any website and constructs an initial profile separating verified facts from hypotheses.
2. **Conducts an Adaptive 10-Question Founder Interview**: Synthesizes sequential questions with clear rationales, allowing confidential skips and answer updates.
3. **Builds a 4-Category Signal Stack**: Discovers legitimate sources across **Customers**, **Competitors**, **Market**, and **Internal Intelligence**.
4. **Controlled Polite Monitoring**: Crawls approved feeds with RFC 9309 robots.txt checks, SSRF filtering, domain rate limiting, and 3-tier deduplication.
5. **Separates Factual Evidence from Interpretation**: Preserves verbatim quotes and links while deriving actionable business impact.
6. **Transparent Multi-Factor Ranking**: Ranks signals using relevance, commercial impact, urgency, source credibility, and exponential recency decay.
7. **Synthesizes Monday Morning Executive Briefs**: Produces an executive-ready 10-section briefing with $\ge 3$ actionable opportunities and verifiable source audit trails.
8. **Automates Weekly Briefings & Monthly Audits**: Background `APScheduler` manages weekly brief runs and monthly dead-URL health audits.

---

## 2. System Architecture

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
│  ├── Company Research Engine      ├── Crawler / Monitoring Engine    ├── Multi-Factor Rank Engine│
│  ├── Adaptive Interview Engine    ├── Deduplication Engine (SHA-256) ├── Brief Generation Engine │
│  ├── Source Discovery Engine      ├── Intelligence Analysis Engine   ├── Document Processor      │
│  └── Source Health Manager        ├── Context Adaptation Engine      └── APScheduler Service     │
└─────────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                  │
                                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           SQLite Relational Database (14 Tables)                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack & Zero-Cost Mandate

The system complies strictly with the assignment mandate: **free / open-source technologies, zero paid APIs, zero paid scraping platforms, and zero paid AI services**.

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Python 3.13, FastAPI, Uvicorn, SQLAlchemy, Pydantic V2.
- **Database**: SQLite 3 (`data/signal_stack.db`).
- **Web Extraction & Crawling**: `httpx`, `BeautifulSoup4`, `feedparser`, `trafilatura`.
- **Internal Document Processing**: `pypdf`, `openpyxl`, `csv`.
- **Automation & Scheduling**: `APScheduler` (Background in-process cron).
- **AI Engine (Zero-Cost Guarantee)**: Built-in High-Fidelity Heuristic NLP Engine (active by default, 100% offline, $0.00 cost). Optional free-tier LLM integrations via standard environment variables (`GEMINI_API_KEY`, `GROQ_API_KEY`, or local `OLLAMA`). See [docs/COST.md](docs/COST.md).

---

## 4. Quickstart & Local Setup

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ & npm 9+

### Step 1: Clone Repository & Create Virtual Environment
```bash
# Clone the repository
git clone https://github.com/edxso/signal-stack.git
cd EDXO

# Setup Python virtual environment
python -m venv backend/venv

# Activate virtual environment
# Windows PowerShell:
.\backend\venv\Scripts\Activate.ps1
# Linux/macOS:
source backend/venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### Step 2: Install Frontend Dependencies
```bash
npm install --prefix frontend
```

### Step 3: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(No API keys are required; the application operates 100% offline out-of-the-box).*

### Step 4: Populate Demonstration Data (Optional but Recommended)
Run the automated seed pipeline to populate MeetUniversity, PostHog, and Tala demonstrations:
```bash
python backend/scripts/seed_demo_companies.py
```

### Step 5: Start Backend and Frontend
In Terminal 1 (Backend):
```bash
python backend/run.py
```
*API will run at `http://127.0.0.1:8000` (Swagger UI at `/docs`).*

In Terminal 2 (Frontend):
```bash
npm run dev:frontend
```
*Web dashboard will run at `http://localhost:3000`.*

---

## 5. Verification & Automated Tests

Run the complete automated pytest suite:
```bash
pytest backend/tests -v
```
All 16 automated tests verify URL validation, SSRF blocking, research extraction, 10-question interview generation, MeetUniversity $\ge 20$ approved sources, deduplication, ranking formulas, 10-section briefs, and context adaptation.

Verify production frontend build:
```bash
npm run build:frontend
```

---

## 6. Key Capabilities & Architectural Highlights

### 6.1 Dynamic Company Understanding (No Static News Aggregator)
- Crawls target company domains dynamically.
- Identifies products, customer segments, positioning, and monetization models.
- **Strict Evidence Boundary:** Categorizes claims into **Verified Facts** (with direct URL citations and quote snippets) and **Strategic Assumptions** (hypotheses requiring interview validation).

### 6.2 Adaptive 10-Question Founder Interview
- Sequentially asks exactly 10 questions tailored to the company's business model.
- Explains the dynamic rationale for every generated question.
- Supports confidential question skipping and retroactive answer editing.

### 6.3 MeetUniversity Demonstration Target
- **23 Approved Legitimate Sources** configured across Customers, Competitors, and Market categories (exceeding the 20-source mandate).
- Legitimate public endpoints: UKVI Immigration News, US State Dept Visas, IRCC Canada Permit News, THE, PIE News, Reddit r/Indians_StudyAbroad, etc.

### 6.4 Transparent Multi-Factor Ranking Formula
Each signal is scored via:
$$P(s) = \left( 0.25 R + 0.25 I + 0.20 U + 0.15 C + 0.15 N \right) \cdot e^{-0.05 \Delta t}$$
Where $R$ = Relevance, $I$ = Impact, $U$ = Urgency, $C$ = Credibility, $N$ = Novelty, and $\Delta t$ = elapsed days.
Outputs clear priority tiers: `CRITICAL` ($\ge 80$), `HIGH` ($\ge 65$), `MEDIUM` ($\ge 45$), `LOW` ($< 45$).

### 6.5 Monday Morning Executive Brief (10 Mandatory Sections)
1. Executive Summary (Top 5 developments)
2. Customer Signals
3. Competitor Intelligence
4. Market Intelligence
5. Internal Business Intelligence
6. Actionable Opportunities Identified ($\ge 3$ actionable opportunities)
7. Risks & Threats
8. Recommended Actions for This Week (Prioritized task table with suggested owners)
9. What We Should Watch
10. Source Appendix (Verifiable audit trail with clickable links)

### 6.6 Independent Automation & Health Audits
- **Weekly Briefing Job**: APScheduler cron `0 6 * * 1` (with manual on-demand trigger).
- **Monthly Source-Health Audit**: APScheduler cron `0 2 1 * *` (detects dead URLs and discovers new sources).

### 6.7 Reusability & Context Adaptation Stress Test
- Tested across 3 diverse companies: **MeetUniversity** (EdTech), **PostHog** (Developer Tools SaaS), and **Tala** (Fintech / Micro-lending).
- Tested strategic pivot on MeetUniversity from B2C student acquisition to B2B university partnerships, showing automatic source de-prioritization and institutional source activation.

---

## 7. Documentation Roadmap
Detailed technical specifications are located in the `docs/` directory:
- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md): Requirement-by-requirement traceability matrix.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): Full system design, component diagrams, and relational schema.
- [docs/CRAWLING.md](docs/CRAWLING.md): Crawler safety, rate limiting, robots.txt, and deduplication design.
- [docs/AI_ANALYSIS.md](docs/AI_ANALYSIS.md): Adaptive interview, signal extraction, evidence separation, and ranking model.
- [docs/SCHEDULING.md](docs/SCHEDULING.md): APScheduler background jobs and audit specifications.
- [docs/COST.md](docs/COST.md): Zero-cost open-source compliance statement and service limitations.
- [docs/TESTING.md](docs/TESTING.md): Test suite execution instructions and test matrix.
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md): Step-by-step 5–10 minute screen recording guide.
- [docs/FINAL_AUDIT.md](docs/FINAL_AUDIT.md): Final compliance self-audit against all assignment criteria.

---

## 8. License
This project is open-source software licensed under the [MIT License](LICENSE).
