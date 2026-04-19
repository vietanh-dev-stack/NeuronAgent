"""
Short-term memory: a sliding window of recent messages stored in Redis.
Key format: session:{session_id}:messages (Redis List)
"""
import json
from typing import Any

import redis.asyncio as aioredis

from app.config import settings


class ShortTermMemory:
    def __init__(self):
        self._redis: aioredis.Redis | None = None

    @property
    def redis(self) -> aioredis.Redis:
        if self._redis is None:
            self._redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        return self._redis

    def _key(self, session_id: str) -> str:
        return f"session:{session_id}:messages"

    async def add(self, session_id: str, role: str, content: str) -> None:
        message = json.dumps({"role": role, "content": content})
        key = self._key(session_id)
        await self.redis.rpush(key, message)
        # Keep only the last N messages
        await self.redis.ltrim(key, -settings.SHORT_TERM_WINDOW, -1)
        await self.redis.expire(key, 60 * 60 * 24 * 7)  # 7 day TTL

    async def get(self, session_id: str) -> list[dict[str, str]]:
        key = self._key(session_id)
        raw_messages = await self.redis.lrange(key, 0, -1)
        return [json.loads(m) for m in raw_messages]

    async def clear(self, session_id: str) -> None:
        await self.redis.delete(self._key(session_id))

    async def close(self) -> None:
        if self._redis:
            await self._redis.aclose()


short_term_memory = ShortTermMemory()
