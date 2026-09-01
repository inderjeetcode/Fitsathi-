import { WorkoutSessionLog, RoutineExercise, WorkoutSet } from '../types';

export interface WeeklyStats {
  weekLabel: string;
  startDate: string;
  workoutCount: number;
  totalVolumeKg: number;
  totalDurationMinutes: number;
  totalSets: number;
}

export interface MonthlyStats {
  monthLabel: string;
  monthKey: string; // YYYY-MM
  workoutCount: number;
  totalVolumeKg: number;
  totalDurationMinutes: number;
}

export interface ExerciseProgressPoint {
  date: string;
  sessionId: string;
  routineName: string;
  maxWeightKg: number;
  bestEstimated1RM: number;
  totalVolumeKg: number;
  totalSets: number;
  bestSet: {
    weightKg: number;
    reps: number;
    setType: string;
    isPR?: boolean;
  };
}

/**
 * Calculates current active workout streak (in days) based on actual completed workout dates.
 * A streak continues if the user worked out today or yesterday.
 */
export function calculateWorkoutStreak(sessions: WorkoutSessionLog[]): number {
  if (!sessions || sessions.length === 0) return 0;

  // Extract unique sorted dates (YYYY-MM-DD) descending
  const uniqueDates = Array.from(
    new Set(
      sessions
        .map((s) => s.log_date || s.completed_at?.split('T')[0])
        .filter(Boolean)
    )
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const mostRecentDate = uniqueDates[0];
  
  // Streak is only active if the latest workout was today or yesterday
  if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let expectedDate = new Date(mostRecentDate);

  for (const dateStr of uniqueDates) {
    const currentDate = new Date(dateStr);
    const diffDays = Math.round((expectedDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      streak++;
      // Decrement expected date by 1 day
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Filters workout sessions by time period ('all', 'week', 'month', '3months').
 */
export function filterSessionsByPeriod(
  sessions: WorkoutSessionLog[],
  period: 'all' | 'week' | 'month' | '3months'
): WorkoutSessionLog[] {
  if (!sessions || sessions.length === 0) return [];
  if (period === 'all') return sessions;

  const now = new Date();
  let cutoffDate = new Date();

  if (period === 'week') {
    cutoffDate.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    cutoffDate.setMonth(now.getMonth() - 1);
  } else if (period === '3months') {
    cutoffDate.setMonth(now.getMonth() - 3);
  }

  const cutoffTime = cutoffDate.getTime();

  return sessions.filter((s) => {
    const sessionTime = new Date(s.log_date || s.completed_at).getTime();
    return sessionTime >= cutoffTime;
  });
}

/**
 * Groups sessions into the last N weeks of training stats.
 */
export function getWeeklyWorkoutStats(
  sessions: WorkoutSessionLog[],
  weeksCount: number = 8
): WeeklyStats[] {
  const result: WeeklyStats[] = [];
  const now = new Date();

  // Create week buckets starting from current week going back
  for (let i = weeksCount - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    const day = weekStart.getDay(); // 0 is Sunday
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    weekStart.setDate(diff - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const startStr = weekStart.toISOString().split('T')[0];
    const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.log_date || s.completed_at).getTime();
      return d >= weekStart.getTime() && d <= weekEnd.getTime();
    });

    const totalVolume = weekSessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);
    const totalDuration = weekSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    const totalSets = weekSessions.reduce((acc, s) => acc + (s.total_sets || 0), 0);

    result.push({
      weekLabel: label,
      startDate: startStr,
      workoutCount: weekSessions.length,
      totalVolumeKg: Math.round(totalVolume),
      totalDurationMinutes: totalDuration,
      totalSets
    });
  }

  return result;
}

/**
 * Groups sessions into the last N months of training stats.
 */
export function getMonthlyWorkoutStats(
  sessions: WorkoutSessionLog[],
  monthsCount: number = 6
): MonthlyStats[] {
  const result: MonthlyStats[] = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

    const monthSessions = sessions.filter((s) => {
      const st = new Date(s.log_date || s.completed_at).getTime();
      return st >= monthStart && st <= monthEnd;
    });

    const totalVolume = monthSessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);
    const totalDuration = monthSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

    result.push({
      monthLabel,
      monthKey,
      workoutCount: monthSessions.length,
      totalVolumeKg: Math.round(totalVolume),
      totalDurationMinutes: totalDuration
    });
  }

  return result;
}

/**
 * Extracts chronological progression data for a specific exercise across all historical sessions.
 */
export function getExerciseProgressionData(
  sessions: WorkoutSessionLog[],
  exerciseId: string
): ExerciseProgressPoint[] {
  if (!sessions || sessions.length === 0 || !exerciseId) return [];

  // Sort sessions chronologically (oldest to newest)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.log_date || a.completed_at).getTime() - new Date(b.log_date || b.completed_at).getTime()
  );

  const points: ExerciseProgressPoint[] = [];

  for (const session of sortedSessions) {
    const targetEx = session.exercises?.find((e) => e.exerciseId === exerciseId);
    if (!targetEx || !targetEx.sets || targetEx.sets.length === 0) continue;

    const completedSets = targetEx.sets.filter((s) => s.completed);
    if (completedSets.length === 0) continue;

    let maxWeight = 0;
    let maxEst1RM = 0;
    let totalVolume = 0;
    let bestSet: WorkoutSet = completedSets[0];

    for (const set of completedSets) {
      const weight = set.actualWeightKg ?? set.targetWeightKg ?? 0;
      const reps = set.actualReps ?? set.targetReps ?? 0;
      const est1RM = set.estimated1RM ?? (weight > 0 && reps > 0 ? Math.round(weight * (1 + reps / 30)) : 0);
      
      const setVol = weight * reps;
      totalVolume += setVol;

      if (weight > maxWeight) {
        maxWeight = weight;
      }
      if (est1RM > maxEst1RM) {
        maxEst1RM = est1RM;
        bestSet = set;
      }
    }

    points.push({
      date: session.log_date || session.completed_at.split('T')[0],
      sessionId: session.id,
      routineName: session.routine_name,
      maxWeightKg: maxWeight,
      bestEstimated1RM: maxEst1RM,
      totalVolumeKg: totalVolume,
      totalSets: completedSets.length,
      bestSet: {
        weightKg: bestSet.actualWeightKg ?? bestSet.targetWeightKg ?? 0,
        reps: bestSet.actualReps ?? bestSet.targetReps ?? 0,
        setType: bestSet.type || 'normal',
        isPR: bestSet.isPR
      }
    });
  }

  return points;
}
