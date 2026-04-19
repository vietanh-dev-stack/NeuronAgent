import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    session_id: uuid.UUID
    message: str
    mode: str = "chat"  # chat | code | task


class MessageOut(BaseModel):
    id: uuid.UUID
    session_id: uuid.UUID
    role: str
    content: str
    tool_name: Optional[str] = None
    tool_input: Optional[str] = None
    tool_output: Optional[str] = None
    tokens_used: int
    created_at: datetime

    model_config = {"from_attributes": True}


# SSE event types emitted by /chat/stream
class TextDeltaEvent(BaseModel):
    type: str = "text_delta"
    content: str


class ToolCallEvent(BaseModel):
    type: str = "tool_call"
    tool: str
    input: dict


class ToolResultEvent(BaseModel):
    type: str = "tool_result"
    tool: str
    output: str


class DoneEvent(BaseModel):
    type: str = "done"
    usage: dict
