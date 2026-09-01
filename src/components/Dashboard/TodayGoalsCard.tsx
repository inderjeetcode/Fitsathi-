import React from 'react';
import { Flame, Zap, Droplet, Moon, Sliders } from 'lucide-react';
import { UserProfile } from '../../types';

interface TodayGoalsCardProps {
  user: UserProfile | null;
  calories: number;
  steps: number;
  waterGlasses: number;
  sleepHours: number;
  onEditGoals: () => void;
}

export const TodayGoalsCard: React.FC<TodayGoalsCardProps> = ({
  user,
  calories,
  steps,
  waterGlasses,
  sleepHours,
  onEditGoals
}) => {
  const calGoal = user?.daily_calories_target || 2200;
  const stepGoal = user?.daily_step_goal || 10000;
  const waterGoal = user?.daily_water_glasses || 8;
  const sleepGoal = user?.daily_sleep_hours || 8;

  const calPct = Math.min(100, Math.round((calories / calGoal) * 100));
  const stepPct = Math.min(100, Math.round((steps / stepGoal) * 100));
  const waterPct = Math.min(100, Math.round((waterGlasses / waterGoal) * 100));
  const sleepPct = Math.min(100, Math.round((sleepHours / sleepGoal) * 100));

  return (
    <div className="card-vibrant p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-black text-sm uppercase tracking-wider font-display">
          Daily Goals
        </h3>
        <button
          id="btn-edit-daily-goals"
          onClick={onEditGoals}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-[#CCFF00] bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg transition-colors"
        >
          <Sliders className="w-3 h-3" />
          <span>Edit Goals</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Calories Goal */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF5C00]" />
              <span className="font-bold text-zinc-200">Calories</span>
            </div>
            <span className="font-bold text-zinc-400">
              <strong className="text-white">{calories.toLocaleString()}</strong> / {calGoal.toLocaleString()} kcal
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#FF5C00] rounded-full shadow-[0_0_10px_rgba(255,92,0,0.4)]"
              style={{ width: `${calPct}%` }}
            />
          </div>
        </div>

        {/* Steps Goal */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#CCFF00]" />
              <span className="font-bold text-zinc-200">Steps</span>
            </div>
            <span className="font-bold text-zinc-400">
              <strong className="text-white">{steps.toLocaleString()}</strong> / {stepGoal.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#CCFF00] rounded-full shadow-[0_0_10px_rgba(204,255,0,0.4)]"
              style={{ width: `${stepPct}%` }}
            />
          </div>
        </div>

        {/* Water Goal */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-zinc-200">Water</span>
            </div>
            <span className="font-bold text-zinc-400">
              <strong className="text-white">{waterGlasses}</strong> / {waterGoal} glasses
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.4)]"
              style={{ width: `${waterPct}%` }}
            />
          </div>
        </div>

        {/* Sleep Goal */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-zinc-200">Sleep</span>
            </div>
            <span className="font-bold text-zinc-400">
              <strong className="text-white">{sleepHours}</strong> / {sleepGoal} hours
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-400 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.4)]"
              style={{ width: `${sleepPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
