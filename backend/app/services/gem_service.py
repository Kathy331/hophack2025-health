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
