# Generate recipe from video URL (mock for now)
def generate_recipe(video_url: str, platform: str) -> dict:
    # TODO: Implement transcript extraction and Gemini call
    # For now, return a mock recipe
    return {
        "title": "Chocolate Chip Cookies",
        "ingredients": [
            "2¼ cups all-purpose flour",
            "1 cup butter, softened",
            "¾ cup granulated sugar",
            "¾ cup brown sugar",
            "2 large eggs",
            "2 tsp vanilla extract",
            "1 tsp baking soda",
            "1 tsp salt",
            "2 cups chocolate chips"
        ],
        "steps": [
            "Preheat oven to 375°F (190°C)",
            "Mix butter and sugars until creamy",
            "Beat in eggs and vanilla",
            "Combine flour, baking soda, and salt in separate bowl",
            "Gradually add dry ingredients to wet mixture",
            "Stir in chocolate chips",
            "Drop rounded tablespoons onto ungreased baking sheets",
            "Bake 9-11 minutes until golden brown",
            "Cool on baking sheet for 2 minutes, then transfer to wire rack"
        ],
        "cookTime": "25 minutes",
        "servings": 24,
        "difficulty": "Easy"
    }
import os
import io
import json
from PIL import Image
from dotenv import load_dotenv
import google.generativeai as genai
import re

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def parse_receipt(image_bytes: bytes) -> dict:
    """
    Send receipt image bytes to Gemini and return structured JSON.
    """
    # Convert bytes to a PIL Image
    image = Image.open(io.BytesIO(image_bytes))

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = (
        "1. Extract food items and their estimated shelf life in days. 2. Extract the date the items were bought and use this to estimate the shelf life 3. Extract the price of the items"
        "Return JSON strictly in this format:\n"
        "{ 'items': [ { 'name': str, 'shelf_life_days': int , 'date_bought': YYYY-MM-DD, 'price': number} ] }"
    )

    # Generate content
    response = model.generate_content([prompt, image])

    response = model.generate_content([prompt, image])
    print(safe_parse_gemini_response(response.text))
    return safe_parse_gemini_response(response.text)


def analyze_image(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes))
    model = genai.GenerativeModel("gemini-2.5-flash")
    prompt = (
        "Extract food items from the image and their estimated shelf life in days. "
        "Return **ONLY** valid JSON in this format:\n"
        '{"items": [{"name": "string", "shelf_life_days": int}]}'
    )
    response = model.generate_content([prompt, image])
    print(safe_parse_gemini_response(response.text))
    return safe_parse_gemini_response(response.text)



#fixes critical error where front end returns empty json bc there were spaces in the gemini response. Deletes any whitespace
def safe_parse_gemini_response(response_text: str) -> dict:
    """
    Extracts JSON object from Gemini response text safely.
    """
    match = re.search(r"\{.*\}", response_text, re.DOTALL)
    if not match:
        print("No JSON object found in Gemini response:", response_text)
        return {}
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        print("Failed to decode JSON from Gemini response:", response_text)
        return {}
