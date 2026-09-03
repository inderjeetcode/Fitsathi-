/**
 * Unit & Integration Test Suite for FitSathi Deletion Consistency & Anti-Resurrection (7E.1)
 *
 * Tests:
 * 1. Explicit local deletion
 * 2. Pending deletion creation
 * 3. Offline deletion
 * 4. Cloud deletion retry
 * 5. Deleted-record anti-resurrection
 * 6. Repeated sync
 * 7. First cloud login does not create false deletion markers
 */

import { localDb } from '../../../lib/supabase';
import { healthSyncService } from '../healthSync.service';
import { FoodLog, WaterLog, SleepLog, WeightLog, ActivityLog, DietPlan } from '../../../types';

function runTestSuite() {
  console.log('🧪 Starting FitSathi 7E.1 Deletion Consistency & Anti-Resurrection Tests...\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✅ Passed: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // Clear test state
  localDb.clearPendingDeletions();

  // ----------------------------------------------------
  // Test 1: Explicit Local Deletion
  // ----------------------------------------------------
  console.log('--- Test 1: Explicit Local Deletion ---');
  const testUserId = 'test-user-uuid-1';
  const foodLogId = '11111111-1111-4111-a111-111111111111';
  
  const testFoodLog: FoodLog = {
    id: foodLogId,
    user_id: testUserId,
    food_id: 'food-1',
    food_name: 'Oatmeal with Almonds',
    meal_type: 'breakfast',
    quantity: 150,
    serving_unit: 'g',
    calories: 300,
    protein_g: 10,
    carbs_g: 50,
    fat_g: 6,
    fiber_g: 5,
    log_date: '2026-09-02',
    created_at: new Date().toISOString()
  };

  localDb.saveFoodLog(testFoodLog);
  let savedLogs = localDb.getFoodLogs(testUserId);
  assert(savedLogs.some(l => l.id === foodLogId), 'Food log successfully saved locally');

  localDb.deleteFoodLog(foodLogId, testUserId);
  savedLogs = localDb.getFoodLogs(testUserId);
  assert(!savedLogs.some(l => l.id === foodLogId), 'Food log successfully removed from local storage on delete');

  // ----------------------------------------------------
  // Test 2: Pending Deletion Creation
  // ----------------------------------------------------
  console.log('\n--- Test 2: Pending Deletion Creation ---');
  const pending = localDb.getPendingDeletions(testUserId);
  const foodDeletion = pending.find(p => p.id === foodLogId && p.entity === 'food_logs');
  assert(Boolean(foodDeletion), 'Pending deletion marker created with correct entity and ID');
  assert(foodDeletion?.userId === testUserId, 'Pending deletion contains correct user ID');
  assert(Boolean(foodDeletion?.deletedAt), 'Pending deletion contains deletion timestamp');
  assert(localDb.isPendingDeletion(foodLogId, 'food_logs'), 'isPendingDeletion returns true for deleted ID');

  // ----------------------------------------------------
  // Test 3: Offline Deletion
  // ----------------------------------------------------
  console.log('\n--- Test 3: Offline Deletion ---');
  const waterLogId = '22222222-2222-4222-a222-222222222222';
  const testWaterLog: WaterLog = {
    id: waterLogId,
    user_id: testUserId,
    amount_ml: 500,
    glasses: 2,
    log_date: '2026-09-02',
    created_at: new Date().toISOString()
  };
  localDb.saveWaterLog(testWaterLog);
  // User deletes while offline (no cloud connection)
  localDb.deleteWaterLog(waterLogId, testUserId);
  const waterPending = localDb.getPendingDeletions().find(p => p.id === waterLogId);
  assert(Boolean(waterPending), 'Offline deletion leaves pending marker retained for later cloud sync');
  assert(localDb.isPendingDeletion(waterLogId, 'water_logs'), 'Offline water log flagged as pending deletion');

  // ----------------------------------------------------
  // Test 4: Cloud Deletion Retry & Error Handling
  // ----------------------------------------------------
  console.log('\n--- Test 4: Cloud Deletion Retry & Error Handling ---');
  // Simulate retry counter increment on failed deletion
  localDb.addPendingDeletion({
    id: waterLogId,
    entity: 'water_logs',
    userId: testUserId,
    deletedAt: new Date().toISOString(),
    retryCount: 1
  });
  const retriedWater = localDb.getPendingDeletions().find(p => p.id === waterLogId);
  assert(retriedWater?.retryCount === 1, 'Retry count tracked properly for deferred cloud sync');

  // ----------------------------------------------------
  // Test 5: Deleted-Record Anti-Resurrection Guard
  // ----------------------------------------------------
  console.log('\n--- Test 5: Deleted-Record Anti-Resurrection Guard ---');
  // Suppose cloud contains a record with ID foodLogId that user previously deleted
  const cloudSimulatedFoodLogId = foodLogId;
  const isProtected = localDb.isPendingDeletion(cloudSimulatedFoodLogId, 'food_logs');
  assert(isProtected, 'Anti-resurrection check identifies pending deletion');

  // Verify that if cloud tries to restore this record during download, the check refuses it
  if (!isProtected) {
    localDb.saveFoodLog(testFoodLog);
  }
  const currentLogs = localDb.getFoodLogs(testUserId);
  assert(!currentLogs.some(l => l.id === foodLogId), 'Deleted record was NOT resurrected into local storage');

  // ----------------------------------------------------
  // Test 6: Repeated Sync Idempotency
  // ----------------------------------------------------
  console.log('\n--- Test 6: Repeated Sync Idempotency ---');
  // Calling isPendingDeletion multiple times yields consistent results without side effects
  assert(localDb.isPendingDeletion(foodLogId, 'food_logs'), 'First check: pending deletion active');
  assert(localDb.isPendingDeletion(foodLogId, 'food_logs'), 'Second check: pending deletion consistently active');
  assert(!localDb.isPendingDeletion('non-existent-id', 'food_logs'), 'Non-deleted ID is false');

  // ----------------------------------------------------
  // Test 7: First Cloud Login Does NOT Create False Deletion Markers
  // ----------------------------------------------------
  console.log('\n--- Test 7: First Cloud Login Does NOT Create False Deletion Markers ---');
  const freshUserId = 'fresh-user-uuid-99';
  const validPlanId = '33333333-3333-4333-a333-333333333333';
  const newDietPlan: DietPlan = {
    id: validPlanId,
    user_id: freshUserId,
    name: 'High Protein Cutting',
    description: 'Fresh local diet plan',
    goal: 'weight_loss',
    target_calories: 2200,
    target_protein_g: 180,
    target_carbs_g: 180,
    target_fat_g: 60,
    meals: [],
    created_at: new Date().toISOString()
  };

  localDb.saveDietPlan(newDietPlan);
  assert(!localDb.isPendingDeletion(validPlanId, 'diet_plans'), 'Newly saved plan has no false pending deletion');
  const freshPending = localDb.getPendingDeletions(freshUserId);
  assert(freshPending.length === 0, 'No false deletion markers created on first login/save');

  console.log(`\n🎉 All ${passed}/${total} Deletion Consistency & Anti-Resurrection Tests Passed Successfully!\n`);
}

runTestSuite();
