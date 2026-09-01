import React from 'react';
import { Scale, TrendingDown, Plus, Trash2 } from 'lucide-react';
import { UserProfile, WeightLog } from '../types';
import { weightService } from '../services/weight.service';
import { WeightTrackerCard } from '../components/Dashboard/WeightTrackerCard';

interface WeightPageProps {
  user: UserProfile;
  weightLogs: WeightLog[];
  onOpenLogWeight: () => void;
  onWeightUpdated: () => void;
}

export const WeightPage: React.FC<WeightPageProps> = ({
  user,
  weightLogs,
  onOpenLogWeight,
  onWeightUpdated
}) => {
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_kg : user.weight_kg;
  const targetWeight = user.target_weight_kg || 65;
  const diffToGoal = Math.abs(currentWeight - targetWeight).toFixed(1);

  const handleDeleteWeight = async (id: string) => {
    try {
      await weightService.deleteWeight(id, user.id);
      onWeightUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
            Weight & Body Composition
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
            Monitor weight trends and trajectory towards your goal
          </p>
        </div>

        <button
          id="btn-open-log-weight-page"
          onClick={onOpenLogWeight}
          className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.25)] transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Log Weight
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeightTrackerCard
          currentWeight={currentWeight}
          weightLogs={weightLogs}
          trendText="↓ 1.5 kg this week"
          onLogWeight={onOpenLogWeight}
        />

        <div className="card-vibrant p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Target Goal
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-white font-display leading-none">
                {targetWeight}
              </span>
              <span className="text-zinc-500 font-bold text-sm">kg Target</span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-2">
              {currentWeight > targetWeight
                ? `${diffToGoal} kg left to lose to reach goal`
                : `${diffToGoal} kg left to gain to reach goal`}
            </p>
          </div>

          <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-xs space-y-2 mt-4">
            <div className="flex justify-between">
              <span className="text-zinc-400">Current Weight:</span>
              <strong className="text-white">{currentWeight} kg</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Goal Weight:</span>
              <strong className="text-emerald-400">{targetWeight} kg</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Height:</span>
              <strong className="text-white">{user.height_cm} cm</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">BMI:</span>
              <strong className="text-[#CCFF00]">
                {((currentWeight / ((user.height_cm / 100) * (user.height_cm / 100))) || 22.5).toFixed(1)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card-vibrant p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Weight Log History
        </h3>

        {weightLogs.length === 0 ? (
          <p className="text-xs text-zinc-600 italic text-center py-6">
            No weight entries recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {weightLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-[#141416] border border-[#262628] rounded-2xl flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{log.weight_kg} kg</span>
                    <span className="text-[10px] text-zinc-500 font-bold">{log.log_date}</span>
                  </div>
                  {log.notes && (
                    <p className="text-xs text-zinc-400 mt-0.5">{log.notes}</p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteWeight(log.id)}
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
