import React from 'react';
import { Droplets, Plus } from 'lucide-react';

interface LiquidGlassTrackerProps {
  currentGlasses: number;
  goalGlasses: number;
  totalMl: number;
  onAddGlass: () => void;
  onAddAmount: (ml: number) => void;
}

export const LiquidGlassTracker: React.FC<LiquidGlassTrackerProps> = ({
  currentGlasses,
  goalGlasses = 8,
  totalMl,
  onAddGlass,
  onAddAmount
}) => {
  const totalSlots = goalGlasses || 8;
  const filledCount = Math.min(totalSlots, Math.floor(currentGlasses));

  return (
    <div className="card-vibrant p-6 flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider font-display">
            Liquid Glass Tracker
          </h3>
        </div>
        <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
          Daily Goal: {goalGlasses * 250} ml
        </span>
      </div>

      {/* Main Glass Visual & Count */}
      <div className="flex items-center justify-between gap-4 my-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white font-display leading-none">
              {currentGlasses}
            </span>
            <span className="text-zinc-500 font-bold text-sm">/ {goalGlasses} Glasses</span>
          </div>
          <p className="text-cyan-400 text-xs font-bold mt-1">
            {totalMl.toLocaleString()} ml consumed today
          </p>
        </div>

        {/* 3D Glass graphic illustration */}
        <div className="relative w-14 h-20 bg-zinc-900 border-2 border-cyan-400/40 rounded-b-2xl rounded-t-sm overflow-hidden flex flex-col justify-end p-1 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div 
            className="w-full bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-b-xl transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            style={{ height: `${Math.min(100, Math.round((currentGlasses / goalGlasses) * 100))}%` }}
          />
          <div className="absolute top-1 left-2 right-2 h-1 bg-cyan-300/30 rounded-full" />
        </div>
      </div>

      {/* 8 Small Glass Indicators */}
      <div className="my-3">
        <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
          {Array.from({ length: totalSlots }).map((_, index) => {
            const isFilled = index < filledCount;
            const isHalf = !isFilled && index === filledCount && (currentGlasses % 1) >= 0.5;

            return (
              <div 
                key={index}
                className={`h-9 rounded-lg flex flex-col justify-end p-0.5 transition-all ${
                  isFilled 
                    ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]' 
                    : isHalf
                    ? 'bg-zinc-800 border border-cyan-500/50'
                    : 'bg-zinc-800/80 border border-zinc-700/60'
                }`}
              >
                {isHalf && (
                  <div className="w-full h-1/2 bg-cyan-400 rounded-b-md" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Actions */}
      <div className="mt-2 space-y-2">
        <button
          id="btn-water-add-glass"
          onClick={onAddGlass}
          className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Add Glass (250 ml)
        </button>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[250, 500, 750, 1000].map((ml) => (
            <button
              key={ml}
              onClick={() => onAddAmount(ml)}
              className="py-1.5 px-1 bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-[10px] font-bold text-zinc-300 hover:text-cyan-400 rounded-lg text-center transition-colors"
            >
              +{ml} ml
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
