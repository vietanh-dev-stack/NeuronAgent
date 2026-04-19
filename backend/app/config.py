from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # App
    APP_NAME: str = "NeuronAgent"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API
    API_PREFIX: str = "/api/v1"

    # LLM
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_MAX_TOKENS: int = 2048
    OPENAI_TEMPERATURE: float = 0.7

    # Database — default matches common local postgres setup
    DATABASE_URL: str = "postgresql+asyncpg://postgres:12345678@localhost:5432/neuronagent"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Memory
    SHORT_TERM_WINDOW: int = 20
    LONG_TERM_TOP_K: int = 5

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
