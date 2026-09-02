import { localDb } from '../lib/supabase';
import { supabase } from '../lib/supabaseClient';
import { WorkoutRoutine, WorkoutSessionLog, PersonalRecord } from '../types';

let syncInFlight = false;

const toRoutineRow = (r: WorkoutRoutine, userId: string) => ({
  id: r.id,
  user_id: userId,
  name: r.name,
  description: r.description || null,
  target_muscles: r.target_muscles || [],
  estimated_minutes: r.estimated_minutes || null,
  target_days: r.days_of_week || [],
  days_of_week: r.days_of_week || [],
  exercises: r.exercises || [],
  is_active: r.is_active ?? true,
  is_custom: r.is_custom ?? true,
  split_type: r.split_type || null,
  category: r.category || null,
  created_at: r.created_at || new Date().toISOString(),
  updated_at: r.updated_at || new Date().toISOString(),
});

const fromRoutineRow = (r: any): WorkoutRoutine => ({
  id: r.id,
  user_id: r.user_id,
  name: r.name,
  description: r.description || '',
  target_muscles: Array.isArray(r.target_muscles) ? r.target_muscles : [],
  estimated_minutes: r.estimated_minutes || 45,
  days_of_week: Array.isArray(r.days_of_week) ? r.days_of_week : (r.target_days || []),
  exercises: Array.isArray(r.exercises) ? r.exercises : [],
  is_active: r.is_active ?? true,
  is_custom: r.is_custom ?? true,
  split_type: r.split_type || undefined,
  category: r.category || undefined,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

const toSessionRow = (s: WorkoutSessionLog, userId: string) => ({
  id: s.id,
  user_id: userId,
  routine_id: s.routine_id || null,
  routine_name: s.routine_name,
  started_at: s.started_at,
  completed_at: s.completed_at,
  duration_minutes: s.duration_minutes,
  total_volume_kg: s.total_volume_kg,
  total_sets: s.total_sets,
  total_reps: s.total_reps,
  pr_count: s.pr_count,
  calories_burned: s.calories_burned ?? null,
  exercises: s.exercises || [],
  notes: s.notes || null,
  log_date: s.log_date,
  created_at: s.created_at || new Date().toISOString(),
});

const fromSessionRow = (s: any): WorkoutSessionLog => ({
  id: s.id,
  user_id: s.user_id,
  routine_id: s.routine_id || undefined,
  routine_name: s.routine_name,
  started_at: s.started_at,
  completed_at: s.completed_at,
  duration_minutes: s.duration_minutes,
  total_volume_kg: Number(s.total_volume_kg || 0),
  total_sets: s.total_sets || 0,
  total_reps: s.total_reps || 0,
  pr_count: s.pr_count || 0,
  calories_burned: s.calories_burned ?? undefined,
  exercises: Array.isArray(s.exercises) ? s.exercises : [],
  notes: s.notes || undefined,
  log_date: s.log_date,
  created_at: s.created_at,
});

export async function syncWorkoutData(userId: string): Promise<void> {
  if (!supabase || syncInFlight) return;
  syncInFlight = true;

  try {
    // Push custom local routines only. Preset routines remain local app content.
    const localRoutines = localDb.getWorkoutRoutines(userId).filter(r => r.is_custom && r.user_id === userId);
    if (localRoutines.length) {
      const { error } = await supabase.from('workout_routines').upsert(
        localRoutines.map(r => toRoutineRow(r, userId)),
        { onConflict: 'id' }
      );
      if (error) throw error;
    }

    const localSessions = localDb.getWorkoutSessions(userId);
    if (localSessions.length) {
      const { error } = await supabase.from('workout_sessions').upsert(
        localSessions.map(s => toSessionRow(s, userId)),
        { onConflict: 'id' }
      );
      if (error) throw error;
    }

    const localPRs = localDb.getPersonalRecords(userId);
    if (localPRs.length) {
      const rows = localPRs.map((pr: any) => ({
        id: pr.id || crypto.randomUUID(),
        user_id: userId,
        exercise_id: pr.exercise_id,
        exercise_name: pr.exercise_name,
        best_weight_kg: pr.best_weight_kg || 0,
        best_reps: pr.best_reps || 0,
        best_estimated_1rm: pr.best_estimated_1rm || 0,
        achieved_date: pr.achieved_date,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from('personal_records').upsert(rows, { onConflict: 'user_id,exercise_id' });
      if (error) throw error;
    }

    // Pull cloud data back into local cache so reload/offline mode keeps working.
    const [{ data: routines, error: routinesError }, { data: sessions, error: sessionsError }, { data: prs, error: prsError }] = await Promise.all([
      supabase.from('workout_routines').select('*').eq('user_id', userId),
      supabase.from('workout_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false }),
      supabase.from('personal_records').select('*').eq('user_id', userId),
    ]);

    if (routinesError) throw routinesError;
    if (sessionsError) throw sessionsError;
    if (prsError) throw prsError;

    (routines || []).forEach(row => localDb.saveWorkoutRoutine(fromRoutineRow(row)));
    (sessions || []).forEach(row => localDb.saveWorkoutSession(fromSessionRow(row)));
    if (prs) localDb.savePersonalRecords(userId, prs.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      exercise_id: row.exercise_id,
      exercise_name: row.exercise_name,
      best_weight_kg: Number(row.best_weight_kg || 0),
      best_reps: row.best_reps || 0,
      best_estimated_1rm: Number(row.best_estimated_1rm || 0),
      achieved_date: row.achieved_date,
    })) as PersonalRecord[]);
  } catch (error) {
    // Cloud is best-effort. Local workout tracking must continue offline.
    console.warn('[FitSathi] Workout cloud sync deferred:', error);
  } finally {
    syncInFlight = false;
  }
}
