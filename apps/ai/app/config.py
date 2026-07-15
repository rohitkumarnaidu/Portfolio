from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Portfolio AI"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    # Supabase / PostgreSQL
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    DATABASE_URL: str = ""
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 5

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_CHAT_MODEL: str = "gpt-4o"
    OPENAI_MAX_TOKENS: int = 2048
    OPENAI_TEMPERATURE: float = 0.3

    # Anthropic (Claude fallback)
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_CHAT_MODEL: str = "claude-sonnet-4-20250514"

    # Redis / Cache
    REDIS_URL: Optional[str] = None
    CACHE_TTL_SECONDS: int = 3600
    EMBEDDING_CACHE_TTL_DAYS: int = 30

    # RAG
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    TOP_K_VECTOR: int = 20
    TOP_K_KEYWORD: int = 10
    RERANK_TOP_K: int = 5
    EMBEDDING_BATCH_SIZE: int = 10

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 30
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # PII Filter
    PII_FILTER_ENABLED: bool = True

    # JWT
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"

    # Budget
    MONTHLY_BUDGET_USD: float = 10.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
