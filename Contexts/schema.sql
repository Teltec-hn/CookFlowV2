-- CookFlow Essential Schema V2.1 (Hardened & Idempotent)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (Secure Preferences)
create table if not exists public.users (
  id uuid references auth.users not null primary key, -- Linked to Supabase Auth
  email text,
  device_type text check (device_type in ('roku', 'android_tv', 'web', 'ios')),
  role text default 'user' check (role in ('user', 'moderator', 'god_mode')), -- RBAC
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Chef Profiles (Public Reference)
create table if not exists public.chef_profiles (
  id text primary key,
  name text not null,
  bio text,
  avatar_url text, -- Points to CDN (Cloudinary/Vercel)
  
  voice_style text,
  
  -- Optimized for Roku (CSV)
  specialties_csv text,
  dietary_tags_csv text,
  
  -- Native Arrays
  specialties text[], 
  dietary_tags text[],
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Whisk Cache (Cost Zero Strategy)
create table if not exists public.whisk_cache (
  query_hash text primary key, -- Hash of the query params
  response_json jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- 4. Recipes (Core Content - Internal DB)
create table if not exists public.recipes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  image text,
  summary text,
  ingredients jsonb, -- [{name, amount, unit}]
  instructions jsonb, -- [{step, text}]
  chef_id text references public.chef_profiles(id),
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Security Hardening)
alter table public.users enable row level security;
alter table public.chef_profiles enable row level security;
alter table public.whisk_cache enable row level security;
alter table public.recipes enable row level security;

-- A. Users can ONLY see/edit their own profile
drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile" 
on public.users for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" 
on public.users for update using (auth.uid() = id);

-- GOD MODE: Super Admins can view/edit ALL users
create policy "God Mode view all users"
on public.users for select using (
  (select role from public.users where id = auth.uid()) = 'god_mode'
);

create policy "God Mode update all users"
on public.users for update using (
  (select role from public.users where id = auth.uid()) = 'god_mode'
);

-- B. Public profiles are viewable by everyone (Anonymous access ok)
drop policy if exists "Public profiles are viewable by everyone" on public.chef_profiles;
create policy "Public profiles are viewable by everyone" 
on public.chef_profiles for select using (true);

-- C. Cache is internal (Service Role only usually, but read-only for helpers)
drop policy if exists "Cache read access" on public.whisk_cache;
create policy "Cache read access" 
on public.whisk_cache for select using (true);

-- D. Recipes are public read, God Mode write
drop policy if exists "Public recipes read" on public.recipes;
create policy "Public recipes read"
on public.recipes for select using (true);

create policy "God Mode manage recipes"
on public.recipes for all using (
  (select role from public.users where id = auth.uid()) = 'god_mode'
);
