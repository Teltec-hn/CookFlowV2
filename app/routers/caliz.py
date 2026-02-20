from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

router = APIRouter()

# --- Models ---
class Caliz(BaseModel):
    chef_id: str
    target_amount: float
    current_amount: float
    percentage: float
    status: str # active, completed, withdrawn

class Contribution(BaseModel):
    user_id: str
    amount: float
    message: str | None = None

# --- Routes ---

@router.get("/{chef_id}", response_model=Caliz)
async def get_caliz_status(chef_id: str):
    """
    Devuelve la meta activa, porcentaje de llenado y estado actual del cáliz.
    """
    # TODO: Fetch from database
    return {
        "chef_id": chef_id,
        "target_amount": 1000.00,
        "current_amount": 425.50,
        "percentage": 42.55,
        "status": "active"
    }

@router.post("/{chef_id}/contribute", response_model=Caliz)
async def contribute_to_caliz(chef_id: str, contribution: Contribution):
    """
    Registra un nuevo aporte, donación o suscripción, actualizando el progreso y notificando al ecosistema.
    """
    # TODO: Process payment/contribution, update Caliz state
    new_amount = 425.50 + contribution.amount
    return {
        "chef_id": chef_id,
        "target_amount": 1000.00,
        "current_amount": new_amount,
        "percentage": (new_amount / 1000.00) * 100,
        "status": "active"
    }
