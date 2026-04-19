import uuid
from datetime import datetime
from pydantic import BaseModel


class MemoryEntryOut(BaseModel):
    id: uuid.UUID
    key: str
    value: str
    category: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MemoryResponse(BaseModel):
    short_term: list[dict]
    long_term: list[MemoryEntryOut]
