import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database import Base
from backend.app.models.company import Company
from backend.app.models.source import Source
from backend.app.models.signal import IntelligenceSignal
from backend.app.services.brief_engine import brief_engine


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_monday_brief_10_sections_mandate(test_db):
    company = Company(name="BriefTestCo", website="https://brieftestco.com")
    test_db.add(company)
    test_db.commit()

    # Add verified signals across categories
    now = datetime.utcnow()
    categories = ["Customers", "Competitors", "Market"]
    for i, cat in enumerate(categories):
        sig = IntelligenceSignal(
            company_id=company.id,
            title=f"Sample {cat} Development",
            summary=f"Summary of {cat} development",
            category=cat,
            source_name=f"{cat} Source",
            source_url="https://example.com/item",
            publication_date=now - timedelta(days=1),
            discovery_date=now,
            evidence_snippet=f"Verbatim quote from {cat} article.",
            verification_status="VERIFIED",
            evidence_strength="HIGH",
            source_reliability="HIGH",
            strategic_relevance=85.0,
            business_impact=80.0,
            urgency=75.0,
            novelty=80.0,
            opportunity_threat="OPPORTUNITY" if i == 0 else "THREAT",
            affected_business_area="Commercial Strategy",
            why_it_matters="Strategic market shift impacting growth.",
            recommended_action="Review product pricing and outreach.",
            overall_priority="HIGH",
            ranking_score=82.0,
            ranking_explanation="High score based on priority."
        )
        test_db.add(sig)
    test_db.commit()

    # Generate Brief
    brief = brief_engine.generate_brief(test_db, company.id, days_back=7)

    # MANDATORY VALIDATION: All 10 sections must be populated
    assert brief.executive_summary is not None
    assert len(brief.executive_summary) >= 1
    assert brief.customer_signals is not None
    assert brief.competitor_intelligence is not None
    assert brief.market_intelligence is not None
    assert brief.internal_intelligence is not None
    assert brief.opportunities_identified is not None
    assert len(brief.opportunities_identified) >= 3, "Mandate requires minimum 3 actionable opportunities."
    assert brief.risks_and_threats is not None
    assert brief.recommended_actions is not None
    assert brief.what_we_should_watch is not None
    assert brief.source_appendix is not None
    assert len(brief.source_appendix) >= 1

    # Check raw markdown formatting
    assert "# MONDAY MORNING EXECUTIVE BRIEF" in brief.raw_markdown
    assert "## 1. Executive Summary" in brief.raw_markdown
    assert "## 10. Source Appendix" in brief.raw_markdown
