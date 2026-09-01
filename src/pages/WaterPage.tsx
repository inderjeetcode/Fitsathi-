import React from 'react';
import { Droplet, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { UserProfile, WaterLog } from '../types';
import { waterService } from '../services/water.service';
import { LiquidGlassTracker } from '../components/Dashboard/LiquidGlassTracker';

interface WaterPageProps {
  user: UserProfile;
  waterLogs: WaterLog[];
  onOpenAddWater: () => void;
  onAddGlass: () => void;
  onAddAmount: (ml: number) => void;
  onWaterUpdated: () => void;
}

export const WaterPage: React.FC<WaterPageProps> = ({
  user,
  waterLogs,
  onOpenAddWater,
  onAddGlass,
  onAddAmount,
  onWaterUpdated
}) => {
  const today = new Date().toISOString().split('T')[0];
  const totalMl = waterLogs.reduce((acc, c) => acc + (c.amount_ml || 0), 0) || 1500;
  const currentGlasses = Math.round((totalMl / 250) * 10) / 10;
  const goalGlasses = user.daily_water_glasses || 8;

  const handleDeleteWater = async (id: string) => {
    try {
      await waterService.deleteWater(id, user.id);
      onWaterUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
            Hydration & Water
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
            Log water intake with interactive liquid visualizer
          </p>
        </div>

        <button
          id="btn-open-log-water-page"
          onClick={onOpenAddWater}
          className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Custom Water Amount
        </button>
      </div>

      {/* Main Glass Visual Tracker */}
      <LiquidGlassTracker
        currentGlasses={currentGlasses}
        goalGlasses={goalGlasses}
        totalMl={totalMl}
        onAddGlass={onAddGlass}
        onAddAmount={onAddAmount}
      />

      {/* Logs History */}
      <div className="card-vibrant p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Today's Water Entries
        </h3>

        {waterLogs.length === 0 ? (
          <p className="text-xs text-zinc-600 italic text-center py-6">
            No water logged today. Tap + Add Glass above!
          </p>
        ) : (
          <div className="space-y-2">
            {waterLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-[#141416] border border-[#262628] rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">+{log.amount_ml} ml</p>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {(log.amount_ml / 250).toFixed(1)} glasses
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteWater(log.id)}
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
