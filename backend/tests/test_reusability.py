import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database import Base
from backend.app.models.company import Company
from backend.app.services.interview_engine import interview_engine
from backend.app.services.source_discovery import source_discovery
from backend.app.services.context_adaptation import context_adaptation_engine


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_cross_company_divergence(test_db):
    """
    Validates that changing company dynamically changes:
    - Interview questions
    - Competitor lists
    - Monitored sources
    """
    comp1 = Company(name="MeetUniversity", website="https://www.meetuniversity.com", industry="EdTech / Higher Education & Study Abroad")
    comp2 = Company(name="PostHog", website="https://posthog.com", industry="Developer Tools / Product Analytics & SaaS")
    test_db.add_all([comp1, comp2])
    test_db.commit()

    # Interview questions
    q1 = interview_engine.initialize_interview_questions(test_db, comp1.id)
    q2 = interview_engine.initialize_interview_questions(test_db, comp2.id)

    assert len(q1) == 10
    assert len(q2) == 10
    # Questions must materially differ between companies
    assert q1[0].question_text != q2[0].question_text
    assert "commission" in q1[0].question_text.lower() or "study abroad" in q1[0].question_text.lower()
    assert "cloud" in q2[0].question_text.lower() or "self-serve" in q2[0].question_text.lower()

    # Sources & Competitors
    src1, comp_list1 = source_discovery.discover_signal_stack_sources(test_db, comp1.id)
    src2, comp_list2 = source_discovery.discover_signal_stack_sources(test_db, comp2.id)

    comp_names1 = [c.name for c in comp_list1]
    comp_names2 = [c.name for c in comp_list2]

    assert comp_names1 != comp_names2
    assert "ApplyBoard" in comp_names1 or "IDP Education" in comp_names1
    assert "Mixpanel" in comp_names2 or "Amplitude" in comp_names2


def test_context_change_adaptation(test_db):
    """
    Validates strategic context pivot (e.g. B2C student acquisition -> B2B university partnerships).
    """
    comp = Company(
        name="MeetUniversity",
        website="https://www.meetuniversity.com",
        industry="EdTech / Higher Education & Study Abroad",
        current_focus="Focus on student acquisition."
    )
    test_db.add(comp)
    test_db.commit()

    source_discovery.discover_signal_stack_sources(test_db, comp.id)

    # Perform pivot
    record = context_adaptation_engine.adapt_business_context(
        db=test_db,
        company_id=comp.id,
        new_context="Focus on B2B university partnerships & institutional licensing."
    )

    assert record.previous_context == "Focus on student acquisition."
    assert "B2B university partnerships" in record.new_context
    assert len(record.sources_flagged_obsolete) >= 1
    assert "Re-assessed" in record.adaptation_summary
