from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class ProfileSchema(BaseModel):
    id: UUID 
    username: str
    avatar: Optional[str] = None

    class Config:
        orm_mode = True
