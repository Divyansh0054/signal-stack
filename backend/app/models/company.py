import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    website = Column(String(512), nullable=False, unique=True, index=True)
    industry = Column(String(255), nullable=True)
    current_focus = Column(Text, nullable=True)  # Business context / focus description
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("CompanyProfile", back_populates="company", uselist=False, cascade="all, delete-orphan")
    interview_questions = relationship("InterviewQuestion", back_populates="company", cascade="all, delete-orphan")
    interview_answers = relationship("InterviewAnswer", back_populates="company", cascade="all, delete-orphan")
    sources = relationship("Source", back_populates="company", cascade="all, delete-orphan")
    competitors = relationship("Competitor", back_populates="company", cascade="all, delete-orphan")
    content_items = relationship("ContentItem", back_populates="company", cascade="all, delete-orphan")
    intelligence_signals = relationship("IntelligenceSignal", back_populates="company", cascade="all, delete-orphan")
    briefs = relationship("Brief", back_populates="company", cascade="all, delete-orphan")
    internal_documents = relationship("InternalDocument", back_populates="company", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="company", cascade="all, delete-orphan")


class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    business_description = Column(Text, nullable=True)
    products_services = Column(JSON, default=list)        # list of {name, description, evidence}
    customer_segments = Column(JSON, default=list)        # list of {segment, description, evidence}
    geographic_markets = Column(JSON, default=list)       # list of regions
    positioning = Column(Text, nullable=True)
    business_model = Column(Text, nullable=True)
    strategic_themes = Column(JSON, default=list)         # list of strings
    verified_facts = Column(JSON, default=list)           # list of {fact, citation_url, snippet}
    assumptions = Column(JSON, default=list)              # list of {assumption, reason, needs_verification}
    raw_research_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="profile")
