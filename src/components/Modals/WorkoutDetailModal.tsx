import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Zap, 
  Layers, 
  Flame, 
  Trophy, 
  Sparkles, 
  FileText, 
  Trash2, 
  Check, 
  Smile, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { WorkoutSessionLog } from '../../types';
import { ExerciseMedia } from '../Exercise/ExerciseMedia';

interface WorkoutDetailModalProps {
  isOpen: boolean;
  session: WorkoutSessionLog | null;
  onClose: () => void;
  onDeleteSession?: (sessionId: string) => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  isOpen,
  session,
  onClose,
  onDeleteSession
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!isOpen || !session) return null;

  const feelingEmojis: Record<string, { emoji: string; color: string }> = {
    'Crushed It': { emoji: '🔥', color: 'text-amber-400 bg-amber-400/15 border-amber-400/30' },
    'Great': { emoji: '💪', color: 'text-[#CCFF00] bg-[#CCFF00]/15 border-[#CCFF00]/30' },
    'Moderate': { emoji: '👍', color: 'text-cyan-400 bg-cyan-400/15 border-cyan-400/30' },
    'Tough': { emoji: '⚡', color: 'text-purple-400 bg-purple-400/15 border-purple-400/30' },
    'Exhausted': { emoji: '😮‍💨', color: 'text-zinc-400 bg-zinc-800 border-zinc-700' }
  };

  const feelingData = session.feeling || session.session_feeling ? feelingEmojis[session.feeling || session.session_feeling || ''] : null;

  const handleDelete = () => {
    if (onDeleteSession) {
      onDeleteSession(session.id);
      setIsConfirmingDelete(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        id={`modal-workout-detail-${session.id}`}
        className="w-full max-w-2xl bg-[#141416] border border-[#262628] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#262628]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] text-[10px] font-black uppercase tracking-wider border border-[#CCFF00]/30">
                Completed Workout
              </span>
              {session.pr_count > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-amber-400/30">
                  <Sparkles className="w-3 h-3" />
                  {session.pr_count} PR{session.pr_count > 1 ? 's' : ''}
                </span>
              )}
              {feelingData && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${feelingData.color}`}>
                  <span>{feelingData.emoji}</span>
                  <span>{session.feeling || session.session_feeling}</span>
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
              {session.routine_name}
            </h2>
            <p className="text-xs text-zinc-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>
                {new Date(session.completed_at || session.log_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              {session.started_at && (
                <span>• {new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Stat Summary Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#18181B] border border-[#262628] rounded-2xl">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Duration</span>
            </div>
            <p className="text-lg font-black text-white font-mono mt-1">{session.duration_minutes} min</p>
          </div>

          <div className="p-3 bg-[#18181B] border border-[#262628] rounded-2xl">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Total Volume</span>
            </div>
            <p className="text-lg font-black text-white font-mono mt-1">
              {session.total_volume_kg.toLocaleString()} <span className="text-xs font-normal text-zinc-400">kg</span>
            </p>
          </div>

          <div className="p-3 bg-[#18181B] border border-[#262628] rounded-2xl">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Sets / Reps</span>
            </div>
            <p className="text-lg font-black text-white font-mono mt-1">
              {session.total_sets} <span className="text-xs font-normal text-zinc-500">/</span> {session.total_reps}
            </p>
          </div>

          <div className="p-3 bg-[#18181B] border border-[#262628] rounded-2xl">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Est. Calories</span>
            </div>
            <p className="text-lg font-black text-white font-mono mt-1">
              ~{session.calories_burned || Math.round(session.duration_minutes * 7.5)} <span className="text-xs font-normal text-zinc-400">kcal</span>
            </p>
          </div>
        </div>

        {/* Notes (if any) */}
        {session.notes && (
          <div className="p-3.5 bg-[#18181B] border border-[#262628] rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Workout Notes
            </span>
            <p className="text-xs text-zinc-200 leading-relaxed italic">
              "{session.notes}"
            </p>
          </div>
        )}

        {/* Performed Exercises Detailed List */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Performed Exercises ({session.exercises.length})
          </h3>

          <div className="space-y-4">
            {session.exercises.map((ex, exIdx) => {
              const completedSets = ex.sets.filter((s) => s.completed);
              const exerciseVolume = completedSets.reduce(
                (sum, s) => sum + (s.actualWeightKg ?? s.targetWeightKg ?? 0) * (s.actualReps ?? s.targetReps ?? 0),
                0
              );

              return (
                <div 
                  key={exIdx}
                  className="p-4 bg-[#18181B] border border-[#262628] rounded-2xl space-y-3"
                >
                  {/* Exercise Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                        <ExerciseMedia
                          exercise={{
                            id: ex.exerciseId,
                            name: ex.exerciseName,
                            category: ex.category,
                            equipment: ex.equipment,
                            targetMuscle: ex.targetMuscle
                          }}
                          size="sm"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{ex.exerciseName}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          <span className="capitalize">{ex.targetMuscle}</span>
                          <span>•</span>
                          <span className="capitalize">{ex.equipment}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#CCFF00]">
                        {exerciseVolume.toLocaleString()} kg
                      </span>
                      <p className="text-[10px] text-zinc-500 font-semibold">
                        {completedSets.length} / {ex.sets.length} sets
                      </p>
                    </div>
                  </div>

                  {/* Set-by-Set Breakdown Table */}
                  <div className="space-y-1.5 pt-1">
                    {ex.sets.map((set, sIdx) => {
                      const weight = set.actualWeightKg ?? set.targetWeightKg ?? 0;
                      const reps = set.actualReps ?? set.targetReps ?? 0;
                      const setVol = weight * reps;
                      const est1RM = set.estimated1RM || (weight > 0 && reps > 0 ? Math.round(weight * (1 + reps / 30)) : 0);

                      return (
                        <div
                          key={sIdx}
                          className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                            set.completed
                              ? 'bg-zinc-900/80 border border-zinc-800'
                              : 'bg-zinc-900/30 border border-zinc-800/40 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-300 font-mono font-bold text-[10px] flex items-center justify-center">
                              {set.setNumber}
                            </span>
                            {set.type !== 'normal' && (
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                {set.type}
                              </span>
                            )}
                            <span className="font-mono font-bold text-white">
                              {weight} kg × {reps} reps
                            </span>
                            {set.isPR && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                                PR
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 font-mono text-[11px]">
                            {est1RM > 0 && (
                              <span className="text-zinc-400 hidden sm:inline">
                                1RM: <strong className="text-zinc-200">{est1RM}kg</strong>
                              </span>
                            )}
                            <span className="text-[#CCFF00] font-bold">
                              {setVol > 0 ? `${setVol.toLocaleString()} kg` : '-'}
                            </span>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              set.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'
                            }`}>
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer & Delete Actions */}
        <div className="pt-4 border-t border-[#262628] flex items-center justify-between gap-4">
          {isConfirmingDelete ? (
            <div className="w-full p-4 bg-red-950/40 border border-red-500/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Delete this workout session from history? (Routines remain safe)</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              {onDeleteSession && (
                <button
                  id={`btn-modal-delete-session-${session.id}`}
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/40 text-zinc-400 hover:text-red-300 text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Session</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-wider ml-auto transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
