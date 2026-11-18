import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database import Base
from backend.app.models.company import Company, CompanyProfile
from backend.app.models.interview import InterviewQuestion, InterviewAnswer
from backend.app.services.interview_engine import interview_engine


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_adaptive_interview_10_questions(test_db):
    company = Company(name="TestMeetUniv", website="https://testmeetuniv.com", industry="EdTech / Higher Education")
    test_db.add(company)
    test_db.commit()

    # Generate 10 questions
    questions = interview_engine.initialize_interview_questions(test_db, company.id)
    assert len(questions) == 10

    # Assert questions asked sequentially 1..10
    orders = [q.question_order for q in questions]
    assert orders == list(range(1, 11))

    # Assert question categories and dynamic rationales exist
    for q in questions:
        assert q.question_text is not None and len(q.question_text) > 10
        assert q.context_rationale is not None and len(q.context_rationale) > 10
        assert q.is_confidential_eligible is True

    # Record answer to Q1
    ans = interview_engine.record_answer(test_db, questions[0].id, "Our main revenue is university commissions.")
    assert ans.answer_text == "Our main revenue is university commissions."
    assert len(ans.derived_insights) >= 1

    # Skip confidential Q2
    skipped_q = interview_engine.skip_question(test_db, questions[1].id)
    assert skipped_q.is_skipped is True
