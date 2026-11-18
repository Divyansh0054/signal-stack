import re
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.signal import ContentItem, IntelligenceSignal
from backend.app.models.source import Source
from backend.app.models.company import Company
from backend.app.services.ranking_engine import ranking_engine

logger = logging.getLogger(__name__)


class IntelligenceAnalysisEngine:
    """
    Transforms raw content items into structured IntelligenceSignals.
    Enforces strict separation between factual evidence and strategic interpretation.
    """

    def process_content_item(
        self,
        db: Session,
        content_item: ContentItem,
        source: Optional[Source] = None
    ) -> IntelligenceSignal:
        company = db.query(Company).filter(Company.id == content_item.company_id).first()
        company_name = company.name if company else "Company"
        industry = company.industry if company else ""

        category = source.category if source else "Market"
        source_name = source.name if source else "Public Web Feed"
        credibility = source.credibility_rating if source else "HIGH"

        # 1. Extract Evidence (Verbatim snippet, URL, Dates)
        raw_text = content_item.raw_text
        title = content_item.title
        snippet = content_item.snippet or raw_text[:300]
        evidence_snippet = snippet

        # Determine verification status
        if source and source.source_type in ("Regulatory", "Official"):
            verification_status = "OFFICIAL"
            evidence_strength = "HIGH"
            source_reliability = "HIGH"
        elif "gov" in content_item.url or "edu" in content_item.url:
            verification_status = "OFFICIAL"
            evidence_strength = "HIGH"
            source_reliability = "HIGH"
        else:
            verification_status = "VERIFIED"
            evidence_strength = "HIGH" if len(raw_text) > 200 else "MEDIUM"
            source_reliability = credibility

        # 2. Derive Strategic Interpretation based on company context
        analysis = self._derive_interpretation(
            title=title,
            text=raw_text,
            category=category,
            company_name=company_name,
            industry=industry
        )

        # 3. Compute Transparent Ranking
        ranking_score, priority, explanation = ranking_engine.compute_ranking(
            relevance=analysis["strategic_relevance"],
            impact=analysis["business_impact"],
            urgency=analysis["urgency"],
            credibility_rating=source_reliability,
            novelty=analysis["novelty"],
            published_date=content_item.published_date or datetime.utcnow()
        )

        signal = IntelligenceSignal(
            content_item_id=content_item.id,
            company_id=content_item.company_id,
            source_id=source.id if source else None,
            title=title,
            summary=analysis["summary"],
            category=category,
            source_name=source_name,
            source_url=content_item.url,
            publication_date=content_item.published_date,
            discovery_date=content_item.discovered_date,
            evidence_snippet=evidence_snippet,
            verification_status=verification_status,
            evidence_strength=evidence_strength,
            source_reliability=source_reliability,
            strategic_relevance=analysis["strategic_relevance"],
            business_impact=analysis["business_impact"],
            urgency=analysis["urgency"],
            novelty=analysis["novelty"],
            opportunity_threat=analysis["opportunity_threat"],
            affected_business_area=analysis["affected_business_area"],
            why_it_matters=analysis["why_it_matters"],
            recommended_action=analysis["recommended_action"],
            overall_priority=priority,
            ranking_score=ranking_score,
            ranking_explanation=explanation
        )

        db.add(signal)
        db.commit()
        db.refresh(signal)
        return signal

    def _derive_interpretation(
        self,
        title: str,
        text: str,
        category: str,
        company_name: str,
        industry: str
    ) -> Dict[str, Any]:
        combined = f"{title} {text}".lower()

        # Categorize affected area
        if any(w in combined for w in ["visa", "regulation", "law", "policy", "government", "embassy", "cap", "compliance"]):
            affected_area = "Regulatory & Immigration Compliance"
            urgency = 88.0
            impact = 90.0
            relevance = 92.0
        elif any(w in combined for w in ["price", "cost", "fee", "funding", "discount", "margin", "commission"]):
            affected_area = "Commercial Pricing & Revenue"
            urgency = 75.0
            impact = 82.0
            relevance = 85.0
        elif any(w in combined for w in ["launch", "feature", "platform", "ai", "product", "sdk", "integration"]):
            affected_area = "Product & Technology Strategy"
            urgency = 70.0
            impact = 78.0
            relevance = 80.0
        elif any(w in combined for w in ["complaint", "issue", "scam", "delay", "reject", "frustrated", "problem", "drop"]):
            affected_area = "Customer Experience & Retention"
            urgency = 85.0
            impact = 80.0
            relevance = 88.0
        elif any(w in combined for w in ["partner", "university", "contract", "mou", "agreement"]):
            affected_area = "Partnerships & Channel Distribution"
            urgency = 72.0
            impact = 84.0
            relevance = 86.0
        else:
            affected_area = "Market Strategy & Operations"
            urgency = 60.0
            impact = 65.0
            relevance = 70.0

        # Determine opportunity vs threat
        threat_terms = ["reject", "cap", "ban", "decline", "fine", "cut", "warning", "delay", "strict", "freeze", "loss", "scam", "fraud"]
        opp_terms = ["growth", "expand", "funding", "partner", "grant", "surge", "open", "approve", "demand", "record", "alliance"]

        threat_count = sum(1 for w in threat_terms if w in combined)
        opp_count = sum(1 for w in opp_terms if w in combined)

        if threat_count > opp_count:
            opp_threat = "THREAT"
            why_it_matters = (
                f"Negative development in {affected_area.lower()} directly impacting {company_name}. "
                f"Requires operational mitigation to preserve student/customer conversion pipeline and retain margins."
            )
            rec_action = (
                f"Conduct immediate review of exposed accounts or applicant cohorts. "
                f"Publish guidance to affected users and diversify dependency on restricted jurisdictions or partners."
            )
        elif opp_count > threat_count:
            opp_threat = "OPPORTUNITY"
            why_it_matters = (
                f"Positive commercial tailwind in {affected_area.lower()}. "
                f"Presents near-term opportunity for {company_name} to capture displaced market share from competitors."
            )
            rec_action = (
                f"Deploy targeted messaging campaigns emphasizing {company_name}'s strengths in this area. "
                f"Engage prospective partners looking for rapid alternatives."
            )
        else:
            opp_threat = "NEUTRAL"
            why_it_matters = (
                f"Relevant market movement in {affected_area.lower()}. "
                f"Signals evolving expectations across the {industry or 'sector'} ecosystem."
            )
            rec_action = f"Monitor competitor responses and track customer sentiment changes over the next 14 days."

        summary = text[:220].strip()
        if len(text) > 220:
            summary += "..."

        return {
            "summary": summary,
            "strategic_relevance": relevance,
            "business_impact": impact,
            "urgency": urgency,
            "novelty": 80.0,
            "opportunity_threat": opp_threat,
            "affected_business_area": affected_area,
            "why_it_matters": why_it_matters,
            "recommended_action": rec_action
        }


intelligence_engine = IntelligenceAnalysisEngine()
