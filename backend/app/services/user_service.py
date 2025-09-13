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
    
async def save_recipe_in_db(user_id: str, recipe: dict):
    try:
        # 1. Insert into recipes table
        cook_time = recipe.get("cookTime", "0")
        # Try to extract minutes as int, fallback to 0
        try:
            cook_time_minutes = int(''.join(filter(str.isdigit, cook_time)))
        except Exception:
            cook_time_minutes = 0

        recipe_insert = {
            "user_uuid": user_id,
            "title": recipe.get("title", "Untitled"),
            "cook_time_minutes": cook_time_minutes,
            "difficulty": recipe.get("difficulty", "Easy"),
            "servings": recipe.get("servings", 1)
        }
        recipe_resp = supabase.table("recipes").insert(recipe_insert).execute()
        if recipe_resp.error:
            return {"success": False, "error": recipe_resp.error.message}
        recipe_id = recipe_resp.data[0]["id"]
      # 2. Insert ingredients
        ingredients = recipe.get("ingredients", [])
        if ingredients:
            ingredient_rows = [{"recipe_id": recipe_id, "ingredient": ing} for ing in ingredients]
            ing_resp = supabase.table("recipe_ingredients").insert(ingredient_rows).execute()
            if ing_resp.error:
                return {"success": False, "error": ing_resp.error.message}

        # 3. Insert steps
        steps = recipe.get("steps", [])
        if steps:
            step_rows = [{"recipe_id": recipe_id, "step_number": i+1, "instruction": step} for i, step in enumerate(steps)]
            step_resp = supabase.table("recipe_steps").insert(step_rows).execute()
            if step_resp.error:
                return {"success": False, "error": step_resp.error.message}

        return {"success": True, "recipe_id": recipe_id}
    except Exception as e:
        print("Error saving recipe:", e)
        return {"success": False, "error": str(e)}