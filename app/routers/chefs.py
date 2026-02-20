from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter()

# --- Models ---
class ActiveGoal(BaseModel):
    targetAmount: int
    currentAmount: int
    percentage: int

class ExtendedChefProfile(BaseModel):
    profile: dict
    activeGoal: ActiveGoal
    awards: List[str]

@router.get("/{chef_id}", response_model=ExtendedChefProfile)
async def get_chef_profile(chef_id: str):
    """
    Descarga el perfil completo para Roku, incluyendo el estado del Cáliz y permios.
    """
    # TODO: Fetch real data from database
    return {
        "profile": {
            "id": chef_id,
            "name": "FlowChef Master",
            "rank": "Oro",
            "specialties": ["Hip-Hop Cuisine"],
            "bio": "Cocinando beats y platos."
        },
        "activeGoal": {
            "targetAmount": 500,
            "currentAmount": 250, 
            "percentage": 50 
        },
        "awards": ["primera_sangre", "maestro_del_fuego"]
    }

@router.put("/{chef_id}", response_model=ChefProfile)
async def update_chef_profile(chef_id: str, chef_update: ChefUpdate):
    """
    Endpoint seguro para que el chef actualice su bio, imagen y tags desde el dashboard.
    """
    # TODO: Verify authentication and update database
    return {
        "id": chef_id,
        "name": "FlowChef Master",
        "rank": "Oro",
        "specialties": ["Hip-Hop Cuisine", "Molecular Gastronomy"],
        "bio": chef_update.bio or "Updated bio",
        "avatar_url": chef_update.avatar_url or "https://example.com/avatar.jpg"
    }

@router.get("/{chef_id}/stats", response_model=ChefStats)
async def get_chef_stats(chef_id: str):
    """
    Devuelve las métricas de rendimiento (vistas, ingresos) para el dashboard del creador.
    """
    # TODO: Calculate stats from database
    return {
        "views": 1500,
        "income": 350.50,
        "subscribers": 120
    }
