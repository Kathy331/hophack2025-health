
from fastapi import APIRouter, File, UploadFile, Request, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from services.gem_service import parse_receipt, analyze_image, generate_recipe
from services.item_service import insert_items_into_supabase

router = APIRouter()

# Request model for recipe generation
class RecipeRequest(BaseModel):
    videoUrl: str
    platform: str

# Response model for recipe (for demonstration)
class Recipe(BaseModel):
    title: str
    ingredients: list[str]
    steps: list[str]
    cookTime: str
    servings: int
    difficulty: str

# POST /generate-recipe endpoint (mock implementation)
@router.post("/generate-recipe")
async def generate_recipe_endpoint(request: RecipeRequest):
    recipe = generate_recipe(request.videoUrl, request.platform)
    return {"success": True, "recipe": recipe}

@router.post("/parse-receipt")
async def parse_receipt_endpoint(
    file: UploadFile = File(...),
    user_uuid: str = Form(...)  # <-- accept user UUID from frontend
):
    """
    Endpoint to parse a receipt image and insert items into Supabase.
    Expects:
    - file: receipt image
    - user_uuid: Supabase auth UUID from frontend
    """
    try:
        # Read image bytes
        image_bytes = await file.read()

        # Parse receipt JSON
        parsed_json = parse_receipt(image_bytes)

        # Insert items into Supabase under this user
        insert_items_into_supabase(user_uuid, parsed_json)

        return {"parsed": parsed_json}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-image")
async def analyze_image_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result_json = analyze_image(image_bytes)
    return {"analysis": result_json}
