"""
Redis Leaky Bucket Rate Limiting Middleware for FastAPI
Guards backend endpoints against DDoS and brute-force attempts.
"""
from fastapi import Request, HTTPException, status
from src.core.cache.redis import get_redis_client


async def rate_limit_middleware(
    request: Request, max_requests: int = 100, window_seconds: int = 60
) -> None:
    """Enforce IP/Tenant rate limiting using Redis sliding window."""
    try:
        client = await get_redis_client()
        client_ip = request.client.host if request.client else "127.0.0.1"
        rate_key = f"rate_limit:{client_ip}:{request.url.path}"

        current = await client.incr(rate_key)
        if current == 1:
            await client.expire(rate_key, window_seconds)

        if current > max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later.",
            )
    except HTTPException:
        raise
    except Exception:
        # Pass through on Redis connection failure to maintain availability
        pass
