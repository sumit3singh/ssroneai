"""
Async Redis Cache Layer with decorators for FastAPI responses.
"""
import json
from typing import Callable, Any, Optional
from functools import wraps
from redis.asyncio import Redis
from src.shared.config import get_settings

settings = get_settings()
redis_client: Optional[Redis] = None


async def get_redis_client() -> Redis:
    """Get or initialize singleton Redis client."""
    global redis_client
    if redis_client is None:
        redis_client = Redis.from_url(
            f"redis://{settings.redis.host}:{settings.redis.port}",
            encoding="utf-8",
            decode_responses=True,
        )
    return redis_client


def cache_response(ttl: int = 300, prefix: str = "ssrone:cache"):
    """Decorator for caching async function responses in Redis."""
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                client = await get_redis_client()
                cache_key = f"{prefix}:{func.__module__}:{func.__name__}:{hash(str(args) + str(kwargs))}"
                cached_data = await client.get(cache_key)
                if cached_data:
                    return json.loads(cached_data)

                result = await func(*args, **kwargs)
                if result is not None:
                    await client.setex(cache_key, ttl, json.dumps(result, default=str))
                return result
            except Exception:
                # Fallback on cache failure to execute underlying function
                return await func(*args, **kwargs)

        return wrapper

    return decorator
