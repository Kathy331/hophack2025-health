const backendUrl = "https://c334963bcfc2.ngrok-free.app"; // replace with your backend

export interface Recipe {
  id?: number;  // recipe_id from database
  title: string;
  ingredients: string[];
  steps: string[];
  cookTime: string;
  servings: number;
  difficulty: string;
  url?: string;  // URL of the video source
}

export const createProfile = async (id: string, username: string, avatar?: string) => {
  try {
    const response = await fetch(`${backendUrl}/user/create_profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        username,
        avatar: avatar || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create profile: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error creating profile:", error);
    throw error;
  }
};

export const saveRecipeToSupabase = async (recipe: Recipe, userId: string) => {
  // Ensure recipe has all required fields before saving
  const recipeToSave = {
    ...recipe,
    url: recipe.url || null, // Ensure URL is included
  };
  
  const response = await fetch(`${backendUrl}/user/save_recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipe: recipeToSave, userId }),
  });
  if (!response.ok) throw new Error("Failed to save recipe");
  return response.json();
};

export const deleteRecipeFromSupabase = async (recipe: Recipe, userId: string) => {
  const response = await fetch(`${backendUrl}/user/delete_recipe`, {
    method: "POST", // or "DELETE" if your backend supports it
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipe, userId }),
  });
  if (!response.ok) throw new Error("Failed to delete recipe");
  return response.json();
};

export interface RecipeSearchFilters {
  searchQuery?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'All';
  minServings?: number;
  userId: string; // to get recipes for the specific user
}

export const searchRecipes = async (filters: RecipeSearchFilters) => {
  try {
    const response = await fetch(`${backendUrl}/user/search_recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error(`Failed to search recipes: ${response.status}`);
    }

    const data = await response.json();
    return data as Recipe[];
  } catch (error: any) {
    console.error('Error searching recipes:', error);
    return [];
  }
};
