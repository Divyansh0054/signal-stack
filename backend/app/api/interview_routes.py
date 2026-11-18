from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.interview import InterviewQuestion, InterviewAnswer
from backend.app.schemas.interview_schema import (
    InterviewQuestionResponse,
    AnswerSubmitRequest,
    AnswerUpdateRequest,
    AnswerResponse,
    InterviewSessionStatus,
)
from backend.app.services.interview_engine import interview_engine

router = APIRouter(prefix="/api/interview", tags=["Adaptive Interview"])


@router.get("/{company_id}/status", response_model=InterviewSessionStatus)
def get_interview_status(company_id: str, db: Session = Depends(get_db)):
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.company_id == company_id,
        InterviewQuestion.is_followup == False
    ).order_by(InterviewQuestion.question_order).all()

    if not questions:
        questions = interview_engine.initialize_interview_questions(db, company_id)

    answered_count = 0
    skipped_count = 0
    current_q = None

    for q in questions:
        if q.is_skipped:
            skipped_count += 1
        elif q.answer:
            answered_count += 1
        elif current_q is None:
            current_q = q

    total_q = len(questions)
    remaining = total_q - answered_count - skipped_count
    is_completed = remaining == 0

    return {
        "company_id": company_id,
        "total_questions": total_q,
        "answered_count": answered_count,
        "skipped_count": skipped_count,
        "remaining_count": remaining,
        "is_completed": is_completed,
        "current_question": current_q,
        "structured_insights": [
            insight
            for q in questions if q.answer
            for insight in (q.answer.derived_insights or [])
        ]
    }


@router.get("/{company_id}/questions", response_model=List[InterviewQuestionResponse])
def get_all_questions(company_id: str, db: Session = Depends(get_db)):
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.company_id == company_id
    ).order_by(InterviewQuestion.question_order).all()

    if not questions:
        questions = interview_engine.initialize_interview_questions(db, company_id)

    return questions


@router.post("/questions/{question_id}/answer", response_model=AnswerResponse)
def submit_answer(question_id: str, payload: AnswerSubmitRequest, db: Session = Depends(get_db)):
    if not payload.answer_text.strip():
        raise HTTPException(status_code=400, detail="Answer text cannot be empty")
    try:
        answer = interview_engine.record_answer(
            db=db,
            question_id=question_id,
            answer_text=payload.answer_text.strip()
        )
        return answer
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/answers/{answer_id}", response_model=AnswerResponse)
def update_answer(answer_id: str, payload: AnswerUpdateRequest, db: Session = Depends(get_db)):
    answer = db.query(InterviewAnswer).filter(InterviewAnswer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    return interview_engine.record_answer(
        db=db,
        question_id=answer.question_id,
        answer_text=payload.answer_text.strip()
    )


@router.post("/questions/{question_id}/skip", response_model=InterviewQuestionResponse)
def skip_question(question_id: str, db: Session = Depends(get_db)):
    try:
        q = interview_engine.skip_question(db, question_id)
        return q
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
