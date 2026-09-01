import React from 'react';
import { Scale, TrendingDown } from 'lucide-react';
import { WeightLog } from '../../types';

interface WeightTrackerCardProps {
  currentWeight: number;
  weightLogs: WeightLog[];
  trendText: string;
  onLogWeight: () => void;
}

export const WeightTrackerCard: React.FC<WeightTrackerCardProps> = ({
  currentWeight,
  weightLogs,
  trendText,
  onLogWeight
}) => {
  // Extract last 7 data points for mini sparkline
  const recentLogs = weightLogs.slice(-7);
  const weights = recentLogs.map(l => l.weight_kg);
  const minW = weights.length > 0 ? Math.min(...weights) - 0.5 : 65;
  const maxW = weights.length > 0 ? Math.max(...weights) + 0.5 : 75;
  const range = maxW - minW || 1;

  return (
    <div className="card-vibrant p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-black text-sm uppercase tracking-wider font-display">
          Weight Tracker
        </h3>
        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
          <Scale className="w-4 h-4" />
        </div>
      </div>

      <div className="my-2">
        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider block">
          Current Weight
        </span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-4xl font-black text-white font-display leading-none">
            {currentWeight || 68.5}
          </span>
          <span className="text-zinc-500 font-bold text-sm">kg</span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mt-2">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>{trendText || '↓ 1.5 kg this week'}</span>
        </div>
      </div>

      {/* Mini SVG Sparkline */}
      <div className="my-3 h-12 w-full flex items-center">
        {weights.length >= 2 ? (
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#A855F7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={weights
                .map((w, idx) => {
                  const x = (idx / (weights.length - 1)) * 100;
                  const y = 40 - ((w - minW) / range) * 35;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
            {weights.map((w, idx) => {
              const x = (idx / (weights.length - 1)) * 100;
              const y = 40 - ((w - minW) / range) * 35;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#A855F7"
                  className="stroke-[#161618] stroke-2"
                />
              );
            })}
          </svg>
        ) : (
          <p className="text-xs text-zinc-600 italic">Log more weights to view graph</p>
        )}
      </div>

      <button
        id="btn-card-log-weight"
        onClick={onLogWeight}
        className="w-full py-2.5 bg-zinc-900 border border-zinc-700 hover:border-[#CCFF00] text-zinc-300 hover:text-[#CCFF00] font-black text-xs uppercase tracking-wider rounded-xl transition-colors active:scale-95"
      >
        Log Weight
      </button>
    </div>
  );
};
