import React, { useState, useEffect } from 'react';
import { Dumbbell, Play, Pause, ArrowRight, X, Layers, Check } from 'lucide-react';
import { ActiveWorkoutState } from '../../types';
import { formatWorkoutDuration } from '../../utils/oneRepMax';

interface ActiveWorkoutBannerProps {
  activeWorkout: ActiveWorkoutState | null;
  onResume: () => void;
  onDiscard: () => void;
  onTogglePause?: () => void;
}

export const ActiveWorkoutBanner: React.FC<ActiveWorkoutBannerProps> = ({
  activeWorkout,
  onResume,
  onDiscard,
  onTogglePause
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!activeWorkout) return;

    // Calculate elapsed seconds from startedAt
    const startMs = new Date(activeWorkout.startedAt).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.max(0, Math.floor((now - startMs) / 1000));
      setSeconds(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  if (!activeWorkout) return null;

  // Calculate completed sets
  let totalSets = 0;
  let completedSets = 0;
  activeWorkout.exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      totalSets++;
      if (s.completed) completedSets++;
    });
  });

  return (
    <div 
      id="active-workout-persistent-banner"
      className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-[#141416]/95 backdrop-blur-xl border-2 border-[#CCFF00] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(204,255,0,0.25)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      {/* Left info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black shrink-0 shadow-[0_0_15px_rgba(204,255,0,0.3)]">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#141416] animate-ping" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-[150px] sm:max-w-[220px]">
              {activeWorkout.routineName || 'Active Workout'}
            </h4>
            <span className="text-[10px] font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-1.5 py-0.5 rounded border border-[#CCFF00]/20">
              {formatWorkoutDuration(seconds)}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
            <Layers className="w-3 h-3 text-[#CCFF00]" />
            <span>{completedSets} of {totalSets} sets completed</span>
          </p>
        </div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          id="btn-banner-resume-workout"
          onClick={onResume}
          className="px-4 py-2 sm:py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.25)] transition-all active:scale-95 min-h-[38px]"
        >
          <span>Resume</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        <button
          id="btn-banner-discard-workout"
          onClick={onDiscard}
          className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 text-zinc-400 hover:text-red-400 transition-colors"
          title="Discard Workout"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
