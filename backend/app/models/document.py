import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class InternalDocument(Base):
    __tablename__ = "internal_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)          # PDF, CSV, XLSX, TXT
    file_size_bytes = Column(Integer, nullable=False)
    extracted_summary = Column(Text, nullable=True)

    # Structured Internal Intelligence extracted
    objections = Column(JSON, default=list)                 # List of recurring objections
    lost_deal_reasons = Column(JSON, default=list)          # List of lost-deal patterns
    product_requests = Column(JSON, default=list)           # List of requested features/changes
    sales_patterns = Column(JSON, default=list)             # Emerging sales trends
    emerging_risks = Column(JSON, default=list)             # Internal operational or market risks

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="internal_documents")
