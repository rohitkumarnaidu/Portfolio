import json
import time
import logging

from typing import Optional, Any

try:
    import redis.asyncio as aioredis
except ImportError:
    aioredis = None

from app.config import settings

logger = logging.getLogger(__name__)


class MemoryCache:
    def __init__(self):
        self._store: dict[str, tuple[Any, float]] = {}

    async def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            return None
        value, expires_at = self._store[key]
        if expires_at and time.time() > expires_at:
            del self._store[key]
            return None
        return value

    async def set(self, key: str, value: Any, ttl: int = 300):
        expires_at = time.time() + ttl if ttl else 0
        self._store[key] = (value, expires_at)

    async def delete(self, key: str):
        self._store.pop(key, None)

    async def clear_pattern(self, pattern: str):
        import fnmatch
        keys = [k for k in self._store if fnmatch.fnmatch(k, pattern)]
        for k in keys:
            del self._store[k]

    async def close(self):
        self._store.clear()


class RedisCache:
    def __init__(self, redis_url: str):
        self._client = aioredis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True,
        )

    async def get(self, key: str) -> Optional[Any]:
        val = await self._client.get(key)
        if val is None:
            return None
        try:
            return json.loads(val)
        except (json.JSONDecodeError, TypeError):
            return val

    async def set(self, key: str, value: Any, ttl: int = 300):
        raw = json.dumps(value, default=str)
        await self._client.setex(key, ttl, raw)

    async def delete(self, key: str):
        await self._client.delete(key)

    async def clear_pattern(self, pattern: str):
        cursor = 0
        while True:
            cursor, keys = await self._client.scan(cursor=cursor, match=pattern, count=100)
            if keys:
                await self._client.delete(*keys)
            if cursor == 0:
                break

    async def close(self):
        await self._client.aclose()


class CacheService:
    def __init__(self):
        self._backend: RedisCache | MemoryCache | None = None

    async def _ensure_backend(self):
        if self._backend is not None:
            return
        if aioredis is not None and settings.REDIS_URL:
            try:
                self._backend = RedisCache(settings.REDIS_URL)
                await self._backend._client.ping()
                logger.info("cache_service using Redis backend")
                return
            except Exception as e:
                logger.warning("cache_service Redis unavailable, falling back to in-memory: %s", e)
        self._backend = MemoryCache()
        logger.info("cache_service using in-memory backend")

    async def get(self, key: str) -> Optional[Any]:
        await self._ensure_backend()
        return await self._backend.get(key)

    async def set(self, key: str, value: Any, ttl: int = 300):
        await self._ensure_backend()
        await self._backend.set(key, value, ttl)

    async def delete(self, key: str):
        await self._ensure_backend()
        await self._backend.delete(key)

    async def clear_pattern(self, pattern: str):
        await self._ensure_backend()
        await self._backend.clear_pattern(pattern)
