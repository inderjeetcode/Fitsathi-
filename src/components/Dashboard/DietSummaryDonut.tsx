import React from 'react';
import { Utensils, CheckCircle2 } from 'lucide-react';
import { DailyNutritionSummary } from '../../types';

interface DietSummaryDonutProps {
  summary: DailyNutritionSummary;
  onViewDetails: () => void;
}

export const DietSummaryDonut: React.FC<DietSummaryDonutProps> = ({
  summary,
  onViewDetails
}) => {
  const { totalCalories, totalCarbs, totalProtein, totalFat, mealsLoggedCount } = summary;

  // Calculate percentages based on total macro grams or default balanced ratio
  const totalGrams = (totalCarbs + totalProtein + totalFat) || 1;
  const carbsPct = Math.round((totalCarbs / totalGrams) * 100) || 45;
  const proteinPct = Math.round((totalProtein / totalGrams) * 100) || 30;
  const fatPct = Math.max(0, 100 - (carbsPct + proteinPct)) || 25;

  // SVG Circle stroke calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  
  const carbsOffset = 0;
  const carbsLength = (carbsPct / 100) * circumference;
  
  const proteinOffset = -carbsLength;
  const proteinLength = (proteinPct / 100) * circumference;
  
  const fatOffset = -(carbsLength + proteinLength);
  const fatLength = (fatPct / 100) * circumference;

  return (
    <div className="card-vibrant p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-black text-sm uppercase tracking-wider font-display">
          Today's Diet Summary
        </h3>
        <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>On Track</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#262628"
              strokeWidth="14"
              fill="transparent"
            />
            {/* Carbs Segment (Purple) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#A855F7"
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={`${carbsLength} ${circumference}`}
              strokeDashoffset={carbsOffset}
              strokeLinecap="round"
            />
            {/* Protein Segment (Emerald) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#10B981"
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={`${proteinLength} ${circumference}`}
              strokeDashoffset={proteinOffset}
              strokeLinecap="round"
            />
            {/* Fat Segment (Amber) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#F59E0B"
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={`${fatLength} ${circumference}`}
              strokeDashoffset={fatOffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-white font-display leading-none">
              {totalCalories.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">kcal</span>
          </div>
        </div>

        {/* Macro Breakdown Legend */}
        <div className="flex-1 w-full space-y-2.5">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
              <span className="text-xs font-bold text-zinc-300">Carbs</span>
            </div>
            <span className="text-xs font-black text-white">
              {carbsPct}% <span className="text-zinc-500 font-normal">({totalCarbs}g)</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span className="text-xs font-bold text-zinc-300">Protein</span>
            </div>
            <span className="text-xs font-black text-white">
              {proteinPct}% <span className="text-zinc-500 font-normal">({totalProtein}g)</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-xs font-bold text-zinc-300">Fats</span>
            </div>
            <span className="text-xs font-black text-white">
              {fatPct}% <span className="text-zinc-500 font-normal">({totalFat}g)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer info & View Details button */}
      <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
          <Utensils className="w-3.5 h-3.5 text-zinc-500" />
          <span>{mealsLoggedCount} / 5 meals logged</span>
        </div>
        <button
          id="btn-view-diet-details"
          onClick={onViewDetails}
          className="text-xs font-black text-[#CCFF00] hover:underline"
        >
          View Details →
        </button>
      </div>
    </div>
  );
};
