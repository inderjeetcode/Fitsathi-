import React from 'react';
import { ProgressChart } from '../components/Dashboard/ProgressChart';
import { DailyDataPoint } from '../services/progress.service';
import { TrendingUp, Flame, Zap, Droplet, Moon, Scale } from 'lucide-react';
import { UserProfile } from '../types';

interface ProgressPageProps {
  user: UserProfile;
  progressData: DailyDataPoint[];
  days: number;
  onDaysChange: (days: number) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  user,
  progressData,
  days,
  onDaysChange
}) => {
  const points = progressData.slice(-days);
  const totalCalories = points.reduce((acc, c) => acc + (c.caloriesConsumed || 0), 0);
  const avgCalories = Math.round(totalCalories / (points.length || 1));

  const totalSteps = points.reduce((acc, c) => acc + (c.steps || 0), 0);
  const avgSteps = Math.round(totalSteps / (points.length || 1));

  const totalWater = points.reduce((acc, c) => acc + (c.waterGlasses || 0), 0);
  const avgWater = (totalWater / (points.length || 1)).toFixed(1);

  const totalSleep = points.reduce((acc, c) => acc + (c.sleepHours || 0), 0);
  const avgSleep = (totalSleep / (points.length || 1)).toFixed(1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
          Analytics & Progress Reports
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
          Longitudinal insights over the last {days} days
        </p>
      </div>

      {/* Main Chart */}
      <ProgressChart
        data={progressData}
        days={days}
        onDaysChange={onDaysChange}
      />

      {/* Metric Averages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-vibrant p-5 text-center">
          <Flame className="w-5 h-5 text-[#FF5C00] mx-auto mb-2" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase block">Avg Daily Calories</span>
          <p className="text-2xl font-black text-white font-display mt-1">{avgCalories}</p>
          <span className="text-[10px] text-zinc-400">Target: {user.daily_calories_target} kcal</span>
        </div>

        <div className="card-vibrant p-5 text-center">
          <Zap className="w-5 h-5 text-[#CCFF00] mx-auto mb-2" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase block">Avg Daily Steps</span>
          <p className="text-2xl font-black text-white font-display mt-1">{avgSteps.toLocaleString()}</p>
          <span className="text-[10px] text-zinc-400">Goal: {user.daily_step_goal?.toLocaleString()}</span>
        </div>

        <div className="card-vibrant p-5 text-center">
          <Droplet className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase block">Avg Water Intake</span>
          <p className="text-2xl font-black text-cyan-300 font-display mt-1">{avgWater} gl</p>
          <span className="text-[10px] text-zinc-400">Goal: {user.daily_water_glasses} glasses</span>
        </div>

        <div className="card-vibrant p-5 text-center">
          <Moon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase block">Avg Sleep Rest</span>
          <p className="text-2xl font-black text-purple-300 font-display mt-1">{avgSleep} hrs</p>
          <span className="text-[10px] text-zinc-400">Goal: {user.daily_sleep_hours} hrs</span>
        </div>
      </div>
    </div>
  );
};
