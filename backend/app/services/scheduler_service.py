import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from backend.app.database import SessionLocal
from backend.app.models.audit import ScheduledJob, AuditLog
from backend.app.models.company import Company
from backend.app.services.crawler_engine import crawler_engine
from backend.app.services.brief_engine import brief_engine
from backend.app.services.source_audit_service import source_audit_service
from backend.app.config import settings

logger = logging.getLogger(__name__)


class SchedulerService:
    """
    Manages autonomous APScheduler background jobs for weekly briefings
    and monthly source health audits with thread-safe execution and manual triggers.
    """

    def __init__(self):
        self.scheduler = BackgroundScheduler(timezone=settings.TIMEZONE)
        self._is_running = False

    def start(self):
        if not self._is_running:
            self._register_jobs()
            self.scheduler.start()
            self._is_running = True
            logger.info("Background Scheduler started successfully.")

    def shutdown(self):
        if self._is_running:
            self.scheduler.shutdown()
            self._is_running = False
            logger.info("Background Scheduler stopped.")

    def _register_jobs(self):
        # 1. Weekly Intelligence Brief Job (Every Monday morning)
        try:
            self.scheduler.add_job(
                func=self.execute_weekly_brief_all,
                trigger=CronTrigger.from_crontab(settings.WEEKLY_BRIEF_CRON),
                id="weekly_intelligence_brief",
                name="Weekly Intelligence Brief Generator",
                replace_existing=True
            )
        except Exception as e:
            logger.error(f"Failed to schedule weekly brief job: {e}")

        # 2. Monthly Source-Health Audit Job (1st of each month)
        try:
            self.scheduler.add_job(
                func=self.execute_monthly_audit_all,
                trigger=CronTrigger.from_crontab(settings.MONTHLY_AUDIT_CRON),
                id="monthly_source_audit",
                name="Monthly Source Health Audit",
                replace_existing=True
            )
        except Exception as e:
            logger.error(f"Failed to schedule monthly audit job: {e}")

    def execute_weekly_brief_all(self):
        """Runs weekly crawl and brief synthesis for all active companies."""
        db: Session = SessionLocal()
        try:
            companies = db.query(Company).all()
            for comp in companies:
                self.trigger_weekly_brief_now(comp.id, db=db)
        finally:
            db.close()

    def execute_monthly_audit_all(self):
        """Runs monthly source health audit for all active companies."""
        db: Session = SessionLocal()
        try:
            companies = db.query(Company).all()
            for comp in companies:
                self.trigger_monthly_audit_now(comp.id, db=db)
        finally:
            db.close()

    def trigger_weekly_brief_now(self, company_id: str, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Executes immediate on-demand crawl and Monday Morning Brief generation.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            company = db.query(Company).filter(Company.id == company_id).first()
            if not company:
                raise ValueError(f"Company {company_id} not found.")

            # Step 1: Run crawl across approved sources
            crawl_run = crawler_engine.run_crawl(
                db=db,
                company_id=company_id,
                trigger_type="AUTOMATION_WEEKLY",
                max_sources=10
            )

            # Step 2: Synthesize Monday Morning Brief
            brief = brief_engine.generate_brief(
                db=db,
                company_id=company_id,
                days_back=7
            )

            # Update ScheduledJob state in DB
            job_record = db.query(ScheduledJob).filter(
                ScheduledJob.job_type == "WEEKLY_BRIEF",
                ScheduledJob.company_id == company_id
            ).first()

            if not job_record:
                job_record = ScheduledJob(
                    job_type="WEEKLY_BRIEF",
                    company_id=company_id,
                    cron_expression=settings.WEEKLY_BRIEF_CRON
                )
                db.add(job_record)

            job_record.last_run_at = datetime.utcnow()
            job_record.last_execution_status = "SUCCESS"
            job_record.error_message = None

            audit = AuditLog(
                company_id=company_id,
                event_type="WEEKLY_BRIEF_RUN",
                severity="INFO",
                message=f"Weekly Brief generated successfully for {company.name}. Brief ID: {brief.id}",
                details={"brief_id": brief.id, "crawl_run_id": crawl_run.id}
            )
            db.add(audit)
            db.commit()

            return {
                "success": True,
                "brief_id": brief.id,
                "crawl_run_id": crawl_run.id,
                "title": brief.title,
                "signals_count": crawl_run.signals_generated
            }

        except Exception as e:
            logger.error(f"Weekly brief execution failed for {company_id}: {e}")
            if db:
                audit = AuditLog(
                    company_id=company_id,
                    event_type="WEEKLY_BRIEF_FAILED",
                    severity="ERROR",
                    message=f"Weekly brief execution error: {str(e)}",
                    details={"error": str(e)}
                )
                db.add(audit)
                db.commit()
            return {"success": False, "error": str(e)}
        finally:
            if close_session and db:
                db.close()

    def trigger_monthly_audit_now(self, company_id: str, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Executes immediate on-demand monthly source health audit.
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            res = source_audit_service.run_monthly_audit(db=db, company_id=company_id)

            job_record = db.query(ScheduledJob).filter(
                ScheduledJob.job_type == "MONTHLY_AUDIT",
                ScheduledJob.company_id == company_id
            ).first()

            if not job_record:
                job_record = ScheduledJob(
                    job_type="MONTHLY_AUDIT",
                    company_id=company_id,
                    cron_expression=settings.MONTHLY_AUDIT_CRON
                )
                db.add(job_record)

            job_record.last_run_at = datetime.utcnow()
            job_record.last_execution_status = "SUCCESS"
            job_record.error_message = None
            db.commit()

            return {"success": True, "audit_summary": res}

        except Exception as e:
            logger.error(f"Monthly audit execution failed for {company_id}: {e}")
            return {"success": False, "error": str(e)}
        finally:
            if close_session and db:
                db.close()

    def get_scheduler_status(self, db: Session, company_id: Optional[str] = None) -> Dict[str, Any]:
        jobs_info = []
        for job in self.scheduler.get_jobs():
            jobs_info.append({
                "id": job.id,
                "name": job.name,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None
            })

        query = db.query(ScheduledJob)
        if company_id:
            query = query.filter(ScheduledJob.company_id == company_id)
        db_jobs = query.all()

        return {
            "scheduler_running": self._is_running,
            "timezone": str(self.scheduler.timezone),
            "registered_jobs": jobs_info,
            "job_records": [
                {
                    "id": j.id,
                    "job_type": j.job_type,
                    "company_id": j.company_id,
                    "last_run_at": j.last_run_at.isoformat() if j.last_run_at else None,
                    "next_run_at": j.next_run_at.isoformat() if j.next_run_at else None,
                    "status": j.status,
                    "last_execution_status": j.last_execution_status,
                    "error_message": j.error_message
                }
                for j in db_jobs
            ]
        }


scheduler_service = SchedulerService()
