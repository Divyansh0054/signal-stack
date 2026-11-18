# AI & STRATEGIC INTELLIGENCE ENGINE
## Signal Stack — Analytical Architecture & Ranking Model

---

## 1. Core Philosophy: Strict Evidence Separation
A primary failure mode of automated intelligence systems is conflating LLM hallucinations or generative opinions with ground-truth facts. Signal Stack establishes a strict, auditable boundary between:

1. **Factual Evidence**: The verbatim quoted snippet, publication date, origin domain, and source reliability tier.
2. **Strategic Interpretation**: The derived assessment of why the development matters to the company's business model, which operational area is affected, and what action leadership should consider.

> **Mandatory Rule:** AI confidence is NEVER presented as proof that an event actually occurred. Reliability is tied solely to source authority and verifiable quotation.

---

## 2. Dynamic Adaptive Interview Engine (`interview_engine.py`)
Rather than presenting a static generic questionnaire, the system conducts a structured 10-question sequence dynamically tailored to the company's business lines:

### 2.1 Context-Sensitive Generation
Questions are constructed by mapping researched offerings and industry metrics into 10 key operational pillars:
1. `revenue_engine`: Monetization splits, fee structures, and commission models.
2. `customer_segments`: Highest-lifetime-value customer personas and geographic demand corridors.
3. `customer_pain`: Churn drivers, credential bottlenecks, and friction points.
4. `competitive_moat`: Decisive differentiators against named competitors.
5. `pricing_economics`: Unit economics sensitivities and margin thresholds.
6. `acquisition_channels`: Organic vs paid vs affiliate channel dependency.
7. `regulatory_risks`: Immigration caps, policy changes, and compliance requirements.
8. `internal_patterns`: Recurring sales objections and lost-deal rationale.
9. `strategic_priorities`: Immediate 6–12 month milestones and expansion roadmap.
10. `decision_triggers`: Explicit event thresholds requiring urgent executive notification.

### 2.2 Confidentiality & Editability
Founders can skip sensitive or confidential questions without halting the pipeline. Any answer can be retroactively updated, triggering automatic recalculation of structured insights.

---

## 3. Multi-Factor Transparent Ranking Algorithm (`ranking_engine.py`)

Each intelligence signal $s$ is evaluated across six mathematical factors:

$$P(s) = \left( w_r \cdot R(s) + w_i \cdot I(s) + w_u \cdot U(s) + w_c \cdot C(s) + w_n \cdot N(s) \right) \cdot e^{-\lambda \Delta t}$$

### Parameter Weights:
- $w_r = 0.25$ (Strategic Relevance $R \in [0, 100]$)
- $w_i = 0.25$ (Commercial Impact $I \in [0, 100]$)
- $w_u = 0.20$ (Operational Urgency $U \in [0, 100]$)
- $w_c = 0.15$ (Source Credibility $C \in [0, 100]$: High=95, Medium=75, Low=50)
- $w_n = 0.15$ (Signal Novelty $N \in [0, 100]$)
- $\lambda = 0.05$ (Daily exponential recency decay)

### Priority Tiers:
- **CRITICAL**: Composite Score $\ge 80.0$
- **HIGH**: $65.0 \le \text{Score} < 80.0$
- **MEDIUM**: $45.0 \le \text{Score} < 65.0$
- **LOW**: $\text{Score} < 45.0$

### Explainability Output
Every signal stores a generated mathematical audit trail:
> *"Ranked as CRITICAL (Score 84.2/100) based on: Strategic Relevance 95/100 (wt 25%), Business Impact 90/100 (wt 25%), Urgency 90/100 (wt 20%), Source Credibility 95/100 (HIGH, wt 15%), and Novelty 85/100 (wt 15%), adjusted by 0.5d recency decay factor (0.98x)."*

---

## 4. Monday Morning Executive Brief Structure (`brief_engine.py`)
The report conforms strictly to the 10-section mandate:
1. **Executive Summary**: 5 highest-priority developments.
2. **Customer Signals**: Community discussions, complaints, sentiment.
3. **Competitor Intelligence**: Product launches, pricing shifts, partnerships.
4. **Market Intelligence**: Regulatory notifications and macro developments.
5. **Internal Business Intelligence**: Objections, lost deals, product requests from uploaded documents.
6. **Actionable Opportunities Identified**: Minimum 3 actionable commercial opportunities with concrete next steps.
7. **Risks & Threats**: Severity, potential impact, and urgency ratings.
8. **Recommended Actions for This Week**: Task, strategic rationale, suggested owner, priority.
9. **What We Should Watch**: Emerging signals deserving monitoring.
10. **Source Appendix**: Full audit trail with clickable links, publication timestamps, and verification states.
