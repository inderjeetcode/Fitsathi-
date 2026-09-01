import { RoutineExercise, WorkoutSet } from '../types';

/**
 * Calculates estimated One-Rep Max (1RM) using the standard Epley formula.
 * Formula: 1RM = Weight * (1 + Reps / 30)
 *
 * @param weightKg Weight lifted in kilograms
 * @param reps Number of repetitions completed (1 - 30)
 * @returns Estimated 1RM in kg, rounded to 1 decimal place
 */
export function calculate1RMEpley(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weightKg * 10) / 10;

  // Cap reps at 30 to prevent unrealistic extrapolation
  const effectiveReps = Math.min(reps, 30);
  const estimated = weightKg * (1 + effectiveReps / 30);
  return Math.round(estimated * 10) / 10;
}

/**
 * Calculates estimated 1RM using the Brzycki formula.
 * Formula: 1RM = Weight * (36 / (37 - Reps))
 *
 * @param weightKg Weight lifted in kilograms
 * @param reps Number of repetitions completed (1 - 30)
 * @returns Estimated 1RM in kg, rounded to 1 decimal place
 */
export function calculate1RMBrzycki(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weightKg * 10) / 10;

  const effectiveReps = Math.min(reps, 30);
  const estimated = weightKg * (36 / (37 - effectiveReps));
  return Math.round(estimated * 10) / 10;
}

/**
 * General Estimated 1RM calculator supporting different standard formulas.
 * Defaults to Epley formula.
 */
export function calculateEstimated1RM(
  weightKg: number,
  reps: number,
  formula: 'epley' | 'brzycki' = 'epley'
): number {
  if (formula === 'brzycki') {
    return calculate1RMBrzycki(weightKg, reps);
  }
  return calculate1RMEpley(weightKg, reps);
}

export interface RepMaxBreakdown {
  reps: number;
  percentage: number;
  weightKg: number;
}

/**
 * Generates an estimated rep max percentage table based on a given 1RM.
 */
export function getRepPercentages(oneRepMaxKg: number): RepMaxBreakdown[] {
  if (oneRepMaxKg <= 0) return [];

  const percentageMap = [
    { reps: 1, percentage: 1.0 },
    { reps: 2, percentage: 0.95 },
    { reps: 3, percentage: 0.93 },
    { reps: 4, percentage: 0.9 },
    { reps: 5, percentage: 0.87 },
    { reps: 6, percentage: 0.85 },
    { reps: 8, percentage: 0.8 },
    { reps: 10, percentage: 0.75 },
    { reps: 12, percentage: 0.7 },
    { reps: 15, percentage: 0.65 }
  ];

  return percentageMap.map((item) => ({
    reps: item.reps,
    percentage: Math.round(item.percentage * 100),
    weightKg: Math.round(oneRepMaxKg * item.percentage * 10) / 10
  }));
}

/**
 * Calculates volume load for a single set (Weight * Reps).
 */
export function calculateSetVolume(set: WorkoutSet): number {
  const weight = set.actualWeightKg ?? set.targetWeightKg ?? 0;
  const reps = set.actualReps ?? set.targetReps ?? 0;
  return Math.round(weight * reps * 10) / 10;
}

/**
 * Calculates total volume lifted across all completed sets in a workout.
 */
export function calculateTotalSessionVolume(exercises: RoutineExercise[]): number {
  let totalVolume = 0;

  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (set.completed) {
        const weight = set.actualWeightKg ?? 0;
        const reps = set.actualReps ?? 0;
        totalVolume += weight * reps;
      }
    }
  }

  return Math.round(totalVolume * 10) / 10;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS format for workout timers.
 */
export function formatWorkoutDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}
