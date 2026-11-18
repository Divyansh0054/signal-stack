import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.company import Company
from backend.app.models.source import Source
from backend.app.models.audit import ContextAdaptationRecord, AuditLog
from backend.app.services.source_discovery import source_discovery

logger = logging.getLogger(__name__)


class ContextAdaptationEngine:
    """
    Handles business-context pivots (e.g. B2C student acquisition -> B2B university partnerships).
    Re-assesses source relevance, flags obsolete sources, recommends new specialized sources,
    updates Signal Stack, and explains rationale.
    """

    def adapt_business_context(
        self,
        db: Session,
        company_id: str,
        new_context: str
    ) -> ContextAdaptationRecord:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise ValueError(f"Company {company_id} not found.")

        previous_context = company.current_focus or "General multi-channel expansion"
        company.current_focus = new_context

        # Re-assess existing sources against new focus
        existing_sources = db.query(Source).filter(Source.company_id == company_id).all()
        flagged_obsolete = []
        new_recommendations = []

        is_b2b_pivot = any(w in new_context.lower() for w in ["b2b", "university partnership", "institution", "enterprise", "licensing"])

        for src in existing_sources:
            if is_b2b_pivot:
                # Consumer student forums have lower direct relevance to B2B partnership contracts
                if "reddit" in src.url.lower() or "quora" in src.url.lower() or src.category == "Customers":
                    src.relevance_score = max(50.0, src.relevance_score - 25.0)
                    flagged_obsolete.append({
                        "source_id": src.id,
                        "source_name": src.name,
                        "previous_relevance": src.relevance_score + 25.0,
                        "new_relevance": src.relevance_score,
                        "rationale": "Direct student complaint forums provide secondary consumer sentiment rather than institutional partnership intelligence."
                    })
                # B2B & Regulatory sources have higher relevance
                elif src.category in ("Market", "Competitors"):
                    src.relevance_score = min(100.0, src.relevance_score + 10.0)

        # Discover new B2B focused sources & competitors
        discovered_sources, discovered_competitors = source_discovery.discover_signal_stack_sources(
            db=db,
            company_id=company_id,
            current_focus=new_context
        )

        for src in discovered_sources:
            if is_b2b_pivot and any(w in src.name.lower() or w in src.reason_for_inclusion.lower() for w in ["partner", "university", "institutional", "pie news", "icef", "he"]):
                new_recommendations.append({
                    "name": src.name,
                    "url": src.url,
                    "category": src.category,
                    "reason": src.reason_for_inclusion
                })

        summary = (
            f"Strategic context changed from '{previous_context}' to '{new_context}'. "
            f"Re-assessed {len(existing_sources)} sources: {len(flagged_obsolete)} consumer sources de-prioritized, "
            f"{len(new_recommendations)} institutional partnership sources activated."
        )

        record = ContextAdaptationRecord(
            company_id=company_id,
            previous_context=previous_context,
            new_context=new_context,
            rationale=f"Pivoted intelligence weighting to reflect strategic focus on {new_context}.",
            sources_flagged_obsolete=flagged_obsolete,
            new_sources_recommended=new_recommendations,
            adaptation_summary=summary
        )
        db.add(record)

        audit = AuditLog(
            company_id=company_id,
            event_type="CONTEXT_PIVOT",
            severity="INFO",
            message=summary,
            details={
                "previous_context": previous_context,
                "new_context": new_context,
                "flagged_count": len(flagged_obsolete),
                "new_recommended_count": len(new_recommendations)
            }
        )
        db.add(audit)
        db.commit()
        db.refresh(record)

        return record


context_adaptation_engine = ContextAdaptationEngine()
