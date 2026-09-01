import React from 'react';
import { Flame } from 'lucide-react';

interface DailyEnergyBalanceProps {
  caloriesConsumed: number;
  caloriesTarget: number;
  onOpenAddFood: () => void;
}

export const DailyEnergyBalance: React.FC<DailyEnergyBalanceProps> = ({
  caloriesConsumed,
  caloriesTarget,
  onOpenAddFood
}) => {
  const percent = Math.min(100, Math.round((caloriesConsumed / (caloriesTarget || 2200)) * 100));
  const remaining = Math.max(0, caloriesTarget - caloriesConsumed);

  // Divide into 4 progress segments
  const segments = [25, 50, 75, 100];

  return (
    <div className="card-vibrant p-6 sm:p-7 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[90px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#CCFF00]/15 flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#CCFF00]" />
            </div>
            <h3 className="text-[#CCFF00] font-black uppercase text-xs sm:text-sm tracking-widest font-display">
              Daily Energy Balance
            </h3>
          </div>
          <button
            id="btn-energy-add-food"
            onClick={onOpenAddFood}
            className="text-[11px] font-black uppercase tracking-wider bg-[#CCFF00] text-[#0A0A0B] px-3 py-1.5 rounded-xl hover:opacity-90 transition-all shadow-[0_0_15px_rgba(204,255,0,0.25)] active:scale-95"
          >
            + Log Food
          </button>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 mt-2">
          <div>
            <p className="text-4xl sm:text-6xl font-black text-white font-display tracking-tight leading-none">
              {caloriesConsumed.toLocaleString()}
            </p>
            <p className="text-zinc-400 font-bold text-xs uppercase tracking-wider mt-1.5">
              Calories Consumed
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:block w-px h-10 bg-zinc-800" />
            <div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-400 font-display">
                {caloriesTarget.toLocaleString()}
              </p>
              <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-wider">
                Target kcal ({remaining} left)
              </p>
            </div>
            <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-3 py-2 rounded-2xl text-right">
              <span className="text-xl font-black text-[#CCFF00] font-display">{percent}%</span>
              <p className="text-[9px] text-zinc-400 font-bold uppercase">Reached</p>
            </div>
          </div>
        </div>

        {/* 4 Segment Progress Bar */}
        <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
          {segments.map((seg, idx) => {
            const isFilled = percent >= seg;
            const isPartial = percent > (segments[idx - 1] || 0) && percent < seg;
            const partialWidth = isPartial ? `${((percent - (segments[idx - 1] || 0)) / 25) * 100}%` : '0%';

            return (
              <div key={seg} className="h-2.5 bg-zinc-800 rounded-full overflow-hidden relative">
                {isFilled ? (
                  <div className="h-full bg-[#CCFF00] rounded-full shadow-[0_0_10px_rgba(204,255,0,0.5)]" />
                ) : isPartial ? (
                  <div 
                    className="h-full bg-[#CCFF00] rounded-full shadow-[0_0_10px_rgba(204,255,0,0.5)]" 
                    style={{ width: partialWidth }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
