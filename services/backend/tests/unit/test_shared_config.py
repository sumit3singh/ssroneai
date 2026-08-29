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
