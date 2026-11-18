import pytest
from datetime import datetime, timedelta
from backend.app.services.ranking_engine import ranking_engine


def test_ranking_engine_weights_and_decay():
    now = datetime.utcnow()

    # High relevance, high impact, urgent, fresh official disclosure
    score_fresh, priority_fresh, explanation = ranking_engine.compute_ranking(
        relevance=95.0,
        impact=90.0,
        urgency=90.0,
        credibility_rating="HIGH",
        novelty=85.0,
        published_date=now,
        now=now
    )

    assert score_fresh >= 80.0
    assert priority_fresh == "CRITICAL"
    assert "Ranked as CRITICAL" in explanation
    assert "relevance" in explanation.lower()

    # Old signal with recency decay (30 days old)
    score_old, priority_old, _ = ranking_engine.compute_ranking(
        relevance=95.0,
        impact=90.0,
        urgency=90.0,
        credibility_rating="HIGH",
        novelty=85.0,
        published_date=now - timedelta(days=30),
        now=now
    )

    assert score_old < score_fresh, "Older signals must have lower scores due to exponential recency decay."
    assert priority_old in ("MEDIUM", "LOW")
