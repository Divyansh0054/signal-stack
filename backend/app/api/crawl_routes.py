from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.signal import CrawlRun, IntelligenceSignal
from backend.app.schemas.signal_schema import (
    CrawlRunResponse,
    IntelligenceSignalResponse,
    SignalFilterParams,
)
from backend.app.services.crawler_engine import crawler_engine

router = APIRouter(tags=["Crawling & Signals"])


# --- CRAWL ENDPOINTS ---
@router.post("/api/crawl/{company_id}", response_model=CrawlRunResponse)
def trigger_crawl(
    company_id: str,
    trigger_type: str = Query("MANUAL", description="MANUAL, WEEKLY_AUTOMATION"),
    db: Session = Depends(get_db)
):
    try:
        run = crawler_engine.run_crawl(
            db=db,
            company_id=company_id,
            trigger_type=trigger_type
        )
        return run
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crawl execution failed: {str(e)}")


@router.get("/api/crawl/{company_id}/history", response_model=List[CrawlRunResponse])
def get_crawl_history(company_id: str, db: Session = Depends(get_db)):
    return db.query(CrawlRun).filter(
        CrawlRun.company_id == company_id
    ).order_by(CrawlRun.started_at.desc()).limit(20).all()


# --- SIGNAL ENDPOINTS ---
@router.get("/api/signals/{company_id}", response_model=List[IntelligenceSignalResponse])
def get_signals(
    company_id: str,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    opportunity_threat: Optional[str] = None,
    verification_status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(IntelligenceSignal).filter(IntelligenceSignal.company_id == company_id)

    if category:
        query = query.filter(IntelligenceSignal.category == category)
    if priority:
        query = query.filter(IntelligenceSignal.overall_priority == priority.upper())
    if opportunity_threat:
        query = query.filter(IntelligenceSignal.opportunity_threat == opportunity_threat.upper())
    if verification_status:
        query = query.filter(IntelligenceSignal.verification_status == verification_status.upper())
    if search:
        s_term = f"%{search}%"
        query = query.filter(
            (IntelligenceSignal.title.ilike(s_term)) |
            (IntelligenceSignal.why_it_matters.ilike(s_term)) |
            (IntelligenceSignal.affected_business_area.ilike(s_term))
        )

    # Order by ranking score descending (highest priority signals first)
    signals = query.order_by(IntelligenceSignal.ranking_score.desc()).offset(offset).limit(limit).all()
    return signals


@router.get("/api/signals/detail/{signal_id}", response_model=IntelligenceSignalResponse)
def get_signal_detail(signal_id: str, db: Session = Depends(get_db)):
    signal = db.query(IntelligenceSignal).filter(IntelligenceSignal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Intelligence signal not found")
    return signal
