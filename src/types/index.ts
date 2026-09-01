export type FitnessGoal = 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance' | 'general_fitness';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | 'light' | 'moderate' | 'active';
export type FoodPreference = 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian' | 'other';
export type DietPreference = FoodPreference;
export type MealType = 'breakfast' | 'lunch' | 'evening_snack' | 'dinner' | 'late_snack' | 'other';
export type FoodCategory =
  | 'all'
  | 'breakfast'
  | 'rice_grains'
  | 'dal_legumes'
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'eggs'
  | 'chicken_meat'
  | 'snacks'
  | 'sweets'
  | 'beverages'
  | 'indian_meals';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height_cm: number;
  weight_kg: number;
  target_weight_kg?: number;
  fitness_goal: FitnessGoal;
  activity_level: ActivityLevel;
  food_preference: FoodPreference;
  diet_preference?: FoodPreference;
  allergies?: string[];
  dietary_notes?: string;
  
  // Daily targets
  daily_calories_target: number;
  daily_protein_target: number; // in grams
  daily_protein_target_g?: number;
  daily_carbs_target: number; // in grams
  daily_carbs_target_g?: number;
  daily_fat_target: number; // in grams
  daily_fat_target_g?: number;
  daily_water_glasses: number; // glasses (e.g. 8)
  daily_step_goal: number;
  daily_sleep_hours: number;
  daily_budget?: number; // ₹ per day
  
  // Status
  is_premium?: boolean;
  level?: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  hindi_name?: string;
  category: FoodCategory;
  serving_size: number;
  serving_unit: string; // 'g', 'ml', 'piece', 'bowl', 'roti', 'cup', 'tbsp'
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  image_url?: string;
  is_custom?: boolean;
  user_id?: string;
  created_at?: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_id: string;
  food_name: string;
  meal_type: MealType;
  quantity: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  log_date: string; // 'YYYY-MM-DD'
  created_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  glasses: number;
  log_date: string; // 'YYYY-MM-DD'
  created_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  bed_time: string; // '23:00'
  wake_time: string; // '07:00'
  duration_minutes: number;
  quality_rating: number; // 1 to 5
  quality_score?: number;
  notes?: string;
  log_date: string; // 'YYYY-MM-DD'
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  steps: number;
  active_minutes: number;
  calories_burned: number;
  activity_type?: string;
  notes?: string;
  log_date: string; // 'YYYY-MM-DD'
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  notes?: string;
  log_date: string; // 'YYYY-MM-DD'
  created_at: string;
}

export interface DietPlanMeal {
  id: string;
  diet_plan_id: string;
  meal_type: MealType;
  food_id: string;
  food_name: string;
  quantity: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface DietPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  goal: FitnessGoal;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  budget?: number;
  meals: DietPlanMeal[];
  created_at: string;
}

export interface DailyNutritionSummary {
  totalCalories: number;
  targetCalories: number;
  totalProtein: number;
  targetProtein: number;
  totalCarbs: number;
  targetCarbs: number;
  totalFat: number;
  targetFat: number;
  totalFiber: number;
  mealsLoggedCount: number;
  totalMealsCount?: number;
}

// ==========================================
// WORKOUT SYSTEM TYPES (openGym compatible)
// ==========================================

export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'cardio'
  | 'full_body';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'bands'
  | 'none';

export type SetType = 'warmup' | 'normal' | 'drop' | 'failure';

export interface Exercise {
  id: string;
  name: string;
  hindi_name?: string;
  category: ExerciseCategory;
  targetMuscle: string;
  secondaryMuscles?: string[];
  equipment: EquipmentType;
  isBodyweight: boolean;
  instructions: string[];
  defaultRestSeconds: number;
  tips?: string;
  image_url?: string;
  gif_url?: string;
  media_url?: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  targetReps?: number;
  targetWeightKg?: number;
  actualReps?: number;
  actualWeightKg?: number;
  completed: boolean;
  isPR?: boolean;
  rpe?: number; // 1 to 10 Rate of Perceived Exertion
  estimated1RM?: number;
}

export interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  targetMuscle: string;
  equipment: EquipmentType;
  sets: WorkoutSet[];
  restSeconds: number;
  notes?: string;
  supersetWithIndex?: number;
}

export interface WorkoutRoutine {
  id: string;
  user_id: string;
  name: string; // e.g. "Push Day (Chest, Shoulders, Triceps)"
  description?: string;
  target_muscles: string[];
  estimated_minutes: number;
  days_of_week: number[]; // 0 = Sunday, 1 = Monday, etc.
  exercises: RoutineExercise[];
  is_custom: boolean;
  created_at: string;
}

export interface WorkoutSessionLog {
  id: string;
  user_id: string;
  routine_id?: string;
  routine_name: string;
  started_at: string;
  completed_at: string;
  duration_minutes: number;
  total_volume_kg: number;
  total_sets: number;
  total_reps: number;
  pr_count: number;
  calories_burned?: number;
  exercises: RoutineExercise[];
  notes?: string;
  log_date: string; // 'YYYY-MM-DD'
  created_at: string;
}

export interface PersonalRecord {
  id?: string;
  user_id?: string;
  exercise_id: string;
  exercise_name: string;
  best_weight_kg: number;
  best_reps: number;
  best_estimated_1rm: number;
  achieved_date: string;
}

export interface ActiveWorkoutState {
  routineId?: string;
  routineName: string;
  startedAt: string;
  exercises: RoutineExercise[];
  currentExerciseIndex: number;
  elapsedSeconds: number;
  isPaused: boolean;
  notes?: string;
}
