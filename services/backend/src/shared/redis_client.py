"""
SSR One AI – Redis Client
Centralized Redis connection for caching, pub/sub, and session management.
"""
from collections.abc import AsyncGenerator
from typing import Any

import redis.asyncio as aioredis
from redis.asyncio import Redis

from src.shared.config import get_settings
from src.shared.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()

_redis_client: Redis | None = None  # type: ignore[type-arg]
_redis_available: bool = True


async def get_redis() -> Redis:  # type: ignore[type-arg]
    """Get or create the Redis client singleton."""
    global _redis_client, _redis_available
    if not _redis_available:
        raise ConnectionError("Redis is marked as unavailable")
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.redis.url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=50,
            socket_connect_timeout=2.0,
            socket_timeout=2.0,
            retry_on_timeout=True,
        )
        logger.info("Redis client initialized", url=settings.redis.url)
    return _redis_client


async def close_redis() -> None:
    """Close the Redis client (call on shutdown)."""
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None
        logger.info("Redis client closed")


async def ping_redis() -> bool:
    """Health check — returns True if Redis is reachable."""
    global _redis_available
    try:
        client = await get_redis()
        return await client.ping()
    except Exception as exc:
        logger.error("Redis health check failed", error=str(exc))
        _redis_available = False
        return False


class InMemoryCache:
    """Simple in-memory cache to use when Redis is unavailable."""

    def __init__(self) -> None:
        self._data: dict[str, tuple[Any, float | None]] = {}

    def get(self, key: str) -> Any | None:
        import time
        if key in self._data:
            val, expiry = self._data[key]
            if expiry is None or expiry > time.time():
                return val
            else:
                del self._data[key]
        return None

    def set(self, key: str, value: Any, ttl: int = 3600) -> None:
        import time
        self._data[key] = (value, time.time() + ttl)

    def delete(self, key: str) -> None:
        if key in self._data:
            del self._data[key]

    def delete_pattern(self, pattern: str) -> int:
        import fnmatch
        count = 0
        for key in list(self._data.keys()):
            if fnmatch.fnmatch(key, pattern):
                del self._data[key]
                count += 1
        return count

    def exists(self, key: str) -> bool:
        return self.get(key) is not None

    def increment(self, key: str, amount: int = 1) -> int:
        val = self.get(key) or 0
        new_val = val + amount
        self.set(key, new_val)
        return new_val

    def expire(self, key: str, ttl: int) -> None:
        val = self.get(key)
        if val is not None:
            self.set(key, val, ttl)


class CacheService:
    """High-level cache service wrapping Redis operations with local memory fallback."""

    def __init__(self, prefix: str = "ssrone") -> None:
        self.prefix = prefix
        self._local_cache = InMemoryCache()
        self._use_redis = True

    def _key(self, key: str) -> str:
        return f"{self.prefix}:{key}"

    async def _safe_execute(self, op: str, key: str, *args: Any, **kwargs: Any) -> Any:
        global _redis_available
        if not _redis_available or not self._use_redis:
            local_method = getattr(self._local_cache, op)
            return local_method(self._key(key), *args, **kwargs)

        try:
            client = await get_redis()
            if op == "get":
                value = await client.get(self._key(key))
                if value is None:
                    return None
                import json
                return json.loads(value)
            elif op == "set":
                value_to_store = args[0]
                ttl = kwargs.get("ttl", 3600)
                import json
                await client.setex(self._key(key), ttl, json.dumps(value_to_store, default=str))
            elif op == "delete":
                await client.delete(self._key(key))
            elif op == "delete_pattern":
                pattern = args[0]
                keys = await client.keys(self._key(pattern))
                if keys:
                    return await client.delete(*keys)
                return 0
            elif op == "exists":
                return bool(await client.exists(self._key(key)))
            elif op == "increment":
                amount = kwargs.get("amount", 1)
                return await client.incrby(self._key(key), amount)
            elif op == "expire":
                ttl = kwargs.get("ttl", 3600)
                await client.expire(self._key(key), ttl)
        except Exception as exc:
            logger.warning(
                f"Redis connection failed. Falling back to local in-memory cache for '{op}' operation.",
                error=str(exc)
            )
            _redis_available = False
            self._use_redis = False
            local_method = getattr(self._local_cache, op)
            return local_method(self._key(key), *args, **kwargs)

    async def get(self, key: str) -> Any | None:
        return await self._safe_execute("get", key)

    async def set(self, key: str, value: Any, ttl: int = 3600) -> None:
        await self._safe_execute("set", key, value, ttl=ttl)

    async def delete(self, key: str) -> None:
        await self._safe_execute("delete", key)

    async def delete_pattern(self, pattern: str) -> int:
        return await self._safe_execute("delete_pattern", pattern)

    async def exists(self, key: str) -> bool:
        return bool(await self._safe_execute("exists", key))

    async def increment(self, key: str, amount: int = 1) -> int:
        return await self._safe_execute("increment", key, amount=amount)

    async def expire(self, key: str, ttl: int) -> None:
        await self._safe_execute("expire", key, ttl=ttl)


# Default cache instance
cache = CacheService()
