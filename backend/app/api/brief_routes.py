from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.brief import Brief, BriefAction
from backend.app.schemas.brief_schema import (
    BriefResponse,
    BriefGenerateRequest,
)
from backend.app.services.brief_engine import brief_engine

router = APIRouter(prefix="/api/briefs", tags=["Monday Morning Brief"])


@router.post("/generate", response_model=BriefResponse, status_code=status.HTTP_201_CREATED)
def generate_brief(payload: BriefGenerateRequest, db: Session = Depends(get_db)):
    """
    Generates a new Monday Morning Executive Brief strictly following the 10-section format.
    """
    try:
        brief = brief_engine.generate_brief(
            db=db,
            company_id=payload.company_id,
            days_back=payload.days_back
        )
        return brief
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Brief synthesis failed: {str(e)}")


@router.get("/{company_id}", response_model=List[BriefResponse])
def get_historical_briefs(company_id: str, db: Session = Depends(get_db)):
    return db.query(Brief).filter(
        Brief.company_id == company_id
    ).order_by(Brief.generated_at.desc()).all()


@router.get("/detail/{brief_id}", response_model=BriefResponse)
def get_brief_detail(brief_id: str, db: Session = Depends(get_db)):
    brief = db.query(Brief).filter(Brief.id == brief_id).first()
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    return brief


@router.put("/actions/{action_id}")
def update_action_status(action_id: str, new_status: str, db: Session = Depends(get_db)):
    action = db.query(BriefAction).filter(BriefAction.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    action.status = new_status.upper()
    db.commit()
    db.refresh(action)
    return {"message": "Action updated", "id": action.id, "status": action.status}
