from backend.app.api.company_routes import router as company_router
from backend.app.api.interview_routes import router as interview_router
from backend.app.api.source_routes import router as source_router
from backend.app.api.crawl_routes import router as crawl_router
from backend.app.api.brief_routes import router as brief_router
from backend.app.api.document_routes import router as document_router
from backend.app.api.scheduler_routes import router as scheduler_router

__all__ = [
    "company_router",
    "interview_router",
    "source_router",
    "crawl_router",
    "brief_router",
    "document_router",
    "scheduler_router",
]
