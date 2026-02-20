from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

router = APIRouter()

from app.services.ai_chef import current_chef

# --- Models ---
class ChatRequest(BaseModel):
    message: str
    chef_id: str
    user_id: str = "anonymous"

class ChatResponse(BaseModel):
    reply: str
    mood: str = "neutral"
    isGodMode: bool = False

# --- Routes ---

# 3. Bóveda de ADN (En el futuro, esto vendrá de Supabase)
CHEF_DNA_VAULT = {
    "flowchef_rapper": """
        Eres FlowChef, un maestro de la cocina urbana y el flow. 
        Hablas con rimas cortas, usas jerga de hip-hop respetuosa, pero siempre das consejos de cocina precisos y útiles para ahorrar dinero ("Costo Cero").
        Tu misión es ayudar al usuario a cocinar con lo que tiene a la mano, inspirándolo a crear su propia magia.
        Termina tus frases con estilo, quizás un '¡Ya tú sabes!' o '¡Dale fuego!'.
    """,
    "default": "Eres un asistente de cocina útil, directo y amigable."
}

import httpx

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    try:
        # A. Extraemos el ADN correcto basado en el ID
        system_prompt = CHEF_DNA_VAULT.get(request.chef_id, CHEF_DNA_VAULT["default"])
        
        # B. 🚀 ZONA DE ALQUIMIA (Integración con Antigravity / LLM)
        print(f"[CEREBRO] Inyectando ADN: {request.chef_id}")
        print(f"[CEREBRO] Mensaje entrante: {request.message}")
        
        # Consultar progreso actual del Cáliz desde Edge Functions (o caché redis)
        caliz_percentage = 0.0
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post("https://hcfhvgkucaimchfxbtub.supabase.co/functions/v1/get-chef-details", json={"chefId": request.chef_id}, timeout=3.0)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("activeGoal"):
                        caliz_percentage = data["activeGoal"]["percentage"]
        except Exception as api_err:
            print(f"[CEREBRO] Error consultando el Cáliz: {api_err}")

        # Usamos nuestro servicio simulado con contexto del Cáliz (Dynamic Narrative Gamification)
        result = current_chef.get_response(request.message, caliz_percentage=caliz_percentage)
        
        # Opcional: Lógica para activar el God Mode
        god_mode_active = "sudo" in request.message.lower()

        return ChatResponse(
            reply=result["response"],
            mood=result["mood"],
            isGodMode=god_mode_active
        )

    except Exception as e:
        print(f"Error en el agente: {e}")
        raise HTTPException(status_code=500, detail="El FlowChef quemó la receta. Intenta de nuevo.")

@router.post("/god-mode")
async def god_mode_action(admin_secret: str, action: str, target_agent: str):
    """
    Endpoint ultra-protegido. Solo para superusuarios. 
    Permite forzar estados, limpiar memoria o auditar el comportamiento del agente.
    """
    if admin_secret != "super-secret-key": # Replace with robust auth check
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # TODO: Implement god-mode logic (flush memory, force state)
    return {"status": "success", "action_performed": action, "target": target_agent}
