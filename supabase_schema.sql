-- ==========================================================
-- FitSathi - Supabase SQL Schema with Foreign Keys & RLS
-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- ==========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================
-- 1. PROFILES TABLE (Linked to auth.users)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  age INTEGER DEFAULT 25,
  gender TEXT DEFAULT 'male' CHECK (gender IN ('male', 'female', 'other')),
  height_cm NUMERIC(5, 2) DEFAULT 175.0,
  weight_kg NUMERIC(5, 2) DEFAULT 70.0,
  target_weight_kg NUMERIC(5, 2) DEFAULT 68.0,
  fitness_goal TEXT DEFAULT 'general_fitness',
  activity_level TEXT DEFAULT 'moderately_active',
  food_preference TEXT DEFAULT 'vegetarian',
  diet_preference TEXT DEFAULT 'vegetarian',
  allergies JSONB DEFAULT '[]'::jsonb,
  dietary_notes TEXT DEFAULT '',
  
  -- Daily Target Nutrients & Habits
  daily_calories_target INTEGER DEFAULT 2200,
  daily_protein_target NUMERIC(5, 1) DEFAULT 120.0,
  daily_protein_target_g NUMERIC(5, 1) DEFAULT 120.0,
  daily_carbs_target NUMERIC(5, 1) DEFAULT 275.0,
  daily_carbs_target_g NUMERIC(5, 1) DEFAULT 275.0,
  daily_fat_target NUMERIC(5, 1) DEFAULT 65.0,
  daily_fat_target_g NUMERIC(5, 1) DEFAULT 65.0,
  daily_water_glasses INTEGER DEFAULT 8,
  daily_step_goal INTEGER DEFAULT 10000,
  daily_sleep_hours NUMERIC(3, 1) DEFAULT 8.0,
  daily_budget NUMERIC(8, 2) DEFAULT 350.0,
  
  -- Status Flags
  is_premium BOOLEAN DEFAULT false,
  level INTEGER DEFAULT 1,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 2. FOOD LOGS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  food_id TEXT NOT NULL,
  food_name TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'evening_snack', 'dinner', 'late_snack', 'other')),
  quantity NUMERIC(6, 2) NOT NULL DEFAULT 1.0,
  serving_unit TEXT NOT NULL DEFAULT 'serving',
  calories NUMERIC(7, 2) NOT NULL DEFAULT 0.0,
  protein_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  carbs_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  fat_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  fiber_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 3. ACTIVITY LOGS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  steps INTEGER NOT NULL DEFAULT 0,
  active_minutes INTEGER NOT NULL DEFAULT 0,
  calories_burned INTEGER NOT NULL DEFAULT 0,
  activity_type TEXT DEFAULT 'Walking / Workout',
  notes TEXT DEFAULT '',
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 4. SLEEP LOGS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bed_time TEXT NOT NULL,
  wake_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  quality_rating INTEGER DEFAULT 4 CHECK (quality_rating BETWEEN 1 AND 5),
  quality_score INTEGER DEFAULT 4,
  notes TEXT DEFAULT '',
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 5. WATER LOGS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL DEFAULT 250,
  glasses NUMERIC(4, 1) NOT NULL DEFAULT 1.0,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 6. WEIGHT LOGS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5, 2) NOT NULL,
  notes TEXT DEFAULT '',
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 7. CUSTOM FOODS TABLE (Optional User-created Items)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hindi_name TEXT DEFAULT '',
  category TEXT DEFAULT 'all',
  serving_size NUMERIC(6, 2) DEFAULT 100.0,
  serving_unit TEXT DEFAULT 'g',
  calories NUMERIC(7, 2) NOT NULL DEFAULT 0.0,
  protein_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  carbs_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  fat_g NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  fiber_g NUMERIC(6, 2) DEFAULT 0.0,
  image_url TEXT,
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- 8. DIET PLANS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  goal TEXT DEFAULT 'general_fitness',
  target_calories NUMERIC(7, 2) NOT NULL,
  target_protein_g NUMERIC(6, 2) NOT NULL,
  target_carbs_g NUMERIC(6, 2) NOT NULL,
  target_fat_g NUMERIC(6, 2) NOT NULL,
  budget NUMERIC(8, 2) DEFAULT 0.0,
  meals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- PERFORMANCE INDEXES
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON public.food_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON public.water_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON public.weight_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_custom_foods_user ON public.custom_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_user ON public.diet_plans(user_id);

-- ==========================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================================

-- PROFILES POLICIES
CREATE POLICY "Users can select own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- FOOD LOGS POLICIES
CREATE POLICY "Users can select own food logs"
  ON public.food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON public.food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
  ON public.food_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON public.food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ACTIVITY LOGS POLICIES
CREATE POLICY "Users can select own activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity logs"
  ON public.activity_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity logs"
  ON public.activity_logs FOR DELETE
  USING (auth.uid() = user_id);

-- SLEEP LOGS POLICIES
CREATE POLICY "Users can select own sleep logs"
  ON public.sleep_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep logs"
  ON public.sleep_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep logs"
  ON public.sleep_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep logs"
  ON public.sleep_logs FOR DELETE
  USING (auth.uid() = user_id);

-- WATER LOGS POLICIES
CREATE POLICY "Users can select own water logs"
  ON public.water_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water logs"
  ON public.water_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water logs"
  ON public.water_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own water logs"
  ON public.water_logs FOR DELETE
  USING (auth.uid() = user_id);

-- WEIGHT LOGS POLICIES
CREATE POLICY "Users can select own weight logs"
  ON public.weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON public.weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
  ON public.weight_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON public.weight_logs FOR DELETE
  USING (auth.uid() = user_id);

-- CUSTOM FOODS POLICIES
CREATE POLICY "Users can manage own custom foods"
  ON public.custom_foods FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DIET PLANS POLICIES
CREATE POLICY "Users can manage own diet plans"
  ON public.diet_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==========================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- AUTOMATIC UPDATED_AT TIMESTAMP TRIGGER
-- ==========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

