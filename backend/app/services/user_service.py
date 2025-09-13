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
    print("Starting recipe save...")
    try:
        # Handle cook time ranges
        cook_time = recipe.get("cookTime", "0 minutes")
        if '-' in cook_time:
            try:
                times = cook_time.split('-')
                numbers = []
                for t in times:
                    num = int(''.join(filter(str.isdigit, t.strip())))
                    numbers.append(num)
                avg_minutes = sum(numbers) // len(numbers)
                cook_time = f"{avg_minutes} minutes"
            except Exception as e:
                print(f"Error parsing cook time range: {e}")
                cook_time = "30 minutes"

        # 1. Insert main recipe
        recipe_insert = {
            "user_uuid": user_id,
            "title": recipe.get("title", "Untitled"),
            "cook_time": cook_time,
            "difficulty": recipe.get("difficulty", "Easy"),
            "servings": recipe.get("servings", 1),
            "url": recipe.get("url", None)
        }
        print("Inserting recipe:", recipe_insert)
        recipe_resp = supabase.table("recipes").insert(recipe_insert).execute()
        recipe_id = recipe_resp.data[0]["id"]
        print("Recipe saved with ID:", recipe_id)

        # 2. Insert ingredients
        ingredients = recipe.get("ingredients", [])
        if ingredients:
            print(f"Inserting {len(ingredients)} ingredients")
            ingredient_rows = [{"recipe_id": recipe_id, "ingredient": ing} for ing in ingredients]
            supabase.table("recipe_ingredients").insert(ingredient_rows).execute()
            print("Ingredients saved successfully")

        # 3. Insert steps
        steps = recipe.get("steps", [])
        if steps:
            print(f"Inserting {len(steps)} steps")
            step_rows = [{"recipe_id": recipe_id, "step_number": i+1, "instruction": step} for i, step in enumerate(steps)]
            supabase.table("recipe_steps").insert(step_rows).execute()
            print("Steps saved successfully")

        return {"success": True, "recipe_id": recipe_id}
    except Exception as e:
        print("Error saving recipe:", str(e))
        return {"success": False, "error": str(e)}
        # Handle time ranges by taking the average
        if '-' in cook_time:
            try:
                times = cook_time.split('-')
                # Extract numbers from each part
                numbers = []
                for t in times:
                    num = int(''.join(filter(str.isdigit, t.strip())))
                    numbers.append(num)
                # Take average for the interval
                avg_minutes = sum(numbers) // len(numbers)
                cook_time = f"{avg_minutes} minutes"
            except Exception as e:
                print(f"Error parsing cook time range: {e}")
                cook_time = "30 minutes"  # fallback
        
        recipe_insert = {
            "user_uuid": user_id,
            "title": recipe.get("title", "Untitled"),
            "cook_time": cook_time,
            "difficulty": recipe.get("difficulty", "Easy"),
            "servings": recipe.get("servings", 1),
            "url": recipe.get("url", None)
        }
        
        print("Inserting main recipe:", recipe_insert)
        recipe_resp = supabase.table("recipes").insert(recipe_insert).execute()
        if recipe_resp.error:
            print("Error inserting recipe:", recipe_resp.error)
            return {"success": False, "error": recipe_resp.error.message}
        
        recipe_id = recipe_resp.data[0]["id"]
        print("Recipe created with ID:", recipe_id)
          # 2. Insert ingredients
        ingredients = recipe.get("ingredients", [])
        if ingredients:
            print(f"Inserting {len(ingredients)} ingredients")
            ingredient_rows = [{"recipe_id": recipe_id, "ingredient": ing} for ing in ingredients]
            ing_resp = supabase.table("recipe_ingredients").insert(ingredient_rows).execute()
            if ing_resp.error:
                print("Error inserting ingredients:", ing_resp.error)
                return {"success": False, "error": ing_resp.error.message}
            print("Ingredients inserted successfully")

        # 3. Insert steps
        steps = recipe.get("steps", [])
        if steps:
            print(f"Inserting {len(steps)} steps")
            step_rows = [{"recipe_id": recipe_id, "step_number": i+1, "instruction": step} for i, step in enumerate(steps)]
            step_resp = supabase.table("recipe_steps").insert(step_rows).execute()
            if step_resp.error:
                print("Error inserting steps:", step_resp.error)
                return {"success": False, "error": step_resp.error.message}
            print("Steps inserted successfully")

        return {"success": True, "recipe_id": recipe_id}
    except Exception as e:
        print("Error saving recipe:", e)
        return {"success": False, "error": str(e)}