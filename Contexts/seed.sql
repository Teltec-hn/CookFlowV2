-- Seed Data for CookFlow

-- 1. Create Chef Profile for FlowChef Rapper
insert into public.chef_profiles (id, name, bio, avatar_url, voice_style, specialties, dietary_tags)
values (
  'flowchef_rapper',
  'FlowChef Rapper',
  'Master of the kitchen beat. Cooking with rhythm and rhyme. God Mode enabled.',
  'https://your-bucket.supabase.co/flowchef-avatar.png',
  'rapper',
  ARRAY['HipHop Cuisine', 'Fast Food Gourmet'],
  ARRAY['Spicy', 'Urban']
) on conflict (id) do nothing;

-- 2. Insert Signature Recipes (Mock Data)
insert into public.recipes (title, image, summary, ingredients, instructions, chef_id, tags)
values 
(
  'Microphone Check Mac & Cheese',
  'https://img.spoonacular.com/recipes/716429-312x231.jpg',
  'Creamy, cheesy, and drops the beat on your tastebuds. The ultimate comfort food remix.',
  '[
    {"name": "Macaroni", "amount": "500", "unit": "g"},
    {"name": "Cheddar Cheese", "amount": "200", "unit": "g"},
    {"name": "Milk", "amount": "500", "unit": "ml"}
  ]'::jsonb,
  '[
    {"step": 1, "text": "Boil the water like a hype crowd."},
    {"step": 2, "text": "Drop the pasta beats."},
    {"step": 3, "text": "Mix the cheese sauce until it smooth like jazz."}
  ]'::jsonb,
  'flowchef_rapper',
  ARRAY['Comfort Food', 'Cheese']
),
(
  'Freestyle Fried Chicken',
  'https://img.spoonacular.com/recipes/715538-312x231.jpg',
  'Crispy skin, juicy meat, seasoned with the secret flow spice mix.',
  '[
    {"name": "Chicken Thighs", "amount": "6", "unit": "pcs"},
    {"name": "Flour", "amount": "2", "unit": "cups"},
    {"name": "Spices", "amount": "2", "unit": "tbsp"}
  ]'::jsonb,
  '[
    {"step": 1, "text": "Season the bird with the word."},
    {"step": 2, "text": "Dip in flour, shake off the extra."},
    {"step": 3, "text": "Fry until golden like a platinum record."}
  ]'::jsonb,
  'flowchef_rapper',
  ARRAY['Fried', 'Chicken']
);

-- Note: To make a user 'God Mode', run this after they sign up:
-- update public.users set role = 'god_mode' where email = 'your-email@example.com';
