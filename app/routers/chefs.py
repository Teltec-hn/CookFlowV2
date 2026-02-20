from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from pydantic import BaseModel

router = APIRouter()

# --- Models ---
class ChefProfile(BaseModel):
    id: str
    name: str
    rank: str # Plomo, Cobre, Oro
    specialties: List[str]
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class ChefUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    tags: Optional[List[str]] = None

class ChefStats(BaseModel):
    views: int
    income: float
    subscribers: int

# --- Routes ---

@router.get("/{chef_id}", response_model=ChefProfile)
async def get_chef_profile(chef_id: str):
    """
    Descarga el perfil público, rango actual (Plomo, Cobre, Oro) y especialidades.
    """
    # TODO: Fetch from database
    return {
        "id": chef_id,
        "name": "FlowChef Master", 
        "rank": "Oro",
        "specialties": ["Hip-Hop Cuisine", "Molecular Gastronomy"],
        "bio": "Cocinando beats y platos.",
        "avatar_url": "https://example.com/avatar.jpg"
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
