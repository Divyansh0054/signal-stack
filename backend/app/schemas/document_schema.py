from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime


class InternalDocumentResponse(BaseModel):
    id: str
    company_id: str
    filename: str
    file_type: str
    file_size_bytes: int
    extracted_summary: Optional[str] = None
    objections: List[Dict[str, Any]] = []
    lost_deal_reasons: List[Dict[str, Any]] = []
    product_requests: List[Dict[str, Any]] = []
    sales_patterns: List[Dict[str, Any]] = []
    emerging_risks: List[Dict[str, Any]] = []
    uploaded_at: datetime

    class Config:
        from_attributes = True
