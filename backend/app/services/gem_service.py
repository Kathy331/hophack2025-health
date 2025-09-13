import os
import io
import json
from PIL import Image
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def parse_receipt(image_bytes: bytes) -> dict:
    """
    Send receipt image bytes to Gemini and return structured JSON.
    """
    # Convert bytes to a PIL Image
    image = Image.open(io.BytesIO(image_bytes))

    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = (
        "Extract food items and their estimated shelf life in days. "
        "Return JSON strictly in this format:\n"
        "{ 'items': [ { 'name': str, 'shelf_life_days': int } ] }"
    )

    # Generate content
    response = model.generate_content([prompt, image])

    # Parse text to JSON
    try:
        parsed_json = json.loads(response.text)
    except Exception:
        print("Failed to parse Gemini response as JSON:", response.text)
        parsed_json = {}

    return parsed_json

def analyze_image(image_bytes: bytes) -> dict:
    """
    Send image to Gemini and return structured JSON of what it sees.
    """
    # Convert bytes to a PIL Image
    image = Image.open(io.BytesIO(image_bytes))

    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = (
        "Extract food items from the image and their estimated shelf life in days based on how the food looks. "
        "Return JSON strictly in this format:\n"
        "{ 'items': [ { 'name': str, 'shelf_life_days': int } ] }"
    )

    # Generate content
    response = model.generate_content([prompt, image])

    # Parse text to JSON
    try:
        parsed_json = json.loads(response.text)
    except Exception:
        print("Failed to parse Gemini response as JSON:", response.text)
        parsed_json = {}

    return parsed_json