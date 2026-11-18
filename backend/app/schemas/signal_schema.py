from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SignalFilterParams(BaseModel):
    category: Optional[str] = None
    priority: Optional[str] = None
    opportunity_threat: Optional[str] = None
    verification_status: Optional[str] = None
    search: Optional[str] = None
    limit: int = 50
    offset: int = 0


class IntelligenceSignalResponse(BaseModel):
    id: str
    company_id: str
    source_id: Optional[str] = None
    content_item_id: Optional[str] = None
    title: str
    summary: str
    category: str
    source_name: str
    source_url: str
    publication_date: Optional[datetime] = None
    discovery_date: datetime

    # Factual Evidence
    evidence_snippet: str
    verification_status: str
    evidence_strength: str
    source_reliability: str

    # Strategic Interpretation
    strategic_relevance: float
    business_impact: float
    urgency: float
    novelty: float
    opportunity_threat: str
    affected_business_area: str
    why_it_matters: str
    recommended_action: str

    # Ranking
    overall_priority: str
    ranking_score: float
    ranking_explanation: str
    created_at: datetime

    class Config:
        from_attributes = True


class CrawlRunResponse(BaseModel):
    id: str
    company_id: str
    trigger_type: str
    status: str
    sources_attempted: int
    sources_successful: int
    sources_failed: int
    items_collected: int
    duplicates_detected: int
    signals_generated: int
    error_summary: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
