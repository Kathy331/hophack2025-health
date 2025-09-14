import { Recipe } from '../types';
import { API_URL } from '../config';

export async function getRecipeRecommendations(): Promise<Recipe[]> {
  try {
    const inventory = []; // TODO: Get from inventory service
    const expiringItems = []; // TODO: Get from inventory service
    
    const response = await fetch(`${API_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inventory,
        expiringItems,
        userRecipes: [],
        count: 3
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }

    const data = await response.json();
    if (!data.recipes || !Array.isArray(data.recipes)) {
      throw new Error('Invalid response format');
    }

    return data.recipes.map(recipe => ({
      ...recipe,
      description: `A ${recipe.difficulty} recipe using ${recipe.metadata?.used_ingredients?.length || 0} of your ingredients`,
      matchedIngredients: recipe.metadata?.used_ingredients || [],
      expiringUsed: recipe.metadata?.used_expiring || [],
      stats: {
        totalUsage: recipe.metadata?.stats?.ingredient_usage || '0/0',
        expiringUsage: recipe.metadata?.stats?.expiring_usage || 'N/A',
        score: recipe.metadata?.stats?.efficiency_score || 0
      }
    }));
  } catch (error) {
    console.error('Error getting recipe recommendations:', error);
    throw error;
  }
}