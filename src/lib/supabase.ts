import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  UserProfile, 
  FoodItem, 
  FoodLog, 
  WaterLog, 
  SleepLog, 
  ActivityLog, 
  WeightLog, 
  DietPlan,
  WorkoutRoutine,
  WorkoutSessionLog,
  PersonalRecord,
  ActiveWorkoutState,
  PendingDeletion,
  HealthSyncEntity
} from '../types';

// ==========================================
// SUPABASE CLIENT INITIALIZATION (Client-Safe)
// ==========================================
const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('YOUR_SUPABASE_URL') &&
  !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// ==========================================
// CLIENT-SIDE PERSISTENCE & CACHE ENGINE
// (All database secrets and API keys are strictly server-side)
// ==========================================
const STORAGE_PREFIX = 'fitsathi_';

// In-memory fallback if localStorage is unavailable
const memoryFallbackStore = new Map<string, string>();

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof localStorage === 'undefined') {
      const raw = memoryFallbackStore.get(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : defaultValue;
    }
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    if (typeof localStorage === 'undefined') {
      memoryFallbackStore.set(STORAGE_PREFIX + key, JSON.stringify(value));
      return;
    }
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error', err);
  }
}

// Initial default user for Inderjeet
const DEFAULT_USER: UserProfile = {
  id: 'user-inderjeet-01',
  email: 'inderjeetcode@gmail.com',
  full_name: 'Inderjeet',
  age: 26,
  gender: 'male',
  height_cm: 178,
  weight_kg: 68.5,
  target_weight_kg: 67.0,
  fitness_goal: 'general_fitness',
  activity_level: 'moderate',
  food_preference: 'vegetarian',
  diet_preference: 'vegetarian',
  allergies: ['None'],
  daily_calories_target: 2200,
  daily_protein_target: 120,
  daily_protein_target_g: 120,
  daily_carbs_target: 275,
  daily_carbs_target_g: 275,
  daily_fat_target: 65,
  daily_fat_target_g: 65,
  daily_water_glasses: 8,
  daily_step_goal: 10000,
  daily_sleep_hours: 8,
  daily_budget: 350,
  is_premium: true,
  level: 12,
  onboarding_completed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

export function initializeSeedData() {
  const today = getTodayDate();
  
  // Seed Profiles
  const profiles: Record<string, UserProfile> = {
    [DEFAULT_USER.id]: DEFAULT_USER,
    'user-priya-02': {
      ...DEFAULT_USER,
      id: 'user-priya-02',
      email: 'priya.sharma@example.com',
      full_name: 'Priya Sharma',
      gender: 'female',
      weight_kg: 58.0,
      target_weight_kg: 55.0,
      daily_calories_target: 1800,
      daily_protein_target: 95
    }
  };
  setStorageItem('profiles', profiles);
  setStorageItem('current_user_id', DEFAULT_USER.id);

  // Seed Global & Custom Foods
  setStorageItem('custom_foods', []);

  // Seed Food Logs for today
  const seedFoodLogs: FoodLog[] = [
    {
      id: 'seed-fl-1',
      user_id: DEFAULT_USER.id,
      food_id: 'f-oats-banana',
      food_name: 'Oats with Banana',
      meal_type: 'breakfast',
      quantity: 1,
      serving_unit: 'bowl (200g)',
      calories: 350,
      protein_g: 14,
      carbs_g: 58,
      fat_g: 7,
      fiber_g: 6,
      log_date: today,
      created_at: `${today}T08:30:00Z`
    },
    {
      id: 'seed-fl-2',
      user_id: DEFAULT_USER.id,
      food_id: 'f-rice-dal-sabzi',
      food_name: 'Rice, Dal, Sabzi',
      meal_type: 'lunch',
      quantity: 1,
      serving_unit: 'plate',
      calories: 550,
      protein_g: 22,
      carbs_g: 86,
      fat_g: 14,
      fiber_g: 8,
      log_date: today,
      created_at: `${today}T13:30:00Z`
    },
    {
      id: 'seed-fl-3',
      user_id: DEFAULT_USER.id,
      food_id: 'f-fruit-bowl',
      food_name: 'Fruits Bowl',
      meal_type: 'evening_snack',
      quantity: 1,
      serving_unit: 'bowl',
      calories: 150,
      protein_g: 4,
      carbs_g: 32,
      fat_g: 1,
      fiber_g: 5,
      log_date: today,
      created_at: `${today}T17:30:00Z`
    },
    {
      id: 'seed-fl-4',
      user_id: DEFAULT_USER.id,
      food_id: 'f-roti-paneer-salad',
      food_name: 'Roti, Paneer, Salad',
      meal_type: 'dinner',
      quantity: 1,
      serving_unit: 'plate',
      calories: 450,
      protein_g: 28,
      carbs_g: 46,
      fat_g: 18,
      fiber_g: 7,
      log_date: today,
      created_at: `${today}T20:30:00Z`
    },
    {
      id: 'seed-fl-5',
      user_id: DEFAULT_USER.id,
      food_id: 'f-roasted-chana',
      food_name: 'Roasted Chana',
      meal_type: 'late_snack',
      quantity: 1,
      serving_unit: 'small bowl (40g)',
      calories: 150,
      protein_g: 10,
      carbs_g: 22,
      fat_g: 3,
      fiber_g: 5,
      log_date: today,
      created_at: `${today}T22:15:00Z`
    }
  ];
  setStorageItem('food_logs', seedFoodLogs);

  // Seed Water Logs
  const seedWaterLogs: WaterLog[] = [
    { id: 'w1', user_id: DEFAULT_USER.id, amount_ml: 250, glasses: 1, log_date: today, created_at: `${today}T08:00:00Z` },
    { id: 'w2', user_id: DEFAULT_USER.id, amount_ml: 250, glasses: 1, log_date: today, created_at: `${today}T10:30:00Z` },
    { id: 'w3', user_id: DEFAULT_USER.id, amount_ml: 250, glasses: 1, log_date: today, created_at: `${today}T12:45:00Z` },
    { id: 'w4', user_id: DEFAULT_USER.id, amount_ml: 250, glasses: 1, log_date: today, created_at: `${today}T15:00:00Z` },
    { id: 'w5', user_id: DEFAULT_USER.id, amount_ml: 250, glasses: 1, log_date: today, created_at: `${today}T17:30:00Z` },
    { id: 'w6', user_id: DEFAULT_USER.id, amount_ml: 250, glasses: 1, log_date: today, created_at: `${today}T19:30:00Z` }
  ];
  setStorageItem('water_logs', seedWaterLogs);

  // Seed Activity Logs
  const seedActivityLogs: ActivityLog[] = [
    {
      id: 'act1',
      user_id: DEFAULT_USER.id,
      steps: 8432,
      active_minutes: 52,
      calories_burned: 420,
      activity_type: 'Brisk Walking & Workout',
      log_date: today,
      created_at: `${today}T18:00:00Z`
    }
  ];
  const pastDays = [1, 2, 3, 4, 5, 6, 7];
  const stepsHistory = [7200, 8900, 6400, 9500, 7800, 10200, 8432];
  pastDays.forEach((d, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - (7 - d));
    const dateStr = dt.toISOString().split('T')[0];
    if (dateStr !== today) {
      seedActivityLogs.push({
        id: `act-past-${i}`,
        user_id: DEFAULT_USER.id,
        steps: stepsHistory[i],
        active_minutes: 45,
        calories_burned: 350 + i * 15,
        log_date: dateStr,
        created_at: `${dateStr}T18:00:00Z`
      });
    }
  });
  setStorageItem('activity_logs', seedActivityLogs);

  // Seed Sleep Logs
  const seedSleepLogs: SleepLog[] = [
    {
      id: 'sl1',
      user_id: DEFAULT_USER.id,
      bed_time: '23:30',
      wake_time: '07:00',
      duration_minutes: 450,
      quality_rating: 4,
      quality_score: 4,
      notes: 'Deep restful sleep',
      log_date: today,
      created_at: `${today}T07:00:00Z`
    }
  ];
  pastDays.forEach((d, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - (7 - d));
    const dateStr = dt.toISOString().split('T')[0];
    if (dateStr !== today) {
      seedSleepLogs.push({
        id: `sl-past-${i}`,
        user_id: DEFAULT_USER.id,
        bed_time: '23:00',
        wake_time: '06:45',
        duration_minutes: 465,
        quality_rating: 4,
        quality_score: 4,
        log_date: dateStr,
        created_at: `${dateStr}T07:00:00Z`
      });
    }
  });
  setStorageItem('sleep_logs', seedSleepLogs);

  // Seed Weight Logs
  const seedWeightLogs: WeightLog[] = [];
  const weightHistory = [70.0, 69.8, 69.4, 69.1, 68.9, 68.7, 68.5];
  pastDays.forEach((d, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - (7 - d));
    const dateStr = dt.toISOString().split('T')[0];
    seedWeightLogs.push({
      id: `wt-${i}`,
      user_id: DEFAULT_USER.id,
      weight_kg: weightHistory[i],
      notes: i === 6 ? 'Feeling energetic' : undefined,
      log_date: dateStr,
      created_at: `${dateStr}T07:30:00Z`
    });
  });
  setStorageItem('weight_logs', seedWeightLogs);

  // Seed Diet Plans
  const seedDietPlans: DietPlan[] = [
    {
      id: 'dp-1',
      user_id: DEFAULT_USER.id,
      name: 'High Protein Indian Lean Muscle Plan',
      description: 'Clean vegetarian diet rich in paneer, dal, sprouts, and curd with balanced complex carbohydrates.',
      goal: 'muscle_gain',
      target_calories: 2200,
      target_protein_g: 120,
      target_carbs_g: 275,
      target_fat_g: 65,
      budget: 350,
      created_at: new Date().toISOString(),
      meals: [
        {
          id: 'dpm-1',
          diet_plan_id: 'dp-1',
          meal_type: 'breakfast',
          food_id: 'f-oats-banana',
          food_name: 'Oats with Banana & Honey',
          quantity: 1,
          serving_unit: 'bowl (200g)',
          calories: 310,
          protein_g: 8.5,
          carbs_g: 56,
          fat_g: 5.5,
          fiber_g: 6.5
        },
        {
          id: 'dpm-2',
          diet_plan_id: 'dp-1',
          meal_type: 'breakfast',
          food_id: 'f-besan-chilla',
          food_name: 'Besan Chilla',
          quantity: 1,
          serving_unit: 'piece',
          calories: 115,
          protein_g: 5.5,
          carbs_g: 16,
          fat_g: 3.2,
          fiber_g: 2.5
        },
        {
          id: 'dpm-3',
          diet_plan_id: 'dp-1',
          meal_type: 'lunch',
          food_id: 'f-roti-paneer-salad',
          food_name: 'Roti (2 pcs), Paneer Bhurji & Green Salad',
          quantity: 1,
          serving_unit: 'meal plate',
          calories: 450,
          protein_g: 24,
          carbs_g: 48,
          fat_g: 18,
          fiber_g: 7.5
        },
        {
          id: 'dpm-4',
          diet_plan_id: 'dp-1',
          meal_type: 'evening_snack',
          food_id: 'f-sprouts-salad',
          food_name: 'Mixed Moong Sprouts Salad',
          quantity: 1,
          serving_unit: 'bowl (150g)',
          calories: 120,
          protein_g: 8.5,
          carbs_g: 18,
          fat_g: 1.2,
          fiber_g: 5.5
        },
        {
          id: 'dpm-5',
          diet_plan_id: 'dp-1',
          meal_type: 'dinner',
          food_id: 'f-rice-dal-sabzi',
          food_name: 'Rice, Dal & Mix Sabzi Bowl',
          quantity: 1,
          serving_unit: 'meal plate',
          calories: 550,
          protein_g: 16.5,
          carbs_g: 86,
          fat_g: 14,
          fiber_g: 8.5
        }
      ]
    }
  ];
  setStorageItem('diet_plans', seedDietPlans);

  // Seed Workout Routines
  const seedRoutines: WorkoutRoutine[] = [
    {
      id: 'routine-push-01',
      user_id: DEFAULT_USER.id,
      name: 'Push Day (Chest, Shoulders, Triceps)',
      description: 'Compound pushing movements for upper body hypertrophy and strength.',
      target_muscles: ['Chest', 'Front Delts', 'Side Delts', 'Triceps'],
      estimated_minutes: 55,
      days_of_week: [1, 4], // Monday, Thursday
      is_custom: false,
      created_at: `${today}T06:00:00Z`,
      exercises: [
        {
          exerciseId: 'barbell_bench_press',
          exerciseName: 'Barbell Flat Bench Press',
          category: 'chest',
          targetMuscle: 'Pectoralis Major (Mid/Overall)',
          equipment: 'barbell',
          restSeconds: 90,
          sets: [
            { id: 's1', setNumber: 1, type: 'warmup', targetReps: 12, targetWeightKg: 40, completed: false },
            { id: 's2', setNumber: 2, type: 'normal', targetReps: 10, targetWeightKg: 60, completed: false },
            { id: 's3', setNumber: 3, type: 'normal', targetReps: 8, targetWeightKg: 70, completed: false },
            { id: 's4', setNumber: 4, type: 'normal', targetReps: 6, targetWeightKg: 75, completed: false }
          ]
        },
        {
          exerciseId: 'incline_dumbbell_press',
          exerciseName: 'Incline Dumbbell Press',
          category: 'chest',
          targetMuscle: 'Upper Chest (Clavicular Head)',
          equipment: 'dumbbell',
          restSeconds: 75,
          sets: [
            { id: 's5', setNumber: 1, type: 'normal', targetReps: 10, targetWeightKg: 22, completed: false },
            { id: 's6', setNumber: 2, type: 'normal', targetReps: 10, targetWeightKg: 24, completed: false },
            { id: 's7', setNumber: 3, type: 'normal', targetReps: 8, targetWeightKg: 26, completed: false }
          ]
        },
        {
          exerciseId: 'overhead_barbell_press',
          exerciseName: 'Overhead Standing Barbell Press (OHP)',
          category: 'shoulders',
          targetMuscle: 'Anterior & Lateral Deltoids',
          equipment: 'barbell',
          restSeconds: 90,
          sets: [
            { id: 's8', setNumber: 1, type: 'normal', targetReps: 8, targetWeightKg: 40, completed: false },
            { id: 's9', setNumber: 2, type: 'normal', targetReps: 8, targetWeightKg: 42.5, completed: false },
            { id: 's10', setNumber: 3, type: 'normal', targetReps: 6, targetWeightKg: 45, completed: false }
          ]
        },
        {
          exerciseId: 'dumbbell_lateral_raise',
          exerciseName: 'Dumbbell Side Lateral Raises',
          category: 'shoulders',
          targetMuscle: 'Lateral Deltoids (Shoulder Width)',
          equipment: 'dumbbell',
          restSeconds: 60,
          sets: [
            { id: 's11', setNumber: 1, type: 'normal', targetReps: 15, targetWeightKg: 10, completed: false },
            { id: 's12', setNumber: 2, type: 'normal', targetReps: 12, targetWeightKg: 12, completed: false },
            { id: 's13', setNumber: 3, type: 'drop', targetReps: 12, targetWeightKg: 10, completed: false }
          ]
        },
        {
          exerciseId: 'cable_triceps_pushdown',
          exerciseName: 'Cable Triceps Rope Pushdown',
          category: 'triceps',
          targetMuscle: 'Triceps Lateral & Medial Heads',
          equipment: 'cable',
          restSeconds: 60,
          sets: [
            { id: 's14', setNumber: 1, type: 'normal', targetReps: 12, targetWeightKg: 25, completed: false },
            { id: 's15', setNumber: 2, type: 'normal', targetReps: 12, targetWeightKg: 27.5, completed: false },
            { id: 's16', setNumber: 3, type: 'failure', targetReps: 10, targetWeightKg: 30, completed: false }
          ]
        }
      ]
    },
    {
      id: 'routine-pull-01',
      user_id: DEFAULT_USER.id,
      name: 'Pull Day (Back, Biceps, Rear Delts)',
      description: 'Back width, thickness and bicep volume routine with deadlifts.',
      target_muscles: ['Lats', 'Rhomboids', 'Traps', 'Biceps', 'Rear Delts'],
      estimated_minutes: 50,
      days_of_week: [2, 5], // Tuesday, Friday
      is_custom: false,
      created_at: `${today}T06:00:00Z`,
      exercises: [
        {
          exerciseId: 'barbell_deadlift',
          exerciseName: 'Conventional Barbell Deadlift',
          category: 'back',
          targetMuscle: 'Erector Spinae & Posterior Chain',
          equipment: 'barbell',
          restSeconds: 120,
          sets: [
            { id: 'p1', setNumber: 1, type: 'warmup', targetReps: 8, targetWeightKg: 60, completed: false },
            { id: 'p2', setNumber: 2, type: 'normal', targetReps: 5, targetWeightKg: 100, completed: false },
            { id: 'p3', setNumber: 3, type: 'normal', targetReps: 5, targetWeightKg: 115, completed: false }
          ]
        },
        {
          exerciseId: 'lat_pulldown',
          exerciseName: 'Cable Lat Pulldown',
          category: 'back',
          targetMuscle: 'Latissimus Dorsi',
          equipment: 'cable',
          restSeconds: 75,
          sets: [
            { id: 'p4', setNumber: 1, type: 'normal', targetReps: 10, targetWeightKg: 55, completed: false },
            { id: 'p5', setNumber: 2, type: 'normal', targetReps: 10, targetWeightKg: 60, completed: false },
            { id: 'p6', setNumber: 3, type: 'normal', targetReps: 8, targetWeightKg: 65, completed: false }
          ]
        },
        {
          exerciseId: 'seated_cable_row',
          exerciseName: 'Seated Cable Row',
          category: 'back',
          targetMuscle: 'Middle Back, Rhomboids & Lats',
          equipment: 'cable',
          restSeconds: 75,
          sets: [
            { id: 'p7', setNumber: 1, type: 'normal', targetReps: 10, targetWeightKg: 50, completed: false },
            { id: 'p8', setNumber: 2, type: 'normal', targetReps: 10, targetWeightKg: 55, completed: false },
            { id: 'p9', setNumber: 3, type: 'normal', targetReps: 8, targetWeightKg: 60, completed: false }
          ]
        },
        {
          exerciseId: 'face_pulls',
          exerciseName: 'Cable Rope Face Pulls',
          category: 'shoulders',
          targetMuscle: 'Rear Deltoids & Rotator Cuff',
          equipment: 'cable',
          restSeconds: 60,
          sets: [
            { id: 'p10', setNumber: 1, type: 'normal', targetReps: 15, targetWeightKg: 20, completed: false },
            { id: 'p11', setNumber: 2, type: 'normal', targetReps: 15, targetWeightKg: 22.5, completed: false },
            { id: 'p12', setNumber: 3, type: 'normal', targetReps: 12, targetWeightKg: 25, completed: false }
          ]
        },
        {
          exerciseId: 'barbell_bicep_curl',
          exerciseName: 'Standing Barbell Bicep Curl',
          category: 'biceps',
          targetMuscle: 'Biceps Brachii (Overall Mass)',
          equipment: 'barbell',
          restSeconds: 60,
          sets: [
            { id: 'p13', setNumber: 1, type: 'normal', targetReps: 10, targetWeightKg: 25, completed: false },
            { id: 'p14', setNumber: 2, type: 'normal', targetReps: 8, targetWeightKg: 27.5, completed: false },
            { id: 'p15', setNumber: 3, type: 'normal', targetReps: 8, targetWeightKg: 30, completed: false }
          ]
        }
      ]
    },
    {
      id: 'routine-legs-01',
      user_id: DEFAULT_USER.id,
      name: 'Legs & Core Power Day',
      description: 'Lower body compound movements for quad, hamstring, and glute development.',
      target_muscles: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core'],
      estimated_minutes: 60,
      days_of_week: [3, 6], // Wednesday, Saturday
      is_custom: false,
      created_at: `${today}T06:00:00Z`,
      exercises: [
        {
          exerciseId: 'barbell_back_squat',
          exerciseName: 'Barbell Back Squat',
          category: 'legs',
          targetMuscle: 'Quadriceps, Glutes & Adductors',
          equipment: 'barbell',
          restSeconds: 120,
          sets: [
            { id: 'l1', setNumber: 1, type: 'warmup', targetReps: 10, targetWeightKg: 50, completed: false },
            { id: 'l2', setNumber: 2, type: 'normal', targetReps: 8, targetWeightKg: 80, completed: false },
            { id: 'l3', setNumber: 3, type: 'normal', targetReps: 6, targetWeightKg: 90, completed: false },
            { id: 'l4', setNumber: 4, type: 'normal', targetReps: 5, targetWeightKg: 95, completed: false }
          ]
        },
        {
          exerciseId: 'romanian_deadlift',
          exerciseName: 'Barbell Romanian Deadlift (RDL)',
          category: 'legs',
          targetMuscle: 'Hamstrings & Gluteus Maximus',
          equipment: 'barbell',
          restSeconds: 90,
          sets: [
            { id: 'l5', setNumber: 1, type: 'normal', targetReps: 10, targetWeightKg: 60, completed: false },
            { id: 'l6', setNumber: 2, type: 'normal', targetReps: 8, targetWeightKg: 70, completed: false },
            { id: 'l7', setNumber: 3, type: 'normal', targetReps: 8, targetWeightKg: 75, completed: false }
          ]
        },
        {
          exerciseId: 'leg_press',
          exerciseName: '45° Leg Press Machine',
          category: 'legs',
          targetMuscle: 'Quadriceps & Glutes',
          equipment: 'machine',
          restSeconds: 90,
          sets: [
            { id: 'l8', setNumber: 1, type: 'normal', targetReps: 12, targetWeightKg: 120, completed: false },
            { id: 'l9', setNumber: 2, type: 'normal', targetReps: 10, targetWeightKg: 140, completed: false },
            { id: 'l10', setNumber: 3, type: 'normal', targetReps: 10, targetWeightKg: 160, completed: false }
          ]
        },
        {
          exerciseId: 'standing_calf_raise',
          exerciseName: 'Standing Calf Raises',
          category: 'legs',
          targetMuscle: 'Gastrocnemius & Soleus (Calves)',
          equipment: 'machine',
          restSeconds: 45,
          sets: [
            { id: 'l11', setNumber: 1, type: 'normal', targetReps: 15, targetWeightKg: 50, completed: false },
            { id: 'l12', setNumber: 2, type: 'normal', targetReps: 15, targetWeightKg: 55, completed: false },
            { id: 'l13', setNumber: 3, type: 'normal', targetReps: 12, targetWeightKg: 60, completed: false }
          ]
        },
        {
          exerciseId: 'hanging_leg_raise',
          exerciseName: 'Hanging Leg / Knee Raises',
          category: 'core',
          targetMuscle: 'Lower Abdominals & Hip Flexors',
          equipment: 'bodyweight',
          restSeconds: 60,
          sets: [
            { id: 'l14', setNumber: 1, type: 'normal', targetReps: 12, targetWeightKg: 0, completed: false },
            { id: 'l15', setNumber: 2, type: 'normal', targetReps: 12, targetWeightKg: 0, completed: false },
            { id: 'l16', setNumber: 3, type: 'normal', targetReps: 10, targetWeightKg: 0, completed: false }
          ]
        }
      ]
    }
  ];
  setStorageItem('workout_routines', seedRoutines);

  // Seed Personal Records
  const seedPRs: PersonalRecord[] = [
    {
      exercise_id: 'barbell_bench_press',
      exercise_name: 'Barbell Flat Bench Press',
      best_weight_kg: 75,
      best_reps: 6,
      best_estimated_1rm: 90,
      achieved_date: today
    },
    {
      exercise_id: 'barbell_back_squat',
      exercise_name: 'Barbell Back Squat',
      best_weight_kg: 95,
      best_reps: 5,
      best_estimated_1rm: 110.8,
      achieved_date: today
    },
    {
      exercise_id: 'barbell_deadlift',
      exercise_name: 'Conventional Barbell Deadlift',
      best_weight_kg: 115,
      best_reps: 5,
      best_estimated_1rm: 134.2,
      achieved_date: today
    },
    {
      exercise_id: 'overhead_barbell_press',
      exercise_name: 'Overhead Standing Barbell Press (OHP)',
      best_weight_kg: 45,
      best_reps: 6,
      best_estimated_1rm: 54,
      achieved_date: today
    },
    {
      exercise_id: 'barbell_bicep_curl',
      exercise_name: 'Standing Barbell Bicep Curl',
      best_weight_kg: 30,
      best_reps: 8,
      best_estimated_1rm: 38,
      achieved_date: today
    }
  ];
  setStorageItem('personal_records', seedPRs);

  // Seed Past Workout Session
  const seedWorkoutSessions: WorkoutSessionLog[] = [
    {
      id: 'session-seed-01',
      user_id: DEFAULT_USER.id,
      routine_id: 'routine-push-01',
      routine_name: 'Push Day (Chest, Shoulders, Triceps)',
      started_at: `${today}T07:00:00Z`,
      completed_at: `${today}T07:52:00Z`,
      duration_minutes: 52,
      total_volume_kg: 4860,
      total_sets: 16,
      total_reps: 168,
      pr_count: 1,
      calories_burned: 380,
      log_date: today,
      created_at: `${today}T07:52:00Z`,
      notes: 'Strong bench press and shoulder session. Felt energized.',
      exercises: seedRoutines[0].exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({
          ...s,
          actualReps: s.targetReps,
          actualWeightKg: s.targetWeightKg,
          completed: true,
          estimated1RM: (s.targetWeightKg && s.targetReps) ? Math.round(s.targetWeightKg * (1 + s.targetReps / 30) * 10) / 10 : 0
        }))
      }))
    }
  ];
  setStorageItem('workout_sessions', seedWorkoutSessions);

  setStorageItem('initialized_v2', true);
}

// Auto-run initialization on start
if (!getStorageItem('initialized_v2', false)) {
  initializeSeedData();
}

// Local DB Helpers for offline fallback
export const localDb = {
  seedInitialData: initializeSeedData,
  getCurrentUserId: (): string | null => {
    return getStorageItem<string | null>('current_user_id', DEFAULT_USER.id);
  },
  setCurrentUserId: (id: string | null): void => {
    setStorageItem('current_user_id', id);
  },
  getProfiles: (): Record<string, UserProfile> => {
    return getStorageItem<Record<string, UserProfile>>('profiles', { [DEFAULT_USER.id]: DEFAULT_USER });
  },
  saveProfile: (profile: UserProfile): void => {
    const profiles = localDb.getProfiles();
    profiles[profile.id] = { ...profile, updated_at: new Date().toISOString() };
    setStorageItem('profiles', profiles);
  },
  getCustomFoods: (userId?: string): FoodItem[] => {
    const list = getStorageItem<FoodItem[]>('custom_foods', []);
    if (!userId) return list;
    return list.filter(f => f.user_id === userId);
  },
  saveCustomFood: (food: FoodItem): void => {
    const list = getStorageItem<FoodItem[]>('custom_foods', []);
    const existingIndex = list.findIndex(f => f.id === food.id);
    if (existingIndex >= 0) {
      list[existingIndex] = food;
    } else {
      list.push(food);
    }
    setStorageItem('custom_foods', list);
  },
  deleteCustomFood: (id: string): void => {
    const list = getStorageItem<FoodItem[]>('custom_foods', []);
    setStorageItem('custom_foods', list.filter(f => f.id !== id));
  },
  // ==========================================
  // PENDING DELETIONS (Anti-Resurrection & Cloud Sync)
  // ==========================================
  getPendingDeletions: (userId?: string): PendingDeletion[] => {
    const list = getStorageItem<PendingDeletion[]>('pending_deletions', []);
    if (!userId) return list;
    return list.filter(d => d.userId === userId || !d.userId);
  },
  addPendingDeletion: (deletion: PendingDeletion): void => {
    const list = getStorageItem<PendingDeletion[]>('pending_deletions', []);
    const existingIndex = list.findIndex(d => d.id === deletion.id && d.entity === deletion.entity);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...deletion };
    } else {
      list.push(deletion);
    }
    setStorageItem('pending_deletions', list);
  },
  removePendingDeletion: (id: string, entity: HealthSyncEntity): void => {
    const list = getStorageItem<PendingDeletion[]>('pending_deletions', []);
    setStorageItem('pending_deletions', list.filter(d => !(d.id === id && d.entity === entity)));
  },
  isPendingDeletion: (id: string, entity: HealthSyncEntity): boolean => {
    const list = getStorageItem<PendingDeletion[]>('pending_deletions', []);
    return list.some(d => d.id === id && d.entity === entity);
  },
  clearPendingDeletions: (userId?: string): void => {
    if (!userId) {
      setStorageItem('pending_deletions', []);
      return;
    }
    const list = getStorageItem<PendingDeletion[]>('pending_deletions', []);
    setStorageItem('pending_deletions', list.filter(d => d.userId !== userId));
  },

  getFoodLogs: (userId: string, date?: string): FoodLog[] => {
    const list = getStorageItem<FoodLog[]>('food_logs', []);
    return list.filter(l => l.user_id === userId && (!date || l.log_date === date));
  },
  saveFoodLog: (log: FoodLog): void => {
    localDb.removePendingDeletion(log.id, 'food_logs');
    const list = getStorageItem<FoodLog[]>('food_logs', []);
    list.unshift(log);
    setStorageItem('food_logs', list);
  },
  deleteFoodLog: (id: string, userId: string): void => {
    const list = getStorageItem<FoodLog[]>('food_logs', []);
    setStorageItem('food_logs', list.filter(l => !(l.id === id && l.user_id === userId)));
    localDb.addPendingDeletion({
      id,
      entity: 'food_logs',
      userId,
      deletedAt: new Date().toISOString()
    });
  },
  getWaterLogs: (userId: string, date?: string): WaterLog[] => {
    const list = getStorageItem<WaterLog[]>('water_logs', []);
    return list.filter(l => l.user_id === userId && (!date || l.log_date === date));
  },
  saveWaterLog: (log: WaterLog): void => {
    localDb.removePendingDeletion(log.id, 'water_logs');
    const list = getStorageItem<WaterLog[]>('water_logs', []);
    list.push(log);
    setStorageItem('water_logs', list);
  },
  deleteWaterLog: (id: string, userId: string): void => {
    const list = getStorageItem<WaterLog[]>('water_logs', []);
    setStorageItem('water_logs', list.filter(w => !(w.id === id && w.user_id === userId)));
    localDb.addPendingDeletion({
      id,
      entity: 'water_logs',
      userId,
      deletedAt: new Date().toISOString()
    });
  },
  getSleepLogs: (userId: string): SleepLog[] => {
    const list = getStorageItem<SleepLog[]>('sleep_logs', []);
    return list.filter(l => l.user_id === userId).sort((a, b) => b.log_date.localeCompare(a.log_date));
  },
  saveSleepLog: (log: SleepLog): void => {
    localDb.removePendingDeletion(log.id, 'sleep_logs');
    const list = getStorageItem<SleepLog[]>('sleep_logs', []);
    const existingIndex = list.findIndex(s => s.user_id === log.user_id && s.log_date === log.log_date);
    if (existingIndex >= 0) {
      list[existingIndex] = log;
    } else {
      list.unshift(log);
    }
    setStorageItem('sleep_logs', list);
  },
  deleteSleepLog: (id: string, userId: string): void => {
    const list = getStorageItem<SleepLog[]>('sleep_logs', []);
    setStorageItem('sleep_logs', list.filter(s => !(s.id === id && s.user_id === userId)));
    localDb.addPendingDeletion({
      id,
      entity: 'sleep_logs',
      userId,
      deletedAt: new Date().toISOString()
    });
  },
  getActivityLogs: (userId: string): ActivityLog[] => {
    const list = getStorageItem<ActivityLog[]>('activity_logs', []);
    return list.filter(l => l.user_id === userId).sort((a, b) => b.log_date.localeCompare(a.log_date));
  },
  saveActivityLog: (log: ActivityLog): void => {
    localDb.removePendingDeletion(log.id, 'activity_logs');
    const list = getStorageItem<ActivityLog[]>('activity_logs', []);
    const existingIndex = list.findIndex(a => a.user_id === log.user_id && a.log_date === log.log_date);
    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        steps: list[existingIndex].steps + log.steps,
        active_minutes: list[existingIndex].active_minutes + log.active_minutes,
        calories_burned: list[existingIndex].calories_burned + log.calories_burned
      };
    } else {
      list.unshift(log);
    }
    setStorageItem('activity_logs', list);
  },
  deleteActivityLog: (id: string, userId: string): void => {
    const list = getStorageItem<ActivityLog[]>('activity_logs', []);
    setStorageItem('activity_logs', list.filter(a => !(a.id === id && a.user_id === userId)));
    localDb.addPendingDeletion({
      id,
      entity: 'activity_logs',
      userId,
      deletedAt: new Date().toISOString()
    });
  },
  getWeightLogs: (userId: string): WeightLog[] => {
    const list = getStorageItem<WeightLog[]>('weight_logs', []);
    return list.filter(l => l.user_id === userId).sort((a, b) => a.log_date.localeCompare(b.log_date));
  },
  saveWeightLog: (log: WeightLog): void => {
    localDb.removePendingDeletion(log.id, 'weight_logs');
    const list = getStorageItem<WeightLog[]>('weight_logs', []);
    const existingIndex = list.findIndex(w => w.user_id === log.user_id && w.log_date === log.log_date);
    if (existingIndex >= 0) {
      list[existingIndex] = log;
    } else {
      list.push(log);
    }
    setStorageItem('weight_logs', list);
  },
  deleteWeightLog: (id: string, userId: string): void => {
    const list = getStorageItem<WeightLog[]>('weight_logs', []);
    setStorageItem('weight_logs', list.filter(w => !(w.id === id && w.user_id === userId)));
    localDb.addPendingDeletion({
      id,
      entity: 'weight_logs',
      userId,
      deletedAt: new Date().toISOString()
    });
  },
  getDietPlans: (userId: string): DietPlan[] => {
    const list = getStorageItem<DietPlan[]>('diet_plans', []);
    return list.filter(d => d.user_id === userId);
  },
  saveDietPlan: (plan: DietPlan): void => {
    localDb.removePendingDeletion(plan.id, 'diet_plans');
    const list = getStorageItem<DietPlan[]>('diet_plans', []);
    const existingIndex = list.findIndex(d => d.id === plan.id);
    if (existingIndex >= 0) {
      list[existingIndex] = plan;
    } else {
      list.unshift(plan);
    }
    setStorageItem('diet_plans', list);
  },
  deleteDietPlan: (id: string, userId: string): void => {
    const list = getStorageItem<DietPlan[]>('diet_plans', []);
    setStorageItem('diet_plans', list.filter(d => !(d.id === id && d.user_id === userId)));
    localDb.addPendingDeletion({
      id,
      entity: 'diet_plans',
      userId,
      deletedAt: new Date().toISOString()
    });
  },

  // ==========================================
  // WORKOUT SYSTEM PERSISTENCE (Milestone 2)
  // ==========================================
  getWorkoutRoutines: (userId: string): WorkoutRoutine[] => {
    const list = getStorageItem<WorkoutRoutine[]>('workout_routines', []);
    return list.filter(r => r.user_id === userId || !r.is_custom);
  },
  saveWorkoutRoutine: (routine: WorkoutRoutine): void => {
    const list = getStorageItem<WorkoutRoutine[]>('workout_routines', []);
    const existingIndex = list.findIndex(r => r.id === routine.id);
    if (existingIndex >= 0) {
      list[existingIndex] = routine;
    } else {
      list.unshift(routine);
    }
    setStorageItem('workout_routines', list);
  },
  deleteWorkoutRoutine: (id: string, userId: string): void => {
    const list = getStorageItem<WorkoutRoutine[]>('workout_routines', []);
    setStorageItem('workout_routines', list.filter(r => !(r.id === id && r.user_id === userId)));
  },

  getActiveWorkout: (userId: string): ActiveWorkoutState | null => {
    const allActive = getStorageItem<Record<string, ActiveWorkoutState>>('active_workouts_by_user', {});
    return allActive[userId] || null;
  },
  saveActiveWorkout: (userId: string, state: ActiveWorkoutState | null): void => {
    const allActive = getStorageItem<Record<string, ActiveWorkoutState>>('active_workouts_by_user', {});
    if (state) {
      allActive[userId] = state;
    } else {
      delete allActive[userId];
    }
    setStorageItem('active_workouts_by_user', allActive);
  },
  clearActiveWorkout: (userId: string): void => {
    const allActive = getStorageItem<Record<string, ActiveWorkoutState>>('active_workouts_by_user', {});
    delete allActive[userId];
    setStorageItem('active_workouts_by_user', allActive);
  },

  getWorkoutSessions: (userId: string, date?: string): WorkoutSessionLog[] => {
    const list = getStorageItem<WorkoutSessionLog[]>('workout_sessions', []);
    return list
      .filter(s => s.user_id === userId && (!date || s.log_date === date))
      .sort((a, b) => b.started_at.localeCompare(a.started_at));
  },
  saveWorkoutSession: (session: WorkoutSessionLog): void => {
    const list = getStorageItem<WorkoutSessionLog[]>('workout_sessions', []);
    const existingIndex = list.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      list[existingIndex] = session;
    } else {
      list.unshift(session);
    }
    setStorageItem('workout_sessions', list);
  },
  deleteWorkoutSession: (id: string, userId: string): void => {
    const list = getStorageItem<WorkoutSessionLog[]>('workout_sessions', []);
    setStorageItem('workout_sessions', list.filter(s => !(s.id === id && s.user_id === userId)));
  },

  getPersonalRecords: (userId: string): PersonalRecord[] => {
    const list = getStorageItem<PersonalRecord[]>('personal_records', []);
    return list.filter(pr => !pr.user_id || pr.user_id === userId);
  },
  savePersonalRecords: (userId: string, prs: PersonalRecord[]): void => {
    const currentList = getStorageItem<PersonalRecord[]>('personal_records', []);
    const otherUsersPRs = currentList.filter(pr => pr.user_id && pr.user_id !== userId);
    const updatedUserPRs = prs.map(pr => ({ ...pr, user_id: userId }));
    setStorageItem('personal_records', [...otherUsersPRs, ...updatedUserPRs]);
  }
};
