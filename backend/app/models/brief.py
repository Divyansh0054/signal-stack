import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Brief(Base):
    __tablename__ = "briefs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    monitoring_start = Column(DateTime, nullable=False)
    monitoring_end = Column(DateTime, nullable=False)

    # 10 MANDATORY SECTIONS
    executive_summary = Column(JSON, nullable=False)        # Top 5 developments leadership must know
    customer_signals = Column(JSON, nullable=False)         # Emerging problems, complaints, sentiment, unmet needs
    competitor_intelligence = Column(JSON, nullable=False)  # What changed, evidence, why it matters
    market_intelligence = Column(JSON, nullable=False)      # Regulatory, industry, economic, tech shifts
    internal_intelligence = Column(JSON, nullable=False)    # Objections, sales patterns, lost-deals, product feedback
    opportunities_identified = Column(JSON, nullable=False) # Min 3 with evidence, impact, next step, priority
    risks_and_threats = Column(JSON, nullable=False)        # Negative developments, potential impact, urgency
    recommended_actions = Column(JSON, nullable=False)      # Prioritized actions with reason & suggested owner
    what_we_should_watch = Column(JSON, nullable=False)     # Early developments deserving continued observation
    source_appendix = Column(JSON, nullable=False)          # Full audit trail: source, URL, snippet, dates, verification

    raw_markdown = Column(Text, nullable=False)
    is_delivered = Column(Boolean, default=False)

    company = relationship("Company", back_populates="briefs")
    actions = relationship("BriefAction", back_populates="brief", cascade="all, delete-orphan")


class BriefAction(Base):
    __tablename__ = "brief_actions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    brief_id = Column(String(36), ForeignKey("briefs.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    suggested_owner = Column(String(100), default="Founder / CEO")
    priority = Column(String(20), default="HIGH")          # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(50), default="PENDING")         # PENDING, IN_PROGRESS, COMPLETED, DISMISSED
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    brief = relationship("Brief", back_populates="actions")
