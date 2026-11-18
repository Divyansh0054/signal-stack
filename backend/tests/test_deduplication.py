import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database import Base
from backend.app.models.company import Company
from backend.app.models.source import Source
from backend.app.models.signal import ContentItem
from backend.app.services.deduplication_engine import deduplication_engine


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_url_normalization():
    raw_url = "https://www.example.com/article/?utm_source=twitter&utm_medium=social&ref=feed#section"
    normalized = deduplication_engine.normalize_url(raw_url)
    assert "utm_source" not in normalized
    assert "ref" not in normalized
    assert normalized == "https://example.com/article"


def test_content_hashing():
    text1 = "UK Home Office confirms graduate route visa rules."
    text2 = "  uk  home office confirms   graduate route visa rules.  "
    hash1 = deduplication_engine.compute_content_hash(text1)
    hash2 = deduplication_engine.compute_content_hash(text2)
    assert hash1 == hash2


def test_duplicate_detection(test_db):
    company = Company(name="TestCo", website="https://testco.com")
    test_db.add(company)
    test_db.commit()

    source = Source(company_id=company.id, name="Test Source", url="https://example.com/feed", category="Market", source_type="RSS", reason_for_inclusion="Test")
    test_db.add(source)
    test_db.commit()

    # Insert first item
    item1 = ContentItem(
        source_id=source.id,
        company_id=company.id,
        title="Major visa changes announced in UK",
        url="https://example.com/visa-news",
        normalized_url="https://example.com/visa-news",
        content_hash="abc123hash",
        raw_text="Major visa changes announced in UK for international students."
    )
    test_db.add(item1)
    test_db.commit()

    # Check duplicate on same normalized URL
    is_dup, orig_id, reason = deduplication_engine.check_is_duplicate(
        db=test_db,
        company_id=company.id,
        normalized_url="https://example.com/visa-news",
        content_hash="differenthash",
        title="Different Title"
    )
    assert is_dup is True
    assert orig_id == item1.id
    assert "URL match" in reason

    # Check duplicate on identical content hash
    is_dup_h, orig_id_h, reason_h = deduplication_engine.check_is_duplicate(
        db=test_db,
        company_id=company.id,
        normalized_url="https://another.com/news",
        content_hash="abc123hash",
        title="Different Title Again"
    )
    assert is_dup_h is True
    assert "hash match" in reason_h
