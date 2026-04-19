from fastapi import APIRouter

from app.api.v1 import auth, chat, sessions, memory

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(chat.router)
api_router.include_router(sessions.router)
api_router.include_router(memory.router)
