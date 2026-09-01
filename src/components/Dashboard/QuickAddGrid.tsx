import React from 'react';
import { Utensils, Droplets, Moon, Scale } from 'lucide-react';

interface QuickAddGridProps {
  onAddFood: () => void;
  onAddWater: () => void;
  onLogSleep: () => void;
  onLogWeight: () => void;
}

export const QuickAddGrid: React.FC<QuickAddGridProps> = ({
  onAddFood,
  onAddWater,
  onLogSleep,
  onLogWeight
}) => {
  const buttons = [
    {
      id: 'quick-add-food',
      label: 'Add Food',
      icon: Utensils,
      bg: 'bg-purple-500/15 hover:bg-purple-500/25',
      textColor: 'text-purple-400',
      action: onAddFood,
      badge: 'Primary'
    },
    {
      id: 'quick-add-water',
      label: 'Add Water',
      icon: Droplets,
      bg: 'bg-cyan-500/15 hover:bg-cyan-500/25',
      textColor: 'text-cyan-400',
      action: onAddWater
    },
    {
      id: 'quick-log-sleep',
      label: 'Log Sleep',
      icon: Moon,
      bg: 'bg-indigo-500/15 hover:bg-indigo-500/25',
      textColor: 'text-indigo-400',
      action: onLogSleep
    },
    {
      id: 'quick-log-weight',
      label: 'Log Weight',
      icon: Scale,
      bg: 'bg-emerald-500/15 hover:bg-emerald-500/25',
      textColor: 'text-emerald-400',
      action: onLogWeight
    }
  ];

  return (
    <div className="card-vibrant p-6">
      <h3 className="text-white font-black text-sm uppercase tracking-wider font-display mb-4">
        Quick Add
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              id={btn.id}
              onClick={btn.action}
              className={`p-4 rounded-2xl border border-[#262628] ${btn.bg} flex items-center gap-3 transition-all transform active:scale-95 text-left`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${btn.textColor} bg-[#141416]/80 shrink-0`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{btn.label}</p>
                <p className="text-[10px] text-zinc-500 font-medium">Quick Entry</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
