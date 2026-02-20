from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

router = APIRouter()

# --- Models ---
class ChatMessage(BaseModel):
    user_id: str
    chef_id: str
    message: str

class ChatResponse(BaseModel):
    response: str
    mood: str

# --- Routes ---

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(chat_input: ChatMessage):
    """
    Recibe el mensaje del usuario y el ID del chef. 
    FastAPI inyecta el contexto (prompt maestro, filosofía) y devuelve la respuesta con el estilo correcto.
    """
    # TODO: Connect to LLM service, retrieve context, format prompt
    return {
        "response": f"¡Hey {chat_input.user_id}! Aquí tu chef favorito. ¿De qué quieres hablar?",
        "mood": "enthusiastic"
    }

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
