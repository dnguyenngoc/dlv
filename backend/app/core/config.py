from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "DLV Backend"
    secret_key: str = "dev-secret-key-change"
    access_token_expire_minutes: int = 60

    database_url: str = "sqlite:///./dlv.db"
    redis_url: str | None = None

    neo4j_url: str | None = None
    neo4j_user: str | None = None
    neo4j_password: str | None = None

    cors_origins: list[str] = ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
