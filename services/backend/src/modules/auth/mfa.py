import pyotp
import time
from typing import Any
from src.shared.redis_client import get_redis
from src.shared.logger import get_logger

logger = get_logger(__name__)

class MFAService:
    """
    TOTP Multi-Factor Authentication and Concurrent Session limits service.
    """
    
    @staticmethod
    def generate_totp_secret() -> str:
        """Generate a random 32-character base32 secret."""
        return pyotp.random_base32()
        
    @staticmethod
    def get_provisioning_uri(username: str, secret: str, issuer_name: str = "The ssrone") -> str:
        """Generate provisioning URI for QR code configuration."""
        return pyotp.totp.TOTP(secret).provisioning_uri(name=username, issuer_name=issuer_name)
        
    @staticmethod
    def verify_totp_code(secret: str, code: str) -> bool:
        """Verify the 6-digit TOTP code against the secret."""
        if not secret or not code:
            return False
        totp = pyotp.totp.TOTP(secret)
        return totp.verify(code)

    @staticmethod
    async def track_session(user_id: int, session_id: str, limit: int = 5) -> bool:
        """
        Record a session in Redis and enforce concurrent session limits.
        If the number of active sessions exceeds the limit, terminate the oldest session.
        """
        key = f"auth:sessions:{user_id}"
        try:
            client = await get_redis()
            now = time.time()
            # zadd expects key, score1, value1, score2, value2 format in some redis-py versions,
            # or mapping dict. Let's pass mapping to be compatible.
            await client.zadd(key, {session_id: now})
            
            count = await client.zcard(key)
            if count > limit:
                # Remove the oldest session (score is lowest)
                oldest_sessions = await client.zrange(key, 0, count - limit - 1)
                if oldest_sessions:
                    await client.zrem(key, *oldest_sessions)
                    for old_sess in oldest_sessions:
                        await client.set(f"auth:revoked_session:{old_sess}", "1", ex=86400)
            return True
        except Exception as e:
            logger.error("Error tracking session limits", user_id=str(user_id), error=str(e))
            return False

    @staticmethod
    async def is_session_valid(session_id: str) -> bool:
        """Check if a session ID has been revoked due to session limit enforcement."""
        try:
            client = await get_redis()
            is_revoked = await client.get(f"auth:revoked_session:{session_id}")
            return is_revoked is None
        except Exception as e:
            logger.error("Error validating session status", session_id=session_id, error=str(e))
            return True
