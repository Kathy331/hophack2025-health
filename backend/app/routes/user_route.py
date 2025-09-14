from fastapi import APIRouter
from pydantic import BaseModel
from services.user_service import create_profile_in_db, save_recipe_in_db

router = APIRouter()

class ProfileCreateRequest(BaseModel):
    id: str
    username: str
    avatar: str | None = None
class RecipeRequest(BaseModel):
    userId: str
    recipe: dict

@router.post("/create_profile")
async def create_profile_endpoint(profile: ProfileCreateRequest):
    result = await create_profile_in_db(profile.id, profile.username, profile.avatar)
    return result

@router.post("/save_recipe")
async def save_recipe_endpoint(data: RecipeRequest):
    # You will implement save_recipe_in_db in your services
    result = await save_recipe_in_db(data.userId, data.recipe)
    return result