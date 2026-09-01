import React, { useState } from 'react';
import { 
  X, 
  Dumbbell, 
  Clock, 
  Sparkles, 
  Check, 
  Plus, 
  Target, 
  Layers, 
  Zap, 
  HeartPulse, 
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';
import { Exercise, ExerciseCategory } from '../../types';
import { ExerciseMedia } from '../Exercise/ExerciseMedia';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToWorkout?: (exercise: Exercise) => void;
}

export const getCategoryTheme = (category: ExerciseCategory) => {
  switch (category) {
    case 'chest':
      return { color: '#FF5C00', bg: 'bg-[#FF5C00]/10', border: 'border-[#FF5C00]/30', text: 'text-[#FF5C00]', label: 'Chest' };
    case 'back':
      return { color: '#00E5FF', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]/30', text: 'text-[#00E5FF]', label: 'Back' };
    case 'legs':
      return { color: '#CCFF00', bg: 'bg-[#CCFF00]/10', border: 'border-[#CCFF00]/30', text: 'text-[#CCFF00]', label: 'Legs' };
    case 'shoulders':
      return { color: '#FF00E5', bg: 'bg-[#FF00E5]/10', border: 'border-[#FF00E5]/30', text: 'text-[#FF00E5]', label: 'Shoulders' };
    case 'biceps':
      return { color: '#FF9900', bg: 'bg-[#FF9900]/10', border: 'border-[#FF9900]/30', text: 'text-[#FF9900]', label: 'Biceps' };
    case 'triceps':
      return { color: '#A855F7', bg: 'bg-[#A855F7]/10', border: 'border-[#A855F7]/30', text: 'text-[#A855F7]', label: 'Triceps' };
    case 'core':
      return { color: '#10B981', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30', text: 'text-[#10B981]', label: 'Core' };
    case 'cardio':
      return { color: '#EF4444', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/30', text: 'text-[#EF4444]', label: 'Cardio' };
    default:
      return { color: '#CCFF00', bg: 'bg-[#CCFF00]/10', border: 'border-[#CCFF00]/30', text: 'text-[#CCFF00]', label: 'Full Body' };
  }
};

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onAddToWorkout
}) => {
  const [justAdded, setJustAdded] = useState(false);

  if (!isOpen || !exercise) return null;

  const theme = getCategoryTheme(exercise.category);

  const handleAddClick = () => {
    if (onAddToWorkout) {
      onAddToWorkout(exercise);
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
      }, 2200);
    }
  };

  return (
    <div 
      id="exercise-detail-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="exercise-detail-modal"
        className="bg-[#141416] border border-[#262628] w-full max-w-xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#262628] flex items-start justify-between gap-3 bg-gradient-to-b from-[#18181B] to-[#141416]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.bg} ${theme.border} ${theme.text}`}>
                {theme.label}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                {exercise.equipment}
              </span>
              {exercise.isBodyweight && (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Bodyweight
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
              {exercise.name}
            </h2>
            {exercise.hindi_name && (
              <p className="text-xs sm:text-sm font-semibold text-zinc-400 mt-0.5">
                {exercise.hindi_name}
              </p>
            )}
          </div>

          <button
            id="btn-close-exercise-modal"
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Exercise Visual Display Hero */}
          <ExerciseMedia 
            exercise={exercise} 
            size="hero" 
            showCategoryBadge={false}
          />

          {/* Target Muscle & Rest Metrics Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#18181B] border border-[#262628] rounded-2xl flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Primary Target
                </p>
                <p className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                  {exercise.targetMuscle}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#18181B] border border-[#262628] rounded-2xl flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Recommended Rest
                </p>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
                  {exercise.defaultRestSeconds} seconds
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Muscle Synergies */}
          {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Secondary Muscles Worked
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {exercise.secondaryMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="px-3 py-1 bg-[#1A1A1D] border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Instructions */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-[#CCFF00]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Step-by-Step Execution
              </h4>
            </div>

            <div className="space-y-2.5">
              {exercise.instructions.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3.5 bg-[#161618] border border-[#262628] rounded-2xl"
                >
                  <div className="w-6 h-6 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] font-black text-xs flex items-center justify-center shrink-0 border border-[#CCFF00]/30">
                    {index + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Coaching & Form Tips */}
          {exercise.tips && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
              <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-400 mb-0.5">
                  Coach's Form Cue
                </p>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                  {exercise.tips}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Action CTA */}
        <div className="p-4 sm:p-5 border-t border-[#262628] bg-[#161618] flex items-center justify-between gap-3">
          <button
            id="btn-modal-cancel"
            onClick={onClose}
            className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>

          <button
            id="btn-modal-add-to-workout"
            onClick={handleAddClick}
            disabled={justAdded}
            className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg ${
              justAdded
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-[#CCFF00] to-[#b3e600] text-[#0A0A0B] shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:opacity-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Added to Workout!
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[3]" />
                Add to Workout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
