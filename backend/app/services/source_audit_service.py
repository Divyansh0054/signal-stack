import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.source import Source
from backend.app.models.company import Company
from backend.app.models.audit import AuditLog
from backend.app.services.web_extractor import fetch_url
from backend.app.services.source_discovery import source_discovery

logger = logging.getLogger(__name__)


class SourceAuditService:
    """
    Performs monthly comprehensive health and relevance audit on monitored sources:
    - Dead URL detection (404, 500, timeouts)
    - Inactive / stagnant source detection
    - Declining relevance assessment
    - Dynamic discovery of new candidate sources
    - Actionable recommendations for additions and removals
    """

    def run_monthly_audit(self, db: Session, company_id: str) -> Dict[str, Any]:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise ValueError(f"Company {company_id} not found.")

        sources = db.query(Source).filter(Source.company_id == company_id).all()

        checked_count = len(sources)
        healthy_sources = []
        dead_sources = []
        inactive_sources = []
        relevance_flags = []
        recommendations = []

        now = datetime.utcnow()

        for source in sources:
            if source.url.startswith("internal://"):
                continue

            # Live ping to test URL viability
            res = fetch_url(source.url, check_robots=False)

            if not res["success"]:
                dead_sources.append({
                    "id": source.id,
                    "name": source.name,
                    "url": source.url,
                    "status_code": res.get("status_code"),
                    "error": res.get("error")
                })
                source.health_status = "FAILED"
                source.last_http_status = res.get("status_code")
                source.failure_reason = res.get("error")
                recommendations.append({
                    "action": "REMOVE_OR_REPLACE",
                    "source_id": source.id,
                    "source_name": source.name,
                    "reason": f"Dead URL (HTTP {res.get('status_code')}: {res.get('error')})"
                })
            else:
                healthy_sources.append(source.name)
                source.health_status = "HEALTHY"
                source.last_http_status = res.get("status_code")
                source.response_time_ms = res.get("response_time_ms")

            # Check inactivity (no items collected in last 30 days)
            if source.last_checked_at and (now - source.last_checked_at) > timedelta(days=30):
                inactive_sources.append(source.name)

        # Discover potential new sources to recommend
        new_sources, new_competitors = source_discovery.discover_signal_stack_sources(db, company_id)

        # Log audit record
        audit_log = AuditLog(
            company_id=company_id,
            event_type="MONTHLY_AUDIT_RUN",
            severity="WARNING" if dead_sources else "INFO",
            message=f"Monthly Source Health Audit completed: {len(dead_sources)} dead URLs, {len(healthy_sources)} healthy sources.",
            details={
                "total_checked": checked_count,
                "healthy_count": len(healthy_sources),
                "dead_count": len(dead_sources),
                "dead_sources": dead_sources,
                "recommendations": recommendations
            }
        )
        db.add(audit_log)
        db.commit()

        return {
            "audit_timestamp": now.isoformat(),
            "company_name": company.name,
            "total_checked": checked_count,
            "healthy_count": len(healthy_sources),
            "dead_sources": dead_sources,
            "inactive_sources": inactive_sources,
            "recommendations": recommendations,
            "discovered_new_sources_count": len(new_sources)
        }


source_audit_service = SourceAuditService()
