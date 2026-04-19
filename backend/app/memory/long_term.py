"""
Long-term memory: key-value facts stored in PostgreSQL.
Retrieved at context-building time to give the agent persistent knowledge about the user.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.memory_entry import MemoryEntry
import uuid


class LongTermMemory:
    async def save(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        key: str,
        value: str,
        category: str = "general",
        session_id: uuid.UUID | None = None,
    ) -> MemoryEntry:
        entry = MemoryEntry(
            user_id=user_id,
            session_id=session_id,
            key=key,
            value=value,
            category=category,
        )
        db.add(entry)
        await db.flush()
        return entry

    async def get_all(self, db: AsyncSession, user_id: uuid.UUID) -> list[MemoryEntry]:
        result = await db.execute(
            select(MemoryEntry)
            .where(MemoryEntry.user_id == user_id)
            .order_by(MemoryEntry.created_at.desc())
            .limit(50)
        )
        return list(result.scalars().all())

    async def get_recent(
        self, db: AsyncSession, user_id: uuid.UUID, limit: int = 5
    ) -> list[MemoryEntry]:
        result = await db.execute(
            select(MemoryEntry)
            .where(MemoryEntry.user_id == user_id)
            .order_by(MemoryEntry.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    def format_for_context(self, entries: list[MemoryEntry]) -> str:
        if not entries:
            return ""
        lines = ["## Remembered about this user:"]
        for e in entries:
            lines.append(f"- [{e.category}] {e.key}: {e.value}")
        return "\n".join(lines)


long_term_memory = LongTermMemory()
