import pytest
from unittest.mock import AsyncMock, patch, ANY
from src.modules.auth.mfa import MFAService

def test_generate_totp_secret():
    secret = MFAService.generate_totp_secret()
    assert len(secret) == 32

def test_get_provisioning_uri():
    secret = MFAService.generate_totp_secret()
    uri = MFAService.get_provisioning_uri("user@example.com", secret)
    assert "user%40example.com" in uri

def test_verify_totp_code_empty():
    assert MFAService.verify_totp_code("", "123456") is False
    assert MFAService.verify_totp_code("secret", "") is False

def test_verify_totp_code():
    secret = MFAService.generate_totp_secret()
    assert MFAService.verify_totp_code(secret, "123456") is False

@pytest.mark.asyncio
async def test_track_session_success():
    mock_redis = AsyncMock()
    mock_redis.zcard.return_value = 1
    
    with patch("src.modules.auth.mfa.get_redis", AsyncMock(return_value=mock_redis)):
        res = await MFAService.track_session(1, "session_id", limit=5)
        assert res is True
        mock_redis.zadd.assert_called_once()

@pytest.mark.asyncio
async def test_track_session_over_limit():
    mock_redis = AsyncMock()
    mock_redis.zcard.return_value = 6
    mock_redis.zrange.return_value = ["old_session"]
    
    with patch("src.modules.auth.mfa.get_redis", AsyncMock(return_value=mock_redis)):
        res = await MFAService.track_session(1, "session_id", limit=5)
        assert res is True
        mock_redis.zrem.assert_called_once_with(ANY, "old_session")
        mock_redis.set.assert_called_once()

@pytest.mark.asyncio
async def test_track_session_redis_error():
    with patch("src.modules.auth.mfa.get_redis", side_effect=Exception("Redis connection error")):
        res = await MFAService.track_session(1, "session_id", limit=5)
        assert res is False

@pytest.mark.asyncio
async def test_is_session_valid_success():
    mock_redis = AsyncMock()
    mock_redis.get.return_value = None
    
    with patch("src.modules.auth.mfa.get_redis", AsyncMock(return_value=mock_redis)):
        res = await MFAService.is_session_valid("session_id")
        assert res is True

@pytest.mark.asyncio
async def test_is_session_valid_revoked():
    mock_redis = AsyncMock()
    mock_redis.get.return_value = "1"
    
    with patch("src.modules.auth.mfa.get_redis", AsyncMock(return_value=mock_redis)):
        res = await MFAService.is_session_valid("session_id")
        assert res is False

@pytest.mark.asyncio
async def test_is_session_valid_redis_error():
    with patch("src.modules.auth.mfa.get_redis", side_effect=Exception("Redis error")):
        res = await MFAService.is_session_valid("session_id")
        assert res is True
