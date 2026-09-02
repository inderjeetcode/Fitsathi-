import { localDb } from '../lib/supabase';
import { supabase } from '../lib/supabaseClient';

let running = false;

export async function syncHealthData(userId: string): Promise<void> {
  if (!supabase || running) return;
  running = true;
  try {
    const push = async (table: string, rows: any[]) => {
      if (!rows.length) return;
      const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
      if (error) throw error;
    };

    // Health data is pushed from the local-first app. We intentionally do not
    // hydrate localStorage from cloud rows here because several legacy localDb
    // save methods append records; blindly pulling every 30 seconds would create
    // duplicates. A dedicated reconciliation layer should be added before enabling
    // bidirectional health pulls.
    await push('food_logs', localDb.getFoodLogs(userId));
    await push('water_logs', localDb.getWaterLogs(userId));
    await push('sleep_logs', localDb.getSleepLogs(userId));
    await push('activity_logs', localDb.getActivityLogs(userId));
    await push('weight_logs', localDb.getWeightLogs(userId));
    await push('custom_foods', localDb.getCustomFoods(userId));
    await push('diet_plans', localDb.getDietPlans(userId));
  } catch (error) {
    console.warn('[FitSathi] Health cloud sync deferred:', error);
  } finally {
    running = false;
  }
}
