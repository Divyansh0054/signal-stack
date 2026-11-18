from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.source import Source, Competitor
from backend.app.schemas.source_schema import (
    SourceCreateRequest,
    SourceUpdateRequest,
    SourceResponse,
    CompetitorCreateRequest,
    CompetitorResponse,
    SignalStackCategorySummary,
)
from backend.app.services.source_manager import source_manager

router = APIRouter(prefix="/api/sources", tags=["Sources & Signal Stack"])


@router.get("/{company_id}", response_model=List[SourceResponse])
def get_sources(
    company_id: str,
    category: Optional[str] = None,
    status: Optional[str] = None,
    health: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Source).filter(Source.company_id == company_id)
    if category:
        query = query.filter(Source.category == category)
    if status:
        query = query.filter(Source.status == status.upper())
    if health:
        query = query.filter(Source.health_status == health.upper())
    return query.order_by(Source.relevance_score.desc()).all()


@router.post("", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
def add_source(payload: SourceCreateRequest, db: Session = Depends(get_db)):
    try:
        source = source_manager.add_source(
            db=db,
            company_id=payload.company_id,
            name=payload.name,
            url=payload.url,
            category=payload.category,
            source_type=payload.source_type,
            reason_for_inclusion=payload.reason_for_inclusion,
            expected_frequency=payload.expected_frequency,
            credibility_rating=payload.credibility_rating
        )
        return source
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{source_id}/status", response_model=SourceResponse)
def update_source_status(source_id: str, new_status: str, db: Session = Depends(get_db)):
    try:
        return source_manager.set_source_status(db, source_id, new_status)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{source_id}")
def delete_source(source_id: str, db: Session = Depends(get_db)):
    success = source_manager.delete_source(db, source_id)
    if not success:
        raise HTTPException(status_code=404, detail="Source not found")
    return {"message": "Source removed successfully"}


@router.get("/{company_id}/signal-stack", response_model=List[SignalStackCategorySummary])
def get_signal_stack_summary(company_id: str, db: Session = Depends(get_db)):
    categories = ["Customers", "Competitors", "Market", "Internal"]
    summaries = []

    competitors = db.query(Competitor).filter(
        Competitor.company_id == company_id,
        Competitor.is_active == True
    ).all()

    for cat in categories:
        sources = db.query(Source).filter(
            Source.company_id == company_id,
            Source.category == cat
        ).all()

        active = [s for s in sources if s.status == "APPROVED"]

        summaries.append({
            "category": cat,
            "source_count": len(sources),
            "active_sources": len(active),
            "sources": sources,
            "competitors": competitors if cat == "Competitors" else None
        })

    return summaries


@router.get("/{company_id}/competitors", response_model=List[CompetitorResponse])
def get_competitors(company_id: str, db: Session = Depends(get_db)):
    return db.query(Competitor).filter(
        Competitor.company_id == company_id,
        Competitor.is_active == True
    ).all()


@router.post("/{company_id}/competitors", response_model=CompetitorResponse)
def add_competitor(company_id: str, payload: CompetitorCreateRequest, db: Session = Depends(get_db)):
    c_obj = Competitor(
        company_id=company_id,
        name=payload.name,
        website=payload.website,
        offering_summary=payload.offering_summary,
        competitor_type=payload.competitor_type,
        why_it_matters=payload.why_it_matters,
        strengths=payload.strengths,
        vulnerabilities=payload.vulnerabilities,
        discovery_evidence=payload.discovery_evidence
    )
    db.add(c_obj)
    db.commit()
    db.refresh(c_obj)
    return c_obj
