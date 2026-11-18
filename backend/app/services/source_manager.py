import time
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.source import Source
from backend.app.models.audit import AuditLog
from backend.app.services.web_extractor import is_safe_url, fetch_url

logger = logging.getLogger(__name__)


class SourceManager:
    """
    Manages Source lifecycle: creation, health tracking, approval, disabling,
    and performance metrics.
    """

    def add_source(
        self,
        db: Session,
        company_id: str,
        name: str,
        url: str,
        category: str,
        source_type: str = "RSS",
        reason_for_inclusion: str = "",
        expected_frequency: str = "WEEKLY",
        credibility_rating: str = "HIGH"
    ) -> Source:
        # Prevent internal protocol checks if not internal
        if not url.startswith("internal://"):
            is_safe, reason = is_safe_url(url)
            if not is_safe:
                raise ValueError(f"Invalid or unsafe URL: {reason}")

        existing = db.query(Source).filter(
            Source.company_id == company_id,
            Source.url == url
        ).first()
        if existing:
            raise ValueError(f"Source with URL {url} already exists for this company.")

        source = Source(
            company_id=company_id,
            name=name,
            url=url,
            category=category,
            source_type=source_type,
            reason_for_inclusion=reason_for_inclusion or f"Manually added intelligence source for {category}.",
            relevance_score=85.0,
            credibility_rating=credibility_rating,
            expected_frequency=expected_frequency,
            status="APPROVED",
            health_status="HEALTHY"
        )
        db.add(source)

        audit = AuditLog(
            company_id=company_id,
            event_type="SOURCE_ADDED",
            severity="INFO",
            message=f"Added new {category} source: {name} ({url})",
            details={"name": name, "url": url, "category": category}
        )
        db.add(audit)
        db.commit()
        db.refresh(source)
        return source

    def update_source_health(
        self,
        db: Session,
        source_id: str,
        success: bool,
        http_status: Optional[int] = None,
        response_time_ms: Optional[float] = None,
        error_msg: Optional[str] = None
    ):
        source = db.query(Source).filter(Source.id == source_id).first()
        if not source:
            return

        now = datetime.utcnow()
        source.last_checked_at = now
        source.last_http_status = http_status
        if response_time_ms is not None:
            source.response_time_ms = response_time_ms

        if success:
            source.last_success_at = now
            source.consecutive_failures = 0
            source.health_status = "HEALTHY"
            source.failure_reason = None
        else:
            source.last_failure_at = now
            source.consecutive_failures = (source.consecutive_failures or 0) + 1
            source.failure_reason = error_msg

            if source.consecutive_failures >= 3:
                source.health_status = "FAILED"
            elif source.consecutive_failures >= 1:
                source.health_status = "WARNING"

        db.commit()

    def set_source_status(self, db: Session, source_id: str, status: str) -> Source:
        source = db.query(Source).filter(Source.id == source_id).first()
        if not source:
            raise ValueError(f"Source {source_id} not found.")

        source.status = status.upper()
        if status.upper() == "DISABLED":
            source.health_status = "INACTIVE"
        elif status.upper() == "APPROVED" and source.health_status == "INACTIVE":
            source.health_status = "HEALTHY"

        db.commit()
        db.refresh(source)
        return source

    def delete_source(self, db: Session, source_id: str) -> bool:
        source = db.query(Source).filter(Source.id == source_id).first()
        if not source:
            return False

        audit = AuditLog(
            company_id=source.company_id,
            event_type="SOURCE_REMOVED",
            severity="WARNING",
            message=f"Removed source: {source.name} ({source.url})",
            details={"source_id": source_id, "name": source.name, "url": source.url}
        )
        db.add(audit)
        db.delete(source)
        db.commit()
        return True


source_manager = SourceManager()
