-- 04_audio_entries.sql
-- Stores metadata for audio uploaded by chefs and their DNA analysis results

-- 1. Voice Entries (The "Raw" Data)
CREATE TABLE IF NOT EXISTS public.voice_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chef_id TEXT REFERENCES public.chef_profiles(id) NOT NULL,
  audio_url TEXT NOT NULL, -- Path to storage bucket
  duration_seconds INTEGER,
  transcript TEXT, -- Raw text from Whisper
  intent_tags TEXT[], -- Extracted intents (e.g., ["storytelling", "technique"])
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Chef DNA (The "Soul" - Aggregated Stats)
CREATE TABLE IF NOT EXISTS public.chef_dna (
  chef_id TEXT REFERENCES public.chef_profiles(id) PRIMARY KEY,
  
  -- Style Metrics (0-100)
  rhythm_score INTEGER DEFAULT 50, -- Fast vs Slow based on speech cadence
  storytelling_score INTEGER DEFAULT 0, -- Narrative focus
  technique_focus_score INTEGER DEFAULT 0, -- Instructional focus
  
  -- Identity
  keywords TEXT[], -- Most used meaningful words (e.g., "abuela", "fresco")
  origin_stories JSONB DEFAULT '[]'::jsonb, -- [{"title": "Achiote", "summary": "From Santa Barbara..."}]
  
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. RLS Policies
ALTER TABLE public.voice_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chef_dna ENABLE ROW LEVEL SECURITY;

-- Voice Entries: Chef can view/add their own. Public can view if we want (or keep private).
-- Let's keep raw audio private for now, but transcripts public maybe? For now private.
DROP POLICY IF EXISTS "Chefs can view own voice entries" ON public.voice_entries;
CREATE POLICY "Chefs can view own voice entries"
ON public.voice_entries FOR SELECT USING (auth.uid()::text = chef_id);

DROP POLICY IF EXISTS "Chefs can insert own voice entries" ON public.voice_entries;
CREATE POLICY "Chefs can insert own voice entries"
ON public.voice_entries FOR INSERT WITH CHECK (auth.uid()::text = chef_id);

-- Chef DNA: Public Read, Service Write
DROP POLICY IF EXISTS "Public can view chef dna" ON public.chef_dna;
CREATE POLICY "Public can view chef dna"
ON public.chef_dna FOR SELECT USING (true);
