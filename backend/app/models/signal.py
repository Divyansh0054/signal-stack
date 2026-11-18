import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from backend.app.database import Base


class CrawlRun(Base):
    __tablename__ = "crawl_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    trigger_type = Column(String(50), default="MANUAL")   # MANUAL, WEEKLY_AUTOMATION, MONTHLY_AUDIT
    status = Column(String(50), default="RUNNING")        # RUNNING, COMPLETED, FAILED
    sources_attempted = Column(Integer, default=0)
    sources_successful = Column(Integer, default=0)
    sources_failed = Column(Integer, default=0)
    items_collected = Column(Integer, default=0)
    duplicates_detected = Column(Integer, default=0)
    signals_generated = Column(Integer, default=0)
    error_summary = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_id = Column(String(36), ForeignKey("sources.id"), nullable=False, index=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    crawl_run_id = Column(String(36), ForeignKey("crawl_runs.id"), nullable=True)
    title = Column(String(512), nullable=False)
    url = Column(String(1024), nullable=False)
    normalized_url = Column(String(1024), nullable=False, index=True)
    content_hash = Column(String(64), nullable=False, index=True)  # SHA-256
    published_date = Column(DateTime, nullable=True)
    discovered_date = Column(DateTime, default=datetime.utcnow)
    raw_text = Column(Text, nullable=False)
    snippet = Column(Text, nullable=True)
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(String(36), nullable=True)

    company = relationship("Company", back_populates="content_items")
    source = relationship("Source", back_populates="content_items")
    signals = relationship("IntelligenceSignal", back_populates="content_item")


class IntelligenceSignal(Base):
    __tablename__ = "intelligence_signals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    content_item_id = Column(String(36), ForeignKey("content_items.id"), nullable=True, index=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    source_id = Column(String(36), ForeignKey("sources.id"), nullable=True, index=True)
    
    title = Column(String(512), nullable=False)
    summary = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)          # Customers, Competitors, Market, Internal
    source_name = Column(String(255), nullable=False)
    source_url = Column(String(1024), nullable=False)
    publication_date = Column(DateTime, nullable=True)
    discovery_date = Column(DateTime, default=datetime.utcnow)

    # STRICT SEPARATION OF EVIDENCE AND INTERPRETATION
    # 1. Raw factual evidence
    evidence_snippet = Column(Text, nullable=False)        # Exact verbatim quote/evidence
    verification_status = Column(String(50), default="VERIFIED") # VERIFIED, UNVERIFIED, OFFICIAL
    evidence_strength = Column(String(50), default="HIGH") # HIGH, MEDIUM, LOW
    source_reliability = Column(String(50), default="HIGH")# HIGH, MEDIUM, LOW

    # 2. Strategic business interpretation
    strategic_relevance = Column(Float, nullable=False)    # 0.0 to 100.0
    business_impact = Column(Float, nullable=False)        # 0.0 to 100.0
    urgency = Column(Float, nullable=False)                # 0.0 to 100.0
    novelty = Column(Float, nullable=False)                # 0.0 to 100.0
    opportunity_threat = Column(String(20), nullable=False)# OPPORTUNITY, THREAT, NEUTRAL
    affected_business_area = Column(String(100), nullable=False) # Pricing, Product, Acquisition, Partnerships, Compliance
    why_it_matters = Column(Text, nullable=False)          # Strategic interpretation of why founder should care
    recommended_action = Column(Text, nullable=False)      # Actionable operational recommendation

    # Ranking computation
    overall_priority = Column(String(20), nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    ranking_score = Column(Float, nullable=False)          # Weighted composite 0.0 to 100.0
    ranking_explanation = Column(Text, nullable=False)     # Transparent breakdown of why this signal is ranked as such

    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="intelligence_signals")
    source = relationship("Source", back_populates="intelligence_signals")
    content_item = relationship("ContentItem", back_populates="signals")
