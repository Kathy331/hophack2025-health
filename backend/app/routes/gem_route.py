from fastapi import APIRouter, File, UploadFile, Request, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.services.gem_service import parse_receipt, analyze_image, generate_recipe
from app.services.gem_service import parse_receipt, analyze_image, generate_recipe
import google.generativeai as genai
import os

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
async def parse_receipt_endpoint(file: UploadFile = File(...)):
    """
    Parse a receipt image and return structured items.
    Expects:
    - file: receipt image
    Returns:
    - parsed JSON with items [name, date_bought, price]
    """
    try:
        # Read image bytes
        image_bytes = await file.read()

        # Parse receipt JSON
        parsed_json = parse_receipt(image_bytes)

        return {"parsed": parsed_json}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-image")
async def analyze_image_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result_json = analyze_image(image_bytes)
    return {"analysis": result_json}

class GeminiRequest(BaseModel):
    prompt: str

# Validate API key is present
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

try:
    # Configure Gemini with error handling
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
except Exception as e:
    print(f"Error configuring Gemini: {str(e)}")
    raise HTTPException(status_code=500, detail="Failed to initialize Gemini API")

@router.post("/generate")
async def generate_response(request: GeminiRequest):
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key not configured"
        )
    try:
        response = model.generate_content(request.prompt)
        if not response:
            raise HTTPException(
                status_code=500,
                detail="No response from Gemini API"
            )
        return {"response": response.text}
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )
