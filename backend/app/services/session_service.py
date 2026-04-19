import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.session import Session, Message
from app.models.user import User


class SessionService:
    async def create(self, db: AsyncSession, user: User, mode: str = "chat") -> Session:
        session = Session(user_id=user.id, mode=mode)
        db.add(session)
        await db.flush()
        return session

    async def get_user_sessions(self, db: AsyncSession, user: User) -> list[Session]:
        result = await db.execute(
            select(Session)
            .where(Session.user_id == user.id)
            .order_by(Session.last_message_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, db: AsyncSession, session_id: uuid.UUID) -> Session | None:
        result = await db.execute(select(Session).where(Session.id == session_id))
        return result.scalar_one_or_none()

    async def get_messages(self, db: AsyncSession, session_id: uuid.UUID) -> list[Message]:
        result = await db.execute(
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.created_at.asc())
        )
        return list(result.scalars().all())

    async def update_title(self, db: AsyncSession, session_id: uuid.UUID, title: str) -> None:
        await db.execute(
            update(Session).where(Session.id == session_id).values(title=title)
        )

    async def delete(self, db: AsyncSession, session_id: uuid.UUID) -> None:
        session = await self.get_by_id(db, session_id)
        if session:
            await db.delete(session)

    async def touch(self, db: AsyncSession, session_id: uuid.UUID, increment_count: bool = True) -> None:
        values: dict = {"last_message_at": datetime.now(timezone.utc)}
        if increment_count:
            # Use SQLAlchemy expression for atomic increment
            from sqlalchemy import text
            await db.execute(
                text("UPDATE sessions SET message_count = message_count + 1, last_message_at = NOW() WHERE id = :id"),
                {"id": str(session_id)},
            )
        else:
            await db.execute(
                update(Session)
                .where(Session.id == session_id)
                .values(**values)
            )


session_service = SessionService()
