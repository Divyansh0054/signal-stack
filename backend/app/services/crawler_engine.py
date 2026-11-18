import logging
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.signal import CrawlRun, ContentItem, IntelligenceSignal
from backend.app.models.source import Source
from backend.app.models.company import Company
from backend.app.services.web_extractor import fetch_url
from backend.app.services.feed_parser import feed_parser
from backend.app.services.deduplication_engine import deduplication_engine
from backend.app.services.intelligence_engine import intelligence_engine
from backend.app.services.source_manager import source_manager

logger = logging.getLogger(__name__)


class CrawlerMonitoringEngine:
    """
    Autonomous monitoring engine that crawls approved public sources,
    enforces rate limits, deduplicates items, and extracts structured signals.
    """

    def run_crawl(
        self,
        db: Session,
        company_id: str,
        trigger_type: str = "MANUAL",
        max_sources: int = 25
    ) -> CrawlRun:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise ValueError(f"Company {company_id} not found.")

        # Create CrawlRun record
        crawl_run = CrawlRun(
            company_id=company_id,
            trigger_type=trigger_type,
            status="RUNNING",
            started_at=datetime.utcnow()
        )
        db.add(crawl_run)
        db.commit()
        db.refresh(crawl_run)

        # Get approved sources
        sources = db.query(Source).filter(
            Source.company_id == company_id,
            Source.status == "APPROVED"
        ).limit(max_sources).all()

        crawl_run.sources_attempted = len(sources)
        items_collected = 0
        duplicates_detected = 0
        signals_generated = 0
        successful_sources = 0
        failed_sources = 0

        for source in sources:
            if source.url.startswith("internal://"):
                continue

            try:
                # Fetch source
                res = fetch_url(source.url, check_robots=True)
                source_manager.update_source_health(
                    db=db,
                    source_id=source.id,
                    success=res["success"],
                    http_status=res.get("status_code"),
                    response_time_ms=res.get("response_time_ms"),
                    error_msg=res.get("error")
                )

                if not res["success"]:
                    failed_sources += 1
                    continue

                successful_sources += 1

                # Parse items based on format
                extracted_items = []
                is_feed = any(ext in source.url.lower() for ext in [".rss", ".xml", ".atom", "/feed"])
                if is_feed or "xml" in res.get("html", "")[:200]:
                    extracted_items = feed_parser.parse_feed_content(res["html"], source.url)
                else:
                    if res.get("text"):
                        extracted_items = [{
                            "title": res.get("title") or source.name,
                            "url": res.get("url") or source.url,
                            "published_date": datetime.utcnow(),
                            "snippet": res.get("description") or res["text"][:300],
                            "raw_text": res["text"]
                        }]

                # Process extracted items through deduplication & intelligence
                for item_dict in extracted_items[:5]:  # Process top 5 freshest items per source
                    norm_url = deduplication_engine.normalize_url(item_dict["url"])
                    c_hash = deduplication_engine.compute_content_hash(item_dict["raw_text"])

                    is_dup, orig_id, dup_reason = deduplication_engine.check_is_duplicate(
                        db=db,
                        company_id=company_id,
                        normalized_url=norm_url,
                        content_hash=c_hash,
                        title=item_dict["title"]
                    )

                    content_item = ContentItem(
                        source_id=source.id,
                        company_id=company_id,
                        crawl_run_id=crawl_run.id,
                        title=item_dict["title"],
                        url=item_dict["url"],
                        normalized_url=norm_url,
                        content_hash=c_hash,
                        published_date=item_dict.get("published_date"),
                        discovered_date=datetime.utcnow(),
                        raw_text=item_dict["raw_text"],
                        snippet=item_dict.get("snippet"),
                        is_duplicate=is_dup,
                        duplicate_of_id=orig_id
                    )
                    db.add(content_item)
                    db.commit()
                    db.refresh(content_item)

                    items_collected += 1

                    if is_dup:
                        duplicates_detected += 1
                        source.duplicate_count = (source.duplicate_count or 0) + 1
                        db.commit()
                    else:
                        # Generate structured intelligence signal
                        signal = intelligence_engine.process_content_item(
                            db=db,
                            content_item=content_item,
                            source=source
                        )
                        signals_generated += 1

            except Exception as e:
                logger.error(f"Error crawling source {source.url}: {e}")
                failed_sources += 1
                source_manager.update_source_health(
                    db=db,
                    source_id=source.id,
                    success=False,
                    http_status=500,
                    error_msg=str(e)
                )

        # Finalize CrawlRun stats
        crawl_run.status = "COMPLETED"
        crawl_run.sources_successful = successful_sources
        crawl_run.sources_failed = failed_sources
        crawl_run.items_collected = items_collected
        crawl_run.duplicates_detected = duplicates_detected
        crawl_run.signals_generated = signals_generated
        crawl_run.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(crawl_run)

        return crawl_run


crawler_engine = CrawlerMonitoringEngine()
