-- Fix for 'voice_style' NOT NULL constraint
-- Run this to update the existing table
ALTER TABLE public.chef_profiles ALTER COLUMN voice_style DROP NOT NULL;
