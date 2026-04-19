"""
Chat streaming endpoint — POST /api/v1/chat/stream
Returns Server-Sent Events (SSE) with typed events.
"""
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.user import User
from app.schemas.chat import ChatRequest
from app.services.auth_service import get_current_user
from app.services.session_service import session_service
from app.agent.orchestrator import orchestrator

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/stream")
async def chat_stream(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Stream a chat completion as Server-Sent Events.
    Client reads: text/event-stream with JSON-encoded typed events.
    """
    # Validate session belongs to user
    session = await session_service.get_by_id(db, body.session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found.")

    async def event_generator():
        try:
            gen = await orchestrator.run(
                session_id=body.session_id,
                user_id=current_user.id,
                user_message=body.message,
                mode=body.mode or session.mode,
                db=db,
            )
            async for event in gen:
                yield f"data: {json.dumps(event)}\n\n"

            # Auto-title session after first user message
            if session.message_count == 0:
                short_title = body.message[:50].strip()
                await session_service.update_title(db, body.session_id, short_title)

            await session_service.touch(db, body.session_id)
            await db.commit()

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/history/{session_id}")
async def get_history(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = await session_service.get_by_id(db, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found.")
    messages = await session_service.get_messages(db, session_id)
    return [
        {
            "id": str(m.id),
            "role": m.role,
            "content": m.content,
            "tool_name": m.tool_name,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]
