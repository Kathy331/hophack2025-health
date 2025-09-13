const backendUrl = "https://4c113d0b753c.ngrok-free.app"; // replace with your backend

export interface Recipe {
  title: string;
  ingredients: string[];
  steps: string[];
  cookTime: string;
  servings: number;
  difficulty: string;
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
  const response = await fetch(`${backendUrl}/user/save_recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipe, userId }),
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