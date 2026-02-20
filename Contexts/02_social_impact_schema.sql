-- CookFlow Social Impact Schema (02_social_impact_schema.sql)
-- Focus: Monetization, Gamification, and Social Impact Tracking for the "FlowChef"

-- 1. Enums & Types
-- Rank Alquímico: Plomo (Starter), Cobre (Regular), Oro (Pro)
DO $$ BEGIN
    CREATE TYPE chef_rank AS ENUM ('plomo', 'cobre', 'oro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Enhance Chef Profiles
-- We use ALTER TABLE to extend the existing 'chef_profiles' without dropping data
ALTER TABLE public.chef_profiles 
ADD COLUMN IF NOT EXISTS rank chef_rank DEFAULT 'plomo',
ADD COLUMN IF NOT EXISTS resonance_score INTEGER DEFAULT 0, -- 0 to 100%
ADD COLUMN IF NOT EXISTS families_nourished INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS traditions_preserved INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pro_potential_score INTEGER DEFAULT 0; -- 0 to 100

-- 3. Goals (The "Cáliz" target)
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chef_id TEXT REFERENCES public.chef_profiles(id) NOT NULL,
  title TEXT NOT NULL, -- e.g., "Industrial Stove"
  description TEXT,
  target_amount NUMERIC(10,2) NOT NULL,
  current_amount NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Gratitude Impulses (Donations/Perfomance Tips)
CREATE TABLE IF NOT EXISTS public.gratitude_impulses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES public.goals(id),
  donor_name TEXT DEFAULT 'Anonymous',
  amount NUMERIC(10,2) NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Realtime Enablement
-- Enable Realtime for the "Cáliz" visualisation so the UI updates instantly
-- Note: 'supabase_realtime' publication usually exists in Supabase projects.
-- We catch errors just in case it doesn't exist yet, although strictly in Supabase it should.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'goals') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'gratitude_impulses') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gratitude_impulses;
  END IF;
EXCEPTION
  WHEN undefined_object THEN null; -- in case publication doesn't exist
END $$;

-- 6. RLS Policies
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_impulses ENABLE ROW LEVEL SECURITY;

-- Public read access for Goals (Everyone needs to see the target to be inspired)
DROP POLICY IF EXISTS "Public goals view" ON public.goals;
CREATE POLICY "Public goals view" ON public.goals FOR SELECT USING (true);

-- Public read access for Impulses (Social proof validation)
DROP POLICY IF EXISTS "Public impulses view" ON public.gratitude_impulses;
CREATE POLICY "Public impulses view" ON public.gratitude_impulses FOR SELECT USING (true);

-- 7. GOD MODE ARCHITECTURE (The "Robin Hood" Protocol)
-- 7.1. Enhance Users with Hierarchy
-- We check if column exists, if not we add it. If it exists, we might need to check constraints (omitted for brevity in pure SQL without migration tool, assuming fresh or compatible)
DO $$ BEGIN
    ALTER TABLE public.users ADD COLUMN role text DEFAULT 'user';
    ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'chef', 'admin', 'super_admin'));
EXCEPTION
    WHEN duplicate_column THEN null; -- Column already exists
    WHEN duplicate_object THEN null; -- Constraint might fail if data inconsistent, handle with care in prod
END $$;

-- 7.2. Chef Awards (Gamification Table)
CREATE TABLE IF NOT EXISTS public.chef_awards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chef_id TEXT REFERENCES public.chef_profiles(id) NOT NULL,
  award_type TEXT NOT NULL, -- e.g., 'community_hero', 'taste_master'
  granted_by UUID REFERENCES public.users(id), -- The Super Admin who granted it
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chef_awards ENABLE ROW LEVEL SECURITY;

-- 7.3. "Master Key" Policies
-- A. Super Admins can update ANY chef profile (Intervention Policy)
DROP POLICY IF EXISTS "Admins can update any chef profile" ON public.chef_profiles;
CREATE POLICY "Admins can update any chef profile" 
ON public.chef_profiles 
FOR UPDATE 
USING (
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin')
);

-- B. Super Admins can grant awards
DROP POLICY IF EXISTS "Admins can grant awards" ON public.chef_awards;
CREATE POLICY "Admins can grant awards" 
ON public.chef_awards 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'super_admin')
);

-- C. Public read for awards
DROP POLICY IF EXISTS "Public view awards" ON public.chef_awards;
CREATE POLICY "Public view awards" ON public.chef_awards FOR SELECT USING (true);
