import { supabase } from '../supabaseClient';

export interface Recipe {
  id: number;
  user_uuid: string;
  title: string;
  cook_time: string;
  difficulty: string;
  servings: number;
  url?: string;
  ingredients?: string[];
  steps?: string[];
}

export async function fetchUserRecipes(userId: string): Promise<Recipe[]> {
  try {
    // Fetch recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_uuid', userId);

    if (recipesError) throw recipesError;

    // For each recipe, fetch its ingredients and steps
    const fullRecipes = await Promise.all(recipes.map(async (recipe) => {
      const [{ data: ingredients }, { data: steps }] = await Promise.all([
        supabase
          .from('recipe_ingredients')
          .select('ingredient')
          .eq('recipe_id', recipe.id),
        supabase
          .from('recipe_steps')
          .select('instruction')
          .eq('recipe_id', recipe.id)
          .order('step_number')
      ]);

      return {
        ...recipe,
        ingredients: ingredients?.map(i => i.ingredient) || [],
        steps: steps?.map(s => s.instruction) || []
      };
    }));

    return fullRecipes;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}