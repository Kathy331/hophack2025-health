from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.services.item_service import insert_items_into_supabase
from app.services.gem_service import predict_expirations

router = APIRouter()

class ItemsPayload(BaseModel):
    user_uuid: str
    items_json: Dict[str, Any]

@router.post("/finalize-items")
async def finalize_items_endpoint(payload: ItemsPayload):
    """
    Finalize receipt items:
    1. Predict missing expiration dates
    2. Insert items into Supabase
    3. Return clean response
    """
    # Step 1: Predict expiration dates
    items_with_exp = predict_expirations(payload.items_json)
    
    # Step 2: Insert into Supabase
    result = await insert_items_into_supabase(payload.user_uuid, items_with_exp)
    
    # Step 3: Return response
    return {
        "status": result.get("status"),
        "items": result.get("result", []),
        "message": result.get("message", "")
    }
