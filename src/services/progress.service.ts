import { nutritionService } from './nutrition.service';
import { waterService } from './water.service';
import { activityService } from './activity.service';
import { sleepService } from './sleep.service';
import { weightService } from './weight.service';

export interface DailyDataPoint {
  date: string;
  displayDate: string;
  weight?: number;
  steps?: number;
  calories?: number;
  caloriesConsumed?: number;
  protein?: number;
  waterGlasses?: number;
  sleepHours?: number;
}

export const progressService = {
  async getReportData(userId: string, days: number = 7): Promise<DailyDataPoint[]> {
    const [foodLogs, waterLogs, activityLogs, sleepLogs, weightLogs] = await Promise.all([
      nutritionService.getFoodLogs(userId),
      waterService.getWaterLogs(userId),
      activityService.getActivityLogs(userId),
      sleepService.getSleepLogs(userId),
      weightService.getWeightLogs(userId)
    ]);

    const result: DailyDataPoint[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

      // Daily totals
      const dayFoods = foodLogs.filter(f => f.log_date === dateStr);
      const calories = dayFoods.reduce((acc, c) => acc + (c.calories || 0), 0);
      const protein = dayFoods.reduce((acc, c) => acc + (c.protein_g || 0), 0);

      const dayWater = waterLogs.filter(w => w.log_date === dateStr);
      const waterGlasses = dayWater.reduce((acc, c) => acc + (c.glasses || 0), 0);

      const dayActivity = activityLogs.filter(a => a.log_date === dateStr);
      const steps = dayActivity.reduce((acc, c) => acc + (c.steps || 0), 0);

      const daySleep = sleepLogs.find(s => s.log_date === dateStr);
      const sleepHours = daySleep ? Number((daySleep.duration_minutes / 60).toFixed(1)) : undefined;

      const dayWeight = weightLogs.find(w => w.log_date === dateStr);
      const weight = dayWeight ? dayWeight.weight_kg : undefined;

      result.push({
        date: dateStr,
        displayDate,
        weight,
        steps: steps > 0 ? steps : undefined,
        calories: calories > 0 ? calories : undefined,
        caloriesConsumed: calories,
        protein: protein > 0 ? Number(protein.toFixed(1)) : undefined,
        waterGlasses: waterGlasses > 0 ? waterGlasses : undefined,
        sleepHours
      });
    }

    return result;
  },

  async getProgressSummary(userId: string, days: number = 7): Promise<DailyDataPoint[]> {
    return this.getReportData(userId, days);
  }
};
