from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from services.item_service import insert_items_into_supabase
from services.gem_service import predict_expirations
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


from db import supabase  # your Supabase client
from schemas.item_schema import ItemSchema 

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

@router.get("/get-items", response_model=List[ItemSchema])
async def get_items_endpoint(user_uuid: UUID = Query(...)):
    """
    Retrieve all items belonging to a specific user by their UUID.
    """
    response = supabase.table("items").select("*").eq("user_uuid", str(user_uuid)).execute()

    if not response.data:  # Supabase Python client returns data directly
        raise HTTPException(status_code=404, detail="No items found for this user")

    return response.data