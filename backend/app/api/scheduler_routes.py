from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.audit import AuditLog, ContextAdaptationRecord
from backend.app.services.scheduler_service import scheduler_service
from backend.app.services.context_adaptation import context_adaptation_engine

router = APIRouter(tags=["Automation & Audit"])


@router.get("/api/scheduler/status")
def get_scheduler_status(company_id: Optional[str] = None, db: Session = Depends(get_db)):
    return scheduler_service.get_scheduler_status(db=db, company_id=company_id)


@router.post("/api/scheduler/run-brief/{company_id}")
def manual_run_brief(company_id: str, db: Session = Depends(get_db)):
    """
    Trigger manual execution of weekly crawl + brief pipeline.
    """
    res = scheduler_service.trigger_weekly_brief_now(company_id=company_id, db=db)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error"))
    return res


@router.post("/api/scheduler/run-audit/{company_id}")
def manual_run_audit(company_id: str, db: Session = Depends(get_db)):
    """
    Trigger manual execution of monthly source health audit.
    """
    res = scheduler_service.trigger_monthly_audit_now(company_id=company_id, db=db)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("error"))
    return res


@router.post("/api/adaptation/pivot/{company_id}")
def adapt_context(
    company_id: str,
    payload: Dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Simulates changing business context (e.g. B2C student acquisition -> B2B university partnerships).
    Re-assesses source relevance, flags obsolete sources, recommends new sources, updates Signal Stack.
    """
    new_focus = payload.get("new_context")
    if not new_focus:
        raise HTTPException(status_code=400, detail="Missing 'new_context' string in payload.")

    try:
        record = context_adaptation_engine.adapt_business_context(
            db=db,
            company_id=company_id,
            new_context=new_focus
        )
        return {
            "id": record.id,
            "company_id": record.company_id,
            "previous_context": record.previous_context,
            "new_context": record.new_context,
            "rationale": record.rationale,
            "sources_flagged_obsolete": record.sources_flagged_obsolete,
            "new_sources_recommended": record.new_sources_recommended,
            "adaptation_summary": record.adaptation_summary,
            "created_at": record.created_at
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/audit/logs/{company_id}")
def get_audit_logs(company_id: str, limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(
        AuditLog.company_id == company_id
    ).order_by(AuditLog.created_at.desc()).limit(limit).all()

    return [
        {
            "id": l.id,
            "event_type": l.event_type,
            "severity": l.severity,
            "message": l.message,
            "details": l.details,
            "created_at": l.created_at
        }
        for l in logs
    ]
