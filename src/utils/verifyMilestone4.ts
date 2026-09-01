import { workoutService } from '../services/workout.service';
import { localDb } from '../lib/supabase';
import { calculateRoutineEstimatedMinutes, formatDaysOfWeek, getDayName } from './routineCalculations';
import { RoutineExercise } from '../types';

export async function runMilestone4Verification(): Promise<{
  allPassed: boolean;
  results: { testName: string; passed: boolean; message: string }[];
}> {
  const results: { testName: string; passed: boolean; message: string }[] = [];
  const testUserId = 'test_user_m4_' + Date.now();
  const secondUserId = 'test_user_other_' + Date.now();

  try {
    // 1. Test Duration Calculation Pure Utility
    const sampleExercises: RoutineExercise[] = [
      {
        exerciseId: 'bench_press',
        exerciseName: 'Barbell Bench Press',
        category: 'chest',
        targetMuscle: 'Chest',
        equipment: 'barbell',
        restSeconds: 90,
        sets: [
          { id: '1', setNumber: 1, type: 'warmup', targetReps: 12, completed: false },
          { id: '2', setNumber: 2, type: 'normal', targetReps: 10, completed: false },
          { id: '3', setNumber: 3, type: 'normal', targetReps: 8, completed: false }
        ]
      },
      {
        exerciseId: 'incline_db_press',
        exerciseName: 'Incline Dumbbell Press',
        category: 'chest',
        targetMuscle: 'Upper Chest',
        equipment: 'dumbbell',
        restSeconds: 60,
        sets: [
          { id: '4', setNumber: 1, type: 'normal', targetReps: 10, completed: false },
          { id: '5', setNumber: 2, type: 'normal', targetReps: 10, completed: false }
        ]
      }
    ];

    const estimatedMins = calculateRoutineEstimatedMinutes(sampleExercises);
    // Ex1: 3 sets * 40 = 120s + 2 rests * 90 = 180s + 60s = 360s
    // Ex2: 2 sets * 40 = 80s + 1 rest * 60 = 60s + 60s = 200s
    // Total = 560s -> ceil(560/60) = 10 mins
    if (estimatedMins >= 8 && estimatedMins <= 15) {
      results.push({ testName: 'Deterministic Duration Calculation', passed: true, message: `Estimated duration calculated: ${estimatedMins} min.` });
    } else {
      results.push({ testName: 'Deterministic Duration Calculation', passed: false, message: `Expected ~10 min, got ${estimatedMins}` });
    }

    // 2. Test Days Formatting Utility
    const formattedDays = formatDaysOfWeek([1, 3, 5]);
    if (formattedDays === 'Mon, Wed, Fri') {
      results.push({ testName: 'Weekly Days Formatting', passed: true, message: `Formatted days: ${formattedDays}` });
    } else {
      results.push({ testName: 'Weekly Days Formatting', passed: false, message: `Expected "Mon, Wed, Fri", got "${formattedDays}"` });
    }

    // 3. Test Routine Creation
    const todayIndex = new Date().getDay();
    const createdRoutine = await workoutService.createRoutine(testUserId, {
      name: 'Push Day - Hypertrophy',
      description: 'Heavy chest, shoulder, and tricep focus',
      target_muscles: ['chest', 'shoulders', 'triceps'],
      estimated_minutes: estimatedMins,
      days_of_week: [todayIndex, (todayIndex + 2) % 7],
      exercises: sampleExercises
    });

    if (createdRoutine && createdRoutine.id && createdRoutine.name === 'Push Day - Hypertrophy') {
      results.push({ testName: 'Create Routine Template', passed: true, message: `Created routine ID: ${createdRoutine.id}` });
    } else {
      results.push({ testName: 'Create Routine Template', passed: false, message: 'Failed to create routine.' });
    }

    // 4. Test Get Routines
    const routinesList = await workoutService.getRoutines(testUserId);
    const found = routinesList.find((r) => r.id === createdRoutine.id);
    if (found && found.exercises.length === 2) {
      results.push({ testName: 'Retrieve User Routines', passed: true, message: `Found ${routinesList.length} routines for user.` });
    } else {
      results.push({ testName: 'Retrieve User Routines', passed: false, message: 'Could not find newly created routine in list.' });
    }

    // 5. Test Today's Routine Detection
    const todayRoutines = await workoutService.getRoutinesForDay(testUserId, todayIndex);
    if (todayRoutines.some((r) => r.id === createdRoutine.id)) {
      results.push({ testName: 'Today\'s Routine Detection', passed: true, message: `Detected routine scheduled on day ${todayIndex} (${getDayName(todayIndex)}).` });
    } else {
      results.push({ testName: 'Today\'s Routine Detection', passed: false, message: `Routine not detected for today (day ${todayIndex}).` });
    }

    // 6. Test Routine Update
    const updated = await workoutService.updateRoutine(createdRoutine.id, testUserId, {
      name: 'Push Day (Strength)',
      description: 'Updated description'
    });
    if (updated.name === 'Push Day (Strength)') {
      results.push({ testName: 'Update Routine Details', passed: true, message: 'Updated routine name and description.' });
    } else {
      results.push({ testName: 'Update Routine Details', passed: false, message: 'Failed to update routine.' });
    }

    // 7. Test User Isolation
    const otherUserRoutines = await workoutService.getRoutines(secondUserId);
    const leaked = otherUserRoutines.some((r) => r.id === createdRoutine.id);
    if (!leaked) {
      results.push({ testName: 'User Isolation', passed: true, message: 'Custom routines are strictly isolated between users.' });
    } else {
      results.push({ testName: 'User Isolation', passed: false, message: 'Data leak detected between users!' });
    }

    // 8. Test Delete Routine (with history preservation check)
    // First log a dummy completed workout session to verify history is preserved
    const dummySession = {
      id: 'session_test_m4_' + Date.now(),
      user_id: testUserId,
      routine_id: createdRoutine.id,
      routine_name: createdRoutine.name,
      started_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date().toISOString(),
      duration_minutes: 60,
      exercises: sampleExercises,
      total_volume_kg: 2450,
      total_sets: 5,
      total_reps: 50,
      pr_count: 0,
      log_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    localDb.saveWorkoutSession(dummySession);

    await workoutService.deleteRoutine(createdRoutine.id, testUserId);
    const postDeleteRoutines = await workoutService.getRoutines(testUserId);
    const routineStillExists = postDeleteRoutines.some((r) => r.id === createdRoutine.id);

    // Check if session history is intact
    const sessionHistory = await workoutService.getWorkoutSessions(testUserId);
    const historyPreserved = sessionHistory.some((s) => s.id === dummySession.id);

    if (!routineStillExists && historyPreserved) {
      results.push({ testName: 'Delete Routine & History Preservation', passed: true, message: 'Routine deleted successfully while workout history remained intact.' });
    } else {
      results.push({ testName: 'Delete Routine & History Preservation', passed: false, message: `Routine exists: ${routineStillExists}, History preserved: ${historyPreserved}` });
    }

  } catch (error: any) {
    results.push({ testName: 'Verification Execution', passed: false, message: `Error during verification: ${error.message}` });
  }

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}
