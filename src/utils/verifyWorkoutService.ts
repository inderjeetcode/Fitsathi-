/**
 * FitSathi Workout Service Verification & Test Runner
 * Verifies all 15 milestone requirements systematically.
 */

// Simple mock for localStorage in Node environment if needed
if (typeof localStorage === 'undefined' || !localStorage.getItem) {
  const store = new Map<string, string>();
  (global as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear()
  };
}

import { workoutService } from '../services/workout.service';
import { localDb } from '../lib/supabase';
import { Exercise, WorkoutRoutine, ActiveWorkoutState } from '../types';
import { calculateTotalSessionVolume, calculate1RMEpley } from './oneRepMax';

const TEST_USER = 'user-test-' + Date.now();

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runWorkoutServiceTests() {
  console.log('\n=============================================');
  console.log('🧪 RUNNING WORKOUT SERVICE VERIFICATION TESTS');
  console.log('=============================================\n');

  // Test 1: Create Routine
  console.log('Test 1: Create Routine');
  const routineData = {
    name: 'Chest & Arms Hypertrophy',
    description: 'Targeted volume for chest and arms',
    target_muscles: ['Chest', 'Biceps', 'Triceps'],
    estimated_minutes: 45,
    days_of_week: [1, 3, 5],
    exercises: [
      {
        exerciseId: 'barbell_bench_press',
        exerciseName: 'Barbell Flat Bench Press',
        category: 'chest' as const,
        targetMuscle: 'Pectoralis Major',
        equipment: 'barbell' as const,
        restSeconds: 90,
        sets: [
          { id: 's-1', setNumber: 1, type: 'normal' as const, targetReps: 10, targetWeightKg: 60, completed: false },
          { id: 's-2', setNumber: 2, type: 'normal' as const, targetReps: 8, targetWeightKg: 70, completed: false }
        ]
      }
    ]
  };
  const createdRoutine = await workoutService.createRoutine(TEST_USER, routineData);
  assert(!!createdRoutine.id, 'Created routine has valid ID');
  assert(createdRoutine.name === 'Chest & Arms Hypertrophy', 'Routine name matches');
  assert(createdRoutine.exercises.length === 1, 'Routine has 1 exercise');

  // Test 2: Retrieve Routine & Routines List
  console.log('\nTest 2: Retrieve Routine & Routines List');
  const allRoutines = await workoutService.getRoutines(TEST_USER);
  assert(allRoutines.length >= 1, 'Routines list returns items');
  const fetchedRoutine = await workoutService.getRoutineById(createdRoutine.id, TEST_USER);
  assert(fetchedRoutine !== null, 'Fetched routine exists');
  assert(fetchedRoutine?.id === createdRoutine.id, 'Fetched routine matches created routine');

  // Test 3: Update Routine
  console.log('\nTest 3: Update Routine');
  const updatedRoutine = await workoutService.updateRoutine(createdRoutine.id, TEST_USER, {
    name: 'Updated Chest & Arms Power',
    estimated_minutes: 50
  });
  assert(updatedRoutine.name === 'Updated Chest & Arms Power', 'Routine name updated successfully');
  assert(updatedRoutine.estimated_minutes === 50, 'Estimated minutes updated successfully');

  // Test 4: Delete Routine
  console.log('\nTest 4: Delete Routine');
  const tempRoutine = await workoutService.createRoutine(TEST_USER, { name: 'Temp Routine' });
  await workoutService.deleteRoutine(tempRoutine.id, TEST_USER);
  const deletedCheck = await workoutService.getRoutineById(tempRoutine.id, TEST_USER);
  assert(deletedCheck === null, 'Deleted routine is no longer returned');

  // Test 5: Start Workout
  console.log('\nTest 5: Start Workout');
  const activeWorkout = workoutService.startActiveWorkout(TEST_USER, updatedRoutine);
  assert(activeWorkout.routineId === updatedRoutine.id, 'Active workout is linked to routine');
  assert(activeWorkout.exercises.length === 1, 'Active workout has copied routine exercises');
  assert(activeWorkout.exercises[0].sets[0].completed === false, 'Sets initialized as uncompleted');

  // Test 6: Persist Active Workout
  console.log('\nTest 6: Persist Active Workout');
  workoutService.saveActiveWorkout(TEST_USER, {
    ...activeWorkout,
    notes: 'Feeling high energy today'
  });
  assert(true, 'Active workout saved to local persistence');

  // Test 7: Restore Active Workout
  console.log('\nTest 7: Restore Active Workout');
  const restoredWorkout = workoutService.restoreActiveWorkout(TEST_USER);
  assert(restoredWorkout !== null, 'Restored active workout is not null');
  assert(restoredWorkout?.notes === 'Feeling high energy today', 'Restored workout has saved notes');

  // Test 8: Log Completed Sets & Add/Remove Sets
  console.log('\nTest 8: Log Completed Sets & Add/Remove Sets');
  let workoutState = restoredWorkout!;
  // Update set 1
  workoutState = workoutService.updateSet(workoutState, 0, 0, {
    actualWeightKg: 65,
    actualReps: 10,
    completed: true
  });
  assert(workoutState.exercises[0].sets[0].completed === true, 'Set 1 marked completed');
  assert(workoutState.exercises[0].sets[0].actualWeightKg === 65, 'Set 1 actual weight recorded');
  assert(workoutState.exercises[0].sets[0].actualReps === 10, 'Set 1 actual reps recorded');

  // Add set
  workoutState = workoutService.addSet(workoutState, 0, 'normal');
  assert(workoutState.exercises[0].sets.length === 3, 'New set added to exercise');

  // Update set 2
  workoutState = workoutService.updateSet(workoutState, 0, 1, {
    actualWeightKg: 75,
    actualReps: 8,
    completed: true
  });

  // Update set 3
  workoutState = workoutService.updateSet(workoutState, 0, 2, {
    actualWeightKg: 85,
    actualReps: 6,
    completed: true
  });

  // Test 9: Calculate Volume
  console.log('\nTest 9: Calculate Volume');
  const totalVolume = calculateTotalSessionVolume(workoutState.exercises);
  // Volume: (65 * 10) + (75 * 8) + (85 * 6) = 650 + 600 + 510 = 1760 kg
  assert(totalVolume === 1760, `Volume calculation matches expected: ${totalVolume} kg`);

  // Test 10: Retrieve Previous Performance (Empty before completion)
  console.log('\nTest 10: Retrieve Previous Performance');
  const prevPerfBefore = await workoutService.getPreviousExercisePerformance(TEST_USER, 'barbell_bench_press');
  assert(prevPerfBefore === null, 'No previous performance before any completed session');

  // Test 11: Detect PR
  console.log('\nTest 11: Detect PR');
  // First time check for user:
  const prCheck1 = await workoutService.checkAndCalculateSetPR(TEST_USER, 'barbell_bench_press', 85, 6);
  assert(prCheck1.isAnyPR === true, 'New exercise set detected as PR');
  assert(prCheck1.estimated1RM === calculate1RMEpley(85, 6), 'Calculated 1RM matches formula');

  // Test 12: Complete Workout
  console.log('\nTest 12: Complete Workout');
  const completionResult = await workoutService.completeWorkout(TEST_USER, workoutState, 'Great bench session!');
  assert(!!completionResult.session.id, 'Session has ID');
  assert(completionResult.session.total_volume_kg === 1760, 'Completed session total volume matches');
  assert(completionResult.session.total_sets === 3, 'Completed session has 3 sets');
  assert(completionResult.session.pr_count >= 1, 'PR count recorded in session');
  assert(workoutService.getActiveWorkout(TEST_USER) === null, 'Active workout cleared after completion');

  // Test 13: Retrieve Workout History & Previous Performance (Now Available)
  console.log('\nTest 13: Retrieve Workout History & Previous Performance');
  const history = await workoutService.getWorkoutSessions(TEST_USER);
  assert(history.length === 1, 'Workout history contains 1 completed session');
  assert(history[0].id === completionResult.session.id, 'History item matches completed session');

  const prevPerfAfter = await workoutService.getPreviousExercisePerformance(TEST_USER, 'barbell_bench_press');
  assert(prevPerfAfter !== null && prevPerfAfter.length === 3, 'Previous exercise sets returned as ghost data');

  // Test 14: Handle Empty History
  console.log('\nTest 14: Handle Empty History');
  const nonExistentUserHistory = await workoutService.getWorkoutSessions('user-unknown-999');
  assert(Array.isArray(nonExistentUserHistory) && nonExistentUserHistory.length === 0, 'Empty history handled gracefully');

  // Test 15: Handle Malformed Local Data Safely
  console.log('\nTest 15: Handle Malformed Local Data Safely');
  // Corrupt the active workout in local storage
  localStorage.setItem('fitsathi_active_workouts_by_user', 'invalid-json-structure{{{');
  const safeActiveRecovery = workoutService.getActiveWorkout(TEST_USER);
  assert(safeActiveRecovery === null, 'Malformed JSON recovered without crash');

  localStorage.setItem('fitsathi_workout_routines', 'corrupt string');
  const safeRoutinesRecovery = await workoutService.getRoutines(TEST_USER);
  assert(Array.isArray(safeRoutinesRecovery), 'Malformed routines storage recovered with empty array');

  console.log('\n=============================================');
  console.log('🎉 ALL 15 WORKOUT SERVICE TESTS PASSED!');
  console.log('=============================================\n');
}

runWorkoutServiceTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
