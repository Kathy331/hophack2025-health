from datetime import datetime
from supabase import create_client, Client
import os
from typing import Optional

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # service role key for server-side
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def insert_items_into_supabase(user_uuid: str, items_json: dict):
    """
    Insert parsed receipt items into Supabase under the given user_uuid.
    
    Args:
        user_uuid (str): Supabase auth UUID of the user.
        items_json (dict): JSON returned from parse_receipt containing items.
    """
    rows_to_insert = []

    for item in items_json.get("items", []):
        name: Optional[str] = item.get("name")
        if not name:
            # Skip items with no name
            continue

        date_str: Optional[str] = item.get("date_bought")
        if date_str:
            date_bought = date_str  # Supabase can accept YYYY-MM-DD string
        else:
            date_bought = datetime.today().strftime("%Y-%m-%d")

        row = {
            "user_uuid": user_uuid,
            "name": name,
            "shelf_life_days": item.get("shelf_life_days"),  # null if non-perishable
            "date_bought": date_bought,
            "price": item.get("price", 0.0),
        }
        rows_to_insert.append(row)

    if not rows_to_insert:
        return {"status": "no items to insert"}

    # Bulk insert into Supabase
    response = supabase.table("items").insert(rows_to_insert).execute()
    return response
