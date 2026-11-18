# AUTOMATION & SCHEDULING ARCHITECTURE
## Signal Stack — Autonomous Background Orchestration

---

## 1. Engine Architecture
Background automation is driven by an in-process, thread-safe `APScheduler` instance (`apscheduler.schedulers.background.BackgroundScheduler`) registered in the FastAPI lifecycle:

```
FastAPI Lifespan Startup
       │
       ▼
[Initialize APScheduler]
  ├── Job 1: Weekly Intelligence Brief  (Cron: 0 6 * * 1)
  └── Job 2: Monthly Source-Health Audit (Cron: 0 2 1 * *)
       │
       ▼
[Thread-Safe Execution Pool] ──> [Database Session via SessionLocal]
```

---

## 2. Process Specifications

### 2.1 Process A: Weekly Intelligence Brief Pipeline
- **Frequency**: Every Monday morning at 06:00 UTC (`0 6 * * 1`).
- **Pipeline Stages**:
  1. Iterate across all registered companies in the database.
  2. Retrieve all sources with status `APPROVED`.
  3. Execute polite HTTP crawl with domain rate limiting and robots.txt validation.
  4. Deduplicate newly collected items using URL normalization and SHA-256 text hashes.
  5. Process new items through the Intelligence Analysis Engine, calculating ranking scores.
  6. Synthesize the 10-section Monday Morning Executive Brief and save to `briefs`.
  7. Generate corresponding actionable tasks in `brief_actions`.
  8. Log execution metrics and timestamps to `audit_logs` and `scheduled_jobs`.
- **Manual Trigger**: Available on demand via `POST /api/scheduler/run-brief/{company_id}` or the **"Run Brief Now"** button in the dashboard.

### 2.2 Process B: Monthly Source-Health Audit
- **Frequency**: 1st of every month at 02:00 UTC (`0 2 1 * *`).
- **Pipeline Stages**:
  1. Ping all approved sources across all companies.
  2. Detect HTTP errors (404, 500, timeouts) and update source health states (`HEALTHY`, `WARNING`, `FAILED`).
  3. Identify inactive sources (no new items produced in > 30 days).
  4. Assess declining relevance against the company's active strategic focus.
  5. Run dynamic source discovery to surface new candidate sources and competitors.
  6. Generate audit report findings and log failed sources directly in the dashboard audit log table.
- **Manual Trigger**: Available on demand via `POST /api/scheduler/run-audit/{company_id}` or the **"Run Monthly Audit Now"** button in the dashboard.

---

## 3. Observability & Dashboard Integration
- The frontend `Automation & Health` tab displays:
  - APScheduler operational status (`ACTIVE` / `STOPPED`).
  - Next scheduled execution time per registered job.
  - Historical execution logs with timestamps and status codes.
  - Failures and dead URLs highlighted with warning banners.
