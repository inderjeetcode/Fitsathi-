import { supabase, isSupabaseConfigured, localDb } from '../../lib/supabase';
import { cloudAuthService } from './cloudAuth.service';
import {
  WorkoutRoutine,
  WorkoutSessionLog,
  PersonalRecord
} from '../../types';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface WorkoutSyncSummary {
  routinesUploaded: number;
  routinesDownloaded: number;
  sessionsUploaded: number;
  sessionsDownloaded: number;
  prsUploaded: number;
  prsDownloaded: number;
  timestamp: string;
}

export interface WorkoutSyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  lastError: string | null;
  lastSummary: WorkoutSyncSummary | null;
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
 * DB Row Interfaces for public.* tables
 */
interface DbWorkoutRoutineRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  exercises: any;
  target_days: number[];
  days_of_week: number[];
  split_type: string | null;
  category: string | null;
  is_custom: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DbWorkoutSessionRow {
  id: string;
  user_id: string;
  routine_id: string | null;
  routine_name: string;
  started_at: string | null;
  completed_at: string;
  duration_minutes: number;
  total_volume_kg: number;
  total_sets: number;
  total_reps: number;
  calories_burned: number;
  pr_count: number;
  feeling: string | null;
  notes: string | null;
  exercises: any;
  log_date: string;
  created_at: string;
}

interface DbPersonalRecordRow {
  id: string;
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  best_weight_kg: number;
  best_reps: number;
  best_estimated_1rm: number;
  achieved_date: string;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Workout Cloud Persistence & Bidirectional Sync Engine
 * Handles:
 * 1. Synchronizing workout routines, workout sessions, and PRs
 * 2. Deduplication and non-destructive reconciliation
 * 3. Graceful offline fallback (never throws or crashes UI)
 * 4. User-isolated RLS enforcement via authenticated Supabase JWT
 */
class WorkoutSyncService {
  private syncState: WorkoutSyncState = {
    status: 'idle',
    lastSyncedAt: null,
    lastError: null,
    lastSummary: null,
    isSyncing: false
  };

  private listeners: Set<(state: WorkoutSyncState) => void> = new Set();
  private lastSyncAttemptTimestamp: number = 0;
  private minSyncIntervalMs: number = 5000; // Debounce sync attempts

  constructor() {
    // Attempt auto-sync when online or when cloud auth state changes
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

  public getSyncState(): WorkoutSyncState {
    return { ...this.syncState };
  }

  public subscribe(callback: (state: WorkoutSyncState) => void): () => void {
    this.listeners.add(callback);
    callback(this.getSyncState());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private updateState(updates: Partial<WorkoutSyncState>) {
    this.syncState = { ...this.syncState, ...updates };
    this.listeners.forEach((listener) => {
      try {
        listener(this.getSyncState());
      } catch (err) {
        console.warn('[WorkoutSync] Error in sync listener callback', err);
      }
    });
  }

  /**
   * Triggers a non-blocking background sync if authenticated and not throttled
   */
  public triggerBackgroundSync(): void {
    const now = Date.now();
    if (this.syncState.isSyncing || now - this.lastSyncAttemptTimestamp < this.minSyncIntervalMs) {
      return;
    }

    this.lastSyncAttemptTimestamp = now;
    this.syncWorkoutData().catch((err) => {
      console.warn('[WorkoutSync] Background sync completed with soft error:', err);
    });
  }

  /**
   * Main Bidirectional Synchronization Entry Point
   */
  public async syncWorkoutData(): Promise<WorkoutSyncSummary | null> {
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

    const summary: WorkoutSyncSummary = {
      routinesUploaded: 0,
      routinesDownloaded: 0,
      sessionsUploaded: 0,
      sessionsDownloaded: 0,
      prsUploaded: 0,
      prsDownloaded: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Sync Routines
      const routineStats = await this.syncWorkoutRoutines(cloudUserId);
      summary.routinesUploaded = routineStats.uploaded;
      summary.routinesDownloaded = routineStats.downloaded;

      // 2. Sync Workout Sessions
      const sessionStats = await this.syncWorkoutSessions(cloudUserId);
      summary.sessionsUploaded = sessionStats.uploaded;
      summary.sessionsDownloaded = sessionStats.downloaded;

      // 3. Sync Personal Records
      const prStats = await this.syncPersonalRecords(cloudUserId);
      summary.prsUploaded = prStats.uploaded;
      summary.prsDownloaded = prStats.downloaded;

      this.updateState({
        status: 'synced',
        isSyncing: false,
        lastSyncedAt: summary.timestamp,
        lastError: null,
        lastSummary: summary
      });

      return summary;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown sync error';
      console.warn('[WorkoutSync] Sync failed with error:', errorMsg);
      this.updateState({
        status: 'error',
        isSyncing: false,
        lastError: errorMsg
      });
      return null;
    }
  }

  /**
   * 1. Bidirectional Workout Routines Sync
   */
  public async syncWorkoutRoutines(cloudUserId: string): Promise<{ uploaded: number; downloaded: number }> {
    if (!supabase) return { uploaded: 0, downloaded: 0 };

    let uploaded = 0;
    let downloaded = 0;

    // A. Fetch cloud routines for authenticated user
    const { data: cloudRoutines, error: fetchErr } = await supabase
      .from('workout_routines')
      .select('*')
      .eq('user_id', cloudUserId);

    if (fetchErr) {
      throw new Error(`Failed to fetch cloud routines: ${fetchErr.message}`);
    }

    const cloudRows: DbWorkoutRoutineRow[] = cloudRoutines || [];
    const cloudMap = new Map<string, DbWorkoutRoutineRow>();
    cloudRows.forEach((row) => cloudMap.set(row.id, row));

    // B. Get local routines (including custom routines)
    const localRoutines = localDb.getWorkoutRoutines(cloudUserId);
    const localMap = new Map<string, WorkoutRoutine>();
    localRoutines.forEach((r) => localMap.set(r.id, r));

    // C. Upload local routines missing from or newer than cloud
    for (const local of localRoutines) {
      // Preset routines that are non-custom don't need cloud duplication unless modified
      if (!local.is_custom && !local.user_id) continue;

      // Ensure stable UUID
      let targetId = local.id;
      if (!isValidUUID(targetId)) {
        // If local had a prefixed string ID (e.g. routine-push-01), generate stable mapping
        targetId = generateUUID();
        local.id = targetId;
        localDb.saveWorkoutRoutine(local);
      }

      const cloudMatch = cloudMap.get(targetId);
      const localUpdatedAt = local.created_at || new Date().toISOString();

      if (!cloudMatch) {
        // Upload new routine
        const dbRow: Partial<DbWorkoutRoutineRow> = {
          id: targetId,
          user_id: cloudUserId,
          name: local.name,
          description: local.description || null,
          exercises: local.exercises || [],
          target_days: local.days_of_week || [],
          days_of_week: local.days_of_week || [],
          split_type: (local as any).split_type || null,
          category: (local as any).category || null,
          is_custom: local.is_custom ?? true,
          is_active: true,
          created_at: local.created_at || new Date().toISOString(),
          updated_at: localUpdatedAt
        };

        const { error: insertErr } = await supabase
          .from('workout_routines')
          .upsert(dbRow);

        if (!insertErr) uploaded++;
      } else {
        // Compare timestamps if available
        const cloudUpdatedAt = cloudMatch.updated_at || cloudMatch.created_at || '';
        if (localUpdatedAt > cloudUpdatedAt) {
          const dbRow: Partial<DbWorkoutRoutineRow> = {
            id: targetId,
            user_id: cloudUserId,
            name: local.name,
            description: local.description || null,
            exercises: local.exercises || [],
            target_days: local.days_of_week || [],
            days_of_week: local.days_of_week || [],
            split_type: (local as any).split_type || cloudMatch.split_type,
            category: (local as any).category || cloudMatch.category,
            is_custom: local.is_custom,
            is_active: cloudMatch.is_active,
            updated_at: localUpdatedAt
          };

          const { error: updateErr } = await supabase
            .from('workout_routines')
            .upsert(dbRow);

          if (!updateErr) uploaded++;
        }
      }
    }

    // D. Download cloud routines missing locally or newer than local
    for (const cloud of cloudRows) {
      const localMatch = localMap.get(cloud.id);
      const cloudUpdatedAt = cloud.updated_at || cloud.created_at || '';

      if (!localMatch) {
        const newLocalRoutine: WorkoutRoutine = {
          id: cloud.id,
          user_id: cloudUserId,
          name: cloud.name,
          description: cloud.description || '',
          target_muscles: [],
          estimated_minutes: 45,
          days_of_week: cloud.days_of_week || cloud.target_days || [],
          exercises: Array.isArray(cloud.exercises) ? cloud.exercises : [],
          is_custom: cloud.is_custom ?? true,
          created_at: cloud.created_at || new Date().toISOString()
        };
        localDb.saveWorkoutRoutine(newLocalRoutine);
        downloaded++;
      } else {
        const localUpdatedAt = localMatch.created_at || '';
        if (cloudUpdatedAt > localUpdatedAt) {
          const updatedLocal: WorkoutRoutine = {
            ...localMatch,
            name: cloud.name,
            description: cloud.description || localMatch.description,
            days_of_week: cloud.days_of_week || cloud.target_days || localMatch.days_of_week,
            exercises: Array.isArray(cloud.exercises) ? cloud.exercises : localMatch.exercises,
            is_custom: cloud.is_custom ?? localMatch.is_custom
          };
          localDb.saveWorkoutRoutine(updatedLocal);
          downloaded++;
        }
      }
    }

    return { uploaded, downloaded };
  }

  /**
   * 2. Bidirectional Workout Sessions Sync (Append & Reconcile)
   */
  public async syncWorkoutSessions(cloudUserId: string): Promise<{ uploaded: number; downloaded: number }> {
    if (!supabase) return { uploaded: 0, downloaded: 0 };

    let uploaded = 0;
    let downloaded = 0;

    // A. Fetch cloud workout sessions
    const { data: cloudSessions, error: fetchErr } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', cloudUserId)
      .order('completed_at', { ascending: false });

    if (fetchErr) {
      throw new Error(`Failed to fetch cloud workout sessions: ${fetchErr.message}`);
    }

    const cloudRows: DbWorkoutSessionRow[] = cloudSessions || [];
    const cloudMap = new Map<string, DbWorkoutSessionRow>();
    cloudRows.forEach((row) => cloudMap.set(row.id, row));

    // B. Get local sessions
    const localSessions = localDb.getWorkoutSessions(cloudUserId);
    const localMap = new Map<string, WorkoutSessionLog>();
    localSessions.forEach((s) => localMap.set(s.id, s));

    // C. Upload local sessions missing from cloud
    for (const local of localSessions) {
      let targetId = local.id;
      if (!isValidUUID(targetId)) {
        targetId = generateUUID();
        local.id = targetId;
        localDb.saveWorkoutSession(local);
      }

      if (!cloudMap.has(targetId)) {
        // Validate routine_id foreign key safety
        let safeRoutineId: string | null = null;
        if (local.routine_id && isValidUUID(local.routine_id)) {
          safeRoutineId = local.routine_id;
        }

        const dbRow: DbWorkoutSessionRow = {
          id: targetId,
          user_id: cloudUserId,
          routine_id: safeRoutineId,
          routine_name: local.routine_name || 'Workout Session',
          started_at: local.started_at || null,
          completed_at: local.completed_at || new Date().toISOString(),
          duration_minutes: Number(local.duration_minutes) || 0,
          total_volume_kg: Number(local.total_volume_kg) || 0,
          total_sets: Number(local.total_sets) || 0,
          total_reps: Number(local.total_reps) || 0,
          calories_burned: Number(local.calories_burned) || 0,
          pr_count: Number(local.pr_count) || 0,
          feeling: null,
          notes: local.notes || null,
          exercises: Array.isArray(local.exercises) ? local.exercises : [],
          log_date: local.log_date || new Date().toISOString().split('T')[0],
          created_at: local.created_at || new Date().toISOString()
        };

        const { error: insertErr } = await supabase
          .from('workout_sessions')
          .upsert(dbRow);

        if (!insertErr) {
          uploaded++;
        } else {
          console.warn('[WorkoutSync] Session upload warning:', insertErr.message);
        }
      }
    }

    // D. Download cloud sessions missing locally
    for (const cloud of cloudRows) {
      if (!localMap.has(cloud.id)) {
        const newLocalSession: WorkoutSessionLog = {
          id: cloud.id,
          user_id: cloudUserId,
          routine_id: cloud.routine_id || undefined,
          routine_name: cloud.routine_name,
          started_at: cloud.started_at || cloud.completed_at,
          completed_at: cloud.completed_at,
          duration_minutes: cloud.duration_minutes,
          total_volume_kg: Number(cloud.total_volume_kg),
          total_sets: cloud.total_sets,
          total_reps: cloud.total_reps,
          pr_count: cloud.pr_count,
          calories_burned: cloud.calories_burned,
          exercises: Array.isArray(cloud.exercises) ? cloud.exercises : [],
          notes: cloud.notes || undefined,
          log_date: cloud.log_date,
          created_at: cloud.created_at
        };

        localDb.saveWorkoutSession(newLocalSession);
        downloaded++;
      }
    }

    return { uploaded, downloaded };
  }

  /**
   * 3. Bidirectional Personal Records Sync (Per Exercise Record)
   */
  public async syncPersonalRecords(cloudUserId: string): Promise<{ uploaded: number; downloaded: number }> {
    if (!supabase) return { uploaded: 0, downloaded: 0 };

    let uploaded = 0;
    let downloaded = 0;

    // A. Fetch cloud PRs
    const { data: cloudPRs, error: fetchErr } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', cloudUserId);

    if (fetchErr) {
      throw new Error(`Failed to fetch personal records: ${fetchErr.message}`);
    }

    const cloudRows: DbPersonalRecordRow[] = cloudPRs || [];
    const cloudMap = new Map<string, DbPersonalRecordRow>();
    cloudRows.forEach((row) => cloudMap.set(row.exercise_id, row));

    // B. Get local PRs
    const localPRs = localDb.getPersonalRecords(cloudUserId);
    const localMap = new Map<string, PersonalRecord>();
    localPRs.forEach((pr) => localMap.set(pr.exercise_id, pr));

    const mergedPRs: PersonalRecord[] = [];

    // C. Reconcile & Upload PRs
    const allExerciseIds = new Set([
      ...Array.from(localMap.keys()),
      ...Array.from(cloudMap.keys())
    ]);

    for (const exerciseId of allExerciseIds) {
      const local = localMap.get(exerciseId);
      const cloud = cloudMap.get(exerciseId);

      if (local && !cloud) {
        // Upload local to cloud
        const dbRow: Partial<DbPersonalRecordRow> = {
          id: isValidUUID(local.id || '') ? local.id : generateUUID(),
          user_id: cloudUserId,
          exercise_id: local.exercise_id,
          exercise_name: local.exercise_name,
          best_weight_kg: Number(local.best_weight_kg) || 0,
          best_reps: Number(local.best_reps) || 0,
          best_estimated_1rm: Number(local.best_estimated_1rm) || 0,
          achieved_date: local.achieved_date || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: insertErr } = await supabase
          .from('personal_records')
          .upsert(dbRow, { onConflict: 'user_id, exercise_id' });

        if (!insertErr) uploaded++;
        mergedPRs.push(local);
      } else if (!local && cloud) {
        // Download cloud to local
        const newLocalPR: PersonalRecord = {
          id: cloud.id,
          user_id: cloudUserId,
          exercise_id: cloud.exercise_id,
          exercise_name: cloud.exercise_name,
          best_weight_kg: Number(cloud.best_weight_kg),
          best_reps: cloud.best_reps,
          best_estimated_1rm: Number(cloud.best_estimated_1rm),
          achieved_date: cloud.achieved_date
        };
        mergedPRs.push(newLocalPR);
        downloaded++;
      } else if (local && cloud) {
        // Best metric comparison (higher 1RM or higher weight wins)
        const local1RM = Number(local.best_estimated_1rm) || 0;
        const cloud1RM = Number(cloud.best_estimated_1rm) || 0;
        const localWeight = Number(local.best_weight_kg) || 0;
        const cloudWeight = Number(cloud.best_weight_kg) || 0;

        const isLocalBetter = local1RM > cloud1RM || (local1RM === cloud1RM && localWeight >= cloudWeight);

        if (isLocalBetter) {
          // Upload local update to cloud
          const dbRow: Partial<DbPersonalRecordRow> = {
            id: cloud.id,
            user_id: cloudUserId,
            exercise_id: local.exercise_id,
            exercise_name: local.exercise_name,
            best_weight_kg: localWeight,
            best_reps: local.best_reps,
            best_estimated_1rm: local1RM,
            achieved_date: local.achieved_date,
            updated_at: new Date().toISOString()
          };

          const { error: updateErr } = await supabase
            .from('personal_records')
            .upsert(dbRow, { onConflict: 'user_id, exercise_id' });

          if (!updateErr) uploaded++;
          mergedPRs.push({ ...local, id: cloud.id });
        } else {
          // Adopt cloud PR
          mergedPRs.push({
            id: cloud.id,
            user_id: cloudUserId,
            exercise_id: cloud.exercise_id,
            exercise_name: cloud.exercise_name,
            best_weight_kg: cloudWeight,
            best_reps: cloud.best_reps,
            best_estimated_1rm: cloud1RM,
            achieved_date: cloud.achieved_date
          });
          downloaded++;
        }
      }
    }

    localDb.savePersonalRecords(cloudUserId, mergedPRs);
    return { uploaded, downloaded };
  }
}

export const workoutSyncService = new WorkoutSyncService();
