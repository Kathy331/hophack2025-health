import os
import io
import json
import re
from PIL import Image
from dotenv import load_dotenv
import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound, VideoUnavailable

# Extract YouTube video ID from URL
def extract_youtube_video_id(url: str) -> str | None:
    """Extracts the video ID from a YouTube URL."""
    patterns = [
        r"(?:v=|youtu\.be/|embed/|shorts/)([\w-]{11})",
        r"youtube\.com/watch\?v=([\w-]{11})"
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

# Generate recipe from video URL (YouTube only for now)
def generate_recipe(video_url: str, platform: str) -> dict:
    transcript_text = None
    error = None
    if platform.lower() == "youtube":
        video_id = extract_youtube_video_id(video_url)
        if not video_id:
            return {"success": False, "error": "Invalid YouTube URL or unable to extract video ID."}
        try:
            ytt_api = YouTubeTranscriptApi()
            fetched_transcript = ytt_api.fetch(video_id)
            transcript_text = " ".join([snippet.text for snippet in fetched_transcript])
        except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable) as e:
            error = f"Could not fetch transcript: {str(e)}"
        except Exception as e:
            error = f"Transcript extraction error: {str(e)}"
    else:
        error = "Only YouTube video links are supported for now."

    if not transcript_text:
        return {"success": False, "error": error or "No transcript available.", "transcript": None}

    # Send transcript to Gemini
    model = genai.GenerativeModel("gemini-2.5-flash")
    prompt = (
        "You are a world-class chef AI. Given the following transcript of a cooking video, extract and infer a complete, detailed recipe. "
        "If the transcript is incomplete, do your best to infer missing steps and ingredients. "
        "Return JSON ONLY in this format: { 'title': str, 'ingredients': [str], 'steps': [str], 'cookTime': str, 'servings': int, 'difficulty': str }\n"
        "If you cannot infer a recipe, return an empty ingredients and steps list.\n"
        f"Transcript: {transcript_text}"
    )
    response = model.generate_content(prompt)
    recipe = safe_parse_gemini_response(response.text)
    if not recipe:
        return {"success": False, "error": "Gemini did not return a valid recipe.", "transcript": transcript_text}
    return {"success": True, "recipe": recipe, "transcript": transcript_text}
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
        "You are given a receipt image. Extract structured information about each item.\n"
        "1. Extract each food or consumable item purchased.\n"
        "2. Extract the purchase date (YYYY-MM-DD) if available; if not, use today's date.\n"
        "3. Extract the price of each item; if unknown, use 0.00.\n"
        "4. Estimate the expiration date for perishable items (YYYY-MM-DD). If unknown or non-perishable, use null.\n"
        "Return the result strictly in valid JSON with double quotes. Example:\n"
        "{\n"
        "  \"items\": [\n"
        "    {\n"
        "      \"name\": \"Milk\",\n"
        "      \"date_bought\": \"2025-09-13\",\n"
        "      \"price\": 3.50,\n"
        "      \"estimated_expiration\": \"2025-09-20\"\n"
        "    },\n"
        "    {\n"
        "      \"name\": \"Canned Beans\",\n"
        "      \"date_bought\": \"2025-09-13\",\n"
        "      \"price\": 1.20,\n"
        "      \"estimated_expiration\": null\n"
        "    }\n"
        "  ]\n"
        "}\n"
        "Do not include explanations or extra text."
    )


    # Generate content
    response = model.generate_content([prompt, image])
    print(safe_parse_gemini_response(response.text))
    return safe_parse_gemini_response(response.text)

def predict_expirations(items_payload: dict) -> dict:
    """
    Takes the user's submitted items JSON and predicts/fills in missing expiration dates
    using Gemini, without changing other fields.
    """
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = (
        "You are a food AI assistant. Here is a list of items with optional estimated_expiration:\n"
        f"{json.dumps(items_payload)}\n"
        "For items where 'estimated_expiration' is null, predict a realistic expiration date "
        "based on the item name. Do not change any other fields. Return the same JSON structure "
        "with only the 'estimated_expiration' fields filled where missing."
    )

    response = model.generate_content(prompt)
    return safe_parse_gemini_response(response.text)

def analyze_image(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes))
    model = genai.GenerativeModel("gemini-2.5-flash")
    prompt = (
        "1. Extract food items from the image and their estimated shelf life in days. 2. Return the number of each item in the photo"
        "Return **ONLY** valid JSON in this format:\n"
        '{"items": [{"name": "string", "shelf_life_days": int, "num_of_occurences": int}]}'
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
