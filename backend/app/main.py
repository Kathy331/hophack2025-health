from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from gem_service import parse_receipt

# Load env vars (Gemini API key, etc.)
load_dotenv()

app = FastAPI()

# Allow requests from React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev, later restrict to your app domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/parse-receipt")
async def parse_receipt_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    parsed_json = parse_receipt(image_bytes)
    return {"parsed": parsed_json}
