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
        "Extract food items and their estimated shelf life in days. "
        "Return JSON strictly in this format:\n"
        "{ 'items': [ { 'name': str, 'shelf_life_days': int } ] }"
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
