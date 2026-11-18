from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.document import InternalDocument
from backend.app.schemas.document_schema import InternalDocumentResponse
from backend.app.services.document_processor import document_processor

router = APIRouter(prefix="/api/documents", tags=["Internal Documents"])


@router.post("/{company_id}/upload", response_model=InternalDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    company_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts PDF, CSV, XLSX, TXT uploads.
    Extracts customer objections, lost-deal reasons, product requests, and risks.
    Maintains strict isolation from public intelligence.
    """
    try:
        content = await file.read()
        doc = document_processor.process_document(
            db=db,
            company_id=company_id,
            filename=file.filename or "uploaded_doc.txt",
            file_bytes=content
        )
        return doc
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document parsing error: {str(e)}")


@router.get("/{company_id}", response_model=List[InternalDocumentResponse])
def get_documents(company_id: str, db: Session = Depends(get_db)):
    return db.query(InternalDocument).filter(
        InternalDocument.company_id == company_id
    ).order_by(InternalDocument.uploaded_at.desc()).all()
