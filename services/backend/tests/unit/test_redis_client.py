import pytest
import time
from src.shared.redis_client import InMemoryCache, CacheService

def test_in_memory_cache():
    cache = InMemoryCache()
    
    # Test set and get
    cache.set("key1", "val1", ttl=10)
    assert cache.get("key1") == "val1"
    
    # Test non-existent key
    assert cache.get("key2") is None
    
    # Test expiry
    cache.set("key_exp", "val_exp", ttl=-1)
    assert cache.get("key_exp") is None
    
    # Test exists
    assert cache.exists("key1") is True
    assert cache.exists("key2") is False
    
    # Test delete
    cache.delete("key1")
    assert cache.get("key1") is None
    
    # Test delete_pattern
    cache.set("prefix:1", "a")
    cache.set("prefix:2", "b")
    cache.set("other:1", "c")
    
    count = cache.delete_pattern("prefix:*")
    assert count == 2
    assert cache.get("prefix:1") is None
    assert cache.get("prefix:2") is None
    assert cache.get("other:1") == "c"
    
    # Test increment
    assert cache.increment("counter", 1) == 1
    assert cache.increment("counter", 5) == 6
    
    # Test expire
    cache.set("key_to_exp", "val", ttl=100)
    cache.expire("key_to_exp", 5)
    assert cache.get("key_to_exp") == "val"

@pytest.mark.asyncio
async def test_cache_service_fallback():
    # Force fallback mode
    service = CacheService(prefix="test_fallback")
    service._use_redis = False
    
    await service.set("k", "v", ttl=10)
    assert await service.get("k") == "v"
    
    assert await service.exists("k") is True
    assert await service.increment("c", amount=2) == 2
    await service.expire("k", 5)
    
    await service.delete("k")
    assert await service.get("k") is None
    
    await service.set("pat:1", "1")
    await service.delete_pattern("pat:*")
    assert await service.get("pat:1") is None
