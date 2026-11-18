import hashlib
import re
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
from typing import Tuple, List, Optional
from sqlalchemy.orm import Session
from backend.app.models.signal import ContentItem


class DeduplicationEngine:
    """
    Multi-stage content deduplication pipeline using:
    1. URL Canonicalization / Normalization
    2. SHA-256 Text Hashing
    3. Jaccard & Token Similarity Check
    """

    TRACKING_PARAMS = {
        "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
        "ref", "fbclid", "gclid", "msclkid", "mc_cid", "mc_eid", "_ga"
    }

    def normalize_url(self, raw_url: str) -> str:
        """
        Removes query tracking params, normalizes protocol/hostname, strips trailing slashes.
        """
        try:
            parsed = urlparse(raw_url.strip())
            # Normalize scheme and host
            scheme = "https" if parsed.scheme in ("http", "https") else parsed.scheme
            netloc = parsed.netloc.lower()
            if netloc.startswith("www."):
                netloc = netloc[4:]

            # Filter tracking query parameters
            query_tuples = parse_qsl(parsed.query, keep_blank_values=False)
            filtered_query = [(k, v) for k, v in query_tuples if k.lower() not in self.TRACKING_PARAMS]
            clean_query = urlencode(sorted(filtered_query))

            # Normalize path (strip trailing slash if not root)
            path = parsed.path.rstrip("/")
            if not path:
                path = "/"

            normalized = urlunparse((scheme, netloc, path, "", clean_query, ""))
            return normalized
        except Exception:
            return raw_url.strip().lower()

    def compute_content_hash(self, text: str) -> str:
        """
        Computes SHA-256 hash of normalized text tokens.
        """
        clean = re.sub(r'\s+', ' ', text.lower().strip())
        return hashlib.sha256(clean.encode('utf-8')).hexdigest()

    def check_is_duplicate(
        self,
        db: Session,
        company_id: str,
        normalized_url: str,
        content_hash: str,
        title: str
    ) -> Tuple[bool, Optional[str], str]:
        """
        Checks if item is duplicate against database history.
        Returns: (is_duplicate: bool, original_item_id: Optional[str], reason: str)
        """
        # 1. Exact Normalized URL Match
        url_match = db.query(ContentItem).filter(
            ContentItem.company_id == company_id,
            ContentItem.normalized_url == normalized_url
        ).first()
        if url_match:
            return True, url_match.id, "Exact normalized URL match"

        # 2. Exact Content Hash Match
        hash_match = db.query(ContentItem).filter(
            ContentItem.company_id == company_id,
            ContentItem.content_hash == content_hash
        ).first()
        if hash_match:
            return True, hash_match.id, "Identical content hash match"

        # 3. Fuzzy Title Similarity Match against recent items
        title_tokens = set(re.findall(r'\w+', title.lower()))
        if len(title_tokens) >= 4:
            recent_items = db.query(ContentItem).filter(
                ContentItem.company_id == company_id
            ).order_by(ContentItem.discovered_date.desc()).limit(100).all()

            for item in recent_items:
                other_tokens = set(re.findall(r'\w+', item.title.lower()))
                if not other_tokens:
                    continue
                intersection = len(title_tokens.intersection(other_tokens))
                union = len(title_tokens.union(other_tokens))
                jaccard_sim = intersection / union if union > 0 else 0.0

                if jaccard_sim >= 0.80:
                    return True, item.id, f"High title similarity ({round(jaccard_sim * 100, 1)}%)"

        return False, None, "New unique content"


deduplication_engine = DeduplicationEngine()
