# SCREEN RECORDING DEMONSTRATION SCRIPT (5–10 MINUTES)
## Signal Stack — Company Intelligence & Executive Briefing Engine

This script guides the evaluator or presenter through the complete, end-to-end demonstration of the application.

---

### Step 1: Launch Application & Overview (0:00 – 0:45)
1. Start the application:
   - Backend running on `http://127.0.0.1:8000`
   - Frontend running on `http://localhost:3000`
2. Point out the top header:
   - Active Company selector (MeetUniversity, PostHog, Tala)
   - Quick Action buttons: "Monitor Now", "New Company"
   - System indicators: $0.00 zero-cost status, Heuristic/Offline AI engine active.
3. Highlight the executive dashboard KPI cards: Critical Signals, Opportunities, Risks, and 23 approved monitored sources for MeetUniversity.

---

### Step 2: Company Setup & Dynamic Research (0:45 – 1:30)
1. Click **Company Setup** in the navigation.
2. Demonstrate how entering any company name and website URL triggers:
   - SSRF validation blocking localhost or private subnet ranges.
   - Autonomous website crawling of homepage and subpages.
3. Navigate to **Intelligence Profile**:
   - Show the extracted business description, products/services, and target customer segments.
   - **Crucial Requirement:** Highlight the explicit visual separation between **Verified Facts** (crawled verbatim text with direct source links) and **Strategic Assumptions** (hypotheses requiring interview verification).

---

### Step 3: Adaptive 10-Question Founder Interview (1:30 – 2:45)
1. Navigate to **Adaptive AI Interview**:
   - Point out that exactly 10 questions are asked sequentially (one at a time).
   - Show the dynamic callout: *"Why this question was generated"* (tailored to study-abroad commission models and visa policies).
2. Demonstrate answering a question and show the structured insight extraction.
3. Demonstrate the **"Skip as Confidential"** button for sensitive commercial data.
4. Scroll down to **Interview History**: show recorded answers and demonstrate clicking **"Edit Answer"** to update previously recorded information.

---

### Step 4: Four-Category Signal Stack & Discovered Competitors (2:45 – 3:45)
1. Navigate to **Signal Stack**:
   - Click through the 4 tabs: **Customers**, **Competitors**, **Market**, **Internal**.
2. On **Competitors**:
   - Show the 5–10 dynamically discovered competitors (ApplyBoard, IDP Education, Leverage Edu, Leap Scholar).
   - Highlight the **"Why this competitor matters"** card for each competitor.
3. On **Market & Customers**:
   - Show legitimate public sources (UKVI immigration news, US State Department, IRCC Canada student permit updates, Reddit r/Indians_StudyAbroad).
   - **Crucial Requirement:** Point out the explicit justification callout on every single source card: *"Reason for Inclusion: Why are we monitoring this source?"*.
   - Confirm MeetUniversity has **23 approved sources** (exceeding the 20-source mandate).

---

### Step 5: Source Manager & Telemetry (3:45 – 4:30)
1. Navigate to **Source Manager**:
   - Show the health states: `HEALTHY`, `WARNING`, `FAILED`.
   - Show HTTP status codes (HTTP 200, latency in ms) and the **Duplicates Suppressed** counter.
2. Demonstrate toggling a source from `Approved` to `Disabled`.
3. Click **"Add Custom Source"** and show the modal requiring mandatory category, URL, and reason for inclusion.

---

### Step 6: Live Crawl & Intelligence Feed (4:30 – 5:45)
1. Click **"Monitor Now"** in the top navigation bar. Show the crawler executing polite requests with rate limiting across approved sources.
2. Navigate to **Intelligence Feed**:
   - Show real collected intelligence records with publication dates, discovery timestamps, and source links.
   - Show the multi-attribute filtering toolbar (Category, Priority, Opportunity/Threat, Verification Status).
3. Open an Intelligence Signal Card:
   - **Crucial Requirement:** Show the two-column layout strictly separating **1. Raw Factual Evidence** (verbatim quoted snippet, source URL) from **2. Strategic Interpretation** (Why it matters, affected business area, recommended action).
   - Point out the **Transparent Ranking Breakdown** explaining why the signal received its priority score.

---

### Step 7: Monday Morning Executive Brief (5:45 – 7:00)
1. Navigate to **Monday Morning Brief**:
   - Click **"Run Brief Now"** to synthesize a fresh executive report.
2. Walk through the **10 mandatory sections**:
   1. Executive Summary (Top 5 developments leadership must know).
   2. Customer Signals (community complaints and sentiment).
   3. Competitor Intelligence (ApplyBoard and IDP developments).
   4. Market Intelligence (UKVI Graduate Route and Canada PAL quota changes).
   5. Internal Business Intelligence (objections and lost deals from uploaded CRM files).
   6. Actionable Opportunities Identified (minimum 3 opportunities with concrete next steps).
   7. Risks & Threats (negative developments with urgency ratings).
   8. Recommended Actions for This Week (table with task, rationale, suggested owner, priority).
   9. What We Should Watch (early developments).
   10. Source Appendix (complete verifiable audit trail with clickable links).
3. Demonstrate clicking **"Copy Markdown"** and **"Print View"**.

---

### Step 8: Automation & Background Scheduler (7:00 – 7:45)
1. Navigate to **Automation & Health**:
   - Show the two independent automated processes:
     - **Process A:** Weekly Intelligence Brief (Cron: `0 6 * * 1`).
     - **Process B:** Monthly Source-Health Audit (Cron: `0 2 1 * *`).
2. Show that both processes have on-demand manual trigger buttons (**"Run Weekly Brief Now"** and **"Run Monthly Audit Now"**).
3. Click **"Run Monthly Audit Now"** and review the audit report finding dead URLs and discovering new candidates.

---

### Step 9: Reusability & Context Adaptation Stress Test (7:45 – 9:00)
1. **Multi-Company Demonstration**:
   - Use the active company dropdown to switch to **PostHog** (Developer Tools / Product Analytics).
   - Point out that interview questions, competitors (Mixpanel, Amplitude), and market sources (EDPB GDPR rulings, Hacker News) are completely different.
   - Switch to **Tala** (Fintech / Digital Lending) and show distinct competitors (Branch, FairMoney) and regulatory sources (Central Bank of Kenya).
2. **Context Adaptation Stress Test**:
   - Switch back to **MeetUniversity**.
   - Navigate to **Automation & Health** $\to$ **Dynamic Business Context Adaptation**.
   - Enter new context: *"Focus on B2B university partnerships & institutional licensing."*
   - Click **"Apply Strategic Context Pivot"**.
   - Review the result: consumer student forums are de-prioritized, institutional partnership sources are activated, and the system outputs an explanation of what changed.

---

### Step 10: Conclusion (9:00 – 9:30)
- Summarize that the entire system was built dynamically with zero static templates, zero hardcoded competitors, real crawling, transparent ranking, full test coverage, and a zero-cost open-source architecture.
