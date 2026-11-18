import pytest
from backend.app.services.research_engine import research_engine


def test_research_engine_synthetic_profiling():
    profile = research_engine.research_company(
        name="TestEdTech",
        website="https://www.meetuniversity.com"
    )

    assert profile["name"] == "TestEdTech"
    assert "industry" in profile
    assert len(profile["verified_facts"]) >= 1
    assert len(profile["assumptions"]) >= 1
    # Check strict separation of verified facts from assumptions
    for fact in profile["verified_facts"]:
        assert "fact" in fact
        assert "citation_url" in fact
        assert "snippet" in fact

    for assump in profile["assumptions"]:
        assert "assumption" in assump
        assert "reason" in assump
        assert assump["needs_verification"] is True
