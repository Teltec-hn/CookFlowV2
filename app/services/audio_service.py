import os
import json
from fastapi import UploadFile
from openai import OpenAI
from supabase import create_client, Client

class AudioService:
    def __init__(self):
        # Ensure env vars are loaded
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role for backend writes

        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is not set")
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set")

        self.client = OpenAI(api_key=self.openai_api_key)
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)

    async def process_audio(self, file: UploadFile, chef_id: str):
        # 1. Transcribe (Whisper)
        # Note: In production, save temp file or stream directly. Here we read into memory for simplicity (careful with large files)
        audio_bytes = await file.read()
        
        # Whisper requires a filename
        # We can mock a file-like object or save temporarity.
        # Simplest: save to temp and delete
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as f:
            f.write(audio_bytes)

        try:
            with open(temp_filename, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file,
                    language="es" # Force Spanish for now or auto-detect
                )
            transcript_text = transcription.text
        finally:
            if os.path.exists(temp_filename):
                os.remove(temp_filename)

        # 2. Analyze Intent & DNA (GPT-4o)
        dna_analysis = self._analyze_dna(transcript_text)

        # 3. Update Database (Supabase)
        self._save_results(chef_id, transcript_text, dna_analysis)

        return {
            "transcript": transcript_text,
            "intent_tags": dna_analysis.get("intent_tags", []),
            "dna_update": dna_analysis.get("dna_factors", {})
        }

    def _analyze_dna(self, text: str) -> dict:
        prompt = f"""
        Analyze this chef's monologue for "Chef DNA".
        Text: "{text}"
        
        Extract:
        1. Intent Tags (e.g., "storytelling", "technique", "ingredients", "philosophy")
        2. DNA Factors (0-100):
           - rhythm_score (Speed/Energy)
           - storytelling_score
           - technique_focus_score
        3. Keywords (List of 3-5 key terms)
        4. Origin Stories (List of any mentions of place/history)

        Return JSON only:
        {{
            "intent_tags": ["tag1"],
            "dna_factors": {{ "rhythm_score": 50, ... }},
            "keywords": ["..."],
            "origin_stories": [{{ "title": "...", "summary": "..." }}]
        }}
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are an expert culinary anthropologist and AI analyst."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)

    def _save_results(self, chef_id: str, transcript: str, analysis: dict):
        # 1. Save Voice Entry
        voice_entry = {
            "chef_id": chef_id,
            "transcript": transcript,
            "intent_tags": analysis.get("intent_tags", []),
            "audio_url": "tbd_s3_path" # TODO: Implement actual S3/Storage upload
        }
        self.supabase.table("voice_entries").insert(voice_entry).execute()

        # 2. Update Chef DNA (Upsert/Merge)
        # Fetch existing DNA
        existing_dna = self.supabase.table("chef_dna").select("*").eq("chef_id", chef_id).execute()
        current_data = existing_dna.data[0] if existing_dna.data else {}

        # Simple averaging or replacement logic for scores
        new_factors = analysis.get("dna_factors", {})
        
        # Merge Keywords (Unique)
        existing_keywords = set(current_data.get("keywords", []))
        existing_keywords.update(analysis.get("keywords", []))
        
        dna_update = {
            "chef_id": chef_id,
            "rhythm_score": new_factors.get("rhythm_score", current_data.get("rhythm_score", 50)),
            "storytelling_score": new_factors.get("storytelling_score", current_data.get("storytelling_score", 0)),
            "technique_focus_score": new_factors.get("technique_focus_score", current_data.get("technique_focus_score", 0)),
            "keywords": list(existing_keywords),
            "last_updated": "now()"
        }
        
        self.supabase.table("chef_dna").upsert(dna_update).execute()
