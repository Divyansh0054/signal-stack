import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database import Base
from backend.app.models.company import Company
from backend.app.services.source_discovery import source_discovery


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_meetuniversity_sources_target(test_db):
    company = Company(
        name="MeetUniversity",
        website="https://www.meetuniversity.com",
        industry="EdTech / Higher Education & Study Abroad"
    )
    test_db.add(company)
    test_db.commit()

    sources, competitors = source_discovery.discover_signal_stack_sources(test_db, company.id)

    # MANDATORY TARGET: At least 20 approved sources for MeetUniversity
    assert len(sources) >= 20, f"Expected >= 20 sources, got {len(sources)}"

    # MANDATORY TARGET: 5-10 Competitor profiles
    assert 5 <= len(competitors) <= 10, f"Expected 5-10 competitors, got {len(competitors)}"

    # Assert every source has an explicit reason for inclusion
    for s in sources:
        assert s.reason_for_inclusion is not None and len(s.reason_for_inclusion) > 10
        assert s.category in ("Customers", "Competitors", "Market", "Internal")

    # Assert every competitor has an explicit why_it_matters explanation
    for c in competitors:
        assert c.why_it_matters is not None and len(c.why_it_matters) > 10
