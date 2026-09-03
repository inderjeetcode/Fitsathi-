import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Flame, 
  Clock, 
  Layers, 
  Repeat, 
  Zap, 
  Check, 
  Sparkles, 
  ArrowRight,
  Smile,
  FileText
} from 'lucide-react';
import { WorkoutSessionLog, PersonalRecord, RoutineExercise } from '../../types';
import { formatWorkoutDuration } from '../../utils/oneRepMax';

interface WorkoutSummaryModalProps {
  isOpen: boolean;
  session: WorkoutSessionLog | null;
  newPRs?: PersonalRecord[];
  isSaving?: boolean;
  onFinish: (notes: string, rating: string) => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  isOpen,
  session,
  newPRs = [],
  isSaving = false,
  onFinish
}) => {
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState('Great');

  // Sync initial notes and feeling when session opens
  useEffect(() => {
    if (session) {
      setNotes(session.notes || '');
      setRating(session.feeling || session.session_feeling || 'Great');
    }
  }, [session, isOpen]);

  // Trigger confetti burst on open
  useEffect(() => {
    if (isOpen) {
      // Confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignore in headless/SSR
      }
    }
  }, [isOpen]);

  if (!isOpen || !session) return null;

  const ratingsList = [
    { label: 'Crushed It', emoji: '🔥', color: 'text-amber-400' },
    { label: 'Great', emoji: '💪', color: 'text-[#CCFF00]' },
    { label: 'Moderate', emoji: '👍', color: 'text-cyan-400' },
    { label: 'Tough', emoji: '⚡', color: 'text-purple-400' },
    { label: 'Exhausted', emoji: '😮‍💨', color: 'text-zinc-400' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="modal-workout-summary"
        className="w-full max-w-xl bg-[#141416] border-2 border-[#CCFF00]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(204,255,0,0.15)] space-y-6 my-8 max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(204,255,0,0.4)] animate-bounce">
            <Trophy className="w-9 h-9 stroke-[2.5]" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] text-xs font-black uppercase tracking-widest border border-[#CCFF00]/30 inline-block mb-1">
              Workout Complete!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              {session.routine_name || 'Great Workout Session!'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
              Awesome consistency! Here is your workout performance summary.
            </p>
          </div>
        </div>

        {/* PR Achievements Banner (if any) */}
        {newPRs.length > 0 && (
          <div 
            id="summary-prs-banner"
            className="p-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 rounded-2xl space-y-2"
          >
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{newPRs.length} New Personal Record{newPRs.length > 1 ? 's' : ''} Achieved!</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {newPRs.map((pr, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 bg-[#18181B] border border-amber-500/30 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[160px]">
                      {pr.exercise_name}
                    </p>
                    <p className="text-[11px] text-amber-400 font-bold">
                      {pr.best_weight_kg} kg × {pr.best_reps} reps
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
                    PR
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Duration */}
          <div className="p-3.5 bg-[#18181B] border border-[#262628] rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Duration</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white font-mono">
              {session.duration_minutes} min
            </p>
          </div>

          {/* Volume */}
          <div className="p-3.5 bg-[#18181B] border border-[#262628] rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Total Volume</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white font-mono">
              {session.total_volume_kg.toLocaleString()} <span className="text-xs font-bold text-zinc-400">kg</span>
            </p>
          </div>

          {/* Sets & Reps */}
          <div className="p-3.5 bg-[#18181B] border border-[#262628] rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Sets / Reps</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white font-mono">
              {session.total_sets} <span className="text-xs font-normal text-zinc-500">/</span> {session.total_reps}
            </p>
          </div>

          {/* Calories */}
          <div className="p-3.5 bg-[#18181B] border border-[#262628] rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Est. Burned</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white font-mono">
              ~{session.calories_burned || Math.round(session.duration_minutes * 7.5)} <span className="text-xs font-bold text-zinc-400">kcal</span>
            </p>
          </div>

          {/* Exercises Count */}
          <div className="p-3.5 bg-[#18181B] border border-[#262628] rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exercises</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white font-mono">
              {session.exercises.length}
            </p>
          </div>

          {/* PR Count */}
          <div className="p-3.5 bg-[#18181B] border border-[#262628] rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>PRs Set</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-white font-mono">
              {session.pr_count || newPRs.length}
            </p>
          </div>
        </div>

        {/* Exercises Summary List */}
        <div className="space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Exercise Breakdown
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {session.exercises.map((ex, idx) => {
              const completedSets = ex.sets.filter((s) => s.completed);
              const bestSet = completedSets.reduce((max, s) => {
                const w = s.actualWeightKg ?? 0;
                return w > (max?.actualWeightKg ?? 0) ? s : max;
              }, completedSets[0]);

              return (
                <div 
                  key={idx}
                  className="p-2.5 bg-[#18181B] border border-[#262628] rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{ex.exerciseName}</p>
                    <p className="text-[11px] text-zinc-400">
                      {completedSets.length} / {ex.sets.length} sets completed
                    </p>
                  </div>
                  {bestSet && (
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-400">Top set: </span>
                      <span className="font-bold text-[#CCFF00]">
                        {bestSet.actualWeightKg ?? bestSet.targetWeightKg}kg × {bestSet.actualReps ?? bestSet.targetReps}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Feeling / Rating */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-400">
            How did this session feel?
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {ratingsList.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => setRating(r.label)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  rating === r.label
                    ? 'bg-[#CCFF00] text-[#0A0A0B] shadow-[0_0_15px_rgba(204,255,0,0.25)] font-black'
                    : 'bg-[#18181B] border border-[#262628] text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            Session Notes (Optional)
          </label>
          <textarea
            id="input-summary-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Felt strong on bench press today! Increased weights on shoulder raises..."
            rows={2}
            className="w-full bg-[#18181B] border border-[#262628] focus:border-[#CCFF00] rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none resize-none"
          />
        </div>

        {/* Save & Finish Action Button */}
        <div className="pt-2">
          <button
            id="btn-save-summary-finish"
            disabled={isSaving}
            onClick={() => !isSaving && onFinish(notes, rating)}
            className={`w-full py-3.5 px-6 rounded-2xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.35)] transition-all active:scale-98 ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <span>{isSaving ? 'Saving & Completing...' : 'Save & Complete Workout'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
