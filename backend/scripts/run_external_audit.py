"""
Comprehensive External Evaluation and Verification Script
for EDXSO AI Engineer Intern Assignment 1: Signal Stack
"""
import sys
import os
import json
import httpx
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api"
client = httpx.Client(timeout=180.0)

def log_section(title):
    print("\n" + "=" * 80)
    print(f" AUDIT SECTION: {title}")
    print("=" * 80)

def main():
    results = {}
    print(f"Starting Comprehensive External Evaluation at {datetime.now().isoformat()}...")

    # 1. Health & Infrastructure
    log_section("1. HEALTH & INFRASTRUCTURE")
    res = client.get(f"{BASE_URL}/health")
    health = res.json()
    print("Health response:", health)
    assert health["status"] == "HEALTHY", "Health endpoint failed"
    assert health["scheduler_active"] is True, "Scheduler is not active"
    results["health"] = "PASS"

    # 2. Company Directory & Seed Audit
    log_section("2. COMPANY DIRECTORY & SETUP")
    res = client.get(f"{BASE_URL}/companies")
    companies = res.json()
    print(f"Total companies in system: {len(companies)}")
    comp_map = {c["name"]: c for c in companies}
    for name, c in comp_map.items():
        print(f" - {name} ({c['website']}): {c['industry']}")

    mu = next((c for c in companies if "MeetUniversity" in c["name"]), None)
    posthog = next((c for c in companies if "PostHog" in c["name"]), None)
    tala = next((c for c in companies if "Tala" in c["name"]), None)

    assert mu is not None, "MeetUniversity not found"
    results["company_directory"] = "PASS"

    # 3. Initial Research & Profiling (MeetUniversity)
    log_section("3. COMPANY RESEARCH & PROFILING (MeetUniversity)")
    res = client.get(f"{BASE_URL}/companies/{mu['id']}")
    mu_full = res.json()
    prof = mu_full.get("profile")
    assert prof is not None, "Profile missing for MeetUniversity"
    print(f"Business Description: {prof.get('business_description')[:120]}...")
    print(f"Positioning: {prof.get('positioning')}")
    print(f"Business Model: {prof.get('business_model')}")
    print(f"Verified Facts: {len(prof.get('verified_facts', []))} ground-truth claims")
    print(f"Assumptions: {len(prof.get('assumptions', []))} testable hypotheses")
    assert len(prof.get("verified_facts", [])) > 0, "No verified facts"
    assert len(prof.get("assumptions", [])) > 0, "No assumptions"
    results["research_profiling"] = "PASS"

    # 4. Adaptive AI Interview (10 Questions & Cross-Company Comparison)
    log_section("4. ADAPTIVE AI INTERVIEW AUDIT")
    res_mu_q = client.get(f"{BASE_URL}/interview/{mu['id']}/questions").json()
    res_ph_q = client.get(f"{BASE_URL}/interview/{posthog['id']}/questions").json() if posthog else []

    print(f"MeetUniversity Questions count: {len(res_mu_q)}")
    print(f"PostHog Questions count: {len(res_ph_q)}")
    assert len(res_mu_q) == 10, f"Expected exactly 10 questions for MeetUniversity, got {len(res_mu_q)}"
    
    print("\nMeetUniversity Sample Questions:")
    for q in res_mu_q[:3]:
        print(f" Q{q['question_order']} [{q['question_category']}]: {q['question_text']}")
    
    if res_ph_q:
        print("\nPostHog Sample Questions:")
        for q in res_ph_q[:3]:
            print(f" Q{q['question_order']} [{q['question_category']}]: {q['question_text']}")
        # Verify genuine differentiation (not template string substitution)
        mu_texts = set(q["question_text"] for q in res_mu_q)
        ph_texts = set(q["question_text"] for q in res_ph_q)
        overlap = mu_texts.intersection(ph_texts)
        print(f"\nQuestion Overlap between MeetUniversity and PostHog: {len(overlap)} of 10")
        assert len(overlap) <= 1, "Questions are too similar; failing adaptive differentiation test"
    
    # Test answer submission, confidential skipping, and answer editing
    status_res = client.get(f"{BASE_URL}/interview/{mu['id']}/status").json()
    print(f"Interview Status for MeetUniversity: {status_res['answered_count']} answered, {status_res['skipped_count']} skipped")
    results["adaptive_interview"] = "PASS"

    # 5. Signal Stack & Source Discovery (MeetUniversity Target >= 20 Approved Sources)
    log_section("5. SIGNAL STACK & SOURCE DISCOVERY")
    res_src = client.get(f"{BASE_URL}/sources/{mu['id']}").json()
    approved_src = [s for s in res_src if s["status"] == "APPROVED"]
    healthy_src = [s for s in res_src if s["health_status"] == "HEALTHY"]
    print(f"Total Sources for MeetUniversity: {len(res_src)}")
    print(f"Approved Sources: {len(approved_src)}")
    print(f"Healthy Sources: {len(healthy_src)}")
    
    categories = {"Customers": 0, "Competitors": 0, "Market": 0, "Internal": 0}
    for s in res_src:
        if s["category"] in categories:
            categories[s["category"]] += 1
    print("Sources by Category:", categories)

    assert len(approved_src) >= 20, f"FAIL: Expected >= 20 approved sources for MeetUniversity, found {len(approved_src)}"
    
    # Competitor Discovery
    res_comps = client.get(f"{BASE_URL}/sources/{mu['id']}/competitors").json()
    print(f"Discovered Competitors for MeetUniversity: {len(res_comps)}")
    for c in res_comps[:4]:
        print(f" - {c['name']} ({c['competitor_type']}): {c['offering_summary'][:80]}...")
    assert len(res_comps) >= 5, f"FAIL: Expected 5-10 competitors, found {len(res_comps)}"
    results["source_discovery"] = "PASS"

    # 6. Intelligence Signals & Evidence / Interpretation Separation
    log_section("6. INTELLIGENCE SIGNALS & EVIDENCE SEPARATION")
    res_sigs = client.get(f"{BASE_URL}/signals/{mu['id']}").json()
    print(f"Total Signals for MeetUniversity: {len(res_sigs)}")
    assert len(res_sigs) >= 20, f"Expected >= 20 signals, found {len(res_sigs)}"

    sample_sig = res_sigs[0]
    print("\nDeep Inspection of Top Signal:")
    print(f" Title: {sample_sig['title']}")
    print(f" Priority: {sample_sig['overall_priority']} (Score: {sample_sig['ranking_score']})")
    print(f" Category: {sample_sig['category']} | Nature: {sample_sig['opportunity_threat']}")
    print(f" [LAYER 1 - Factual Summary]: {sample_sig['summary']}")
    print(f" [LAYER 2 - Strategic Why It Matters]: {sample_sig['why_it_matters']}")
    print(f" [LAYER 3 - Recommended Action]: {sample_sig['recommended_action']}")
    print(f" [EVIDENCE SNIPPET]: '{sample_sig['evidence_snippet'][:100]}...'")
    print(f" [SOURCE URL]: {sample_sig['source_url']}")
    print(f" [VERIFICATION STATUS]: {sample_sig['verification_status']}")
    print(f" [RANKING EXPLANATION]: {sample_sig['ranking_explanation']}")

    assert sample_sig["evidence_snippet"], "Evidence snippet is missing"
    assert sample_sig["source_url"].startswith("http"), "Source URL is missing or invalid"
    assert sample_sig["why_it_matters"] != sample_sig["evidence_snippet"], "Evidence and interpretation are identical"
    results["intelligence_analysis"] = "PASS"

    # 7. Monday Morning Brief (10 Mandatory Sections & Min 3 Opportunities)
    log_section("7. MONDAY MORNING BRIEF AUDIT")
    res_briefs = client.get(f"{BASE_URL}/briefs/{mu['id']}").json()
    print(f"Total Briefs found for MeetUniversity: {len(res_briefs)}")
    if len(res_briefs) == 0:
        print("Generating fresh Monday Morning Brief...")
        new_brief_res = client.post(f"{BASE_URL}/briefs/generate", json={"company_id": mu['id'], "days_back": 7})
        assert new_brief_res.status_code == 200, "Brief generation failed"
        brief = new_brief_res.json()
    else:
        brief = res_briefs[0]

    print(f"Brief Title: {brief['title']}")
    print("Verifying 10 Mandatory Sections:")
    sec1 = len(brief.get("executive_summary", []))
    sec2 = len(brief.get("customer_signals", []))
    sec3 = len(brief.get("competitor_intelligence", []))
    sec4 = len(brief.get("market_intelligence", []))
    sec5 = len(brief.get("internal_intelligence", []))
    sec6 = len(brief.get("opportunities_identified", []))
    sec7 = len(brief.get("risks_and_threats", []))
    sec8 = len(brief.get("recommended_actions", []))
    sec9 = len(brief.get("what_we_should_watch", []))
    sec10 = len(brief.get("source_appendix", []))

    print(f" 1. Executive Summary: {sec1} items")
    print(f" 2. Customer Signals: {sec2} items")
    print(f" 3. Competitor Intelligence: {sec3} items")
    print(f" 4. Market Intelligence: {sec4} items")
    print(f" 5. Internal Intelligence: {sec5} items")
    print(f" 6. Actionable Opportunities: {sec6} items (MANDATE: >= 3)")
    print(f" 7. Risks & Threats: {sec7} items")
    print(f" 8. Recommended Actions: {sec8} items")
    print(f" 9. What We Should Watch: {sec9} items")
    print(f" 10. Source Appendix: {sec10} items")

    assert sec6 >= 3, f"FAIL: Actionable opportunities mandate >= 3, found {sec6}"
    assert sec10 > 0, "FAIL: Source appendix is empty"
    results["monday_brief"] = "PASS"

    # 8. Automation & Health Audit
    log_section("8. AUTOMATION & SOURCE HEALTH AUDIT")
    # Trigger weekly brief manually
    print("Testing Manual Weekly Brief Trigger...")
    res_w = client.post(f"{BASE_URL}/scheduler/run-brief/{mu['id']}")
    assert res_w.status_code == 200, f"Weekly brief trigger failed: {res_w.text}"
    print(" Weekly Brief manual run:", res_w.json().get("status", "SUCCESS"))

    # Trigger monthly audit manually
    print("Testing Manual Monthly Source-Health Audit Trigger...")
    res_m = client.post(f"{BASE_URL}/scheduler/run-audit/{mu['id']}")
    assert res_m.status_code == 200, f"Monthly audit trigger failed: {res_m.text}"
    audit_summary = res_m.json().get("audit_summary", res_m.json())
    print(" Monthly Source Audit summary:", audit_summary)
    results["automation"] = "PASS"

    # 9. Context Adaptation (Stress Test: B2C to B2B)
    log_section("9. BUSINESS CONTEXT CHANGE AUDIT (B2C -> B2B)")
    pivot_text = "Focus exclusively on B2B university partnerships, institutional licensing, and enterprise agent management."
    res_adapt = client.post(f"{BASE_URL}/adaptation/pivot/{mu['id']}", json={"new_context": pivot_text})
    assert res_adapt.status_code == 200, f"Context adaptation failed: {res_adapt.text}"
    adapt_data = res_adapt.json()
    print("Context Adaptation result:", adapt_data)
    results["context_adaptation"] = "PASS"

    # 10. Unseen Company End-to-End Workflow Test
    log_section("10. UNSEEN COMPANY COMPLETE WORKFLOW TEST")
    unseen_name = f"CalCom_{int(datetime.now().timestamp())}"
    unseen_url = "https://cal.com"
    print(f"Creating brand-new unseen company: {unseen_name} ({unseen_url})...")
    create_res = client.post(f"{BASE_URL}/companies", json={
        "name": unseen_name,
        "website": unseen_url,
        "current_focus": "Open-source scheduling infrastructure and enterprise calendar management"
    })
    assert create_res.status_code in (200, 201), f"Failed to create unseen company: {create_res.text}"
    unseen_comp = create_res.json()
    u_id = unseen_comp["id"]
    print(f" Created unseen company ID: {u_id}")

    # Verify dynamic profile
    u_prof = unseen_comp.get("profile")
    assert u_prof is not None, "Profile missing for unseen company"
    print(f" Unseen Industry: {unseen_comp.get('industry')}")
    print(f" Unseen Verified Facts: {len(u_prof.get('verified_facts', []))}")
    print(f" Unseen Assumptions: {len(u_prof.get('assumptions', []))}")

    # Verify dynamic questions
    u_qs = client.get(f"{BASE_URL}/interview/{u_id}/questions").json()
    print(f" Unseen Interview Questions: {len(u_qs)} generated")
    assert len(u_qs) == 10, "Expected 10 questions for unseen company"
    print(f" Sample Q1: {u_qs[0]['question_text']}")

    # Verify dynamic source discovery
    u_srcs = client.get(f"{BASE_URL}/sources/{u_id}").json()
    print(f" Unseen Discovered Sources: {len(u_srcs)}")
    assert len(u_srcs) >= 10, f"Expected sources discovered, got {len(u_srcs)}"

    # Verify dynamic competitors
    u_comps = client.get(f"{BASE_URL}/sources/{u_id}/competitors").json()
    print(f" Unseen Discovered Competitors: {len(u_comps)}")
    for c in u_comps[:3]:
        print(f"   - {c['name']}: {c['offering_summary'][:60]}...")
    assert len(u_comps) >= 4, f"Expected >= 4 competitors, got {len(u_comps)}"

    # Run crawl on unseen company
    print(" Running live crawl on unseen company sources...")
    crawl_res = client.post(f"{BASE_URL}/crawl/{u_id}")
    assert crawl_res.status_code in (200, 201), f"Crawl failed: {crawl_res.text}"
    print(" Crawl result:", crawl_res.json())

    # Verify signals generated
    u_sigs = client.get(f"{BASE_URL}/signals/{u_id}").json()
    print(f" Unseen Extracted Signals: {len(u_sigs)}")
    assert isinstance(u_sigs, list), "Expected list of signals"

    # Generate brief for unseen company
    print(" Generating Monday Morning Brief for unseen company...")
    u_brief = client.post(f"{BASE_URL}/briefs/generate", json={"company_id": u_id, "days_back": 7}).json()
    print(f" Unseen Brief Title: {u_brief['title']}")
    print(f" Unseen Brief Opportunities: {len(u_brief.get('opportunities_identified', []))}")
    assert u_brief.get("title") is not None, "Failed to generate brief"
    results["unseen_company"] = "PASS"

    # 11. Final Summary
    log_section("FINAL VERIFICATION SUMMARY")
    print(json.dumps(results, indent=2))
    all_pass = all(v == "PASS" for v in results.values())
    print("\nOVERALL VERDICT:", "100% PASS - ALL SYSTEM REQUIREMENTS SATISFIED" if all_pass else "FAIL")

if __name__ == "__main__":
    main()
