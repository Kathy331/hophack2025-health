// Update Recipe interface to include metadata and stats
interface RecipeMetadata {
  used_ingredients: string[];
  used_expiring: string[];
  stats: {
    ingredient_usage: string;
    expiring_usage: string;
    efficiency_score: number;
  };
}

export interface Recipe {
  id?: number;
  title: string;
  ingredients: string[];
  steps: string[];
  cook_time: string;
  difficulty: string;
  servings: number;
  url?: string;
  user_uuid?: string;
  image?: string;
  description?: string;
  matchedIngredients?: string[];
  expiringUsed?: string[];
  metadata?: RecipeMetadata;
  stats?: {
    totalUsage: string;
    expiringUsage: string;
    score: number;
  };
}