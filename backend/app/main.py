import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.api import (
    company_router,
    interview_router,
    source_router,
    crawl_router,
    brief_router,
    document_router,
    scheduler_router,
)
from backend.app.services.scheduler_service import scheduler_service

# Setup logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("signal_stack")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and Start Scheduler
    logger.info("Initializing Signal Stack Database...")
    init_db()
    logger.info("Database tables initialized.")

    logger.info("Starting background scheduler...")
    scheduler_service.start()
    yield
    # Shutdown: Stop Scheduler
    logger.info("Stopping background scheduler...")
    scheduler_service.shutdown()


app = FastAPI(
    title="Signal Stack — Company Intelligence Engine",
    description="Autonomous Company Intelligence & Executive Briefing API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(company_router)
app.include_router(interview_router)
app.include_router(source_router)
app.include_router(crawl_router)
app.include_router(brief_router)
app.include_router(document_router)
app.include_router(scheduler_router)


@app.get("/")
def root():
    return {
        "system": "Signal Stack — Company Intelligence & Executive Briefing Engine",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "docs_url": "/docs"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "ai_provider": settings.AI_PROVIDER,
        "crawler_user_agent": settings.CRAWLER_USER_AGENT,
        "scheduler_active": scheduler_service._is_running
    }
