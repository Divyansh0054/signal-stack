import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "127.0.0.1"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./data/signal_stack.db"

    # Crawler Settings
    CRAWLER_USER_AGENT: str = "SignalStackBot/1.0 (+https://github.com/edxso/signal-stack)"
    CRAWLER_RATE_LIMIT_SECONDS: float = 1.5
    CRAWLER_TIMEOUT_SECONDS: float = 12.0
    CRAWLER_MAX_RETRIES: int = 2

    # Scheduling
    WEEKLY_BRIEF_CRON: str = "0 6 * * 1"
    MONTHLY_AUDIT_CRON: str = "0 2 1 * *"
    TIMEZONE: str = "UTC"

    # AI Provider: heuristic, gemini, groq, ollama
    AI_PROVIDER: str = "heuristic"
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
