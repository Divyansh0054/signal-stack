import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database import Base
from backend.app.models.company import Company
from backend.app.services.document_processor import document_processor


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_txt_and_csv_internal_doc_processing(test_db):
    company = Company(name="DocTestCo", website="https://doctestco.com")
    test_db.add(company)
    test_db.commit()

    text_data = (
        "Customer Objection: The pricing is too high compared to local sub-agents.\n"
        "Lost deal to ApplyBoard: Competitor offered university guaranteed enrollment.\n"
        "Feature request: Counselors need an automated WhatsApp notification tracker.\n"
        "Risk: Visa delays in UK intake causing cash flow latency.\n"
    ).encode("utf-8")

    doc = document_processor.process_document(
        db=test_db,
        company_id=company.id,
        filename="sales_objections_q3.txt",
        file_bytes=text_data
    )

    assert doc.filename == "sales_objections_q3.txt"
    assert doc.file_type == "TXT"
    assert len(doc.objections) >= 1
    assert len(doc.lost_deal_reasons) >= 1
    assert len(doc.product_requests) >= 1
    assert len(doc.emerging_risks) >= 1
