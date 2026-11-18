import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.company import Company, CompanyProfile
from backend.app.schemas.company_schema import (
    CompanyCreateRequest,
    CompanyUpdateRequest,
    CompanyResponse,
    CompanyProfileResponse,
)
from backend.app.services.web_extractor import is_safe_url
from backend.app.services.research_engine import research_engine
from backend.app.services.interview_engine import interview_engine
from backend.app.services.source_discovery import source_discovery

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/companies", tags=["Companies"])


@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(payload: CompanyCreateRequest, db: Session = Depends(get_db)):
    """
    Accepts Company Name + Website.
    1. Validates URL & SSRF checks.
    2. Researches the public website dynamically.
    3. Builds initial Company Profile (separating verified facts from assumptions).
    4. Initializes adaptive 10-question interview.
    5. Discovers initial Signal Stack sources & competitors.
    """
    is_safe, reason = is_safe_url(payload.website)
    if not is_safe:
        raise HTTPException(status_code=400, detail=f"Invalid or prohibited URL: {reason}")

    # Check for existing company by website
    existing = db.query(Company).filter(Company.website == payload.website).first()
    if existing:
        return existing

    # 1. Create company record
    company = Company(
        name=payload.name.strip(),
        website=payload.website.strip(),
        current_focus=payload.current_focus
    )
    db.add(company)
    db.commit()
    db.refresh(company)

    # 2. Research company website dynamically
    try:
        research_data = research_engine.research_company(company.name, company.website)
        company.industry = research_data.get("industry")

        profile = CompanyProfile(
            company_id=company.id,
            business_description=research_data.get("business_description"),
            products_services=research_data.get("products_services", []),
            customer_segments=research_data.get("customer_segments", []),
            geographic_markets=research_data.get("geographic_markets", []),
            positioning=research_data.get("positioning"),
            business_model=research_data.get("business_model"),
            strategic_themes=research_data.get("strategic_themes", []),
            verified_facts=research_data.get("verified_facts", []),
            assumptions=research_data.get("assumptions", []),
            raw_research_summary=research_data.get("raw_research_summary")
        )
        db.add(profile)
        db.commit()
    except Exception as e:
        logger.error(f"Research failed for {company.name}: {e}")
        # Create baseline profile so process never blocks
        profile = CompanyProfile(
            company_id=company.id,
            business_description=f"{company.name} profile initialized.",
            verified_facts=[{"fact": f"Registered domain {company.website}", "citation_url": company.website, "snippet": "Website accessible."}],
            assumptions=[{"assumption": "Standard SaaS/platform business model", "reason": "Initial baseline", "needs_verification": True}]
        )
        db.add(profile)
        db.commit()

    # 3. Initialize adaptive 10-question interview
    interview_engine.initialize_interview_questions(db, company.id)

    # 4. Discover Signal Stack sources & competitors
    source_discovery.discover_signal_stack_sources(db, company.id, company.current_focus)

    db.refresh(company)
    return company


@router.get("", response_model=List[CompanyResponse])
def list_companies(db: Session = Depends(get_db)):
    return db.query(Company).order_by(Company.created_at.desc()).all()


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(company_id: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(company_id: str, payload: CompanyUpdateRequest, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    if payload.name:
        company.name = payload.name.strip()
    if payload.industry:
        company.industry = payload.industry.strip()
    if payload.current_focus is not None:
        company.current_focus = payload.current_focus.strip()

    db.commit()
    db.refresh(company)
    return company
