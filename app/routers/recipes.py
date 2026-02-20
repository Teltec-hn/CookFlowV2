from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter()

# --- Models ---
class Recipe(BaseModel):
    id: str
    title: str
    description: str
    image_url: str
    ingredients: List[str]
    steps: List[str]
    is_premium: bool
    chef_id: str

class RecipeCreate(BaseModel):
    title: str
    description: str
    image_url: Optional[str]
    ingredients: List[str]
    steps: List[str]
    is_premium: bool = False

# --- Routes ---

@router.get("/", response_model=List[Recipe])
async def get_recipes(limit: int = 10, offset: int = 0):
    """
    Lista de recetas (feed general o por categorías).
    """
    # TODO: Fetch from database with pagination
    return []

@router.get("/{recipe_id}", response_model=Recipe)
async def get_recipe_detail(recipe_id: str):
    """
    Detalle de la receta. Verifica si el usuario tiene nivel para verla (gratis vs. premium).
    """
    # TODO: Fetch from database, check permissions
    return {
        "id": recipe_id,
        "title": "Tacos al Pastor Cuánticos",
        "description": "Una fusión de sabores tradicionales y ciencia molecular.",
        "image_url": "https://example.com/tacos.jpg",
        "ingredients": ["Tortilla", "Carne", "Piña", "Cilantro", "Salsa Cuántica"],
        "steps": ["Marinar la carne en un campo de fuerza", "Asar a 5000 grados Kelvin", "Disfrutar"],
        "is_premium": True,
        "chef_id": "flowchef_rapper"
    }

@router.post("/", response_model=Recipe)
async def create_recipe(recipe: RecipeCreate):
    """
    Permite a los chefs crear y publicar nuevas recetas.
    """
    # TODO: Create in database
    return {
        "id": "new_recipe_123", # Generated ID
        "title": recipe.title,
        "description": recipe.description,
        "image_url": recipe.image_url,
        "ingredients": recipe.ingredients,
        "steps": recipe.steps,
        "is_premium": recipe.is_premium,
        "chef_id": "current_auth_user" # Placeholder until auth is fully integrated
    }
