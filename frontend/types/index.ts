export interface Item {
  id: number;
  name: string;
  expiry_date: string;
  user_uuid: string;
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
}