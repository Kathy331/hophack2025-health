from fastapi import APIRouter, HTTPException
import google.generativeai as genai
import os
import json
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel
from time import sleep

router = APIRouter()

# Model configuration for recipe generation
GENERATION_CONFIG = {
    "temperature": 0.65,     # More deterministic outputs
    "top_p": 0.9,           # Maintain focused vocabulary
    "top_k": 25,            # Further limit vocabulary diversity
    "max_output_tokens": 2048,
    "stop_sequences": ["}}}"],  # Prevent overgeneration
    "candidate_count": 1,      # Single high-quality response
    "presence_penalty": 0.2,   # Encourage ingredient variety
    "frequency_penalty": 0.3   # Reduce repetition
}

SAFETY_SETTINGS = [
    {
        "category": "HARM_CATEGORY_DANGEROUS",
        "threshold": "BLOCK_LOW_AND_ABOVE"
    }
]

# Data models
class Item(BaseModel):
    id: int
    name: str
    expiry_date: str
    user_uuid: str

class Recipe(BaseModel):
    id: Optional[int] = None
    title: str
    ingredients: List[str]
    steps: List[str]
    cook_time: str
    difficulty: str
    servings: int
    url: Optional[str] = None
    user_uuid: Optional[str] = None

class RecommendationsRequest(BaseModel):
    inventory: List[Item]
    expiringItems: List[Item]
    userRecipes: List[Recipe]
    count: int = 3

def get_model():
    """Initialize and configure Gemini model."""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-pro')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Gemini: {str(e)}")

def create_recipe_prompt(inventory: List[Item], expiring: List[Item], experience: str, count: int) -> str:
    """Create a structured prompt for recipe generation."""
    
    # Format ingredients by category
    def format_ingredient_list(items: List[Item]) -> str:
        return "\n".join(f"- {item.name}" for item in sorted(items, key=lambda x: x.name))
    
    # Format instructions based on experience level
    instruction_detail = {
        "beginner": {
            "techniques": ["chopping", "mixing", "baking", "boiling"],
            "complexity": "simple steps with basic equipment",
            "detail": "detailed instructions with timing"
        },
        "intermediate": {
            "techniques": ["sautéing", "roasting", "marinating", "blending"],
            "complexity": "moderate techniques with standard equipment",
            "detail": "standard cooking instructions"
        },
        "advanced": {
            "techniques": ["reduction", "emulsion", "sous vide", "pastry"],
            "complexity": "complex techniques with specialized equipment",
            "detail": "concise professional instructions"
        }
    }[experience]

    return f'''You are a professional chef creating recipes to minimize food waste.

AVAILABLE INGREDIENTS:
{format_ingredient_list(inventory)}

PRIORITY INGREDIENTS (Must Use):
{format_ingredient_list(expiring)}

RECIPE COMPLEXITY:
- Skill Level: {experience}
- Techniques: {", ".join(instruction_detail["techniques"])}
- Equipment: {instruction_detail["complexity"]}
- Style: {instruction_detail["detail"]}

RECIPE REQUIREMENTS:
1. Generate {count} unique recipes that:
   - Use at least 3 available ingredients each
   - Incorporate expiring items when provided
   - Match specified skill level
   - Include practical portions (2-4 servings)

2. Format ingredients as:
   - Exact quantities (2 cups, 1 tablespoon)
   - Standard units (cups, tbsp, g, oz)
   - Clear descriptions (ripe, fresh, diced)

3. Write steps that:
   - Start with prep/setup
   - Include exact temperatures
   - Specify precise timings
   - End with completion indicators

JSON FORMAT:
{{
    "recipes": [
        {{
            "title": "Clear Name (Key Ingredients)",
            "cook_time": "Total time (25 mins)",
            "difficulty": "easy|medium|hard",
            "servings": "2-4",
            "ingredients": [
                "2 cups ripe bananas (mashed)",
                "1 tablespoon vanilla extract"
            ],
            "steps": [
                "1. Prep: Heat oven to 350°F",
                "2. Mix: Combine ingredients...",
                "3. Cook: Bake 25 minutes...",
                "4. Check: Golden brown crust..."
            ]
        }}
    ]
}}'''
    
class RecipeValidator:
    """Validates recipe structure and content."""
    
    def __init__(self, inventory: List[Item], expiring: List[Item]):
        self.inventory = {item.name.lower(): item for item in inventory}
        self.expiring = {item.name.lower(): item for item in expiring}
        
        self.required_fields = {'title', 'cook_time', 'difficulty', 'ingredients', 'steps', 'servings'}
        self.valid_difficulties = {'easy', 'medium', 'hard'}
        self.units = {
            'volume': {'cup', 'cups', 'tbsp', 'tsp', 'ml', 'l', 'tablespoon', 'teaspoon'},
            'weight': {'g', 'gram', 'grams', 'kg', 'oz', 'pound', 'lb'},
            'whole': {'piece', 'pieces', 'whole', 'slice', 'slices'}
        }
    
    def _extract_ingredient_name(self, ingredient: str) -> str:
        """Extract core ingredient name without quantities and units."""
        words = ingredient.lower().split()
        # Remove numbers and measurements
        all_units = sum((list(units) for units in self.units.values()), [])
        core_words = [w for w in words if not w[0].isdigit() 
                     and w not in all_units
                     and w not in ['fresh', 'ripe', 'frozen', 'dried', 'chopped', 'diced']]
        return ' '.join(core_words)

    def validate_ingredient(self, ingredient: str) -> Tuple[bool, str]:
        """Validate ingredient format and extract core name."""
        words = ingredient.lower().split()
        
        # Check quantity
        if not any(w[0].isdigit() for w in words):
            return False, "Missing quantity"
            
        # Check unit
        if not any(unit in words for units in self.units.values() for unit in units):
            return False, "Missing unit of measurement"
            
        # Check ingredient name
        core_name = self._extract_ingredient_name(ingredient)
        if not core_name:
            return False, "Missing ingredient name"
            
        return True, ""
    
    def validate_step(self, step: str, index: int) -> Tuple[bool, str]:
        """Validate recipe step format and content."""
        if not step.startswith(f"{index + 1}."):
            return False, f"Step should start with '{index + 1}.'"
            
        if len(step.split()) < 5:
            return False, "Step too short, needs more detail"
            
        return True, ""
    
    def validate_recipe(self, recipe: Dict[str, Any]) -> Tuple[bool, str]:
        """Validate single recipe structure and content."""
        # Check required fields
        if missing := self.required_fields - set(recipe.keys()):
            return False, f"Missing fields: {missing}"
            
        # Validate difficulty
        if recipe['difficulty'].lower() not in self.valid_difficulties:
            return False, f"Invalid difficulty: {recipe['difficulty']}"
            
        # Validate ingredients
        if not isinstance(recipe['ingredients'], list) or len(recipe['ingredients']) < 3:
            return False, "Need at least 3 ingredients"
            
        for ing in recipe['ingredients']:
            valid, error = self.validate_ingredient(ing)
            if not valid:
                return False, f"Invalid ingredient '{ing}': {error}"
                
        # Check ingredient usage with smarter matching
        used_ingredients = set()
        used_expiring = set()
        
        for ing in recipe['ingredients']:
            core_name = self._extract_ingredient_name(ing)
            if not core_name:
                continue
                
            # Try exact match first
            if core_name in self.inventory:
                used_ingredients.add(core_name)
                if core_name in self.expiring:
                    used_expiring.add(core_name)
                continue
            
            # Try partial matching
            for inv_name in self.inventory:
                if core_name in inv_name or inv_name in core_name:
                    used_ingredients.add(inv_name)
                    if inv_name in self.expiring:
                        used_expiring.add(inv_name)
                    break
                        
        if len(used_ingredients) < 3:
            return False, f"Only using {len(used_ingredients)} available ingredients"
            
        if self.expiring and not used_expiring:
            return False, "Not using any expiring ingredients"
            
        # Validate steps
        if not isinstance(recipe['steps'], list) or len(recipe['steps']) < 3:
            return False, "Need at least 3 steps"
            
        for i, step in enumerate(recipe['steps']):
            valid, error = self.validate_step(step, i)
            if not valid:
                return False, error
                
        return True, ""
    
    def validate_response(self, data: Dict[str, Any], expected_count: int) -> Tuple[bool, str]:
        """Validate complete recipe response."""
        try:
            if not isinstance(data, dict) or 'recipes' not in data:
                return False, "Invalid response format"
                
            recipes = data['recipes']
            if not isinstance(recipes, list) or len(recipes) != expected_count:
                return False, f"Expected {expected_count} recipes"
                
            for recipe in recipes:
                valid, error = self.validate_recipe(recipe)
                if not valid:
                    return False, error
                    
            return True, "Valid recipe response"
        except Exception as e:
            return False, f"Validation error: {str(e)}"

@router.post("/recommendations")
async def get_recommendations(request: RecommendationsRequest):
    """Generate recipe recommendations using available ingredients."""
    # Input validation
    if not request.inventory:
        raise HTTPException(status_code=400, detail="No ingredients provided")
    if request.count < 1 or request.count > 5:
        raise HTTPException(status_code=400, detail="Recipe count must be between 1 and 5")
    
    # Initialize components
    validator = RecipeValidator(request.inventory, request.expiringItems)
    experience = "advanced" if len(request.userRecipes) > 5 else "intermediate" if request.userRecipes else "beginner"
    
    try:
        model = get_model()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Gemini: {str(e)}")
    
    # Generate recipes with retry
    prompt = create_recipe_prompt(request.inventory, request.expiringItems, experience, request.count)
    max_attempts = 3
    last_error = None
    
    for attempt in range(max_attempts):
        try:
            # Generate recipe
            response = model.generate_content(
                prompt,
                generation_config=GENERATION_CONFIG,
                safety_settings=SAFETY_SETTINGS
            )
            
            if not response or not response.text:
                raise ValueError("Empty response from Gemini")
            
            # Parse and validate
            try:
                result = json.loads(response.text)
            except json.JSONDecodeError:
                raise ValueError("Invalid JSON response")
                
            is_valid, error = validator.validate_response(result, request.count)
            if not is_valid:
                print(f"Validation failed: {error}")
                continue
            
            # Add metadata
            for recipe in result['recipes']:
                used_ingredients = []
                used_expiring = []
                
                # Track ingredient usage
                for item in request.inventory:
                    if any(item.name.lower() in ing.lower() for ing in recipe['ingredients']):
                        used_ingredients.append(item.name)
                        if item in request.expiringItems:
                            used_expiring.append(item.name)
                
                # Calculate scores
                ingredient_score = len(used_ingredients) / len(request.inventory)
                expiring_score = len(used_expiring) / len(request.expiringItems) if request.expiringItems else 1.0
                
                recipe['metadata'] = {
                    'used_ingredients': used_ingredients,
                    'used_expiring': used_expiring,
                    'stats': {
                        'ingredient_usage': f"{len(used_ingredients)}/{len(request.inventory)}",
                        'expiring_usage': f"{len(used_expiring)}/{len(request.expiringItems)}" if request.expiringItems else "N/A",
                        'efficiency_score': round((ingredient_score + expiring_score) / 2 * 100)
                    }
                }
            
            return result
            
        except Exception as e:
            last_error = str(e)
            if attempt < max_attempts - 1:
                sleep(1)
                continue
    
    raise HTTPException(
        status_code=500,
        detail=f"Failed to generate valid recipes after {max_attempts} attempts: {last_error}"
    )
