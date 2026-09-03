import { localDb } from '../lib/supabase';
import { workoutSyncService } from './cloud/workoutSync.service';
import {
  Exercise,
  ExerciseCategory,
  EquipmentType,
  SetType,
  WorkoutSet,
  RoutineExercise,
  WorkoutRoutine,
  WorkoutSessionLog,
  PersonalRecord,
  ActiveWorkoutState
} from '../types';
import {
  calculateEstimated1RM,
  calculateSetVolume,
  calculateTotalSessionVolume
} from '../utils/oneRepMax';

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

/**
 * Validates whether a given weight and rep count qualify for realistic PR evaluation.
 * Rejects non-sensical inputs (e.g., negative or zero numbers, reps > 30, weight > 600kg).
 */
function isValidPRAttempt(weightKg: number, reps: number): boolean {
  if (typeof weightKg !== 'number' || typeof reps !== 'number') return false;
  if (isNaN(weightKg) || isNaN(reps)) return false;
  if (weightKg <= 0 || reps <= 0) return false;
  if (reps > 30 || weightKg > 600) return false;
  return true;
}

export const workoutService = {
  // ==========================================
  // 1. ROUTINE MANAGEMENT
  // ==========================================

  /**
   * Retrieves all routines available to the user (both custom and default presets).
   */
  async getRoutines(userId: string): Promise<WorkoutRoutine[]> {
    try {
      return localDb.getWorkoutRoutines(userId);
    } catch (err) {
      console.error('Failed to get workout routines', err);
      return [];
    }
  },

  /**
   * Retrieves a specific routine by ID.
   */
  async getRoutineById(id: string, userId: string): Promise<WorkoutRoutine | null> {
    try {
      const routines = await this.getRoutines(userId);
      return routines.find((r) => r.id === id) || null;
    } catch (err) {
      console.error(`Failed to get routine ${id}`, err);
      return null;
    }
  },

  /**
   * Creates a new workout routine.
   */
  async createRoutine(
    userId: string,
    data: {
      name: string;
      description?: string;
      target_muscles?: string[];
      estimated_minutes?: number;
      days_of_week?: number[];
      exercises?: RoutineExercise[];
    }
  ): Promise<WorkoutRoutine> {
    const routine: WorkoutRoutine = {
      id: generateId('routine'),
      user_id: userId,
      name: data.name.trim() || 'New Workout Routine',
      description: data.description || '',
      target_muscles: data.target_muscles || [],
      estimated_minutes: data.estimated_minutes || 45,
      days_of_week: data.days_of_week || [],
      exercises: data.exercises || [],
      is_custom: true,
      created_at: new Date().toISOString()
    };

    localDb.saveWorkoutRoutine(routine);
    workoutSyncService.triggerBackgroundSync();
    return routine;
  },

  /**
   * Updates an existing custom routine.
   */
  async updateRoutine(
    id: string,
    userId: string,
    updates: Partial<WorkoutRoutine>
  ): Promise<WorkoutRoutine> {
    const existing = await this.getRoutineById(id, userId);
    if (!existing) {
      throw new Error(`Routine with id ${id} not found.`);
    }

    const updated: WorkoutRoutine = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      user_id: existing.user_id // Preserve Owner
    };

    localDb.saveWorkoutRoutine(updated);
    workoutSyncService.triggerBackgroundSync();
    return updated;
  },

  /**
   * Deletes a routine.
   */
  async deleteRoutine(id: string, userId: string): Promise<void> {
    localDb.deleteWorkoutRoutine(id, userId);
    workoutSyncService.triggerBackgroundSync();
  },

  /**
   * Assigns days of the week (0 = Sun, 1 = Mon, ..., 6 = Sat) to a routine.
   */
  async assignRoutineDays(id: string, userId: string, days: number[]): Promise<WorkoutRoutine> {
    const validDays = Array.from(new Set(days.filter((d) => d >= 0 && d <= 6)));
    return this.updateRoutine(id, userId, { days_of_week: validDays });
  },

  /**
   * Retrieves routines scheduled for a given day of the week (0-6).
   */
  async getRoutinesForDay(userId: string, dayOfWeek: number): Promise<WorkoutRoutine[]> {
    const routines = await this.getRoutines(userId);
    return routines.filter((r) => r.days_of_week && r.days_of_week.includes(dayOfWeek));
  },

  // ==========================================
  // 2. ACTIVE WORKOUT SESSION MANAGEMENT
  // ==========================================

  /**
   * Starts a new active workout session, initializing from an optional routine template.
   */
  startActiveWorkout(
    userId: string,
    routine?: WorkoutRoutine | null,
    customName?: string
  ): ActiveWorkoutState {
    const startedAt = new Date().toISOString();

    let initialExercises: RoutineExercise[] = [];
    if (routine && routine.exercises && routine.exercises.length > 0) {
      // Clone exercises and reset completed statuses for the active session
      initialExercises = routine.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s, idx) => ({
          ...s,
          id: generateId('set'),
          setNumber: idx + 1,
          completed: false,
          actualReps: undefined,
          actualWeightKg: undefined,
          isPR: false,
          estimated1RM: undefined
        }))
      }));
    }

    const activeState: ActiveWorkoutState = {
      routineId: routine?.id,
      routineName: customName || routine?.name || 'Quick Workout Session',
      startedAt,
      exercises: initialExercises,
      currentExerciseIndex: 0,
      elapsedSeconds: 0,
      isPaused: false,
      notes: ''
    };

    localDb.saveActiveWorkout(userId, activeState);
    return activeState;
  },

  /**
   * Retrieves the currently active workout state for a user, if one exists.
   */
  getActiveWorkout(userId: string): ActiveWorkoutState | null {
    try {
      const state = localDb.getActiveWorkout(userId);
      if (!state || !state.startedAt || !Array.isArray(state.exercises)) {
        return null;
      }
      return state;
    } catch (err) {
      console.warn('Failed to retrieve active workout state; recovering safely.', err);
      return null;
    }
  },

  /**
   * Restores an active workout state after page reload or route transition.
   */
  restoreActiveWorkout(userId: string): ActiveWorkoutState | null {
    return this.getActiveWorkout(userId);
  },

  /**
   * Saves the current active workout state to local storage.
   */
  saveActiveWorkout(userId: string, state: ActiveWorkoutState): void {
    if (!state) return;
    localDb.saveActiveWorkout(userId, state);
  },

  /**
   * Updates partial fields in the active workout state.
   */
  updateActiveWorkout(
    userId: string,
    updates: Partial<ActiveWorkoutState>
  ): ActiveWorkoutState {
    const current = this.getActiveWorkout(userId);
    if (!current) {
      throw new Error('No active workout found to update.');
    }

    const updated: ActiveWorkoutState = {
      ...current,
      ...updates
    };

    this.saveActiveWorkout(userId, updated);
    return updated;
  },

  /**
   * Discards the active workout without saving it to history.
   */
  discardActiveWorkout(userId: string): void {
    localDb.clearActiveWorkout(userId);
  },

  // ==========================================
  // 3. SET & EXERCISE LOGGING
  // ==========================================

  /**
   * Adds an exercise to the active workout session.
   */
  addExerciseToActiveWorkout(
    activeWorkout: ActiveWorkoutState,
    exercise: Exercise | {
      id: string;
      name: string;
      category: ExerciseCategory;
      targetMuscle: string;
      equipment: EquipmentType;
      defaultRestSeconds?: number;
    },
    defaultSetsCount: number = 3
  ): ActiveWorkoutState {
    const sets: WorkoutSet[] = [];
    const count = Math.max(1, defaultSetsCount);

    for (let i = 1; i <= count; i++) {
      sets.push({
        id: generateId('set'),
        setNumber: i,
        type: 'normal',
        targetReps: 10,
        targetWeightKg: 20,
        completed: false
      });
    }

    const newExercise: RoutineExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      targetMuscle: exercise.targetMuscle,
      equipment: exercise.equipment,
      restSeconds: exercise.defaultRestSeconds || 60,
      sets
    };

    return {
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newExercise]
    };
  },

  /**
   * Removes an exercise by index from the active workout.
   */
  removeExerciseFromActiveWorkout(
    activeWorkout: ActiveWorkoutState,
    exerciseIndex: number
  ): ActiveWorkoutState {
    const updatedExercises = activeWorkout.exercises.filter((_, idx) => idx !== exerciseIndex);
    const newCurrentIndex = Math.min(
      activeWorkout.currentExerciseIndex,
      Math.max(0, updatedExercises.length - 1)
    );

    return {
      ...activeWorkout,
      exercises: updatedExercises,
      currentExerciseIndex: newCurrentIndex
    };
  },

  /**
   * Reorders exercises within an active workout.
   */
  reorderExercises(
    activeWorkout: ActiveWorkoutState,
    fromIndex: number,
    toIndex: number
  ): ActiveWorkoutState {
    if (
      fromIndex < 0 ||
      fromIndex >= activeWorkout.exercises.length ||
      toIndex < 0 ||
      toIndex >= activeWorkout.exercises.length ||
      fromIndex === toIndex
    ) {
      return activeWorkout;
    }

    const list = [...activeWorkout.exercises];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    return {
      ...activeWorkout,
      exercises: list
    };
  },

  /**
   * Adds a set to an exercise in the active workout.
   */
  addSet(
    activeWorkout: ActiveWorkoutState,
    exerciseIndex: number,
    setType: SetType = 'normal'
  ): ActiveWorkoutState {
    if (exerciseIndex < 0 || exerciseIndex >= activeWorkout.exercises.length) {
      return activeWorkout;
    }

    const targetEx = activeWorkout.exercises[exerciseIndex];
    const lastSet = targetEx.sets[targetEx.sets.length - 1];

    const newSet: WorkoutSet = {
      id: generateId('set'),
      setNumber: targetEx.sets.length + 1,
      type: setType,
      targetReps: lastSet?.actualReps ?? lastSet?.targetReps ?? 10,
      targetWeightKg: lastSet?.actualWeightKg ?? lastSet?.targetWeightKg ?? 20,
      completed: false
    };

    const updatedExercises = activeWorkout.exercises.map((ex, idx) => {
      if (idx !== exerciseIndex) return ex;
      return {
        ...ex,
        sets: [...ex.sets, newSet]
      };
    });

    return {
      ...activeWorkout,
      exercises: updatedExercises
    };
  },

  /**
   * Removes a set from an exercise in the active workout.
   */
  removeSet(
    activeWorkout: ActiveWorkoutState,
    exerciseIndex: number,
    setIndex: number
  ): ActiveWorkoutState {
    if (exerciseIndex < 0 || exerciseIndex >= activeWorkout.exercises.length) {
      return activeWorkout;
    }

    const targetEx = activeWorkout.exercises[exerciseIndex];
    const updatedSets = targetEx.sets
      .filter((_, idx) => idx !== setIndex)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 })); // re-index set numbers

    const updatedExercises = activeWorkout.exercises.map((ex, idx) => {
      if (idx !== exerciseIndex) return ex;
      return { ...ex, sets: updatedSets };
    });

    return {
      ...activeWorkout,
      exercises: updatedExercises
    };
  },

  /**
   * Updates an individual set in the active workout (e.g. marking completed, editing reps/weight/type).
   */
  updateSet(
    activeWorkout: ActiveWorkoutState,
    exerciseIndex: number,
    setIndex: number,
    setUpdates: Partial<WorkoutSet>
  ): ActiveWorkoutState {
    if (exerciseIndex < 0 || exerciseIndex >= activeWorkout.exercises.length) {
      return activeWorkout;
    }

    const targetEx = activeWorkout.exercises[exerciseIndex];
    if (setIndex < 0 || setIndex >= targetEx.sets.length) {
      return activeWorkout;
    }

    const currentSet = targetEx.sets[setIndex];
    const updatedSet: WorkoutSet = {
      ...currentSet,
      ...setUpdates
    };

    // Calculate estimated 1RM if completed or actual values provided
    const effectiveWeight = updatedSet.actualWeightKg ?? updatedSet.targetWeightKg ?? 0;
    const effectiveReps = updatedSet.actualReps ?? updatedSet.targetReps ?? 0;

    if (effectiveWeight > 0 && effectiveReps > 0) {
      updatedSet.estimated1RM = calculateEstimated1RM(effectiveWeight, effectiveReps);
    }

    const updatedSets = targetEx.sets.map((s, idx) => (idx === setIndex ? updatedSet : s));
    const updatedExercises = activeWorkout.exercises.map((ex, idx) =>
      idx === exerciseIndex ? { ...ex, sets: updatedSets } : ex
    );

    return {
      ...activeWorkout,
      exercises: updatedExercises
    };
  },

  // ==========================================
  // 4. PREVIOUS PERFORMANCE & GHOST DATA
  // ==========================================

  /**
   * Retrieves the user's most recent completed sets for a specific exercise to display as reference ghost data.
   */
  async getPreviousExercisePerformance(
    userId: string,
    exerciseId: string
  ): Promise<WorkoutSet[] | null> {
    try {
      const pastSessions = await this.getWorkoutSessions(userId);

      // Search from newest to oldest session
      for (const session of pastSessions) {
        const foundEx = session.exercises.find((ex) => ex.exerciseId === exerciseId);
        if (foundEx && foundEx.sets && foundEx.sets.length > 0) {
          const completedSets = foundEx.sets.filter((s) => s.completed);
          if (completedSets.length > 0) {
            return completedSets;
          }
        }
      }

      return null;
    } catch (err) {
      console.error(`Failed to get previous performance for exercise ${exerciseId}`, err);
      return null;
    }
  },

  // ==========================================
  // 5. PERSONAL RECORD (PR) TRACKING
  // ==========================================

  /**
   * Retrieves all personal records for a user.
   */
  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    try {
      return localDb.getPersonalRecords(userId);
    } catch (err) {
      console.error('Failed to get personal records', err);
      return [];
    }
  },

  /**
   * Retrieves the personal record for a specific exercise.
   */
  async getPRForExercise(userId: string, exerciseId: string): Promise<PersonalRecord | null> {
    const prs = await this.getPersonalRecords(userId);
    return prs.find((pr) => pr.exercise_id === exerciseId) || null;
  },

  /**
   * Checks if a set constitutes a new personal record (weight, reps, or estimated 1RM).
   */
  async checkAndCalculateSetPR(
    userId: string,
    exerciseId: string,
    weightKg: number,
    reps: number,
    existingPRList?: PersonalRecord[]
  ): Promise<{
    isWeightPR: boolean;
    isRepsPR: boolean;
    is1RMPR: boolean;
    isAnyPR: boolean;
    estimated1RM: number;
  }> {
    if (!isValidPRAttempt(weightKg, reps)) {
      return {
        isWeightPR: false,
        isRepsPR: false,
        is1RMPR: false,
        isAnyPR: false,
        estimated1RM: 0
      };
    }

    const estimated1RM = calculateEstimated1RM(weightKg, reps);
    const prList = existingPRList ?? (await this.getPersonalRecords(userId));
    const existingPR = prList.find((p) => p.exercise_id === exerciseId);

    if (!existingPR) {
      // First time recording a valid performance for this exercise
      return {
        isWeightPR: true,
        isRepsPR: true,
        is1RMPR: true,
        isAnyPR: true,
        estimated1RM
      };
    }

    const isWeightPR = weightKg > existingPR.best_weight_kg;
    const isRepsPR = weightKg >= existingPR.best_weight_kg && reps > existingPR.best_reps;
    const is1RMPR = estimated1RM > existingPR.best_estimated_1rm;

    return {
      isWeightPR,
      isRepsPR,
      is1RMPR,
      isAnyPR: isWeightPR || isRepsPR || is1RMPR,
      estimated1RM
    };
  },

  /**
   * Evaluates all completed sets in a session and updates the user's PR database.
   */
  async updatePersonalRecordsFromSession(
    userId: string,
    session: WorkoutSessionLog
  ): Promise<PersonalRecord[]> {
    const currentPRs = [...(await this.getPersonalRecords(userId))];
    let prsUpdated = false;

    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (!set.completed) continue;

        const weight = set.actualWeightKg ?? 0;
        const reps = set.actualReps ?? 0;

        if (!isValidPRAttempt(weight, reps)) continue;

        const est1RM = set.estimated1RM || calculateEstimated1RM(weight, reps);
        const existingIdx = currentPRs.findIndex((p) => p.exercise_id === ex.exerciseId);

        if (existingIdx === -1) {
          currentPRs.push({
            user_id: userId,
            exercise_id: ex.exerciseId,
            exercise_name: ex.exerciseName,
            best_weight_kg: weight,
            best_reps: reps,
            best_estimated_1rm: est1RM,
            achieved_date: session.log_date
          });
          prsUpdated = true;
        } else {
          const current = currentPRs[existingIdx];
          let updated = false;
          let newWeight = current.best_weight_kg;
          let newReps = current.best_reps;
          let new1RM = current.best_estimated_1rm;

          if (weight > current.best_weight_kg) {
            newWeight = weight;
            newReps = reps;
            updated = true;
          } else if (weight === current.best_weight_kg && reps > current.best_reps) {
            newReps = reps;
            updated = true;
          }

          if (est1RM > current.best_estimated_1rm) {
            new1RM = est1RM;
            updated = true;
          }

          if (updated) {
            currentPRs[existingIdx] = {
              ...current,
              exercise_name: ex.exerciseName,
              best_weight_kg: newWeight,
              best_reps: newReps,
              best_estimated_1rm: new1RM,
              achieved_date: session.log_date
            };
            prsUpdated = true;
          }
        }
      }
    }

    if (prsUpdated) {
      localDb.savePersonalRecords(userId, currentPRs);
    }

    return currentPRs;
  },

  // ==========================================
  // 6. WORKOUT COMPLETION & HISTORY
  // ==========================================

  /**
   * Calculates the summary metrics for an active workout session.
   */
  calculateWorkoutSummary(
    activeWorkout: ActiveWorkoutState,
    completedAtDate: Date = new Date()
  ): {
    durationMinutes: number;
    totalSets: number;
    totalReps: number;
    totalVolumeKg: number;
    exercisesCompleted: number;
    prCount: number;
  } {
    const startTime = new Date(activeWorkout.startedAt).getTime();
    const endTime = completedAtDate.getTime();
    const elapsedMinutes = Math.max(
      1,
      Math.round((endTime - startTime) / (1000 * 60)) ||
        Math.round((activeWorkout.elapsedSeconds || 0) / 60)
    );

    let totalSets = 0;
    let totalReps = 0;
    let totalVolumeKg = 0;
    let exercisesCompleted = 0;
    let prCount = 0;

    for (const ex of activeWorkout.exercises) {
      let completedInExercise = 0;
      for (const set of ex.sets) {
        if (set.completed) {
          completedInExercise++;
          totalSets++;
          const reps = set.actualReps ?? set.targetReps ?? 0;
          const weight = set.actualWeightKg ?? set.targetWeightKg ?? 0;
          totalReps += reps;
          totalVolumeKg += weight * reps;
          if (set.isPR) prCount++;
        }
      }
      if (completedInExercise > 0) {
        exercisesCompleted++;
      }
    }

    return {
      durationMinutes: elapsedMinutes,
      totalSets,
      totalReps,
      totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
      exercisesCompleted,
      prCount
    };
  },

  /**
   * Finalizes and saves a workout session to history, updates PRs, and clears the active session.
   */
  async completeWorkout(
    userId: string,
    activeWorkout: ActiveWorkoutState,
    notes?: string
  ): Promise<{
    session: WorkoutSessionLog;
    updatedPRs: PersonalRecord[];
  }> {
    if (!userId) {
      throw new Error('User ID is required to complete workout.');
    }
    if (!activeWorkout || !Array.isArray(activeWorkout.exercises)) {
      throw new Error('Invalid active workout state provided for completion.');
    }

    const now = new Date();
    const today = getTodayDate();
    const summary = this.calculateWorkoutSummary(activeWorkout, now);

    // Check PRs on all completed sets before finalizing
    const existingPRs = await this.getPersonalRecords(userId);
    let sessionPRCount = 0;
    const newlyAchievedPRs: PersonalRecord[] = [];

    const finalizedExercises: RoutineExercise[] = activeWorkout.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((set) => {
        if (!set.completed) {
          const w = set.actualWeightKg ?? set.targetWeightKg;
          const r = set.actualReps ?? set.targetReps;
          const est = w && r ? calculateEstimated1RM(w, r) : undefined;
          return {
            ...set,
            actualWeightKg: w,
            actualReps: r,
            estimated1RM: est
          };
        }

        const weight = set.actualWeightKg ?? set.targetWeightKg ?? 0;
        const reps = set.actualReps ?? set.targetReps ?? 0;
        const est1RM = calculateEstimated1RM(weight, reps);

        const isPR =
          isValidPRAttempt(weight, reps) &&
          (() => {
            const existing = existingPRs.find((p) => p.exercise_id === ex.exerciseId);
            if (!existing) return true;
            return weight > existing.best_weight_kg || est1RM > existing.best_estimated_1rm;
          })();

        if (isPR) {
          sessionPRCount++;
          newlyAchievedPRs.push({
            user_id: userId,
            exercise_id: ex.exerciseId,
            exercise_name: ex.exerciseName,
            best_weight_kg: weight,
            best_reps: reps,
            best_estimated_1rm: est1RM,
            achieved_date: today
          });
        }

        return {
          ...set,
          actualWeightKg: weight,
          actualReps: reps,
          isPR,
          estimated1RM: est1RM
        };
      })
    }));

    // Estimate calories burned based on duration and volume (~7.5 kcal per min of resistance training)
    const estimatedCalories = Math.round(summary.durationMinutes * 7.5);

    const session: WorkoutSessionLog = {
      id: generateId('session'),
      user_id: userId,
      routine_id: activeWorkout.routineId,
      routine_name: activeWorkout.routineName || 'Workout Session',
      started_at: activeWorkout.startedAt,
      completed_at: now.toISOString(),
      duration_minutes: summary.durationMinutes,
      total_volume_kg: summary.totalVolumeKg,
      total_sets: summary.totalSets,
      total_reps: summary.totalReps,
      pr_count: sessionPRCount,
      calories_burned: estimatedCalories,
      exercises: finalizedExercises,
      notes: notes || activeWorkout.notes || '',
      log_date: today,
      created_at: now.toISOString()
    };

    // 1. Save session to history first
    localDb.saveWorkoutSession(session);

    // 2. Update persistent PRs
    await this.updatePersonalRecordsFromSession(userId, session);

    // 3. Clear active workout from storage ONLY after successful session persistence
    localDb.clearActiveWorkout(userId);

    // 4. Trigger non-blocking cloud sync if cloud auth exists
    workoutSyncService.triggerBackgroundSync();

    return {
      session,
      updatedPRs: newlyAchievedPRs
    };
  },

  /**
   * Updates an existing completed workout session in history (e.g. notes, rating/feeling).
   */
  async updateWorkoutSession(
    id: string,
    userId: string,
    updates: Partial<WorkoutSessionLog>
  ): Promise<WorkoutSessionLog | null> {
    try {
      const session = await this.getWorkoutSessionById(id, userId);
      if (!session) {
        console.warn(`[WorkoutService] Session not found for update: ${id}`);
        return null;
      }

      const updatedSession: WorkoutSessionLog = {
        ...session,
        ...updates,
        id: session.id, // Immutable ID
        user_id: session.user_id // Immutable user ID
      };

      localDb.saveWorkoutSession(updatedSession);
      workoutSyncService.triggerBackgroundSync();
      return updatedSession;
    } catch (err) {
      console.error('Failed to update workout session', err);
      return null;
    }
  },

  /**
   * Retrieves all completed workout sessions for a user, optionally filtered by date.
   */
  async getWorkoutSessions(userId: string, date?: string): Promise<WorkoutSessionLog[]> {
    try {
      return localDb.getWorkoutSessions(userId, date);
    } catch (err) {
      console.error('Failed to get workout sessions', err);
      return [];
    }
  },

  /**
   * Retrieves a specific completed workout session by ID.
   */
  async getWorkoutSessionById(id: string, userId: string): Promise<WorkoutSessionLog | null> {
    const sessions = await this.getWorkoutSessions(userId);
    return sessions.find((s) => s.id === id) || null;
  },

  /**
   * Deletes a completed workout session from history.
   */
  async deleteWorkoutSession(id: string, userId: string): Promise<void> {
    localDb.deleteWorkoutSession(id, userId);
    workoutSyncService.triggerBackgroundSync();
  }
};
