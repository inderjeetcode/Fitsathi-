import React from 'react';
import { Zap, Moon, Droplet, Scale, Flame, ArrowUpRight } from 'lucide-react';

interface MetricGridProps {
  steps: number;
  stepGoal: number;
  protein: number;
  proteinGoal: number;
  sleepHours: number;
  sleepGoal: number;
  waterGlasses: number;
  waterGoal: number;
  currentWeight: number;
  weightChangeText: string;
  onOpenActivity: () => void;
  onOpenNutrition: () => void;
  onOpenSleep: () => void;
  onOpenWater: () => void;
  onOpenWeight: () => void;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
  steps,
  stepGoal,
  protein,
  proteinGoal,
  sleepHours,
  sleepGoal,
  waterGlasses,
  waterGoal,
  currentWeight,
  weightChangeText,
  onOpenActivity,
  onOpenNutrition,
  onOpenSleep,
  onOpenWater,
  onOpenWeight
}) => {
  const stepsPercent = Math.min(100, Math.round((steps / (stepGoal || 10000)) * 100));
  const proteinPercent = Math.min(100, Math.round((protein / (proteinGoal || 120)) * 100));
  const sleepPercent = Math.min(100, Math.round((sleepHours / (sleepGoal || 8)) * 100));
  const waterPercent = Math.min(100, Math.round((waterGlasses / (waterGoal || 8)) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. STEPS (Electric Orange Highlight Card) */}
      <div 
        onClick={onOpenActivity}
        className="bg-[#FF5C00] rounded-[28px] p-6 text-[#0A0A0B] flex flex-col justify-between cursor-pointer hover:opacity-95 transition-all shadow-[0_0_25px_rgba(255,92,0,0.2)] active:scale-[0.98] group"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#0A0A0B] fill-[#0A0A0B]" />
            </div>
            <span className="font-black uppercase text-xs tracking-widest font-display">Steps</span>
          </div>
          <span className="bg-black/15 px-2.5 py-1 rounded-lg text-xs font-black">{stepsPercent}%</span>
        </div>

        <div className="my-4">
          <p className="text-4xl font-black font-display tracking-tight leading-none">
            {steps.toLocaleString()}
          </p>
          <p className="font-bold text-xs opacity-80 mt-1 uppercase tracking-wider">
            Goal: {stepGoal.toLocaleString()}
          </p>
        </div>

        {/* Dynamic bar chart simulation */}
        <div className="flex gap-1.5 h-10 items-end">
          <div className="flex-1 bg-black/15 rounded-sm h-[50%]" />
          <div className="flex-1 bg-black/15 rounded-sm h-[75%]" />
          <div className="flex-1 bg-black/15 rounded-sm h-[40%]" />
          <div className="flex-1 bg-black/15 rounded-sm h-[90%]" />
          <div className="flex-1 bg-black/30 rounded-sm h-[100%]" />
        </div>
      </div>

      {/* 2. PROTEIN (Emerald Accent Card) */}
      <div 
        onClick={onOpenNutrition}
        className="card-vibrant-interactive p-6 flex flex-col justify-between cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs">
              <Flame className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-black uppercase text-xs tracking-wider text-zinc-300 font-display">Protein</h4>
          </div>
          <span className="text-xs font-bold text-emerald-400">{proteinPercent}%</span>
        </div>

        <div className="my-4">
          <div className="flex items-baseline gap-1.5">
            <p className="text-3xl font-black text-white font-display leading-none">{protein}g</p>
            <span className="text-zinc-500 font-bold text-xs">/ {proteinGoal}g</span>
          </div>
          <p className="text-emerald-400 text-[11px] font-bold mt-1">Muscle Recovery</p>
        </div>

        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-500"
            style={{ width: `${proteinPercent}%` }}
          />
        </div>
      </div>

      {/* 3. SLEEP QUALITY (Purple Accent Card) */}
      <div 
        onClick={onOpenSleep}
        className="card-vibrant-interactive p-6 flex flex-col justify-between cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-400/20 text-purple-400 flex items-center justify-center">
              <Moon className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="font-black uppercase text-xs tracking-wider text-zinc-300 font-display">Sleep</h4>
          </div>
          <span className="text-xs font-bold text-purple-400">{sleepPercent}%</span>
        </div>

        <div className="my-4">
          <div className="flex items-baseline gap-1.5">
            <p className="text-3xl font-black text-white font-display leading-none">
              {Math.floor(sleepHours)}h {Math.round((sleepHours % 1) * 60)}m
            </p>
            <span className="text-zinc-500 font-bold text-xs">/ {sleepGoal}h</span>
          </div>
          <p className="text-purple-400 text-[11px] font-bold mt-1">Deep Rest · 4 ★★★★</p>
        </div>

        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-400 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.5)] transition-all duration-500"
            style={{ width: `${sleepPercent}%` }}
          />
        </div>
      </div>

      {/* 4. BODY WEIGHT (Emerald / Slate Accent Card) */}
      <div 
        onClick={onOpenWeight}
        className="card-vibrant-interactive p-6 flex flex-col justify-between cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
              <Scale className="w-4 h-4 text-cyan-400" />
            </div>
            <h4 className="font-black uppercase text-xs tracking-wider text-zinc-300 font-display">Body Weight</h4>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
        </div>

        <div className="my-4">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-white font-display leading-none">
              {currentWeight || 68.5}
            </p>
            <span className="text-zinc-400 font-bold text-xs">KG</span>
          </div>
          <p className="text-emerald-400 text-[11px] font-bold mt-1 uppercase tracking-wider">
            {weightChangeText || '↓ 1.5 kg this week'}
          </p>
        </div>

        {/* Mini sparkline */}
        <div className="flex items-center gap-1 h-3">
          {[40, 55, 50, 65, 60, 75, 70].map((h, i) => (
            <div key={i} className="flex-1 bg-zinc-800 rounded-full overflow-hidden h-full flex items-end">
              <div 
                className="w-full bg-cyan-400/70 rounded-full" 
                style={{ height: `${h}%` }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
