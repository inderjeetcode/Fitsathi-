import { RoutineExercise } from '../types';

/**
 * Deterministically calculates the estimated duration in minutes for a routine.
 * Formula:
 * - Each set takes ~40 seconds of active exertion.
 * - Add rest period between sets.
 * - Add 60 seconds transition time between different exercises.
 * - Total rounded to nearest minute (minimum 5 minutes).
 */
export function calculateRoutineEstimatedMinutes(exercises: RoutineExercise[]): number {
  if (!exercises || exercises.length === 0) return 0;

  let totalSeconds = 0;

  exercises.forEach((ex) => {
    const setCount = ex.sets?.length || 0;
    const restPerSet = ex.restSeconds || 60;

    // Active exertion + rest per set
    // Note: Last set doesn't need full rest before next exercise, but transition takes time
    totalSeconds += setCount * 40; // 40s per set
    totalSeconds += Math.max(0, setCount - 1) * restPerSet; // Rest between sets
    totalSeconds += 60; // 1 min setup & transition per exercise
  });

  const minutes = Math.ceil(totalSeconds / 60);
  return Math.max(5, minutes);
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getDayName(dayIndex: number, short: boolean = false): string {
  if (dayIndex < 0 || dayIndex > 6) return '';
  return short ? DAY_SHORT_NAMES[dayIndex] : DAY_NAMES[dayIndex];
}

export function formatDaysOfWeek(days: number[]): string {
  if (!days || days.length === 0) return 'Not scheduled';
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays (Mon-Fri)';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends (Sat-Sun)';

  const sorted = [...days].sort((a, b) => a - b);
  return sorted.map((d) => DAY_SHORT_NAMES[d]).join(', ');
}
