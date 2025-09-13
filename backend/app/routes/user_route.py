from fastapi import APIRouter
from pydantic import BaseModel
from app.services.user_service import create_profile_in_db

router = APIRouter()

class ProfileCreateRequest(BaseModel):
    id: str
    username: str
    avatar: str | None = None

@router.post("/create_profile")
async def create_profile_endpoint(profile: ProfileCreateRequest):
    result = await create_profile_in_db(profile.id, profile.username, profile.avatar)
    return result
