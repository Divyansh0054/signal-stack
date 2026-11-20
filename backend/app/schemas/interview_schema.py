from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class AnswerResponse(BaseModel):
    id: str
    question_id: str
    company_id: str
    answer_text: str
    derived_insights: List[Dict[str, Any]] = []
    is_edited: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InterviewQuestionResponse(BaseModel):
    id: str
    company_id: str
    question_order: int
    question_text: str
    question_category: str
    context_rationale: str
    is_confidential_eligible: bool
    is_skipped: bool
    is_followup: bool
    parent_question_id: Optional[str] = None
    created_at: datetime
    answer: Optional[AnswerResponse] = None

    class Config:
        from_attributes = True


class AnswerSubmitRequest(BaseModel):
    answer_text: str = Field(..., description="Answer provided by founder")


class AnswerUpdateRequest(BaseModel):
    answer_text: str = Field(..., description="Updated answer text")


class InterviewSessionStatus(BaseModel):
    company_id: str
    total_questions: int = 10
    answered_count: int
    skipped_count: int
    remaining_count: int
    is_completed: bool
    current_question: Optional[InterviewQuestionResponse] = None
    structured_insights: List[Dict[str, Any]] = []
