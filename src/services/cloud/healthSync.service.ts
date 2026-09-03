import { supabase, isSupabaseConfigured, localDb } from '../../lib/supabase';
import { cloudAuthService } from './cloudAuth.service';
import {
  DietPlan,
  DietPlanMeal,
  FoodLog,
  WaterLog,
  SleepLog,
  WeightLog,
  ActivityLog,
  FitnessGoal
} from '../../types';

export type HealthSyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface HealthSyncSummary {
  deletionsProcessed: number;
  dietPlansUploaded: number;
  dietPlansDownloaded: number;
  mealsUploaded: number;
  mealsDownloaded: number;
  foodLogsUploaded: number;
  foodLogsDownloaded: number;
  waterLogsUploaded: number;
  waterLogsDownloaded: number;
  sleepLogsUploaded: number;
  sleepLogsDownloaded: number;
  weightLogsUploaded: number;
  weightLogsDownloaded: number;
  activityLogsUploaded: number;
  activityLogsDownloaded: number;
  timestamp: string;
}

export interface HealthSyncState {
  status: HealthSyncStatus;
  lastSyncedAt: string | null;
  lastError: string | null;
  lastSummary: HealthSyncSummary | null;
  isSyncing: boolean;
}

/**
 * Validates if an ID is a valid RFC 4122 UUID
 */
function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Generates a stable RFC 4122 v4 UUID
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * DB Row Interfaces for public.* health & nutrition tables
 */
interface DbDietPlanRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  fitness_goal: string | null;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DbMealRow {
  id: string;
  diet_plan_id: string;
  user_id: string;
  name: string;
  meal_type: string;
  time_of_day: string | null;
  target_calories: number;
  order_index: number;
  created_at: string;
}

interface DbFoodLogRow {
  id: string;
  user_id: string;
  meal_id: string | null;
  food_name: string;
  serving_size: number;
  serving_unit: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  log_date: string;
  logged_at: string;
  created_at: string;
}

interface DbWaterLogRow {
  id: string;
  user_id: string;
  amount_ml: number;
  log_date: string;
  logged_at: string;
  created_at: string;
}

interface DbSleepLogRow {
  id: string;
  user_id: string;
  duration_hours: number;
  quality: string | null;
  bedtime: string | null;
  wake_time: string | null;
  log_date: string;
  created_at: string;
}

interface DbWeightLogRow {
  id: string;
  user_id: string;
  weight_kg: number;
  body_fat_pct: number | null;
  log_date: string;
  notes: string | null;
  created_at: string;
}

interface DbActivityLogRow {
  id: string;
  user_id: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned: number;
  steps: number;
  distance_km: number | null;
  log_date: string;
  created_at: string;
}

/**
 * Health & Nutrition Cloud Persistence and Bidirectional Sync Service
 * Manages:
 * 1. diet_plans & meals
 * 2. food_logs
 * 3. water_logs
 * 4. sleep_logs
 * 5. weight_logs
 * 6. activity_logs
 *
 * Adheres strictly to:
 * - Local-First principles (immediate local write, background sync)
 * - Safe conflict reconciliation (timestamps & historical immutability)
 * - Strict auth gating with auth.uid()
 * - Non-destructive first-login merging
 */
class HealthSyncService {
  private syncState: HealthSyncState = {
    status: 'idle',
    lastSyncedAt: null,
    lastError: null,
    lastSummary: null,
    isSyncing: false
  };

  private listeners: Set<(state: HealthSyncState) => void> = new Set();
  private lastSyncAttemptTimestamp: number = 0;
  private minSyncIntervalMs: number = 5000;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.triggerBackgroundSync();
      });
    }

    cloudAuthService.subscribeToCloudAuth((authState) => {
      if (authState.isCloudAuthenticated) {
        this.triggerBackgroundSync();
      } else {
        this.updateState({
          status: 'idle',
          lastError: null
        });
      }
    });
  }

  public getSyncState(): HealthSyncState {
    return { ...this.syncState };
  }

  public subscribe(callback: (state: HealthSyncState) => void): () => void {
    this.listeners.add(callback);
    callback(this.getSyncState());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private updateState(updates: Partial<HealthSyncState>) {
    this.syncState = { ...this.syncState, ...updates };
    this.listeners.forEach((listener) => {
      try {
        listener(this.getSyncState());
      } catch (err) {
        console.warn('[HealthSync] Error in sync listener callback', err);
      }
    });
  }

  /**
   * Triggers non-blocking background sync if authenticated and not throttled
   */
  public triggerBackgroundSync(): void {
    const now = Date.now();
    if (this.syncState.isSyncing || now - this.lastSyncAttemptTimestamp < this.minSyncIntervalMs) {
      return;
    }

    this.lastSyncAttemptTimestamp = now;
    this.syncHealthData().catch((err) => {
      console.warn('[HealthSync] Background sync completed with soft warning:', err);
    });
  }

  /**
   * Main Bidirectional Synchronization Entry Point for Health & Nutrition Data
   */
  public async syncHealthData(): Promise<HealthSyncSummary | null> {
    if (this.syncState.isSyncing) {
      return this.syncState.lastSummary;
    }

    if (!isSupabaseConfigured || !supabase) {
      this.updateState({ status: 'offline', isSyncing: false });
      return null;
    }

    const isCloudAuth = await cloudAuthService.isCloudAuthenticated();
    const cloudUserId = await cloudAuthService.getCloudUserId();

    if (!isCloudAuth || !cloudUserId) {
      this.updateState({ status: 'idle', isSyncing: false });
      return null;
    }

    this.updateState({ status: 'syncing', isSyncing: true, lastError: null });

    const summary: HealthSyncSummary = {
      deletionsProcessed: 0,
      dietPlansUploaded: 0,
      dietPlansDownloaded: 0,
      mealsUploaded: 0,
      mealsDownloaded: 0,
      foodLogsUploaded: 0,
      foodLogsDownloaded: 0,
      waterLogsUploaded: 0,
      waterLogsDownloaded: 0,
      sleepLogsUploaded: 0,
      sleepLogsDownloaded: 0,
      weightLogsUploaded: 0,
      weightLogsDownloaded: 0,
      activityLogsUploaded: 0,
      activityLogsDownloaded: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // 0. Process Pending Explicit Deletions BEFORE upload/download reconciliation
      const delStats = await this.processPendingDeletions(cloudUserId);
      summary.deletionsProcessed = delStats.processed;

      // 1. Sync Diet Plans
      const dietStats = await this.syncDietPlans(cloudUserId);
      summary.dietPlansUploaded = dietStats.uploaded;
      summary.dietPlansDownloaded = dietStats.downloaded;

      // 2. Sync Meals (nested in diet plans)
      const mealStats = await this.syncMeals(cloudUserId);
      summary.mealsUploaded = mealStats.uploaded;
      summary.mealsDownloaded = mealStats.downloaded;

      // 3. Sync Food Logs
      const foodStats = await this.syncFoodLogs(cloudUserId);
      summary.foodLogsUploaded = foodStats.uploaded;
      summary.foodLogsDownloaded = foodStats.downloaded;

      // 4. Sync Water Logs
      const waterStats = await this.syncWaterLogs(cloudUserId);
      summary.waterLogsUploaded = waterStats.uploaded;
      summary.waterLogsDownloaded = waterStats.downloaded;

      // 5. Sync Sleep Logs
      const sleepStats = await this.syncSleepLogs(cloudUserId);
      summary.sleepLogsUploaded = sleepStats.uploaded;
      summary.sleepLogsDownloaded = sleepStats.downloaded;

      // 6. Sync Weight Logs
      const weightStats = await this.syncWeightLogs(cloudUserId);
      summary.weightLogsUploaded = weightStats.uploaded;
      summary.weightLogsDownloaded = weightStats.downloaded;

      // 7. Sync Activity Logs
      const actStats = await this.syncActivityLogs(cloudUserId);
      summary.activityLogsUploaded = actStats.uploaded;
      summary.activityLogsDownloaded = actStats.downloaded;

      this.updateState({
        status: 'synced',
        isSyncing: false,
        lastSyncedAt: summary.timestamp,
        lastError: null,
        lastSummary: summary
      });

      return summary;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown health sync error';
      console.warn('[HealthSync] Sync failed with error:', errorMsg);
      this.updateState({
        status: 'error',
        isSyncing: false,
        lastError: errorMsg
      });
      return null;
    }
  }

  /**
   * 0. PROCESS PENDING EXPLICIT DELETIONS
   * Targeted deletion for exact records explicitly deleted by user
   * Guarantees anti-resurrection and offline-resilient deletion consistency
   */
  public async processPendingDeletions(cloudUserId: string): Promise<{ processed: number; failed: number }> {
    if (!supabase) return { processed: 0, failed: 0 };

    const pendingList = localDb.getPendingDeletions();
    if (!pendingList || pendingList.length === 0) {
      return { processed: 0, failed: 0 };
    }

    let processed = 0;
    let failed = 0;

    for (const item of pendingList) {
      try {
        const { error } = await supabase
          .from(item.entity)
          .delete()
          .eq('id', item.id)
          .eq('user_id', cloudUserId);

        if (!error) {
          localDb.removePendingDeletion(item.id, item.entity);
          processed++;
        } else {
          localDb.addPendingDeletion({
            ...item,
            retryCount: (item.retryCount || 0) + 1
          });
          failed++;
        }
      } catch (err) {
        console.warn(`[HealthSync] Error processing deletion for ${item.entity} ID ${item.id}:`, err);
        localDb.addPendingDeletion({
          ...item,
          retryCount: (item.retryCount || 0) + 1
        });
        failed++;
      }
    }

    return { processed, failed };
  }

  /**
   * 1. DIET PLANS SYNC (public.diet_plans)
   */
  public async syncDietPlans(cloudUserId: string): Promise<{ uploaded: number; downloaded: number }> {
    if (!supabase) return { uploaded: 0, downloaded: 0 };

    let uploaded = 0;
    let downloaded = 0;

    const { data: cloudPlans, error: fetchErr } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', cloudUserId);

    if (fetchErr) {
      throw new Error(`Failed to fetch cloud diet plans: ${fetchErr.message}`);
    }

    const cloudRows: DbDietPlanRow[] = cloudPlans || [];
    const cloudMap = new Map<string, DbDietPlanRow>();
    cloudRows.forEach((row) => cloudMap.set(row.id, row));

    const localPlans = localDb.getDietPlans(cloudUserId);
    const localMap = new Map<string, DietPlan>();
    localPlans.forEach((p) => localMap.set(p.id, p));

    // Upload local plans
    for (const local of localPlans) {
      let targetId = local.id;
      if (!isValidUUID(targetId)) {
        targetId = generateUUID();
        local.id = targetId;
        localDb.saveDietPlan(local);
      }

      if (localDb.isPendingDeletion(targetId, 'diet_plans')) {
        continue;
      }

      const cloudMatch = cloudMap.get(targetId);
      const localUpdatedAt = local.created_at || new Date().toISOString();

      if (!cloudMatch) {
        const dbRow: DbDietPlanRow = {
          id: targetId,
          user_id: cloudUserId,
          name: local.name,
          description: local.description || null,
          fitness_goal: local.goal || null,
          target_calories: Number(local.target_calories) || 2000,
          target_protein_g: Number(local.target_protein_g) || 150,
          target_carbs_g: Number(local.target_carbs_g) || 200,
          target_fat_g: Number(local.target_fat_g) || 65,
          is_active: true,
          created_at: local.created_at || new Date().toISOString(),
          updated_at: localUpdatedAt
        };

        const { error: insertErr } = await supabase
          .from('diet_plans')
          .upsert(dbRow);

        if (!insertErr) uploaded++;
      } else {
        const cloudUpdatedAt = cloudMatch.updated_at || cloudMatch.created_at || '';
        if (localUpdatedAt > cloudUpdatedAt) {
          const dbRow: DbDietPlanRow = {
            id: targetId,
            user_id: cloudUserId,
            name: local.name,
            description: local.description || null,
            fitness_goal: local.goal || cloudMatch.fitness_goal,
            target_calories: Number(local.target_calories) || cloudMatch.target_calories,
            target_protein_g: Number(local.target_protein_g) || cloudMatch.target_protein_g,
            target_carbs_g: Number(local.target_carbs_g) || cloudMatch.target_carbs_g,
            target_fat_g: Number(local.target_fat_g) || cloudMatch.target_fat_g,
            is_active: cloudMatch.is_active,
            created_at: cloudMatch.created_at,
            updated_at: localUpdatedAt
          };

          const { error: updateErr } = await supabase
            .from('diet_plans')
            .upsert(dbRow);

          if (!updateErr) uploaded++;
        }
      }
    }

    // Download cloud plans (with anti-resurrection check)
    for (const cloud of cloudRows) {
      if (localDb.isPendingDeletion(cloud.id, 'diet_plans')) {
        continue;
      }

      const localMatch = localMap.get(cloud.id);
      const cloudUpdatedAt = cloud.updated_at || cloud.created_at || '';

      if (!localMatch) {
        const newLocalPlan: DietPlan = {
          id: cloud.id,
          user_id: cloudUserId,
          name: cloud.name,
          description: cloud.description || '',
          goal: (cloud.fitness_goal as FitnessGoal) || 'muscle_gain',
          target_calories: cloud.target_calories,
          target_protein_g: cloud.target_protein_g,
          target_carbs_g: cloud.target_carbs_g,
          target_fat_g: cloud.target_fat_g,
          meals: [],
          created_at: cloud.created_at
        };
        localDb.saveDietPlan(newLocalPlan);
        downloaded++;
      } else {
        const localUpdatedAt = localMatch.created_at || '';
        if (cloudUpdatedAt > localUpdatedAt) {
          const updatedLocal: DietPlan = {
            ...localMatch,
            name: cloud.name,
            description: cloud.description || localMatch.description,
            goal: (cloud.fitness_goal as FitnessGoal) || localMatch.goal,
            target_calories: cloud.target_calories,
            target_protein_g: cloud.target_protein_g,
            target_carbs_g: cloud.target_carbs_g,
            target_fat_g: cloud.target_fat_g
          };
          localDb.saveDietPlan(updatedLocal);
          downloaded++;
        }
      }
    }

    return { uploaded, downloaded };
  }

  /**
   * 2. MEALS SYNC (public.meals)
   */
  public async syncMeals(cloudUserId: string): Promise<{ uploaded: number; downloaded: number }> {
    if (!supabase) return { uploaded: 0, downloaded: 0 };

    let uploaded = 0;
    let downloaded = 0;

    const { data: cloudMeals, error: fetchErr } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', cloudUserId);

    if (fetchErr) {
      throw new Error(`Failed to fetch cloud meals: ${fetchErr.message}`);
    }

    const cloudRows: DbMealRow[] = cloudMeals || [];
    const cloudMap = new Map<string, DbMealRow>();
    cloudRows.forEach((row) => cloudMap.set(row.id, row));

    const localPlans = localDb.getDietPlans(cloudUserId);

    // Upload local meals inside plans
    for (const plan of localPlans) {
      if (!isValidUUID(plan.id)) continue;
      if (localDb.isPendingDeletion(plan.id, 'diet_plans')) continue;

      if (Array.isArray(plan.meals)) {
        for (let i = 0; i < plan.meals.length; i++) {
          const meal = plan.meals[i];
          let targetMealId = meal.id;
          if (!isValidUUID(targetMealId)) {
            targetMealId = generateUUID();
            meal.id = targetMealId;
          }

          if (localDb.isPendingDeletion(targetMealId, 'meals')) {
            continue;
          }

          if (!cloudMap.has(targetMealId)) {
            const dbRow: DbMealRow = {
              id: targetMealId,
              diet_plan_id: plan.id,
              user_id: cloudUserId,
              name: meal.food_name || 'Meal',
              meal_type: meal.meal_type || 'breakfast',
              time_of_day: null,
              target_calories: Number(meal.calories) || 0,
              order_index: i,
              created_at: new Date().toISOString()
            };

            const { error: insertErr } = await supabase
              .from('meals')
              .upsert(dbRow);

            if (!insertErr) uploaded++;
          }
        }
      }
    }

    return { uploaded, downloaded };
  }

  /**
   * 3. FOOD LOGS SYNC (public.food_logs)
   */
  public async syncFoodLogs(cloudUserId: string): Promise<{ uploaded: number; downloaded: number }> {
    if (!supabase) return { uploaded: 0, downloaded: 0 };

    let uploaded = 0;
    let downloaded = 0;

    const { data: cloudFoodLogs, error: fetchErr } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', cloudUserId)
      .order('log_date', { ascending: false });

    if (fetchErr) {
      throw new Error(`Failed to fetch cloud food logs: ${fetchErr.message}`);
    }

    const cloudRows: DbFoodLogRow[] = cloudFoodLogs || [];
    const cloudMap = new Map<string, DbFoodLogRow>();
    cloudRows.forEach((row) => cloudMap.set(row.id, row));

    const localFoodLogs = localDb.getFoodLogs(cloudUserId);
    const localMap = new Map<string, FoodLog>();
    localFoodLogs.forEach((l) => localMap.set(l.id, l));

    // Upload local food logs missing from cloud
    for (const local of localFoodLogs) {
      let targetId = local.id;
      if (!isValidUUID(targetId)) {
        targetId = generateUUID();
        local.id = targetId;
        localDb.saveFoodLog(local);
      }

      if (localDb.isPendingDeletion(targetId, 'food_logs')) {
        continue;
      }

      if (!cloudMap.has(targetId)) {
        const dbRow: DbFoodLogRow = {
          id: targetId,
          user_id: cloudUserId,
          meal_id: null,
          food_name: local.food_name,
          serving_size: Number(local.quantity) || 100,
          serving_unit: local.serving_unit || 'g',
          servings: 1,
          calories: Number(local.calories) || 0,
          protein_g: Number(local.protein_g) || 0,
          carbs_g: Number(local.carbs_g) || 0,
          fat_g: Number(local.fat_g) || 0,
          log_date: local.log_date || new Date().toISOString().split('T')[0],
          logged_at: local.created_at || new Date().toISOString(),
          created_at: local.created_at || new Date().toISOString()
        };

        const { error: insertErr } = await supabase
          .from('food_logs')
          .upsert(dbRow);

        if (!insertErr) uploaded++;
      }
    }

    // Download cloud food logs missing locally (with anti-resurrection check)
    for (const cloud of cloudRows) {
      if (localDb.isPendingDeletion(cloud.id, 'food_logs')) {
        continue;
      }

      if (!localMap.has(cloud.id)) {
        const newLocalFoodLog: FoodLog = {
          id: cloud.id,
          user_id: cloudUserId,
          food_id: cloud.id,
          food_name: cloud.food_name,
          meal_type: 'breakfast',
          quantity: Number(cloud.serving_size),
          serving_unit: cloud.serving_unit,
          calories: cloud.calories,
          protein_g: Number(cloud.protein_g),
          carbs_g: Number(cloud.carbs_g),
          fat_g: Number(cloud.fat_g),
          fiber_g: 0,
          log_date: cloud.log_date,
          created_at: cloud.created_at || cloud.logged_at
        };

        localDb.saveFoodLog(newLocalFoodLog);
        downloaded++;
      }
    }

    return { uploaded, downloaded };
  }

  /**
   * 4. WATER LOGS SYNC (public.water_logs)
   */
  public async syncWaterLogs(cloudUserId: string): Promise<{ uploaded: number; downloaded: number }> {
    if (!supabase) return { uploaded: 0, downloaded: 0 };

    let uploaded = 0;
    let downloaded = 0;

    const { data: cloudWaterLogs, error: fetchErr } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', cloudUserId)
      .order('log_date', { ascending: false });

    if (fetchErr) {
      throw new Error(`Failed to fetch cloud water logs: ${fetchErr.message}`);
    }

    const cloudRows: DbWaterLogRow[] = cloudWaterLogs || [];
    const cloudMap = new Map<string, DbWaterLogRow>();
    cloudRows.forEach((row) => cloudMap.set(row.id, row));

    const localWaterLogs = localDb.getWaterLogs(cloudUserId);
    const localMap = new Map<string, WaterLog>();
    localWaterLogs.forEach((w) => localMap.set(w.id, w));

    // Upload local water logs
    for (const local of localWaterLogs) {
      let targetId = local.id;
      if (!isValidUUID(targetId)) {
        targetId = generateUUID();
        local.id = targetId;
        localDb.saveWaterLog(local);
      }

      if (localDb.isPendingDeletion(targetId, 'water_logs')) {
        continue;
      }

      if (!cloudMap.has(targetId)) {
        const dbRow: DbWaterLogRow = {
          id: targetId,
          user_id: cloudUserId,
          amount_ml: Number(local.amount_ml) || 250,
          log_date: local.log_date || new Date().toISOString().split('T')[0],
          logged_at: local.created_at || new Date().toISOString(),
          created_at: local.created_at || new Date().toISOString()
        };

        const { error: insertErr } = await supabase
          .from('water_logs')
          .upsert(dbRow);

        if (!insertErr) uploaded++;
      }
    }

    // Download cloud water logs (with anti-resurrection check)
    for (const cloud of cloudRows) {
      if (localDb.isPendingDeletion(cloud.id, 'water_logs')) {
        continue;
      }

      if (!localMap.has(cloud.id)) {
        const newLocalWaterLog: WaterLog = {
          id: cloud.id,
          user_id: cloudUserId,
          amount_ml: cloud.amount_ml,
          glasses: Math.round((cloud.amount_ml / 250) * 10) / 10,
          log_date: cloud.log_date,
          created_at: cloud.created_at || cloud.logged_at
        };

        localDb.saveWaterLog(newLocalWaterLog);
        downloaded++;
      }
    }

    return { uploaded, downloaded };
  }

  /**
   * 5. SLEEP LOGS SYNC (public.sleep_logs)
   */
  public async syncSleepLogs(cloudUserId: string): Promise<{ uploaded: number; downloaded: number }> {
    if (!supabase) return { uploaded: 0, downloaded: 0 };

    let uploaded = 0;
    let downloaded = 0;

    const { data: cloudSleepLogs, error: fetchErr } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', cloudUserId)
      .order('log_date', { ascending: false });

    if (fetchErr) {
      throw new Error(`Failed to fetch cloud sleep logs: ${fetchErr.message}`);
    }

    const cloudRows: DbSleepLogRow[] = cloudSleepLogs || [];
    const cloudMap = new Map<string, DbSleepLogRow>();
    cloudRows.forEach((row) => cloudMap.set(row.id, row));

    const localSleepLogs = localDb.getSleepLogs(cloudUserId);
    const localMap = new Map<string, SleepLog>();
    localSleepLogs.forEach((s) => localMap.set(s.id, s));

    // Upload local sleep logs
    for (const local of localSleepLogs) {
      let targetId = local.id;
      if (!isValidUUID(targetId)) {
        targetId = generateUUID();
        local.id = targetId;
        localDb.saveSleepLog(local);
      }

      if (localDb.isPendingDeletion(targetId, 'sleep_logs')) {
        continue;
      }

      if (!cloudMap.has(targetId)) {
        const durationHours = local.duration_minutes
          ? Number((local.duration_minutes / 60).toFixed(2))
          : 8.0;

        const dbRow: DbSleepLogRow = {
          id: targetId,
          user_id: cloudUserId,
          duration_hours: durationHours,
          quality: local.quality_rating ? `${local.quality_rating}/5` : null,
          bedtime: null,
          wake_time: null,
          log_date: local.log_date || new Date().toISOString().split('T')[0],
          created_at: local.created_at || new Date().toISOString()
        };

        const { error: insertErr } = await supabase
          .from('sleep_logs')
          .upsert(dbRow);

        if (!insertErr) uploaded++;
      }
    }

    // Download cloud sleep logs (with anti-resurrection check)
    for (const cloud of cloudRows) {
      if (localDb.isPendingDeletion(cloud.id, 'sleep_logs')) {
        continue;
      }

      if (!localMap.has(cloud.id)) {
        const durationMinutes = Math.round((Number(cloud.duration_hours) || 8) * 60);
        let qualityRating = 4;
        if (cloud.quality) {
          const match = cloud.quality.match(/(\d+)/);
          if (match) qualityRating = parseInt(match[1], 10);
        }

        const newLocalSleepLog: SleepLog = {
          id: cloud.id,
          user_id: cloudUserId,
          bed_time: '23:00',
          wake_time: '07:00',
          duration_minutes: durationMinutes,
          quality_rating: qualityRating,
          quality_score: qualityRating,
          log_date: cloud.log_date,
          created_at: cloud.created_at
        };

        localDb.saveSleepLog(newLocalSleepLog);
        downloaded++;
      }
    }

    return { uploaded, downloaded };
  }

  /**
   * 6. WEIGHT LOGS SYNC (public.weight_logs)
   */
  public async syncWeightLogs(cloudUserId: string): Promise<{ uploaded: number; downloaded: number }> {
    if (!supabase) return { uploaded: 0, downloaded: 0 };

    let uploaded = 0;
    let downloaded = 0;

    const { data: cloudWeightLogs, error: fetchErr } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', cloudUserId)
      .order('log_date', { ascending: false });

    if (fetchErr) {
      throw new Error(`Failed to fetch cloud weight logs: ${fetchErr.message}`);
    }

    const cloudRows: DbWeightLogRow[] = cloudWeightLogs || [];
    const cloudMap = new Map<string, DbWeightLogRow>();
    cloudRows.forEach((row) => cloudMap.set(row.id, row));

    const localWeightLogs = localDb.getWeightLogs(cloudUserId);
    const localMap = new Map<string, WeightLog>();
    localWeightLogs.forEach((w) => localMap.set(w.id, w));

    // Upload local weight logs
    for (const local of localWeightLogs) {
      let targetId = local.id;
      if (!isValidUUID(targetId)) {
        targetId = generateUUID();
        local.id = targetId;
        localDb.saveWeightLog(local);
      }

      if (localDb.isPendingDeletion(targetId, 'weight_logs')) {
        continue;
      }

      if (!cloudMap.has(targetId)) {
        const dbRow: DbWeightLogRow = {
          id: targetId,
          user_id: cloudUserId,
          weight_kg: Number(local.weight_kg) || 70,
          body_fat_pct: null,
          log_date: local.log_date || new Date().toISOString().split('T')[0],
          notes: local.notes || null,
          created_at: local.created_at || new Date().toISOString()
        };

        const { error: insertErr } = await supabase
          .from('weight_logs')
          .upsert(dbRow);

        if (!insertErr) uploaded++;
      }
    }

    // Download cloud weight logs (with anti-resurrection check)
    for (const cloud of cloudRows) {
      if (localDb.isPendingDeletion(cloud.id, 'weight_logs')) {
        continue;
      }

      if (!localMap.has(cloud.id)) {
        const newLocalWeightLog: WeightLog = {
          id: cloud.id,
          user_id: cloudUserId,
          weight_kg: Number(cloud.weight_kg),
          notes: cloud.notes || undefined,
          log_date: cloud.log_date,
          created_at: cloud.created_at
        };

        localDb.saveWeightLog(newLocalWeightLog);
        downloaded++;
      }
    }

    return { uploaded, downloaded };
  }

  /**
   * 7. ACTIVITY LOGS SYNC (public.activity_logs)
   */
  public async syncActivityLogs(cloudUserId: string): Promise<{ uploaded: number; downloaded: number }> {
    if (!supabase) return { uploaded: 0, downloaded: 0 };

    let uploaded = 0;
    let downloaded = 0;

    const { data: cloudActivityLogs, error: fetchErr } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', cloudUserId)
      .order('log_date', { ascending: false });

    if (fetchErr) {
      throw new Error(`Failed to fetch cloud activity logs: ${fetchErr.message}`);
    }

    const cloudRows: DbActivityLogRow[] = cloudActivityLogs || [];
    const cloudMap = new Map<string, DbActivityLogRow>();
    cloudRows.forEach((row) => cloudMap.set(row.id, row));

    const localActivityLogs = localDb.getActivityLogs(cloudUserId);
    const localMap = new Map<string, ActivityLog>();
    localActivityLogs.forEach((a) => localMap.set(a.id, a));

    // Upload local activity logs
    for (const local of localActivityLogs) {
      let targetId = local.id;
      if (!isValidUUID(targetId)) {
        targetId = generateUUID();
        local.id = targetId;
        localDb.saveActivityLog(local);
      }

      if (localDb.isPendingDeletion(targetId, 'activity_logs')) {
        continue;
      }

      if (!cloudMap.has(targetId)) {
        const dbRow: DbActivityLogRow = {
          id: targetId,
          user_id: cloudUserId,
          activity_type: local.activity_type || 'Walking / Daily Steps',
          duration_minutes: Number(local.active_minutes) || 30,
          calories_burned: Number(local.calories_burned) || 150,
          steps: Number(local.steps) || 0,
          distance_km: null,
          log_date: local.log_date || new Date().toISOString().split('T')[0],
          created_at: local.created_at || new Date().toISOString()
        };

        const { error: insertErr } = await supabase
          .from('activity_logs')
          .upsert(dbRow);

        if (!insertErr) uploaded++;
      }
    }

    // Download cloud activity logs (with anti-resurrection check)
    for (const cloud of cloudRows) {
      if (localDb.isPendingDeletion(cloud.id, 'activity_logs')) {
        continue;
      }

      if (!localMap.has(cloud.id)) {
        const newLocalActivityLog: ActivityLog = {
          id: cloud.id,
          user_id: cloudUserId,
          steps: cloud.steps || 0,
          active_minutes: cloud.duration_minutes,
          calories_burned: cloud.calories_burned,
          activity_type: cloud.activity_type,
          log_date: cloud.log_date,
          created_at: cloud.created_at
        };

        localDb.saveActivityLog(newLocalActivityLog);
        downloaded++;
      }
    }

    return { uploaded, downloaded };
  }
}

export const healthSyncService = new HealthSyncService();
