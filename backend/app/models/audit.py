import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class ScheduledJob(Base):
    __tablename__ = "scheduled_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_type = Column(String(50), nullable=False)          # WEEKLY_BRIEF, MONTHLY_AUDIT
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=True)
    cron_expression = Column(String(50), nullable=False)
    status = Column(String(50), default="ACTIVE")          # ACTIVE, PAUSED, ERROR
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    last_execution_status = Column(String(50), nullable=True) # SUCCESS, FAILED
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=True, index=True)
    event_type = Column(String(100), nullable=False)       # AUDIT_RUN, CRAWL_RUN, DEAD_URL, CONTEXT_PIVOT, SOURCE_ADDED
    severity = Column(String(20), default="INFO")          # INFO, WARNING, ERROR
    message = Column(Text, nullable=False)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="audit_logs")


class ContextAdaptationRecord(Base):
    __tablename__ = "context_adaptation_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    previous_context = Column(Text, nullable=False)
    new_context = Column(Text, nullable=False)
    rationale = Column(Text, nullable=False)
    sources_flagged_obsolete = Column(JSON, default=list)  # list of source IDs/names
    new_sources_recommended = Column(JSON, default=list)   # list of recommended sources
    adaptation_summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
