from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.audio_service import AudioService
from pydantic import BaseModel

router = APIRouter()

class AnalysisResponse(BaseModel):
    transcript: str
    intent_tags: list[str]
    dna_update: dict

@router.post("/analyze")
async def analyze_audio(
    file: UploadFile = File(...),
    chef_id: str = Form(...)
):
    """
    Upload audio -> Transcribe (Whisper) -> Analyze Intent (GPT) -> Update DB (Supabase)
    """
    try:
        service = AudioService()
        result = await service.process_audio(file, chef_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
