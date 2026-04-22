"""
Short-term memory: a sliding window of recent messages.
Stored in-memory locally instead of Redis to bypass connection issues on Windows.
"""
from typing import Any

from app.config import settings


class ShortTermMemory:
    def __init__(self):
        # Store messages directly in memory instead of Redis
        self._memory = {}

    async def add(self, session_id: str, role: str, content: str) -> None:
        if session_id not in self._memory:
            self._memory[session_id] = []
            
        self._memory[session_id].append({"role": role, "content": content})
        
        # Keep only the last N messages
        if len(self._memory[session_id]) > settings.SHORT_TERM_WINDOW:
            self._memory[session_id] = self._memory[session_id][-settings.SHORT_TERM_WINDOW:]

    async def get(self, session_id: str) -> list[dict[str, str]]:
        return self._memory.get(session_id, [])

    async def clear(self, session_id: str) -> None:
        if session_id in self._memory:
            del self._memory[session_id]

    async def close(self) -> None:
        # In-memory dict does not need to be closed
        pass


short_term_memory = ShortTermMemory()
