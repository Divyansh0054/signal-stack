import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models.brief import Brief, BriefAction
from backend.app.models.signal import IntelligenceSignal
from backend.app.models.company import Company
from backend.app.models.document import InternalDocument

logger = logging.getLogger(__name__)


class MondayBriefEngine:
    """
    Synthesizes executive-level Monday Morning Intelligence Briefs
    strictly conforming to the 10-section architectural mandate.
    """

    def generate_brief(
        self,
        db: Session,
        company_id: str,
        days_back: int = 7
    ) -> Brief:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise ValueError(f"Company {company_id} not found.")

        now = datetime.utcnow()
        start_date = now - timedelta(days=days_back)

        # Retrieve signals generated within time window, ordered by ranking_score descending
        signals = db.query(IntelligenceSignal).filter(
            IntelligenceSignal.company_id == company_id,
            IntelligenceSignal.created_at >= start_date
        ).order_by(IntelligenceSignal.ranking_score.desc()).all()

        # Retrieve internal documents
        internal_docs = db.query(InternalDocument).filter(
            InternalDocument.company_id == company_id
        ).all()

        # 1. Executive Summary (top 5 developments)
        top_5_signals = signals[:5]
        executive_summary = []
        for sig in top_5_signals:
            executive_summary.append({
                "signal_id": sig.id,
                "title": sig.title,
                "category": sig.category,
                "ranking_score": sig.ranking_score,
                "priority": sig.overall_priority,
                "why_it_matters": sig.why_it_matters,
                "recommended_action": sig.recommended_action
            })

        # 2. Customer Signals
        customer_signals = [
            {
                "title": s.title,
                "evidence": s.evidence_snippet,
                "source": s.source_name,
                "url": s.source_url,
                "why_it_matters": s.why_it_matters,
                "sentiment": s.opportunity_threat
            }
            for s in signals if s.category == "Customers"
        ]

        # 3. Competitor Intelligence
        competitor_signals = [
            {
                "title": s.title,
                "evidence": s.evidence_snippet,
                "source": s.source_name,
                "url": s.source_url,
                "why_it_matters": s.why_it_matters,
                "affected_area": s.affected_business_area
            }
            for s in signals if s.category == "Competitors"
        ]

        # 4. Market Intelligence
        market_signals = [
            {
                "title": s.title,
                "evidence": s.evidence_snippet,
                "source": s.source_name,
                "url": s.source_url,
                "why_it_matters": s.why_it_matters,
                "verification_status": s.verification_status
            }
            for s in signals if s.category == "Market"
        ]

        # 5. Internal Business Intelligence
        internal_intelligence = []
        for doc in internal_docs:
            for obj in doc.objections or []:
                internal_intelligence.append({
                    "type": "Customer Objection",
                    "insight": obj.get("objection") if isinstance(obj, dict) else str(obj),
                    "source_doc": doc.filename
                })
            for ld in doc.lost_deal_reasons or []:
                internal_intelligence.append({
                    "type": "Lost Deal Reason",
                    "insight": ld.get("reason") if isinstance(ld, dict) else str(ld),
                    "source_doc": doc.filename
                })
            for pr in doc.product_requests or []:
                internal_intelligence.append({
                    "type": "Product Request",
                    "insight": pr.get("request") if isinstance(pr, dict) else str(pr),
                    "source_doc": doc.filename
                })

        # 6. Opportunities Identified (minimum 3 actionable opportunities)
        opp_signals = [s for s in signals if s.opportunity_threat == "OPPORTUNITY"]
        opportunities = []
        for s in opp_signals[:5]:
            opportunities.append({
                "title": s.title,
                "evidence": s.evidence_snippet,
                "business_impact": f"High commercial potential in {s.affected_business_area}",
                "next_step": s.recommended_action,
                "priority": s.overall_priority
            })

        # If fewer than 3 opportunities from live crawl, identify proactive strategic opportunities based on market signals
        if len(opportunities) < 3 and len(signals) >= 1:
            for s in signals:
                if len(opportunities) >= 3:
                    break
                if s not in opp_signals:
                    opportunities.append({
                        "title": f"Strategic Opportunity: Leverage {s.affected_business_area}",
                        "evidence": s.evidence_snippet,
                        "business_impact": f"Proactively address market movement in {s.source_name}",
                        "next_step": s.recommended_action,
                        "priority": "HIGH"
                    })

        # 7. Risks & Threats
        threat_signals = [s for s in signals if s.opportunity_threat == "THREAT"]
        risks_and_threats = []
        for s in threat_signals[:5]:
            risks_and_threats.append({
                "development": s.title,
                "possible_impact": s.why_it_matters,
                "urgency": f"{s.urgency:.0f}/100 ({s.overall_priority})",
                "evidence_snippet": s.evidence_snippet,
                "source_url": s.source_url
            })

        # 8. Recommended Actions for This Week
        recommended_actions = []
        for idx, s in enumerate(top_5_signals[:5], start=1):
            owner = "Head of Growth / Marketing" if "Acquisition" in s.affected_business_area else (
                "Legal & Compliance Lead" if "Compliance" in s.affected_business_area else (
                    "Product Lead" if "Product" in s.affected_business_area else "Founder / CEO"
                )
            )
            recommended_actions.append({
                "action": s.recommended_action,
                "reason": s.why_it_matters,
                "suggested_owner": owner,
                "priority": s.overall_priority
            })

        # 9. What We Should Watch
        what_we_should_watch = []
        watch_signals = signals[5:10] if len(signals) > 5 else signals[:3]
        for s in watch_signals:
            what_we_should_watch.append({
                "topic": s.title,
                "monitoring_angle": f"Track follow-up disclosures from {s.source_name} regarding {s.affected_business_area}",
                "source": s.source_name
            })

        # 10. Source Appendix (complete verifiable audit trail)
        source_appendix = []
        for s in signals:
            source_appendix.append({
                "original_source": s.source_name,
                "direct_link": s.source_url,
                "publication_date": s.publication_date.isoformat() if s.publication_date else "N/A",
                "discovery_date": s.discovery_date.isoformat(),
                "evidence_snippet": s.evidence_snippet,
                "verification_status": s.verification_status,
                "reliability": s.source_reliability
            })

        # Generate Markdown presentation
        markdown_text = self._render_markdown_brief(
            company_name=company.name,
            monitoring_start=start_date,
            monitoring_end=now,
            executive_summary=executive_summary,
            customer_signals=customer_signals,
            competitor_signals=competitor_signals,
            market_signals=market_signals,
            internal_intelligence=internal_intelligence,
            opportunities=opportunities,
            risks_and_threats=risks_and_threats,
            recommended_actions=recommended_actions,
            what_we_should_watch=what_we_should_watch,
            source_appendix=source_appendix
        )

        brief = Brief(
            company_id=company_id,
            title=f"Monday Morning Executive Brief — {company.name} ({now.strftime('%b %d, %Y')})",
            monitoring_start=start_date,
            monitoring_end=now,
            executive_summary=executive_summary,
            customer_signals=customer_signals,
            competitor_intelligence=competitor_signals,
            market_intelligence=market_signals,
            internal_intelligence=internal_intelligence,
            opportunities_identified=opportunities,
            risks_and_threats=risks_and_threats,
            recommended_actions=recommended_actions,
            what_we_should_watch=what_we_should_watch,
            source_appendix=source_appendix,
            raw_markdown=markdown_text,
            is_delivered=False
        )

        db.add(brief)
        db.commit()
        db.refresh(brief)

        # Create BriefAction records for action item tracking
        for act in recommended_actions:
            action_record = BriefAction(
                brief_id=brief.id,
                title=act["action"][:100],
                description=act["reason"],
                suggested_owner=act["suggested_owner"],
                priority=act["priority"],
                status="PENDING"
            )
            db.add(action_record)
        db.commit()

        return brief

    def _render_markdown_brief(
        self,
        company_name: str,
        monitoring_start: datetime,
        monitoring_end: datetime,
        executive_summary: List[Dict[str, Any]],
        customer_signals: List[Dict[str, Any]],
        competitor_signals: List[Dict[str, Any]],
        market_signals: List[Dict[str, Any]],
        internal_intelligence: List[Dict[str, Any]],
        opportunities: List[Dict[str, Any]],
        risks_and_threats: List[Dict[str, Any]],
        recommended_actions: List[Dict[str, Any]],
        what_we_should_watch: List[Dict[str, Any]],
        source_appendix: List[Dict[str, Any]]
    ) -> str:
        md = []
        md.append(f"# MONDAY MORNING EXECUTIVE BRIEF — {company_name.upper()}")
        md.append(f"**Monitoring Window:** {monitoring_start.strftime('%Y-%m-%d')} to {monitoring_end.strftime('%Y-%m-%d')}  ")
        md.append(f"**Confidentiality:** Executive Leadership Eyes Only\n")
        md.append("---\n")

        # 1. Executive Summary
        md.append("## 1. Executive Summary (Top Developments)")
        if executive_summary:
            for i, item in enumerate(executive_summary, 1):
                md.append(f"### {i}. [{item['priority']}] {item['title']}")
                md.append(f"- **Impact Score:** {item['ranking_score']}/100")
                md.append(f"- **Why It Matters:** {item['why_it_matters']}")
                md.append(f"- **Recommended Response:** {item['recommended_action']}\n")
        else:
            md.append("*No meaningful development detected during this monitoring period.*\n")

        # 2. Customer Signals
        md.append("## 2. Customer Signals")
        if customer_signals:
            for s in customer_signals:
                md.append(f"- **{s['title']}** ({s['source']})")
                md.append(f"  - *Evidence:* \"{s['evidence']}\"")
                md.append(f"  - *Implication:* {s['why_it_matters']}\n")
        else:
            md.append("*No meaningful development detected during this monitoring period.*\n")

        # 3. Competitor Intelligence
        md.append("## 3. Competitor Intelligence")
        if competitor_signals:
            for s in competitor_signals:
                md.append(f"- **{s['title']}**")
                md.append(f"  - *Source:* [{s['source']}]({s['url']})")
                md.append(f"  - *Evidence:* \"{s['evidence']}\"")
                md.append(f"  - *Business Implication:* {s['why_it_matters']}\n")
        else:
            md.append("*No meaningful development detected during this monitoring period.*\n")

        # 4. Market Intelligence
        md.append("## 4. Market Intelligence")
        if market_signals:
            for s in market_signals:
                md.append(f"- **{s['title']}** ({s['verification_status']})")
                md.append(f"  - *Source:* [{s['source']}]({s['url']})")
                md.append(f"  - *Evidence:* \"{s['evidence']}\"")
                md.append(f"  - *Strategic Impact:* {s['why_it_matters']}\n")
        else:
            md.append("*No meaningful development detected during this monitoring period.*\n")

        # 5. Internal Business Intelligence
        md.append("## 5. Internal Business Intelligence")
        if internal_intelligence:
            for item in internal_intelligence:
                md.append(f"- **[{item['type']}]** {item['insight']} *(Source: {item['source_doc']})*")
            md.append("")
        else:
            md.append("*No internal document intelligence uploaded for this period.*\n")

        # 6. Opportunities Identified
        md.append("## 6. Actionable Opportunities Identified")
        if opportunities:
            for i, opp in enumerate(opportunities, 1):
                md.append(f"### Opportunity {i}: {opp['title']}")
                md.append(f"- **Evidence:** \"{opp['evidence']}\"")
                md.append(f"- **Commercial Impact:** {opp['business_impact']}")
                md.append(f"- **Next Concrete Step:** {opp['next_step']}")
                md.append(f"- **Priority:** {opp['priority']}\n")
        else:
            md.append("*No immediate commercial opportunities detected during this period.*\n")

        # 7. Risks & Threats
        md.append("## 7. Risks & Threats")
        if risks_and_threats:
            for r in risks_and_threats:
                md.append(f"- **Threat:** {r['development']}")
                md.append(f"  - *Possible Impact:* {r['possible_impact']}")
                md.append(f"  - *Urgency:* {r['urgency']}")
                md.append(f"  - *Evidence:* \"{r['evidence_snippet']}\"\n")
        else:
            md.append("*No critical threats identified during this monitoring period.*\n")

        # 8. Recommended Actions for This Week
        md.append("## 8. Recommended Actions for This Week")
        if recommended_actions:
            md.append("| # | Action | Strategic Rationale | Suggested Owner | Priority |")
            md.append("|---|---|---|---|---|")
            for i, act in enumerate(recommended_actions, 1):
                clean_act = act['action'].replace('|', '/')
                clean_reason = act['reason'].replace('|', '/')
                md.append(f"| {i} | {clean_act} | {clean_reason} | {act['suggested_owner']} | {act['priority']} |")
            md.append("")
        else:
            md.append("*No urgent operational actions required for this week.*\n")

        # 9. What We Should Watch
        md.append("## 9. What We Should Watch")
        if what_we_should_watch:
            for w in what_we_should_watch:
                md.append(f"- **{w['topic']}**: {w['monitoring_angle']} (Source: {w['source']})")
            md.append("")
        else:
            md.append("*Standard baseline monitoring active.*\n")

        # 10. Source Appendix
        md.append("## 10. Source Appendix & Verifiable Audit Trail")
        if source_appendix:
            md.append("| Source | URL | Published | Status | Evidence Snippet |")
            md.append("|---|---|---|---|---|")
            for sa in source_appendix[:15]:
                clean_snippet = sa['evidence_snippet'][:100].replace('|', '/').replace('\n', ' ')
                md.append(f"| {sa['original_source']} | [Direct Link]({sa['direct_link']}) | {sa['publication_date']} | {sa['verification_status']} | \"{clean_snippet}...\" |")
            md.append("")
        else:
            md.append("*No external source citations available.*\n")

        return "\n".join(md)


brief_engine = MondayBriefEngine()
