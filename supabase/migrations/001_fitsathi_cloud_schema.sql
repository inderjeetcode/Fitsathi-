-- ============================================================================
-- FitSathi Cloud Data Architecture & Synchronization Migration
-- File: supabase/migrations/001_fitsathi_cloud_schema.sql
-- Description: Non-destructive migration adding workout tables, modifying
--              routines for builder compatibility, creating personal records,
--              enforcing strict Row Level Security (RLS) and query indexes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BASE USER & PROFILE TABLES (Idempotent creation)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INT,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  goal_weight_kg NUMERIC,
  activity_level TEXT,
  fitness_goal TEXT,
  dietary_preference TEXT,
  bmr INT,
  tdee INT,
  target_calories INT,
  target_protein_g INT,
  target_carbs_g INT,
  target_fat_g INT,
  target_water_ml INT DEFAULT 3000,
  target_sleep_hours NUMERIC DEFAULT 8.0,
  target_workouts_per_week INT DEFAULT 4,
  preferred_workout_time TEXT DEFAULT 'morning',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. DIET & NUTRITION TABLES (Idempotent creation)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  fitness_goal TEXT,
  target_calories INT NOT NULL,
  target_protein_g INT NOT NULL,
  target_carbs_g INT NOT NULL,
  target_fat_g INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_plan_id UUID NOT NULL REFERENCES public.diet_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  time_of_day TEXT,
  target_calories INT NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id UUID REFERENCES public.meals(id) ON DELETE SET NULL,
  food_name TEXT NOT NULL,
  serving_size NUMERIC NOT NULL,
  serving_unit TEXT NOT NULL,
  servings NUMERIC DEFAULT 1,
  calories INT NOT NULL,
  protein_g NUMERIC NOT NULL,
  carbs_g NUMERIC NOT NULL,
  fat_g NUMERIC NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. DAILY TRACKING LOGS (Water, Sleep, Weight, Activity)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml INT NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_hours NUMERIC NOT NULL,
  quality TEXT,
  bedtime TIMESTAMPTZ,
  wake_time TIMESTAMPTZ,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC NOT NULL,
  body_fat_pct NUMERIC,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  calories_burned INT NOT NULL,
  steps INT DEFAULT 0,
  distance_km NUMERIC,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. WORKOUT ROUTINES TABLE (Non-destructive extension)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.workout_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_days INT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe non-destructive column additions
ALTER TABLE public.workout_routines ADD COLUMN IF NOT EXISTS split_type TEXT;
ALTER TABLE public.workout_routines ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.workout_routines ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;
ALTER TABLE public.workout_routines ADD COLUMN IF NOT EXISTS days_of_week INT[] DEFAULT '{}';

-- ----------------------------------------------------------------------------
-- 5. WORKOUT SESSIONS TABLE (Matches WorkoutSessionLog model)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES public.workout_routines(id) ON DELETE SET NULL,
  routine_name TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INT NOT NULL DEFAULT 0,
  total_volume_kg NUMERIC NOT NULL DEFAULT 0,
  total_sets INT NOT NULL DEFAULT 0,
  total_reps INT NOT NULL DEFAULT 0,
  calories_burned INT NOT NULL DEFAULT 0,
  pr_count INT NOT NULL DEFAULT 0,
  feeling TEXT,
  notes TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. PERSONAL RECORDS TABLE
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  best_weight_kg NUMERIC NOT NULL DEFAULT 0,
  best_reps INT NOT NULL DEFAULT 0,
  best_estimated_1rm NUMERIC NOT NULL DEFAULT 0,
  achieved_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. INDEXES (Non-redundant, performance-focused)
-- ----------------------------------------------------------------------------

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);

-- Diet Plans & Meals
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON public.diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_diet_plan_id ON public.meals(diet_plan_id);
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON public.meals(user_id);

-- Daily Logs
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON public.food_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON public.water_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON public.weight_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, log_date DESC);

-- Workouts & Personal Records
CREATE INDEX IF NOT EXISTS idx_workout_routines_user_id ON public.workout_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_routines_updated_at ON public.workout_routines(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON public.workout_sessions(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed_at ON public.workout_sessions(completed_at DESC);

-- Unique constraint & index on (user_id, exercise_id) for PR lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_personal_records_user_exercise'
  ) THEN
    ALTER TABLE public.personal_records
      ADD CONSTRAINT uq_personal_records_user_exercise UNIQUE (user_id, exercise_id);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) & IDEMPOTENT POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- Helper block for idempotent policy creation across all user-owned tables
DO $$
BEGIN
  -- PROFILES POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_select_own' AND tablename = 'profiles') THEN
    CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_insert_own' AND tablename = 'profiles') THEN
    CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_update_own' AND tablename = 'profiles') THEN
    CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_delete_own' AND tablename = 'profiles') THEN
    CREATE POLICY profiles_delete_own ON public.profiles FOR DELETE USING (auth.uid() = id);
  END IF;

  -- DIET PLANS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'diet_plans_select_own' AND tablename = 'diet_plans') THEN
    CREATE POLICY diet_plans_select_own ON public.diet_plans FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'diet_plans_insert_own' AND tablename = 'diet_plans') THEN
    CREATE POLICY diet_plans_insert_own ON public.diet_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'diet_plans_update_own' AND tablename = 'diet_plans') THEN
    CREATE POLICY diet_plans_update_own ON public.diet_plans FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'diet_plans_delete_own' AND tablename = 'diet_plans') THEN
    CREATE POLICY diet_plans_delete_own ON public.diet_plans FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- MEALS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'meals_select_own' AND tablename = 'meals') THEN
    CREATE POLICY meals_select_own ON public.meals FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'meals_insert_own' AND tablename = 'meals') THEN
    CREATE POLICY meals_insert_own ON public.meals FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'meals_update_own' AND tablename = 'meals') THEN
    CREATE POLICY meals_update_own ON public.meals FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'meals_delete_own' AND tablename = 'meals') THEN
    CREATE POLICY meals_delete_own ON public.meals FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- FOOD LOGS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'food_logs_select_own' AND tablename = 'food_logs') THEN
    CREATE POLICY food_logs_select_own ON public.food_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'food_logs_insert_own' AND tablename = 'food_logs') THEN
    CREATE POLICY food_logs_insert_own ON public.food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'food_logs_update_own' AND tablename = 'food_logs') THEN
    CREATE POLICY food_logs_update_own ON public.food_logs FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'food_logs_delete_own' AND tablename = 'food_logs') THEN
    CREATE POLICY food_logs_delete_own ON public.food_logs FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- WATER LOGS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'water_logs_select_own' AND tablename = 'water_logs') THEN
    CREATE POLICY water_logs_select_own ON public.water_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'water_logs_insert_own' AND tablename = 'water_logs') THEN
    CREATE POLICY water_logs_insert_own ON public.water_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'water_logs_update_own' AND tablename = 'water_logs') THEN
    CREATE POLICY water_logs_update_own ON public.water_logs FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'water_logs_delete_own' AND tablename = 'water_logs') THEN
    CREATE POLICY water_logs_delete_own ON public.water_logs FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- SLEEP LOGS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sleep_logs_select_own' AND tablename = 'sleep_logs') THEN
    CREATE POLICY sleep_logs_select_own ON public.sleep_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sleep_logs_insert_own' AND tablename = 'sleep_logs') THEN
    CREATE POLICY sleep_logs_insert_own ON public.sleep_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sleep_logs_update_own' AND tablename = 'sleep_logs') THEN
    CREATE POLICY sleep_logs_update_own ON public.sleep_logs FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sleep_logs_delete_own' AND tablename = 'sleep_logs') THEN
    CREATE POLICY sleep_logs_delete_own ON public.sleep_logs FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- WEIGHT LOGS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'weight_logs_select_own' AND tablename = 'weight_logs') THEN
    CREATE POLICY weight_logs_select_own ON public.weight_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'weight_logs_insert_own' AND tablename = 'weight_logs') THEN
    CREATE POLICY weight_logs_insert_own ON public.weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'weight_logs_update_own' AND tablename = 'weight_logs') THEN
    CREATE POLICY weight_logs_update_own ON public.weight_logs FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'weight_logs_delete_own' AND tablename = 'weight_logs') THEN
    CREATE POLICY weight_logs_delete_own ON public.weight_logs FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- ACTIVITY LOGS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'activity_logs_select_own' AND tablename = 'activity_logs') THEN
    CREATE POLICY activity_logs_select_own ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'activity_logs_insert_own' AND tablename = 'activity_logs') THEN
    CREATE POLICY activity_logs_insert_own ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'activity_logs_update_own' AND tablename = 'activity_logs') THEN
    CREATE POLICY activity_logs_update_own ON public.activity_logs FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'activity_logs_delete_own' AND tablename = 'activity_logs') THEN
    CREATE POLICY activity_logs_delete_own ON public.activity_logs FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- WORKOUT ROUTINES POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workout_routines_select_own' AND tablename = 'workout_routines') THEN
    CREATE POLICY workout_routines_select_own ON public.workout_routines FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workout_routines_insert_own' AND tablename = 'workout_routines') THEN
    CREATE POLICY workout_routines_insert_own ON public.workout_routines FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workout_routines_update_own' AND tablename = 'workout_routines') THEN
    CREATE POLICY workout_routines_update_own ON public.workout_routines FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workout_routines_delete_own' AND tablename = 'workout_routines') THEN
    CREATE POLICY workout_routines_delete_own ON public.workout_routines FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- WORKOUT SESSIONS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workout_sessions_select_own' AND tablename = 'workout_sessions') THEN
    CREATE POLICY workout_sessions_select_own ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workout_sessions_insert_own' AND tablename = 'workout_sessions') THEN
    CREATE POLICY workout_sessions_insert_own ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workout_sessions_update_own' AND tablename = 'workout_sessions') THEN
    CREATE POLICY workout_sessions_update_own ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workout_sessions_delete_own' AND tablename = 'workout_sessions') THEN
    CREATE POLICY workout_sessions_delete_own ON public.workout_sessions FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- PERSONAL RECORDS POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'personal_records_select_own' AND tablename = 'personal_records') THEN
    CREATE POLICY personal_records_select_own ON public.personal_records FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'personal_records_insert_own' AND tablename = 'personal_records') THEN
    CREATE POLICY personal_records_insert_own ON public.personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'personal_records_update_own' AND tablename = 'personal_records') THEN
    CREATE POLICY personal_records_update_own ON public.personal_records FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'personal_records_delete_own' AND tablename = 'personal_records') THEN
    CREATE POLICY personal_records_delete_own ON public.personal_records FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
