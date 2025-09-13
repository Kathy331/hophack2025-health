tables created in supabase via SQL editor

-- Main recipe table
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    user_uuid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- recipe owner
    title TEXT NOT NULL,
    cook_time_minutes INT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    servings INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ingredients linked to recipe
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient TEXT NOT NULL
);

-- Steps linked to recipe
CREATE TABLE IF NOT EXISTS recipe_steps (
    id SERIAL PRIMARY KEY,
    recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    instruction TEXT NOT NULL,
    UNIQUE(recipe_id, step_number) -- ensures no duplicate step numbers per recipe
);
