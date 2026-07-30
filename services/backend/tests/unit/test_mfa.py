import pytest
import pyotp
from unittest.mock import AsyncMock, patch, MagicMock
from src.modules.auth.mfa import MFAService

def test_totp_generation_and_verification():
    secret = MFAService.generate_totp_secret()
    assert len(secret) == 32
    
    uri = MFAService.get_provisioning_uri("user@example.com", secret)
    assert "user%40example.com" in uri
    assert "The%20Baithak" in uri

    totp = pyotp.totp.TOTP(secret)
    current_code = totp.now()
    
    assert MFAService.verify_totp_code(secret, current_code) is True
    assert MFAService.verify_totp_code(secret, "000000") is False

@pytest.mark.asyncio
async def test_track_session_limits():
    user_id = 1
    
    mock_redis = AsyncMock()
    mock_redis.zcard.return_value = 6
    mock_redis.zrange.return_value = ["session-oldest"]
    
    with patch("src.modules.auth.mfa.get_redis", AsyncMock(return_value=mock_redis)):
        res = await MFAService.track_session(user_id, "session-new", limit=5)
        assert res is True
        
        mock_redis.zrem.assert_called_once_with(f"auth:sessions:{user_id}", "session-oldest")
        mock_redis.set.assert_called_once_with("auth:revoked_session:session-oldest", "1", ex=86400)
