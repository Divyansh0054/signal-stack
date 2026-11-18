import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import feedparser
from bs4 import BeautifulSoup
from dateutil import parser as date_parser

logger = logging.getLogger(__name__)


class FeedParserService:
    """
    Parses RSS, Atom, and XML syndicate feeds safely and standardizes publication items.
    """

    def parse_feed_content(self, content_bytes_or_str: str, base_url: str) -> List[Dict[str, Any]]:
        parsed = feedparser.parse(content_bytes_or_str)
        items = []

        for entry in parsed.entries[:20]:  # Limit to 20 most recent entries per feed run
            title = entry.get("title", "").strip()
            link = entry.get("link", "").strip() or base_url

            # Extract publication date
            pub_date = None
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                try:
                    pub_date = datetime(*entry.published_parsed[:6])
                except Exception:
                    pass
            elif hasattr(entry, "published") and entry.published:
                try:
                    pub_date = date_parser.parse(entry.published)
                except Exception:
                    pass
            elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                try:
                    pub_date = datetime(*entry.updated_parsed[:6])
                except Exception:
                    pass

            # Extract body text / description
            summary = entry.get("summary", "") or entry.get("description", "")
            content_val = ""
            if hasattr(entry, "content") and entry.content:
                content_val = entry.content[0].get("value", "")

            raw_html = content_val or summary or title
            soup = BeautifulSoup(raw_html, "html.parser")
            clean_text = soup.get_text(separator=" ", strip=True)

            if not title and not clean_text:
                continue

            items.append({
                "title": title or clean_text[:100],
                "url": link,
                "published_date": pub_date or datetime.utcnow(),
                "snippet": clean_text[:400],
                "raw_text": clean_text
            })

        return items


feed_parser = FeedParserService()
