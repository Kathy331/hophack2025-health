from fastapi import APIRouter, File, UploadFile
from ..services.gem_service import parse_receipt, analyze_image

router = APIRouter()

@router.post("/parse-receipt")
async def parse_receipt_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    parsed_json = parse_receipt(image_bytes)
    return {"parsed": parsed_json}

@router.post("/analyze-image")
async def analyze_image_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result_json = analyze_image(image_bytes)
    return {"analysis": result_json}
