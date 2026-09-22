import pytest
from src.shared.config import get_settings, Settings, DatabaseSettings

def test_settings_properties():
    settings = get_settings()
    assert settings.app_name == "SSR One AI Platform"
    
    # Test sync_url property
    db_settings = DatabaseSettings()
    assert "postgresql+psycopg2" in db_settings.sync_url
    
    # Test is_production / is_development
    assert settings.is_development is True
    assert settings.is_production is False
    
    # Test nested settings properties
    assert settings.db is not None
    assert settings.redis is not None
    assert settings.jwt is not None
    assert settings.ai is not None


def test_database_url_normalization():
    # Test standard postgresql URL with sslmode=require
    db = DatabaseSettings(DATABASE_URL="postgresql://user:pass@ep-cool.neon.tech/cafedb?sslmode=require")
    assert db.async_url == "postgresql+asyncpg://user:pass@ep-cool.neon.tech/cafedb?ssl=require"
    assert db.sync_url == "postgresql+psycopg2://user:pass@ep-cool.neon.tech/cafedb?sslmode=require"

    # Test postgres:// shorthand
    db_short = DatabaseSettings(DATABASE_URL="postgres://user:pass@db.supabase.co:5432/postgres")
    assert db_short.async_url == "postgresql+asyncpg://user:pass@db.supabase.co:5432/postgres"
    assert db_short.sync_url == "postgresql+psycopg2://user:pass@db.supabase.co:5432/postgres"

