from datetime import datetime
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import Optional, Dict, Any
import asyncio

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

async def insert_items_into_supabase(user_uuid: str, items_json: Dict[str, Any]) -> Dict[str, Any]:
    """Insert items into Supabase with user association"""
    rows_to_insert = []

    for item in items_json.get("items", []):
        name: Optional[str] = item.get("name")
        if not name:
            continue

        date_str: Optional[str] = item.get("date_bought")
        date_bought = date_str if date_str else datetime.today().strftime("%Y-%m-%d")

        row = {
            "user_uuid": user_uuid,
            "name": name,
            "date_bought": date_bought,
            "price": item.get("price", 0.0),
            "estimated_expiration": item.get("estimated_expiration"),
            "storage_location": item.get("storage_location"),
        }

        rows_to_insert.append(row)

    if not rows_to_insert:
        return {"status": "no items to insert"}

    try:
        # Run synchronous Supabase insert in a thread to avoid blocking the event loop
        response = await asyncio.to_thread(lambda: supabase.table("items").insert(rows_to_insert).execute())
        return {"status": "success", "result": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

