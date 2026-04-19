import uuid
from datetime import datetime
from pydantic import BaseModel


class SessionCreate(BaseModel):
    mode: str = "chat"


class SessionOut(BaseModel):
    id: uuid.UUID
    title: str
    mode: str
    message_count: int
    created_at: datetime
    last_message_at: datetime

    model_config = {"from_attributes": True}


class SessionUpdate(BaseModel):
    title: str
