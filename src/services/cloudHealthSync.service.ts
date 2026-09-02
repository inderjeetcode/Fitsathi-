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

    await push('food_logs', localDb.getFoodLogs(userId));
    await push('water_logs', localDb.getWaterLogs(userId));
    await push('sleep_logs', localDb.getSleepLogs(userId));
    await push('activity_logs', localDb.getActivityLogs(userId));
    await push('weight_logs', localDb.getWeightLogs(userId));
    await push('custom_foods', localDb.getCustomFoods(userId));
    await push('diet_plans', localDb.getDietPlans(userId));

    // Pulling is deliberately conservative: only hydrate local records owned by this user.
    const tables = ['food_logs','water_logs','sleep_logs','activity_logs','weight_logs','custom_foods','diet_plans'];
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').eq('user_id', userId);
      if (error) throw error;
      if (!data) continue;
      for (const row of data) {
        if (table === 'food_logs') localDb.saveFoodLog(row);
        else if (table === 'water_logs') localDb.saveWaterLog(row);
        else if (table === 'sleep_logs') localDb.saveSleepLog(row);
        else if (table === 'activity_logs') localDb.saveActivityLog(row);
        else if (table === 'weight_logs') localDb.saveWeightLog(row);
        else if (table === 'custom_foods') localDb.saveCustomFood(row);
        else if (table === 'diet_plans') localDb.saveDietPlan(row);
      }
    }
  } catch (error) {
    console.warn('[FitSathi] Health cloud sync deferred:', error);
  } finally {
    running = false;
  }
}
