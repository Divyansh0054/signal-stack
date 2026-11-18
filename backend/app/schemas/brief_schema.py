from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime


class BriefActionItem(BaseModel):
    title: str
    description: str
    suggested_owner: str = "Founder / CEO"
    priority: str = "HIGH"
    status: str = "PENDING"
    due_date: Optional[str] = None


class OpportunityItem(BaseModel):
    title: str
    evidence: str
    business_impact: str
    next_step: str
    priority: str = "HIGH"


class RiskItem(BaseModel):
    development: str
    possible_impact: str
    urgency: str = "HIGH"
    mitigation_step: Optional[str] = None


class SourceAppendixItem(BaseModel):
    original_source: str
    direct_link: str
    publication_date: Optional[str] = None
    discovery_date: str
    evidence_snippet: str
    verification_status: str


class BriefResponse(BaseModel):
    id: str
    company_id: str
    title: str
    generated_at: datetime
    monitoring_start: datetime
    monitoring_end: datetime

    executive_summary: List[Dict[str, Any]]
    customer_signals: List[Dict[str, Any]]
    competitor_intelligence: List[Dict[str, Any]]
    market_intelligence: List[Dict[str, Any]]
    internal_intelligence: List[Dict[str, Any]]
    opportunities_identified: List[Dict[str, Any]]
    risks_and_threats: List[Dict[str, Any]]
    recommended_actions: List[Dict[str, Any]]
    what_we_should_watch: List[Dict[str, Any]]
    source_appendix: List[Dict[str, Any]]

    raw_markdown: str
    is_delivered: bool

    class Config:
        from_attributes = True


class BriefGenerateRequest(BaseModel):
    company_id: str
    days_back: int = 7
