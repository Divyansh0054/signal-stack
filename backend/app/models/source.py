import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Source(Base):
    __tablename__ = "sources"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(512), nullable=False, index=True)
    category = Column(String(50), nullable=False)        # Customers, Competitors, Market, Internal
    source_type = Column(String(50), nullable=False)     # RSS, WebPage, Regulatory, ReviewHub, NewsFeed
    reason_for_inclusion = Column(Text, nullable=False)  # "Why are we monitoring this source?"
    relevance_score = Column(Float, default=80.0)        # 0.0 to 100.0
    credibility_rating = Column(String(20), default="HIGH") # HIGH, MEDIUM, LOW
    expected_frequency = Column(String(50), default="WEEKLY") # DAILY, WEEKLY, MONTHLY
    status = Column(String(50), default="APPROVED")      # APPROVED, PENDING, DISABLED, REJECTED
    health_status = Column(String(50), default="HEALTHY") # HEALTHY, WARNING, FAILED, INACTIVE, NEEDS_REVIEW
    
    # Monitoring statistics
    last_checked_at = Column(DateTime, nullable=True)
    last_success_at = Column(DateTime, nullable=True)
    last_failure_at = Column(DateTime, nullable=True)
    consecutive_failures = Column(Integer, default=0)
    last_http_status = Column(Integer, nullable=True)
    response_time_ms = Column(Float, nullable=True)
    duplicate_count = Column(Integer, default=0)
    failure_reason = Column(Text, nullable=True)
    discovery_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="sources")
    content_items = relationship("ContentItem", back_populates="source", cascade="all, delete-orphan")
    intelligence_signals = relationship("IntelligenceSignal", back_populates="source")


class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    website = Column(String(512), nullable=True)
    offering_summary = Column(Text, nullable=True)
    competitor_type = Column(String(50), default="DIRECT") # DIRECT, INDIRECT, SUBSTITUTE
    why_it_matters = Column(Text, nullable=False)          # Explicit business rationale
    strengths = Column(Text, nullable=True)
    vulnerabilities = Column(Text, nullable=True)
    discovery_evidence = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="competitors")
