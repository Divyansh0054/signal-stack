# AUTOMATED TESTING SUITE & VERIFICATION GUIDE
## Signal Stack — Quality Assurance & Test Verification

---

## 1. Test Suite Overview
The Signal Stack test suite covers unit, functional, integration, and reusability requirements across the entire intelligence pipeline.

### Test Execution Commands:
```bash
# Run full automated test suite
.\backend\venv\Scripts\pytest backend\tests -v

# Or via root npm script
npm run test:backend
```

---

## 2. Test Module Breakdown

| Test File | Focus Area | Key Invariants Tested |
|:---|:---|:---|
| `test_url_validation.py` | Security & SSRF Hardening | - Verifies valid public HTTPS URLs.<br>- Blocks access to `localhost`, `127.0.0.1`, and private RFC 1918 subnets (`192.168.x.x`, `10.x.x.x`).<br>- Blocks non-HTTP schemes (`ftp://`, `file://`). |
| `test_research.py` | Company Profiling Engine | - Verifies dynamic extraction of business description, offerings, and positioning.<br>- Validates strict separation of verified facts (with citations) from testable assumptions. |
| `test_interview.py` | Adaptive AI Interview Engine | - Asserts exactly 10 questions generated sequentially.<br>- Verifies question uniqueness, dynamic context rationales, and category mappings.<br>- Validates answer recording, derived insights, and skipping confidential questions. |
| `test_source_discovery.py` | Signal Stack & Sources | - **Mandatory MeetUniversity Target:** Asserts $\ge 20$ approved sources discovered across Customers, Competitors, Market, and Internal categories.<br>- Asserts 5–10 competitors discovered with explicit `why_it_matters` explanations. |
| `test_deduplication.py` | Deduplication Engine | - Verifies URL normalization (stripping tracking query params like `utm_*`, `ref`, `fbclid`).<br>- Validates SHA-256 content hashing across whitespace-normalized text.<br>- Tests exact URL and content hash match detection against SQLite history. |
| `test_ranking.py` | Transparent Ranking Model | - Verifies mathematical composite formula ($w_r=0.25, w_i=0.25, w_u=0.20, w_c=0.15, w_n=0.15$).<br>- Asserts Priority Tiers (CRITICAL $\ge 80$, HIGH $\ge 65$, MEDIUM $\ge 45$, LOW $<45$).<br>- Validates exponential recency decay over time. |
| `test_brief.py` | Monday Morning Executive Brief | - **Mandatory 10-Section Structure:** Asserts presence of all 10 required sections.<br>- Asserts minimum 3 actionable opportunities with next steps.<br>- Verifies Source Appendix verifiable audit trail. |
| `test_document_processor.py` | Internal Intelligence Processor | - Tests extraction of customer objections, lost-deal reasons, and product requests from TXT/CSV files.<br>- Verifies isolation of internal data from external web engines. |
| `test_reusability.py` | Multi-Company Stress Testing | - Tests distinct question and competitor profiles between MeetUniversity and PostHog.<br>- Tests business context adaptation pivot (B2C $\to$ B2B) and source reassessment. |

---

## 3. Frontend Verification
```bash
# Verify TypeScript compilation and production bundle build
npm run build --prefix frontend
```
Build output:
`✓ 1554 modules transformed. dist/index.html (0.81 kB), dist/assets/index.js (313 kB). Zero compilation errors.`
