import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Check, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Timer, 
  Flame, 
  Layers, 
  Zap, 
  Dumbbell, 
  Clock, 
  HelpCircle, 
  FileText, 
  X,
  AlertTriangle,
  RotateCcw,
  Trophy
} from 'lucide-react';
import { 
  UserProfile, 
  ActiveWorkoutState, 
  RoutineExercise, 
  WorkoutSet, 
  SetType, 
  Exercise, 
  PersonalRecord,
  WorkoutSessionLog
} from '../types';
import { workoutService } from '../services/workout.service';
import { calculateEstimated1RM, formatWorkoutDuration, calculateTotalSessionVolume } from '../utils/oneRepMax';
import { RestTimer } from '../components/Workout/RestTimer';
import { DiscardWorkoutModal } from '../components/Modals/DiscardWorkoutModal';
import { WorkoutSummaryModal } from '../components/Modals/WorkoutSummaryModal';
import { SelectExerciseModal } from '../components/Modals/SelectExerciseModal';
import { ExerciseMedia } from '../components/Exercise/ExerciseMedia';
import { exerciseService } from '../services/exercise.service';
import { soundEffects } from '../utils/audio';

interface ActiveWorkoutPageProps {
  user: UserProfile;
  onFinishWorkout: () => void;
  onMinimize: () => void;
  onDiscard: () => void;
}

const SET_TYPES: { type: SetType; label: string; short: string; color: string }[] = [
  { type: 'normal', label: 'Normal', short: 'N', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  { type: 'warmup', label: 'Warm-up', short: 'W', color: 'bg-amber-950/40 text-amber-400 border-amber-500/40' },
  { type: 'drop', label: 'Drop Set', short: 'D', color: 'bg-purple-950/40 text-purple-400 border-purple-500/40' },
  { type: 'failure', label: 'Failure', short: 'F', color: 'bg-red-950/40 text-red-400 border-red-500/40' }
];

const REST_PRESETS = [30, 60, 90, 120, 180];

export const ActiveWorkoutPage: React.FC<ActiveWorkoutPageProps> = ({
  user,
  onFinishWorkout,
  onMinimize,
  onDiscard
}) => {
  // 1. Active Workout State
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // 2. Ghost Data (Previous performance mapping: exerciseId -> WorkoutSet[])
  const [previousPerformanceMap, setPreviousPerformanceMap] = useState<Record<string, WorkoutSet[]>>({});
  
  // 3. User PRs cache
  const [userPRs, setUserPRs] = useState<PersonalRecord[]>([]);

  // 4. Rest Timer State
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [restSeconds, setRestSeconds] = useState(60);
  const [nextExerciseName, setNextExerciseName] = useState<string>('');
  const [nextSetNumber, setNextSetNumber] = useState<number>(1);

  // 5. Modals State
  const [isSelectExerciseOpen, setIsSelectExerciseOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [completedSessionData, setCompletedSessionData] = useState<WorkoutSessionLog | null>(null);
  const [newPRsAchieved, setNewPRsAchieved] = useState<PersonalRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load / Restore Active Workout & PRs on Mount
  useEffect(() => {
    let workout = workoutService.getActiveWorkout(user.id);
    if (!workout) {
      // If none active, initialize a default quick session
      workout = workoutService.startActiveWorkout(user.id, null, 'Quick Workout Session');
    }
    setActiveWorkout(workout);
    setSessionNotes(workout.notes || '');

    // Calculate initial elapsed time from startedAt
    const startMs = new Date(workout.startedAt).getTime();
    const currentElapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
    setElapsedSeconds(currentElapsed);

    // Fetch user PRs
    workoutService.getPersonalRecords(user.id).then(setUserPRs);
  }, [user.id]);

  // Load Previous Performance (Ghost Data) for all exercises in workout
  useEffect(() => {
    if (!activeWorkout || !activeWorkout.exercises) return;

    const loadGhostData = async () => {
      const map: Record<string, WorkoutSet[]> = {};
      for (const ex of activeWorkout.exercises) {
        if (!previousPerformanceMap[ex.exerciseId]) {
          const prevSets = await workoutService.getPreviousExercisePerformance(user.id, ex.exerciseId);
          if (prevSets) {
            map[ex.exerciseId] = prevSets;
          }
        }
      }
      if (Object.keys(map).length > 0) {
        setPreviousPerformanceMap((prev) => ({ ...prev, ...map }));
      }
    };

    loadGhostData();
  }, [activeWorkout?.exercises, user.id]);

  // Active Workout Elapsed Timer Loop
  useEffect(() => {
    if (!activeWorkout || isTimerPaused) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextSec = prev + 1;
        // Periodically update state
        if (nextSec % 10 === 0 && activeWorkout) {
          workoutService.saveActiveWorkout(user.id, {
            ...activeWorkout,
            elapsedSeconds: nextSec
          });
        }
        return nextSec;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout, isTimerPaused, user.id]);

  // Helper to commit state updates to React & localDb
  const commitWorkoutState = useCallback((updated: ActiveWorkoutState) => {
    setActiveWorkout(updated);
    workoutService.saveActiveWorkout(user.id, updated);
  }, [user.id]);

  // Live Metrics Calculations
  const metrics = useMemo(() => {
    if (!activeWorkout) return { totalVolumeKg: 0, completedSets: 0, totalSets: 0, prCount: 0 };

    let totalVolumeKg = 0;
    let completedSets = 0;
    let totalSets = 0;
    let prCount = 0;

    activeWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        totalSets++;
        if (set.completed) {
          completedSets++;
          const weight = set.actualWeightKg ?? set.targetWeightKg ?? 0;
          const reps = set.actualReps ?? set.targetReps ?? 0;
          totalVolumeKg += weight * reps;
          if (set.isPR) prCount++;
        }
      });
    });

    return {
      totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
      completedSets,
      totalSets,
      prCount
    };
  }, [activeWorkout]);

  // Set Completed Toggle & PR Evaluation
  const handleToggleSetComplete = async (exerciseIndex: number, setIndex: number) => {
    if (!activeWorkout) return;

    const ex = activeWorkout.exercises[exerciseIndex];
    const targetSet = ex.sets[setIndex];
    const willBeCompleted = !targetSet.completed;

    // Use current or target values
    const weight = targetSet.actualWeightKg ?? targetSet.targetWeightKg ?? 0;
    const reps = targetSet.actualReps ?? targetSet.targetReps ?? 0;

    let isPR = false;
    let estimated1RM = targetSet.estimated1RM;

    if (willBeCompleted && weight > 0 && reps > 0) {
      soundEffects.playSetChecked();
      estimated1RM = calculateEstimated1RM(weight, reps);

      // Check if PR
      const prCheck = await workoutService.checkAndCalculateSetPR(
        user.id,
        ex.exerciseId,
        weight,
        reps,
        userPRs
      );

      if (prCheck.isAnyPR) {
        isPR = true;
        soundEffects.playPRAchieved();
        showToast(`🔥 New PR on ${ex.exerciseName}! (${weight} kg × ${reps} reps)`);
      }

      // Auto start rest timer
      const restDuration = ex.restSeconds || 60;
      setRestSeconds(restDuration);
      setNextExerciseName(ex.exerciseName);
      setNextSetNumber(setIndex + 2 <= ex.sets.length ? setIndex + 2 : 1);
      setIsRestTimerOpen(true);
    }

    const updated = workoutService.updateSet(activeWorkout, exerciseIndex, setIndex, {
      completed: willBeCompleted,
      actualWeightKg: weight,
      actualReps: reps,
      estimated1RM,
      isPR
    });

    commitWorkoutState(updated);
  };

  // Set Value Change Handlers
  const handleUpdateSetWeight = (exerciseIndex: number, setIndex: number, newWeight: number) => {
    if (!activeWorkout) return;
    const validWeight = Math.max(0, Math.round(newWeight * 10) / 10);
    const updated = workoutService.updateSet(activeWorkout, exerciseIndex, setIndex, {
      actualWeightKg: validWeight,
      targetWeightKg: validWeight
    });
    commitWorkoutState(updated);
  };

  const handleUpdateSetReps = (exerciseIndex: number, setIndex: number, newReps: number) => {
    if (!activeWorkout) return;
    const validReps = Math.max(0, Math.round(newReps));
    const updated = workoutService.updateSet(activeWorkout, exerciseIndex, setIndex, {
      actualReps: validReps,
      targetReps: validReps
    });
    commitWorkoutState(updated);
  };

  const handleToggleSetType = (exerciseIndex: number, setIndex: number) => {
    if (!activeWorkout) return;
    const currentType = activeWorkout.exercises[exerciseIndex].sets[setIndex].type;
    const typesOrder: SetType[] = ['normal', 'warmup', 'drop', 'failure'];
    const currentIdx = typesOrder.indexOf(currentType);
    const nextType = typesOrder[(currentIdx + 1) % typesOrder.length];

    const updated = workoutService.updateSet(activeWorkout, exerciseIndex, setIndex, {
      type: nextType
    });
    commitWorkoutState(updated);
  };

  // Add Set
  const handleAddSet = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    const updated = workoutService.addSet(activeWorkout, exerciseIndex, 'normal');
    commitWorkoutState(updated);
  };

  // Remove Set
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    if (!activeWorkout) return;
    const updated = workoutService.removeSet(activeWorkout, exerciseIndex, setIndex);
    commitWorkoutState(updated);
  };

  // Add Exercise from Modal
  const handleSelectExercise = (exercise: Exercise) => {
    if (!activeWorkout) return;
    const updated = workoutService.addExerciseToActiveWorkout(activeWorkout, exercise, 3);
    commitWorkoutState(updated);
    setIsSelectExerciseOpen(false);
    showToast(`Added ${exercise.name} to workout.`);
  };

  // Remove Exercise
  const handleRemoveExercise = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    const updated = workoutService.removeExerciseFromActiveWorkout(activeWorkout, exerciseIndex);
    commitWorkoutState(updated);
  };

  // Reorder Exercises
  const handleMoveExercise = (fromIndex: number, toIndex: number) => {
    if (!activeWorkout) return;
    const updated = workoutService.reorderExercises(activeWorkout, fromIndex, toIndex);
    commitWorkoutState(updated);
  };

  // Update Rest Seconds Preset
  const handleSetRestSeconds = (exerciseIndex: number, seconds: number) => {
    if (!activeWorkout) return;
    const updatedExercises = activeWorkout.exercises.map((ex, idx) => {
      if (idx === exerciseIndex) {
        return { ...ex, restSeconds: seconds };
      }
      return ex;
    });
    commitWorkoutState({ ...activeWorkout, exercises: updatedExercises });
  };

  // Finish Workout Action
  const handleFinishWorkoutClick = async () => {
    if (!activeWorkout) return;

    if (metrics.completedSets === 0) {
      if (!confirm('You haven’t checked off any completed sets yet. Do you still want to finish and log this workout?')) {
        return;
      }
    }

    try {
      const result = await workoutService.completeWorkout(user.id, activeWorkout, sessionNotes);
      setCompletedSessionData(result.session);
      setNewPRsAchieved(result.updatedPRs);
      setIsSummaryModalOpen(true);
    } catch (err) {
      console.error('Failed to complete workout', err);
      showToast('Error completing workout.');
    }
  };

  // Confirm Summary Modal & Return
  const handleSummarySaved = () => {
    setIsSummaryModalOpen(false);
    onFinishWorkout();
  };

  // Confirm Discard Action
  const handleConfirmDiscard = () => {
    workoutService.discardActiveWorkout(user.id);
    setIsDiscardModalOpen(false);
    onDiscard();
  };

  if (!activeWorkout) {
    return (
      <div className="p-8 text-center text-zinc-400 space-y-4">
        <Dumbbell className="w-10 h-10 mx-auto text-[#CCFF00] animate-bounce" />
        <p className="font-bold text-sm">Preparing Active Workout session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-32">
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          id="active-workout-toast"
          className="fixed top-20 right-4 sm:right-8 z-50 bg-[#18181B] border border-[#CCFF00]/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="w-7 h-7 rounded-xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* TOP HEADER CONTROLS */}
      <div className="bg-[#141416] border border-[#262628] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="btn-workout-minimize"
              onClick={onMinimize}
              className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              title="Minimize (Keep workout running in background)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <input
                  id="input-active-workout-name"
                  type="text"
                  value={activeWorkout.routineName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    commitWorkoutState({ ...activeWorkout, routineName: newName });
                  }}
                  className="text-xl sm:text-2xl font-black text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-[#CCFF00] focus:outline-none tracking-tight font-display py-0.5"
                  placeholder="Workout Routine Name"
                />
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Active Workout Session</span>
              </p>
            </div>
          </div>

          {/* Right Header Actions: Finish & Discard */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              id="btn-workout-discard-top"
              onClick={() => setIsDiscardModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 text-xs font-bold text-zinc-400 hover:text-red-400 transition-colors"
            >
              Discard
            </button>

            <button
              id="btn-workout-finish-top"
              onClick={handleFinishWorkoutClick}
              className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all active:scale-95 min-h-[44px]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Finish Workout
            </button>
          </div>
        </div>

        {/* METRICS & TIMER BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#262628]">
          {/* Live Timer */}
          <div className="p-3 bg-[#18181B] border border-[#262628] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-zinc-400 block">Duration</span>
              <span className="text-lg font-black text-white font-mono">{formatWorkoutDuration(elapsedSeconds)}</span>
            </div>
            <button
              id="btn-workout-toggle-pause"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
            >
              {isTimerPaused ? <Play className="w-3.5 h-3.5 fill-current text-[#CCFF00]" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Volume */}
          <div className="p-3 bg-[#18181B] border border-[#262628] rounded-2xl">
            <span className="text-[10px] uppercase font-extrabold text-zinc-400 block">Total Volume</span>
            <span className="text-lg font-black text-[#CCFF00] font-mono">
              {metrics.totalVolumeKg.toLocaleString()} <span className="text-xs font-semibold text-zinc-400">kg</span>
            </span>
          </div>

          {/* Sets Done */}
          <div className="p-3 bg-[#18181B] border border-[#262628] rounded-2xl">
            <span className="text-[10px] uppercase font-extrabold text-zinc-400 block">Sets Completed</span>
            <span className="text-lg font-black text-white font-mono">
              {metrics.completedSets} <span className="text-xs font-normal text-zinc-500">/ {metrics.totalSets}</span>
            </span>
          </div>

          {/* PRs */}
          <div className="p-3 bg-[#18181B] border border-[#262628] rounded-2xl">
            <span className="text-[10px] uppercase font-extrabold text-zinc-400 block">PRs Hit</span>
            <span className="text-lg font-black text-amber-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              {metrics.prCount}
            </span>
          </div>
        </div>
      </div>

      {/* EXERCISES LIST */}
      <div className="space-y-6">
        {activeWorkout.exercises.map((exercise, exerciseIdx) => {
          const ghostSets = previousPerformanceMap[exercise.exerciseId] || [];
          const baseExercise = exerciseService.getExerciseById(exercise.exerciseId) || {
            id: exercise.exerciseId,
            name: exercise.exerciseName,
            category: exercise.category,
            targetMuscle: exercise.targetMuscle,
            equipment: exercise.equipment,
            isBodyweight: exercise.equipment === 'bodyweight',
            instructions: [],
            defaultRestSeconds: exercise.restSeconds || 60
          };

          return (
            <div
              key={`${exercise.exerciseId}-${exerciseIdx}`}
              id={`exercise-card-${exerciseIdx}`}
              className="bg-[#141416] border border-[#262628] hover:border-zinc-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl transition-all"
            >
              {/* Exercise Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262628]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-[#CCFF00] flex items-center justify-center font-black text-xs shrink-0">
                    {exerciseIdx + 1}
                  </div>
                  <ExerciseMedia 
                    exercise={baseExercise} 
                    size="thumb" 
                    className="w-11 h-11 rounded-xl shrink-0" 
                  />
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white font-display">
                      {exercise.exerciseName}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                        {exercise.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#18181B] text-zinc-400 text-[10px] font-semibold capitalize border border-zinc-800">
                        {exercise.equipment}
                      </span>
                      {exercise.targetMuscle && (
                        <span className="text-[11px] text-zinc-400 font-medium">
                          • {exercise.targetMuscle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rest Timer Selector & Exercise Reorder Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  {/* Rest Timer Presets */}
                  <div className="flex items-center gap-1 bg-[#18181B] border border-zinc-800 rounded-xl p-1">
                    <Timer className="w-3.5 h-3.5 text-cyan-400 ml-1 mr-0.5" />
                    {REST_PRESETS.map((sec) => (
                      <button
                        key={sec}
                        id={`btn-rest-preset-${exerciseIdx}-${sec}`}
                        onClick={() => handleSetRestSeconds(exerciseIdx, sec)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          exercise.restSeconds === sec
                            ? 'bg-cyan-500 text-[#0A0A0B] font-black'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>

                  {/* Move Up / Down / Remove */}
                  <div className="flex items-center gap-1">
                    <button
                      id={`btn-move-exercise-up-${exerciseIdx}`}
                      disabled={exerciseIdx === 0}
                      onClick={() => handleMoveExercise(exerciseIdx, exerciseIdx - 1)}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-move-exercise-down-${exerciseIdx}`}
                      disabled={exerciseIdx === activeWorkout.exercises.length - 1}
                      onClick={() => handleMoveExercise(exerciseIdx, exerciseIdx + 1)}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-remove-exercise-${exerciseIdx}`}
                      onClick={() => handleRemoveExercise(exerciseIdx)}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400"
                      title="Remove Exercise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* SETS TABLE */}
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-[#262628] pb-2">
                      <th className="py-2 px-2 w-14">SET</th>
                      <th className="py-2 px-2 min-w-[100px]">PREVIOUS</th>
                      <th className="py-2 px-2 min-w-[110px]">KG</th>
                      <th className="py-2 px-2 min-w-[110px]">REPS</th>
                      <th className="py-2 px-2 min-w-[80px]">1RM / PR</th>
                      <th className="py-2 px-2 text-center w-16">DONE</th>
                      <th className="py-2 px-1 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {exercise.sets.map((set, setIdx) => {
                      const ghostSet = ghostSets[setIdx];
                      const ghostText = ghostSet && ghostSet.actualWeightKg !== undefined
                        ? `${ghostSet.actualWeightKg} kg × ${ghostSet.actualReps || 0}`
                        : '—';

                      const currentWeight = set.actualWeightKg ?? set.targetWeightKg ?? 20;
                      const currentReps = set.actualReps ?? set.targetReps ?? 10;
                      const estimated1RM = set.estimated1RM || calculateEstimated1RM(currentWeight, currentReps);

                      const setTypeObj = SET_TYPES.find((t) => t.type === set.type) || SET_TYPES[0];

                      return (
                        <tr 
                          key={set.id || setIdx}
                          id={`set-row-${exerciseIdx}-${setIdx}`}
                          className={`transition-colors ${
                            set.completed ? 'bg-[#CCFF00]/5' : 'hover:bg-zinc-900/40'
                          }`}
                        >
                          {/* Set Number & Type Toggle */}
                          <td className="py-2.5 px-2">
                            <button
                              id={`btn-set-type-${exerciseIdx}-${setIdx}`}
                              onClick={() => handleToggleSetType(exerciseIdx, setIdx)}
                              className={`w-7 h-7 rounded-lg border text-[11px] font-black flex items-center justify-center transition-transform active:scale-95 ${setTypeObj.color}`}
                              title={`Set Type: ${setTypeObj.label} (Click to toggle)`}
                            >
                              {set.type === 'normal' ? set.setNumber : setTypeObj.short}
                            </button>
                          </td>

                          {/* Previous Ghost Performance */}
                          <td className="py-2.5 px-2 text-zinc-400 font-mono font-semibold text-xs whitespace-nowrap">
                            {ghostText}
                          </td>

                          {/* Weight (kg) Input with steppers */}
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1">
                              <button
                                id={`btn-weight-minus-${exerciseIdx}-${setIdx}`}
                                onClick={() => handleUpdateSetWeight(exerciseIdx, setIdx, Math.max(0, currentWeight - 2.5))}
                                className="w-6 h-7 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center font-bold text-xs"
                              >
                                -
                              </button>
                              <input
                                id={`input-weight-${exerciseIdx}-${setIdx}`}
                                type="number"
                                step="0.5"
                                value={currentWeight === 0 ? '' : currentWeight}
                                onChange={(e) => handleUpdateSetWeight(exerciseIdx, setIdx, parseFloat(e.target.value) || 0)}
                                className={`w-16 py-1 px-1.5 text-center font-mono font-black text-xs rounded-lg border focus:outline-none transition-colors ${
                                  set.completed
                                    ? 'bg-[#18181B] border-[#CCFF00]/50 text-[#CCFF00]'
                                    : 'bg-[#18181B] border-zinc-800 focus:border-[#CCFF00] text-white'
                                }`}
                              />
                              <button
                                id={`btn-weight-plus-${exerciseIdx}-${setIdx}`}
                                onClick={() => handleUpdateSetWeight(exerciseIdx, setIdx, currentWeight + 2.5)}
                                className="w-6 h-7 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center font-bold text-xs"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Reps Input with steppers */}
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1">
                              <button
                                id={`btn-reps-minus-${exerciseIdx}-${setIdx}`}
                                onClick={() => handleUpdateSetReps(exerciseIdx, setIdx, Math.max(1, currentReps - 1))}
                                className="w-6 h-7 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center font-bold text-xs"
                              >
                                -
                              </button>
                              <input
                                id={`input-reps-${exerciseIdx}-${setIdx}`}
                                type="number"
                                min="1"
                                max="100"
                                value={currentReps === 0 ? '' : currentReps}
                                onChange={(e) => handleUpdateSetReps(exerciseIdx, setIdx, parseInt(e.target.value) || 0)}
                                className={`w-14 py-1 px-1.5 text-center font-mono font-black text-xs rounded-lg border focus:outline-none transition-colors ${
                                  set.completed
                                    ? 'bg-[#18181B] border-[#CCFF00]/50 text-[#CCFF00]'
                                    : 'bg-[#18181B] border-zinc-800 focus:border-[#CCFF00] text-white'
                                }`}
                              />
                              <button
                                id={`btn-reps-plus-${exerciseIdx}-${setIdx}`}
                                onClick={() => handleUpdateSetReps(exerciseIdx, setIdx, currentReps + 1)}
                                className="w-6 h-7 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center font-bold text-xs"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Estimated 1RM & PR Badge */}
                          <td className="py-2.5 px-2 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-mono font-semibold text-zinc-400">
                                ~{estimated1RM}k
                              </span>
                              {set.isPR && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase flex items-center gap-0.5 border border-amber-400/40 animate-pulse">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  PR
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Completion Checkmark Button */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              id={`btn-complete-set-${exerciseIdx}-${setIdx}`}
                              onClick={() => handleToggleSetComplete(exerciseIdx, setIdx)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 mx-auto ${
                                set.completed
                                  ? 'bg-[#CCFF00] text-[#0A0A0B] shadow-[0_0_12px_rgba(204,255,0,0.4)] scale-105 font-black'
                                  : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:border-[#CCFF00] hover:text-white'
                              }`}
                              title={set.completed ? 'Mark incomplete' : 'Mark completed & start rest timer'}
                            >
                              <Check className={`w-4 h-4 ${set.completed ? 'stroke-[3.5]' : 'stroke-[2]'}`} />
                            </button>
                          </td>

                          {/* Delete Set */}
                          <td className="py-2.5 px-1 text-center">
                            <button
                              id={`btn-remove-set-${exerciseIdx}-${setIdx}`}
                              onClick={() => handleRemoveSet(exerciseIdx, setIdx)}
                              className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                              title="Delete Set"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Set Button */}
              <div className="pt-1">
                <button
                  id={`btn-add-set-${exerciseIdx}`}
                  onClick={() => handleAddSet(exerciseIdx)}
                  className="w-full py-2 rounded-xl bg-[#18181B] hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Exercise to Workout Button */}
        <div className="pt-2">
          <button
            id="btn-add-exercise-to-active-workout"
            onClick={() => setIsSelectExerciseOpen(true)}
            className="w-full py-4 rounded-3xl bg-[#141416] hover:bg-zinc-900 border-2 border-dashed border-[#262628] hover:border-[#CCFF00]/50 text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-[#CCFF00] flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Exercise to This Workout</span>
          </button>
        </div>
      </div>

      {/* BOTTOM FINISH BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#141416]/95 backdrop-blur-md border-t border-[#262628] p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {metrics.completedSets} of {metrics.totalSets} sets logged
              </p>
              <p className="text-[11px] text-zinc-400 font-mono">
                {metrics.totalVolumeKg.toLocaleString()} kg total volume
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-bottom-discard-workout"
              onClick={() => setIsDiscardModalOpen(true)}
              className="px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-red-400 transition-colors"
            >
              Cancel
            </button>

            <button
              id="btn-bottom-finish-workout"
              onClick={handleFinishWorkoutClick}
              className="px-6 py-3.5 rounded-2xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Complete Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* REST TIMER COMPONENT */}
      <RestTimer
        isOpen={isRestTimerOpen}
        initialSeconds={restSeconds}
        exerciseName={nextExerciseName}
        nextSetNumber={nextSetNumber}
        onClose={() => setIsRestTimerOpen(false)}
      />

      {/* SELECT EXERCISE MODAL */}
      <SelectExerciseModal
        isOpen={isSelectExerciseOpen}
        onClose={() => setIsSelectExerciseOpen(false)}
        onSelectExercise={handleSelectExercise}
        alreadySelectedIds={activeWorkout.exercises.map((e) => e.exerciseId)}
      />

      {/* DISCARD CONFIRMATION MODAL */}
      <DiscardWorkoutModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onConfirmDiscard={handleConfirmDiscard}
      />

      {/* WORKOUT SUMMARY CELEBRATION MODAL */}
      <WorkoutSummaryModal
        isOpen={isSummaryModalOpen}
        session={completedSessionData}
        newPRs={newPRsAchieved}
        onFinish={handleSummarySaved}
      />
    </div>
  );
};
