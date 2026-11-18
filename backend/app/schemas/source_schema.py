from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SourceCreateRequest(BaseModel):
    company_id: str
    name: str = Field(..., min_length=1, max_length=255)
    url: str = Field(..., min_length=4, max_length=512)
    category: str = Field(..., description="Customers, Competitors, Market, Internal")
    source_type: str = Field(default="RSS", description="RSS, WebPage, Regulatory, ReviewHub, NewsFeed")
    reason_for_inclusion: str = Field(..., description="Why are we monitoring this source?")
    expected_frequency: str = Field(default="WEEKLY")
    credibility_rating: str = Field(default="HIGH")


class SourceUpdateRequest(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    source_type: Optional[str] = None
    reason_for_inclusion: Optional[str] = None
    status: Optional[str] = None
    credibility_rating: Optional[str] = None


class SourceResponse(BaseModel):
    id: str
    company_id: str
    name: str
    url: str
    category: str
    source_type: str
    reason_for_inclusion: str
    relevance_score: float
    credibility_rating: str
    expected_frequency: str
    status: str
    health_status: str
    last_checked_at: Optional[datetime] = None
    last_success_at: Optional[datetime] = None
    last_failure_at: Optional[datetime] = None
    consecutive_failures: int
    last_http_status: Optional[int] = None
    response_time_ms: Optional[float] = None
    duplicate_count: int
    failure_reason: Optional[str] = None
    discovery_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class CompetitorCreateRequest(BaseModel):
    company_id: str
    name: str
    website: Optional[str] = None
    offering_summary: Optional[str] = None
    competitor_type: str = "DIRECT"
    why_it_matters: str
    strengths: Optional[str] = None
    vulnerabilities: Optional[str] = None
    discovery_evidence: Optional[str] = None


class CompetitorResponse(BaseModel):
    id: str
    company_id: str
    name: str
    website: Optional[str] = None
    offering_summary: Optional[str] = None
    competitor_type: str
    why_it_matters: str
    strengths: Optional[str] = None
    vulnerabilities: Optional[str] = None
    discovery_evidence: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SignalStackCategorySummary(BaseModel):
    category: str
    source_count: int
    active_sources: int
    sources: List[SourceResponse]
    competitors: Optional[List[CompetitorResponse]] = None
