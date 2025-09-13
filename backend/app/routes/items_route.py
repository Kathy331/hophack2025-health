from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from services.item_service import insert_items_into_supabase
from services.gem_service import predict_expirations

router = APIRouter()

class ItemsPayload(BaseModel):
    user_uuid: str
    items_json: Dict[str, Any]  # JSON returned from parse_receipt

@router.post("/finalize-items")
async def finalize_items_endpoint(payload: ItemsPayload):
    """
    Finalize receipt items:
    1. Predict missing expiration dates for the user's items.
    2. Insert all items into Supabase asynchronously.
    3. Return a clean response with inserted items.
    """
    # Step 1: Predict missing expiration dates using Gemini
    items_with_predicted_exp = predict_expirations(payload.items_json)
    # print(items_with_predicted_exp)
    # Step 2: Insert into Supabase  
    print(payload.user_uuid)
    result = await insert_items_into_supabase(payload.user_uuid, items_with_predicted_exp)

    # Step 3: Return clean response
    return {
        "status": result.get("status"),
        "inserted_items": result.get("result") if result.get("status") == "success" else [],
        "message": result.get("message", "")
    }
