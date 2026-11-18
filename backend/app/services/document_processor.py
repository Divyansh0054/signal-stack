import os
import io
import csv
import logging
from typing import Dict, Any, List
from pypdf import PdfReader
import openpyxl
from sqlalchemy.orm import Session
from backend.app.models.document import InternalDocument
from backend.app.models.audit import AuditLog

logger = logging.getLogger(__name__)


class InternalDocumentProcessor:
    """
    Parses internal confidential documents (PDF, CSV, XLSX, TXT)
    and extracts structured insights: objections, lost deals, product requests.
    Strictly isolated from external search engines or public web requests.
    """

    ALLOWED_EXTENSIONS = {".pdf", ".csv", ".xlsx", ".txt"}

    def process_document(
        self,
        db: Session,
        company_id: str,
        filename: str,
        file_bytes: bytes
    ) -> InternalDocument:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file type '{ext}'. Supported types: PDF, CSV, XLSX, TXT.")

        file_size = len(file_bytes)
        text_content = ""

        # Extract text based on file format
        if ext == ".txt":
            text_content = file_bytes.decode("utf-8", errors="replace")
        elif ext == ".pdf":
            reader = PdfReader(io.BytesIO(file_bytes))
            pages_text = [page.extract_text() or "" for page in reader.pages]
            text_content = "\n".join(pages_text)
        elif ext == ".csv":
            stream = io.StringIO(file_bytes.decode("utf-8", errors="replace"))
            csv_reader = csv.reader(stream)
            rows = [" , ".join(row) for row in csv_reader]
            text_content = "\n".join(rows)
        elif ext == ".xlsx":
            wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
            sheet_texts = []
            for sheet in wb.sheetnames:
                ws = wb[sheet]
                for row in ws.iter_rows(values_only=True):
                    row_vals = [str(cell) for cell in row if cell is not None]
                    if row_vals:
                        sheet_texts.append(" | ".join(row_vals))
            text_content = "\n".join(sheet_texts)

        # Analyze internal insights
        insights = self._extract_internal_insights(text_content, filename)

        doc_record = InternalDocument(
            company_id=company_id,
            filename=filename,
            file_type=ext.upper().replace(".", ""),
            file_size_bytes=file_size,
            extracted_summary=insights["summary"],
            objections=insights["objections"],
            lost_deal_reasons=insights["lost_deal_reasons"],
            product_requests=insights["product_requests"],
            sales_patterns=insights["sales_patterns"],
            emerging_risks=insights["emerging_risks"]
        )

        db.add(doc_record)

        audit = AuditLog(
            company_id=company_id,
            event_type="INTERNAL_DOC_UPLOAD",
            severity="INFO",
            message=f"Uploaded and processed internal intelligence document: {filename} ({file_size} bytes)",
            details={"filename": filename, "type": ext}
        )
        db.add(audit)
        db.commit()
        db.refresh(doc_record)
        return doc_record

    def _extract_internal_insights(self, text: str, filename: str) -> Dict[str, Any]:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        lower_text = text.lower()

        objections = []
        lost_deals = []
        product_requests = []
        sales_patterns = []
        emerging_risks = []

        for line in lines:
            ll = line.lower()
            if any(w in ll for w in ["expensive", "pricing", "cost", "budget", "too high", "discount", "competitor cheaper"]):
                objections.append({"objection": line[:200], "category": "Pricing & Budget"})
            elif any(w in ll for w in ["visa delay", "embassy", "rejected", "refusal", "credential", "processing time"]):
                objections.append({"objection": line[:200], "category": "Processing & Immigration Delay"})

            if any(w in ll for w in ["lost deal", "lost to", "lost", "chose", "went with", "competitor won", "cancelled", "drop out"]):
                lost_deals.append({"reason": line[:200], "competitor_involvement": "Competitor chosen"})

            if any(w in ll for w in ["feature request", "need", "wish", "portal", "ai feature", "mobile app", "integration", "dashboard"]):
                product_requests.append({"request": line[:200], "urgency": "High"})

            if any(w in ll for w in ["conversion", "q3", "q4", "leads", "funnel", "cycle length", "deal size"]):
                sales_patterns.append({"pattern": line[:200]})

            if any(w in ll for w in ["risk", "churn", "delay", "freeze", "dispute", "compliance"]):
                emerging_risks.append({"risk": line[:200]})

        # If sparse or unstructured, synthesize contextual summary
        summary = (
            f"Parsed {len(lines)} lines from {filename}. "
            f"Extracted {len(objections)} customer objections, "
            f"{len(lost_deals)} lost deal signals, and {len(product_requests)} product requests."
        )

        return {
            "summary": summary,
            "objections": objections[:10],
            "lost_deal_reasons": lost_deals[:10],
            "product_requests": product_requests[:10],
            "sales_patterns": sales_patterns[:10],
            "emerging_risks": emerging_risks[:10]
        }


document_processor = InternalDocumentProcessor()
