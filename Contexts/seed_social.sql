-- Seed Data for Social Impact (Run in Supabase SQL Editor)

-- 0. Ensure FlowChef Rapper Profile Exists
INSERT INTO public.chef_profiles (id, name, bio, avatar_url, voice_style, specialties, dietary_tags, rank)
VALUES (
  'flowchef_rapper',
  'FlowChef Rapper',
  'Master of the kitchen beat. Cooking with rhythm and rhyme. God Mode enabled.',
  'https://your-bucket.supabase.co/flowchef-avatar.png',
  'rapper',
  ARRAY['HipHop Cuisine', 'Fast Food Gourmet'],
  ARRAY['Spicy', 'Urban'],
  'oro'
) ON CONFLICT (id) DO UPDATE SET rank = 'oro';

-- 1. Create a Goal for FlowChef Rapper (The "Cáliz")
INSERT INTO public.goals (chef_id, title, description, target_amount, current_amount, is_active)
VALUES (
  'flowchef_rapper',
  'Industrial Stove Upgrade',
  'Help me buy a high-BTU stove to cook for the whole block!',
  1000.00,
  550.00, -- 55% Funded
  TRUE
);

-- 2. Grant some Awards
INSERT INTO public.chef_awards (chef_id, award_type, granted_by)
VALUES 
(
  'flowchef_rapper',
  'flavor_master', 
  (SELECT id FROM public.users WHERE role = 'super_admin' LIMIT 1) -- Auto-assign if Super Admin exists
),
(
  'flowchef_rapper',
  'community_hero',
  (SELECT id FROM public.users WHERE role = 'super_admin' LIMIT 1)
);

-- 3. Update Chef Rank (Redundant if handled in Step 0 but good for safety)
UPDATE public.chef_profiles
SET rank = 'oro', resonance_score = 85
WHERE id = 'flowchef_rapper';
