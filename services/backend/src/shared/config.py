"""
SSR One AI – Application Settings
All configuration is loaded from environment variables via Pydantic Settings.
"""
from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    url: str | None = Field(default=None, alias="DATABASE_URL")
    provider: str = Field(default="postgresql", alias="DB_PROVIDER")
    host: str = Field(default="127.0.0.1", alias="DB_HOST")
    port: int = Field(default=5432, alias="DB_PORT")
    name: str = Field(default="cafedb", alias="DB_NAME")
    user: str = Field(default="postgres", alias="DB_USER")
    password: str = Field(default="asd123", alias="DB_PASSWORD")
    pool_size: int = Field(default=20, alias="DB_POOL_SIZE")
    max_overflow: int = Field(default=40, alias="DB_MAX_OVERFLOW")
    echo: bool = Field(default=False, alias="DB_ECHO")

    @computed_field  # type: ignore[misc]
    @property
    def async_url(self) -> str:
        if self.url:
            return self.url
        if self.provider.lower() == "sqlite":
            return "sqlite+aiosqlite:///./cafedb.db"
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    @computed_field  # type: ignore[misc]
    @property
    def sync_url(self) -> str:
        if self.provider.lower() == "sqlite":
            return "sqlite:///./cafedb.db"
        return f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class RedisSettings(BaseSettings):
    host: str = Field(default="localhost", alias="REDIS_HOST")
    port: int = Field(default=6379, alias="REDIS_PORT")
    password: str | None = Field(default=None, alias="REDIS_PASSWORD")
    db: int = Field(default=0, alias="REDIS_DB")

    @computed_field  # type: ignore[misc]
    @property
    def url(self) -> str:
        auth = f":{self.password}@" if self.password else ""
        return f"redis://{auth}{self.host}:{self.port}/{self.db}"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class JWTSettings(BaseSettings):
    secret_key: str = Field(default="ssrone-jwt-secret-key-2026", alias="JWT_SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=30, alias="JWT_REFRESH_TOKEN_EXPIRE_DAYS")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class AISettings(BaseSettings):
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    anthropic_api_key: str | None = Field(default=None, alias="ANTHROPIC_API_KEY")
    model: str = Field(default="claude-sonnet-4-6", alias="AI_MODEL")
    fallback_model: str = Field(default="gpt-4o-mini", alias="AI_FALLBACK_MODEL")
    max_tokens_per_day: int = Field(default=1_000_000, alias="AI_MAX_TOKENS_PER_DAY")
    cost_limit_usd_per_day: float = Field(default=10.0, alias="AI_COST_LIMIT_USD_PER_DAY")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class Settings(BaseSettings):
    # Application
    app_name: str = Field(default="SSR One AI Platform", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    app_env: Literal["development", "staging", "production"] = Field(
        default="development", alias="APP_ENV"
    )
    app_debug: bool = Field(default=True, alias="APP_DEBUG")
    app_secret_key: str = Field(default="ssrone-app-secret-key-2026", alias="APP_SECRET_KEY")
    frontend_url: AnyHttpUrl = Field(default="http://localhost:5173", alias="FRONTEND_URL")  # type: ignore[assignment]

    # Celery
    celery_broker_url: str = Field(
        default="redis://localhost:6379/1", alias="CELERY_BROKER_URL"
    )
    celery_result_backend: str = Field(
        default="redis://localhost:6379/2", alias="CELERY_RESULT_BACKEND"
    )

    # Storage
    storage_provider: Literal["local", "s3", "minio"] = Field(
        default="local", alias="STORAGE_PROVIDER"
    )
    storage_local_path: str = Field(default="./uploads", alias="STORAGE_LOCAL_PATH")

    # Feature Flags
    feature_ai_copilot: bool = Field(default=True, alias="FEATURE_AI_COPILOT")
    feature_offline_pos: bool = Field(default=True, alias="FEATURE_OFFLINE_POS")
    feature_multi_tenant: bool = Field(default=True, alias="FEATURE_MULTI_TENANT")

    # Sentry
    sentry_dsn: str | None = Field(default=None, alias="SENTRY_DSN")

    # Nested settings
    @computed_field  # type: ignore[misc]
    @property
    def db(self) -> DatabaseSettings:
        return DatabaseSettings()

    @computed_field  # type: ignore[misc]
    @property
    def redis(self) -> RedisSettings:
        return RedisSettings()

    @computed_field  # type: ignore[misc]
    @property
    def jwt(self) -> JWTSettings:
        return JWTSettings()

    @computed_field  # type: ignore[misc]
    @property
    def ai(self) -> AISettings:
        return AISettings()

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton — import and call this everywhere."""
    return Settings()
