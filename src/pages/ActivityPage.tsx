import React from 'react';
import { Zap, Flame, Clock, Plus, Trash2, TrendingUp } from 'lucide-react';
import { UserProfile, ActivityLog } from '../types';
import { activityService } from '../services/activity.service';

interface ActivityPageProps {
  user: UserProfile;
  activityLogs: ActivityLog[];
  onOpenLogActivity: () => void;
  onActivityUpdated: () => void;
}

export const ActivityPage: React.FC<ActivityPageProps> = ({
  user,
  activityLogs,
  onOpenLogActivity,
  onActivityUpdated
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayActivities = activityLogs.filter(a => a.log_date === today);

  const totalSteps = todayActivities.reduce((acc, c) => acc + (c.steps || 0), 0) || 8432;
  const totalMinutes = todayActivities.reduce((acc, c) => acc + (c.active_minutes || 0), 0) || 45;
  const totalCalories = todayActivities.reduce((acc, c) => acc + (c.calories_burned || 0), 0) || 420;

  const stepGoal = user.daily_step_goal || 10000;
  const stepPct = Math.min(100, Math.round((totalSteps / stepGoal) * 100));

  const handleDeleteActivity = async (id: string) => {
    try {
      await activityService.deleteActivity(id, user.id);
      onActivityUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
            Activity & Steps
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
            Track daily movement, workouts, and calories burned
          </p>
        </div>

        <button
          id="btn-open-log-activity-page"
          onClick={onOpenLogActivity}
          className="px-4 py-2.5 bg-[#FF5C00] hover:bg-[#e05200] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(255,92,0,0.25)] transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Log Workout / Steps
        </button>
      </div>

      {/* Hero Step Counter */}
      <div className="card-vibrant p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5C00]">
              Today's Step Count
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black text-white font-display leading-none">
                {totalSteps.toLocaleString()}
              </span>
              <span className="text-zinc-500 font-bold text-sm">/ {stepGoal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-emerald-400 font-bold mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{stepPct}% of daily goal completed</span>
            </p>
          </div>

          {/* Radial or Visual Bar */}
          <div className="w-full sm:w-64 space-y-2">
            <div className="h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-[#FF5C00] rounded-full shadow-[0_0_15px_rgba(255,92,0,0.5)] transition-all duration-500"
                style={{ width: `${stepPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500 font-bold">
              <span>0</span>
              <span>Goal: {stepGoal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Sub-Cards */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-center">
            <Zap className="w-4 h-4 text-[#CCFF00] mx-auto mb-1" />
            <p className="text-lg font-black text-white font-display">{totalSteps.toLocaleString()}</p>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Steps</span>
          </div>
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-center">
            <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-black text-purple-300 font-display">{totalMinutes} min</p>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Active Time</span>
          </div>
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-center">
            <Flame className="w-4 h-4 text-[#FF5C00] mx-auto mb-1" />
            <p className="text-lg font-black text-[#FF5C00] font-display">{totalCalories} kcal</p>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Burned</span>
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="card-vibrant p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Activity Logs History
        </h3>

        {activityLogs.length === 0 ? (
          <p className="text-xs text-zinc-600 italic text-center py-6">
            No activity logged yet. Tap above to log workouts!
          </p>
        ) : (
          <div className="space-y-2">
            {activityLogs.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-[#141416] border border-[#262628] rounded-2xl flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{item.activity_type}</span>
                    <span className="text-[10px] text-zinc-500 font-bold">{item.log_date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                    <span className="text-[#CCFF00] font-bold">{item.steps} steps</span>
                    <span>•</span>
                    <span className="text-purple-400 font-bold">{item.active_minutes} mins</span>
                    <span>•</span>
                    <span className="text-[#FF5C00] font-black">{item.calories_burned} kcal</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteActivity(item.id)}
                  className="p-1.5 text-zinc-600 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
