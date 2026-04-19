import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.user import User
from app.schemas.memory import MemoryResponse
from app.services.auth_service import get_current_user
from app.memory.short_term import short_term_memory
from app.memory.long_term import long_term_memory

router = APIRouter(prefix="/memory", tags=["memory"])


@router.get("", response_model=MemoryResponse)
async def get_memory(
    session_id: uuid.UUID = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    short = await short_term_memory.get(str(session_id))
    long = await long_term_memory.get_all(db, current_user.id)
    return MemoryResponse(short_term=short, long_term=long)
