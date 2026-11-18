import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    question_order = Column(Integer, nullable=False)     # 1 to 10
    question_text = Column(Text, nullable=False)
    question_category = Column(String(100), nullable=False)  # business_model, customer_segments, pain_points, competitors, etc.
    context_rationale = Column(Text, nullable=False)    # Why this question was chosen dynamically for this specific company
    is_confidential_eligible = Column(Boolean, default=True)
    is_skipped = Column(Boolean, default=False)
    is_followup = Column(Boolean, default=False)
    parent_question_id = Column(String(36), ForeignKey("interview_questions.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="interview_questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = Column(String(36), ForeignKey("interview_questions.id"), nullable=False, unique=True, index=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    answer_text = Column(Text, nullable=False)
    derived_insights = Column(JSON, default=list)       # list of insights extracted from this answer
    is_edited = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="interview_answers")
    question = relationship("InterviewQuestion", back_populates="answer")
