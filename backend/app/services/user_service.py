from supabase import create_client, Client
import os
from typing import Optional

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # use service role key for server-side
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def create_profile_in_db(user_id: str, username: str, avatar: Optional[str] = None):
    """
    Inserts a new profile into the 'profiles' table.
    """
    try:
        response = supabase.table("profiles").insert({
            "id": user_id,
            "username": username,
            "avatar": avatar
        }).execute()
        if response.error:
            print("Supabase error:", response.error)
            return {"error": response.error.message}
        return response.data
    except Exception as e:
        print("Unexpected error creating profile:", e)
        return {"error": str(e)}
