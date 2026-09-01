import { exerciseService } from '../services/exercise.service';
import { workoutService } from '../services/workout.service';
import { INITIAL_EXERCISES } from '../data/exercises';

export function runExerciseLibraryVerification(): { success: boolean; results: string[] } {
  const results: string[] = [];
  let success = true;

  function logPass(msg: string) {
    results.push(`✅ PASS: ${msg}`);
  }

  function logFail(msg: string) {
    results.push(`❌ FAIL: ${msg}`);
    success = false;
  }

  try {
    // Test 1: Database Validation
    const dbValidation = exerciseService.validateDatabase();
    if (dbValidation.valid && dbValidation.totalCount > 30) {
      logPass(`Database integrity verified. Total exercises: ${dbValidation.totalCount}`);
    } else {
      logFail(`Database validation issues: ${dbValidation.errors.join(', ')}`);
    }

    // Test 2: Category Listing
    const categories = exerciseService.getAvailableCategories();
    if (categories.length >= 9 && categories[0].id === 'all') {
      logPass(`Available categories retrieved correctly (${categories.length} categories)`);
    } else {
      logFail(`Expected >=9 categories with 'all' as first item.`);
    }

    // Test 3: Equipment Listing
    const equipment = exerciseService.getAvailableEquipment();
    if (equipment.length >= 8 && equipment[0].id === 'all') {
      logPass(`Available equipment retrieved correctly (${equipment.length} equipment types)`);
    } else {
      logFail(`Expected >=8 equipment types.`);
    }

    // Test 4: Category Filtering (e.g. Chest)
    const chestExercises = exerciseService.getExercises({ category: 'chest' });
    const allAreChest = chestExercises.every((ex) => ex.category === 'chest');
    if (chestExercises.length > 0 && allAreChest) {
      logPass(`Category filter (chest) returned ${chestExercises.length} valid chest exercises`);
    } else {
      logFail(`Category filter (chest) failed or returned empty.`);
    }

    // Test 5: Equipment Filtering (e.g. Dumbbell)
    const dumbbellExercises = exerciseService.getExercises({ equipment: 'dumbbell' });
    const allAreDumbbell = dumbbellExercises.every((ex) => ex.equipment === 'dumbbell');
    if (dumbbellExercises.length > 0 && allAreDumbbell) {
      logPass(`Equipment filter (dumbbell) returned ${dumbbellExercises.length} valid dumbbell exercises`);
    } else {
      logFail(`Equipment filter (dumbbell) failed.`);
    }

    // Test 6: Combined Filtering (Chest + Dumbbell)
    const chestDumbbells = exerciseService.getExercises({ category: 'chest', equipment: 'dumbbell' });
    const allMatchBoth = chestDumbbells.every((ex) => ex.category === 'chest' && ex.equipment === 'dumbbell');
    if (chestDumbbells.length > 0 && allMatchBoth) {
      logPass(`Combined filter (chest + dumbbell) returned ${chestDumbbells.length} exercises correctly`);
    } else {
      logFail(`Combined filter failed.`);
    }

    // Test 7: Name Search
    const searchBench = exerciseService.getExercises({ searchQuery: 'bench' });
    if (searchBench.length > 0 && searchBench.some((ex) => ex.name.toLowerCase().includes('bench'))) {
      logPass(`Search query "bench" returned ${searchBench.length} matching exercises`);
    } else {
      logFail(`Search query for "bench" returned no results.`);
    }

    // Test 8: Hindi Name Search
    const searchHindi = exerciseService.getExercises({ searchQuery: 'बेंच' });
    if (searchHindi.length > 0) {
      logPass(`Search query for Hindi term "बेंच" returned ${searchHindi.length} exercises`);
    } else {
      logFail(`Hindi search failed.`);
    }

    // Test 9: Get Exercise By ID
    const exId = INITIAL_EXERCISES[0].id;
    const fetched = exerciseService.getExerciseById(exId);
    if (fetched && fetched.id === exId) {
      logPass(`getExerciseById for "${exId}" succeeded.`);
    } else {
      logFail(`getExerciseById failed for ${exId}`);
    }

    // Test 10: Non-existent ID returns null
    const nonExistent = exerciseService.getExerciseById('non_existent_exercise_xyz');
    if (nonExistent === null) {
      logPass(`getExerciseById correctly returned null for non-existent ID.`);
    } else {
      logFail(`getExerciseById should return null for invalid IDs.`);
    }

    // Test 11: Add to Workout integration with workoutService
    const testUserId = 'test-user-ex-lib-01';
    const testExercise = INITIAL_EXERCISES[0];
    const session = workoutService.startActiveWorkout(testUserId, null, 'Test Session');
    const updated = workoutService.addExerciseToActiveWorkout(session, testExercise, 3);
    workoutService.saveActiveWorkout(testUserId, updated);

    const reloaded = workoutService.getActiveWorkout(testUserId);
    if (reloaded && reloaded.exercises.length === 1 && reloaded.exercises[0].exerciseId === testExercise.id) {
      logPass(`Exercise successfully integrated and persisted to active workout session`);
    } else {
      logFail(`Failed to persist exercise to active workout.`);
    }

    // Cleanup test session
    workoutService.discardActiveWorkout(testUserId);

  } catch (err: any) {
    logFail(`Unexpected exception during verification: ${err?.message || String(err)}`);
  }

  return { success, results };
}

// Auto-run if executed in node/tsx
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('verifyExerciseLibrary')) {
  const { success, results } = runExerciseLibraryVerification();
  console.log('\n--- EXERCISE LIBRARY VERIFICATION RESULTS ---');
  results.forEach((r) => console.log(r));
  console.log(`\nFINAL STATUS: ${success ? 'ALL PASSED' : 'SOME TESTS FAILED'}\n`);
  if (!success) process.exit(1);
}
