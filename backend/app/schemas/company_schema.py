from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class CompanyCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Company Name")
    website: str = Field(..., description="Company Website URL (e.g. https://www.meetuniversity.com)")
    current_focus: Optional[str] = Field(None, description="Current strategic or commercial focus")


class CompanyUpdateRequest(BaseModel):
    name: Optional[str] = None
    current_focus: Optional[str] = None
    industry: Optional[str] = None


class FactCitation(BaseModel):
    fact: str
    citation_url: str
    snippet: str


class AssumptionItem(BaseModel):
    assumption: str
    reason: str
    needs_verification: bool = True


class ProductServiceItem(BaseModel):
    name: str
    description: str
    evidence: Optional[str] = None


class CustomerSegmentItem(BaseModel):
    segment: str
    description: str
    evidence: Optional[str] = None


class CompanyProfileResponse(BaseModel):
    id: str
    company_id: str
    business_description: Optional[str] = None
    products_services: List[Dict[str, Any]] = []
    customer_segments: List[Dict[str, Any]] = []
    geographic_markets: List[str] = []
    positioning: Optional[str] = None
    business_model: Optional[str] = None
    strategic_themes: List[str] = []
    verified_facts: List[Dict[str, Any]] = []
    assumptions: List[Dict[str, Any]] = []
    raw_research_summary: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanyResponse(BaseModel):
    id: str
    name: str
    website: str
    industry: Optional[str] = None
    current_focus: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    profile: Optional[CompanyProfileResponse] = None

    class Config:
        from_attributes = True
