import math
from datetime import datetime
from typing import Dict, Any, Tuple


class IntelligenceRankingEngine:
    """
    Transparent multi-factor ranking mechanism computing composite priority scores
    with transparent mathematical breakdowns and explanations.
    """

    # Normalized weights summing to 1.0
    WEIGHT_RELEVANCE = 0.25
    WEIGHT_IMPACT = 0.25
    WEIGHT_URGENCY = 0.20
    WEIGHT_CREDIBILITY = 0.15
    WEIGHT_NOVELTY = 0.15

    # Exponential decay parameter (lambda = 0.05 per day)
    DECAY_LAMBDA = 0.05

    def compute_ranking(
        self,
        relevance: float,      # 0 - 100
        impact: float,         # 0 - 100
        urgency: float,        # 0 - 100
        credibility_rating: str, # HIGH, MEDIUM, LOW
        novelty: float,        # 0 - 100
        published_date: datetime,
        now: datetime = None
    ) -> Tuple[float, str, str]:
        """
        Computes composite ranking score, priority tier, and human-readable explanation.
        Returns: (ranking_score: float, priority: str, explanation: str)
        """
        if now is None:
            now = datetime.utcnow()

        # Convert credibility rating to numeric
        cred_map = {"HIGH": 95.0, "MEDIUM": 75.0, "LOW": 50.0}
        cred_score = cred_map.get(credibility_rating.upper(), 75.0)

        # Calculate recency decay factor
        days_diff = max(0.0, (now - (published_date or now)).total_seconds() / 86400.0)
        recency_factor = math.exp(-self.DECAY_LAMBDA * days_diff)

        # Weighted raw composite
        raw_composite = (
            (self.WEIGHT_RELEVANCE * relevance) +
            (self.WEIGHT_IMPACT * impact) +
            (self.WEIGHT_URGENCY * urgency) +
            (self.WEIGHT_CREDIBILITY * cred_score) +
            (self.WEIGHT_NOVELTY * novelty)
        )

        final_score = round(min(100.0, max(0.0, raw_composite * recency_factor)), 1)

        # Determine priority tier
        if final_score >= 80.0:
            priority = "CRITICAL"
        elif final_score >= 65.0:
            priority = "HIGH"
        elif final_score >= 45.0:
            priority = "MEDIUM"
        else:
            priority = "LOW"

        # Generate transparent explanation
        explanation = (
            f"Ranked as {priority} (Score {final_score}/100) based on: "
            f"Strategic Relevance {relevance:.0f}/100 (wt 25%), "
            f"Business Impact {impact:.0f}/100 (wt 25%), "
            f"Urgency {urgency:.0f}/100 (wt 20%), "
            f"Source Credibility {cred_score:.0f}/100 ({credibility_rating}, wt 15%), "
            f"and Novelty {novelty:.0f}/100 (wt 15%), "
            f"adjusted by {days_diff:.1f}d recency decay factor ({recency_factor:.2f}x)."
        )

        return final_score, priority, explanation


ranking_engine = IntelligenceRankingEngine()
