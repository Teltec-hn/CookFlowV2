-- CookFlow Essential Schema V2.1 (Hardened)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (Secure Preferences)
create table public.users (
  id uuid references auth.users not null primary key, -- Linked to Supabase Auth
  email text,
  device_type text check (device_type in ('roku', 'android_tv', 'web', 'ios')),
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Chef Profiles (Public Reference)
create table public.chef_profiles (
  id text primary key,
  name text not null,
  bio text,
  avatar_url text, -- Points to CDN (Cloudinary/Vercel)
  
  voice_style text not null,
  
  -- Optimized for Roku (CSV)
  specialties_csv text,
  dietary_tags_csv text,
  
  -- Native Arrays
  specialties text[], 
  dietary_tags text[],
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Whisk Cache (Cost Zero Strategy)
create table public.whisk_cache (
  query_hash text primary key, -- Hash of the query params
  response_json jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- RLS Policies (Security Hardening)
alter table public.users enable row level security;
alter table public.chef_profiles enable row level security;
alter table public.whisk_cache enable row level security;

-- A. Users can ONLY see/edit their own profile
create policy "Users can view own profile" 
on public.users for select using (auth.uid() = id);

create policy "Users can update own profile" 
on public.users for update using (auth.uid() = id);

-- B. Public profiles are viewable by everyone (Anonymous access ok)
create policy "Public profiles are viewable by everyone" 
on public.chef_profiles for select using (true);

-- C. Cache is internal (Service Role only usually, but read-only for helpers)
create policy "Cache read access" 
on public.whisk_cache for select using (true);
