import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Save, 
  X, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Calendar, 
  Target, 
  Link2, 
  Unlink2,
  ChevronLeft
} from 'lucide-react';
import { 
  UserProfile, 
  WorkoutRoutine, 
  RoutineExercise, 
  WorkoutSet, 
  SetType, 
  Exercise, 
  ExerciseCategory 
} from '../types';
import { workoutService } from '../services/workout.service';
import { SelectExerciseModal } from '../components/Modals/SelectExerciseModal';
import { calculateRoutineEstimatedMinutes, getDayName } from '../utils/routineCalculations';
import { getCategoryTheme } from '../components/Modals/ExerciseDetailModal';

interface RoutineBuilderPageProps {
  user: UserProfile;
  routineToEditId?: string | null;
  onSaveSuccess: (savedRoutine: WorkoutRoutine) => void;
  onCancel: () => void;
}

const ALL_MUSCLE_GROUPS: { id: string; label: string }[] = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'legs', label: 'Legs / Quads / Hamstrings' },
  { id: 'shoulders', label: 'Shoulders / Delts' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'core', label: 'Core / Abs' },
  { id: 'cardio', label: 'Cardio / Conditioning' },
  { id: 'full_body', label: 'Full Body' }
];

const DAYS_OF_WEEK = [
  { index: 1, label: 'Mon' },
  { index: 2, label: 'Tue' },
  { index: 3, label: 'Wed' },
  { index: 4, label: 'Thu' },
  { index: 5, label: 'Fri' },
  { index: 6, label: 'Sat' },
  { index: 0, label: 'Sun' }
];

const SET_TYPES: { id: SetType; label: string; badgeClass: string }[] = [
  { id: 'normal', label: 'Normal', badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  { id: 'warmup', label: 'Warmup', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { id: 'drop', label: 'Drop Set', badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { id: 'failure', label: 'Failure', badgeClass: 'bg-red-500/10 text-red-400 border-red-500/30' }
];

export const RoutineBuilderPage: React.FC<RoutineBuilderPageProps> = ({
  user,
  routineToEditId,
  onSaveSuccess,
  onCancel
}) => {
  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);
  const [scheduledDays, setScheduledDays] = useState<number[]>([]);
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);

  // UI state
  const [isSelectExerciseModalOpen, setIsSelectExerciseModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing routine if editing
  useEffect(() => {
    if (routineToEditId) {
      setIsLoading(true);
      workoutService.getRoutineById(routineToEditId, user.id)
        .then((routine) => {
          if (routine) {
            setName(routine.name || '');
            setDescription(routine.description || '');
            setTargetMuscles(routine.target_muscles || []);
            setScheduledDays(routine.days_of_week || []);
            setExercises(routine.exercises || []);
          }
        })
        .catch((err) => {
          console.error('Failed to load routine for editing', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [routineToEditId, user.id]);

  // Estimated Duration Live Calculation
  const estimatedMinutes = useMemo(() => {
    return calculateRoutineEstimatedMinutes(exercises);
  }, [exercises]);

  // Total Sets Counter
  const totalSets = useMemo(() => {
    return exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);
  }, [exercises]);

  // Muscle Category Toggle
  const toggleMuscle = (muscle: string) => {
    setTargetMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  // Day of Week Toggle
  const toggleDay = (dayIndex: number) => {
    setScheduledDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  // Handle Add Exercise From Modal
  const handleAddExercise = (selected: Exercise) => {
    const newRoutineExercise: RoutineExercise = {
      exerciseId: selected.id,
      exerciseName: selected.name,
      category: selected.category,
      targetMuscle: selected.targetMuscle,
      equipment: selected.equipment,
      restSeconds: selected.defaultRestSeconds || 60,
      notes: '',
      sets: [
        {
          id: `set-${Date.now()}-1`,
          setNumber: 1,
          type: 'normal',
          targetReps: 10,
          targetWeightKg: 0,
          completed: false
        },
        {
          id: `set-${Date.now()}-2`,
          setNumber: 2,
          type: 'normal',
          targetReps: 10,
          targetWeightKg: 0,
          completed: false
        },
        {
          id: `set-${Date.now()}-3`,
          setNumber: 3,
          type: 'normal',
          targetReps: 10,
          targetWeightKg: 0,
          completed: false
        }
      ]
    };

    setExercises((prev) => [...prev, newRoutineExercise]);

    // Auto-select target muscle if not already present
    if (selected.category && !targetMuscles.includes(selected.category)) {
      setTargetMuscles((prev) => [...prev, selected.category]);
    }

    setValidationError(null);
  };

  // Remove Exercise
  const handleRemoveExercise = (indexToRemove: number) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Reorder Exercises: Move Up / Down
  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === exercises.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...exercises];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setExercises(updated);
  };

  // Exercise Rest Change
  const handleRestChange = (exerciseIndex: number, newRest: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        restSeconds: Math.max(10, newRest)
      };
      return updated;
    });
  };

  // Add Set to Exercise
  const handleAddSet = (exerciseIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = updated[exerciseIndex];
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSetNumber = ex.sets.length + 1;

      const newSet: WorkoutSet = {
        id: `set-${Date.now()}-${newSetNumber}`,
        setNumber: newSetNumber,
        type: lastSet?.type || 'normal',
        targetReps: lastSet?.targetReps || 10,
        targetWeightKg: lastSet?.targetWeightKg || 0,
        completed: false
      };

      updated[exerciseIndex] = {
        ...ex,
        sets: [...ex.sets, newSet]
      };
      return updated;
    });
  };

  // Remove Set from Exercise
  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = updated[exerciseIndex];
      if (ex.sets.length <= 1) return prev; // Keep at least 1 set

      const filteredSets = ex.sets.filter((_, idx) => idx !== setIndex);
      // Renumber sets
      const renumbered = filteredSets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));

      updated[exerciseIndex] = {
        ...ex,
        sets: renumbered
      };
      return updated;
    });
  };

  // Update Individual Set Property
  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: any
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = updated[exerciseIndex];
      const sets = [...ex.sets];
      sets[setIndex] = {
        ...sets[setIndex],
        [field]: value
      };
      updated[exerciseIndex] = { ...ex, sets };
      return updated;
    });
  };

  // Toggle Superset Pairing with next exercise
  const handleToggleSuperset = (index: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const current = updated[index];
      if (current.supersetWithIndex !== undefined) {
        delete current.supersetWithIndex;
      } else if (index < updated.length - 1) {
        current.supersetWithIndex = index + 1;
      }
      return updated;
    });
  };

  // Validate and Save Routine
  const handleSaveRoutine = async () => {
    // 1. Validation: Name
    if (!name.trim()) {
      setValidationError('Please enter a routine name (e.g. "Push Day - Upper Body").');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Validation: Exercises count
    if (exercises.length === 0) {
      setValidationError('Please add at least 1 exercise to this routine.');
      return;
    }

    // 3. Validation: Sets and Reps
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (!ex.sets || ex.sets.length === 0) {
        setValidationError(`Exercise "${ex.exerciseName}" must have at least 1 set.`);
        return;
      }

      for (let s = 0; s < ex.sets.length; s++) {
        const set = ex.sets[s];
        if (!set.targetReps || set.targetReps <= 0) {
          setValidationError(`Set #${set.setNumber} for "${ex.exerciseName}" must have a target rep count > 0.`);
          return;
        }
      }

      if (!ex.restSeconds || ex.restSeconds <= 0) {
        setValidationError(`Rest time for "${ex.exerciseName}" must be greater than 0 seconds.`);
        return;
      }
    }

    setValidationError(null);
    setIsSaving(true);

    try {
      if (routineToEditId) {
        // Update existing routine
        const updated = await workoutService.updateRoutine(routineToEditId, user.id, {
          name: name.trim(),
          description: description.trim(),
          target_muscles: targetMuscles,
          estimated_minutes: estimatedMinutes,
          days_of_week: scheduledDays,
          exercises: exercises
        });
        onSaveSuccess(updated);
      } else {
        // Create new routine
        const created = await workoutService.createRoutine(user.id, {
          name: name.trim(),
          description: description.trim(),
          target_muscles: targetMuscles,
          estimated_minutes: estimatedMinutes,
          days_of_week: scheduledDays,
          exercises: exercises
        });
        onSaveSuccess(created);
      }
    } catch (err: any) {
      console.error('Failed to save workout routine', err);
      setValidationError(err?.message || 'Failed to save routine. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-zinc-400">
        <div className="w-6 h-6 border-2 border-[#CCFF00] border-t-transparent rounded-full animate-spin mr-3" />
        Loading routine details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="btn-back-to-workouts"
          onClick={onCancel}
          className="px-3.5 py-2 rounded-xl bg-[#141416] border border-[#262628] text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Live Metrics Header */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#141416] border border-[#262628] text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>{exercises.length} {exercises.length === 1 ? 'Exercise' : 'Exercises'}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#141416] border border-[#262628] text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>~{estimatedMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
          {routineToEditId ? 'Edit Workout Routine' : 'Build Custom Routine'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
          Customize exercises, target reps, set types, rest periods, and schedule your training split.
        </p>
      </div>

      {/* Validation Banner */}
      {validationError && (
        <div 
          id="routine-builder-validation-alert"
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-400 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-bold">{validationError}</p>
          </div>
          <button onClick={() => setValidationError(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section 1: Routine Basic Info */}
      <div className="p-5 sm:p-6 bg-[#141416] border border-[#262628] rounded-3xl space-y-5">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-[#CCFF00]" />
          1. Routine Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Routine Name <span className="text-[#CCFF00]">*</span>
            </label>
            <input
              id="input-routine-name"
              type="text"
              placeholder="e.g. Push Day (Chest, Shoulders, Triceps)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#18181B] border border-[#262628] focus:border-[#CCFF00] text-sm text-white placeholder-zinc-500 rounded-xl px-4 py-3 outline-none transition-all font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Description / Notes (Optional)
            </label>
            <input
              id="input-routine-description"
              type="text"
              placeholder="e.g. Heavy compound lifts followed by high-volume arm hypertrophy."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#18181B] border border-[#262628] focus:border-[#CCFF00] text-xs sm:text-sm text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none transition-all"
            />
          </div>

          {/* Target Muscles */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-zinc-500" />
              Target Muscle Focus
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_MUSCLE_GROUPS.map((m) => {
                const isSelected = targetMuscles.includes(m.id);
                return (
                  <button
                    key={m.id}
                    id={`toggle-muscle-${m.id}`}
                    type="button"
                    onClick={() => toggleMuscle(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border min-h-[36px] ${
                      isSelected
                        ? 'bg-[#CCFF00] text-[#0A0A0B] border-[#CCFF00] font-black'
                        : 'bg-[#18181B] text-zinc-400 border-[#262628] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly Schedule Days */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              Weekly Training Schedule (Assign Days)
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = scheduledDays.includes(d.index);
                return (
                  <button
                    key={d.index}
                    id={`toggle-day-${d.index}`}
                    type="button"
                    onClick={() => toggleDay(d.index)}
                    className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-xs font-black transition-all border shrink-0 ${
                      isSelected
                        ? 'bg-cyan-400 text-[#0A0A0B] border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)] transform -translate-y-0.5'
                        : 'bg-[#18181B] text-zinc-400 border-[#262628] hover:text-white'
                    }`}
                  >
                    <span>{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Exercise List & Set Configurations */}
      <div className="p-5 sm:p-6 bg-[#141416] border border-[#262628] rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#CCFF00]" />
              2. Exercises & Sets ({exercises.length})
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {totalSets} Total Sets | ~{estimatedMinutes} Minutes workout estimate
            </p>
          </div>

          <button
            id="btn-open-select-exercise-modal"
            type="button"
            onClick={() => setIsSelectExerciseModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.25)] transition-all active:scale-95 self-start sm:self-auto min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Exercise
          </button>
        </div>

        {/* Exercises Container */}
        {exercises.length > 0 ? (
          <div className="space-y-4">
            {exercises.map((ex, exIndex) => {
              const theme = getCategoryTheme(ex.category as ExerciseCategory);
              const isSuperset = ex.supersetWithIndex !== undefined;

              return (
                <div
                  key={`${ex.exerciseId}-${exIndex}`}
                  id={`routine-exercise-card-${exIndex}`}
                  className="p-4 sm:p-5 bg-[#18181B] border border-[#262628] rounded-2xl space-y-4 transition-all"
                >
                  {/* Exercise Item Header */}
                  <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-black shrink-0 border border-zinc-700">
                        {exIndex + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.bg} ${theme.border} ${theme.text}`}>
                            {theme.label}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                            {ex.equipment}
                          </span>
                          {isSuperset && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              Superset with #{ex.supersetWithIndex! + 1}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-white leading-snug">
                          {ex.exerciseName}
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium mt-0.5">
                          Target: {ex.targetMuscle}
                        </p>
                      </div>
                    </div>

                    {/* Reorder & Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => handleMoveExercise(exIndex, 'up')}
                        disabled={exIndex === 0}
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveExercise(exIndex, 'down')}
                        disabled={exIndex === exercises.length - 1}
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(exIndex)}
                        className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        title="Remove Exercise"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rest Period Customizer */}
                  <div className="flex items-center justify-between p-2.5 bg-[#141416] border border-[#262628] rounded-xl text-xs">
                    <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      Rest Between Sets
                    </span>
                    <div className="flex items-center gap-2">
                      {[45, 60, 90, 120].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => handleRestChange(exIndex, sec)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            ex.restSeconds === sec
                              ? 'bg-zinc-200 text-[#0A0A0B] font-black'
                              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                      <div className="flex items-center gap-1 ml-1">
                        <input
                          type="number"
                          min="10"
                          max="600"
                          value={ex.restSeconds}
                          onChange={(e) => handleRestChange(exIndex, parseInt(e.target.value) || 60)}
                          className="w-14 bg-zinc-900 border border-zinc-700 text-center text-white text-xs py-1 rounded-lg outline-none font-bold"
                        />
                        <span className="text-[10px] text-zinc-500 font-bold">sec</span>
                      </div>
                    </div>
                  </div>

                  {/* Sets Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-wider text-zinc-400 px-2">
                      <div className="col-span-2 sm:col-span-1">Set</div>
                      <div className="col-span-4 sm:col-span-3">Type</div>
                      <div className="col-span-3 sm:col-span-4">Target Reps</div>
                      <div className="col-span-2 sm:col-span-3">Weight (kg)</div>
                      <div className="col-span-1 text-right"></div>
                    </div>

                    {ex.sets.map((set, setIndex) => (
                      <div
                        key={set.id || setIndex}
                        className="grid grid-cols-12 gap-2 items-center p-2 bg-[#141416] border border-[#262628] rounded-xl"
                      >
                        {/* Set Number */}
                        <div className="col-span-2 sm:col-span-1 font-black text-xs text-zinc-300 pl-1">
                          #{set.setNumber}
                        </div>

                        {/* Set Type Dropdown */}
                        <div className="col-span-4 sm:col-span-3">
                          <select
                            value={set.type}
                            onChange={(e) => handleUpdateSet(exIndex, setIndex, 'type', e.target.value as SetType)}
                            className="w-full bg-[#18181B] border border-zinc-700 text-white text-xs font-semibold rounded-lg px-2 py-1.5 outline-none"
                          >
                            {SET_TYPES.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Target Reps */}
                        <div className="col-span-3 sm:col-span-4">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={set.targetReps || ''}
                            onChange={(e) =>
                              handleUpdateSet(
                                exIndex,
                                setIndex,
                                'targetReps',
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="10"
                            className="w-full bg-[#18181B] border border-zinc-700 text-center text-white text-xs font-bold py-1.5 rounded-lg outline-none focus:border-[#CCFF00]"
                          />
                        </div>

                        {/* Target Weight (Optional) */}
                        <div className="col-span-2 sm:col-span-3">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.targetWeightKg || ''}
                            onChange={(e) =>
                              handleUpdateSet(
                                exIndex,
                                setIndex,
                                'targetWeightKg',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            className="w-full bg-[#18181B] border border-zinc-700 text-center text-white text-xs font-bold py-1.5 rounded-lg outline-none focus:border-[#CCFF00]"
                          />
                        </div>

                        {/* Remove Set Button */}
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(exIndex, setIndex)}
                            disabled={ex.sets.length <= 1}
                            className="p-1 rounded text-zinc-500 hover:text-red-400 disabled:opacity-20 transition-colors"
                            title="Remove set"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Set & Superset Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIndex)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#CCFF00]" />
                      Add Set
                    </button>

                    {exIndex < exercises.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleToggleSuperset(exIndex)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                          isSuperset
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {isSuperset ? (
                          <>
                            <Unlink2 className="w-3.5 h-3.5" />
                            Unlink Superset
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3.5 h-3.5 text-purple-400" />
                            Pair Superset with #{exIndex + 2}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Exercise State */
          <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center space-y-3">
            <Dumbbell className="w-8 h-8 mx-auto text-zinc-600" />
            <div>
              <p className="text-sm font-bold text-zinc-300">No exercises added yet</p>
              <p className="text-xs text-zinc-500 mt-0.5">Click the button below to browse and add exercises</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSelectExerciseModalOpen(true)}
              className="px-4 py-2 bg-[#CCFF00] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-90 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add First Exercise
            </button>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#141416]/95 backdrop-blur-md border-t border-[#262628] p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-colors min-h-[44px]"
          >
            Cancel
          </button>

          <button
            id="btn-save-routine"
            type="button"
            onClick={handleSaveRoutine}
            disabled={isSaving}
            className="flex-1 max-w-xs py-3 px-6 rounded-2xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all active:scale-95 disabled:opacity-50 min-h-[44px]"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Saving Routine...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                {routineToEditId ? 'Update Routine' : 'Save Routine'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Select Exercise Modal */}
      <SelectExerciseModal
        isOpen={isSelectExerciseModalOpen}
        onClose={() => setIsSelectExerciseModalOpen(false)}
        onSelectExercise={handleAddExercise}
        alreadySelectedIds={exercises.map((e) => e.exerciseId)}
      />
    </div>
  );
};
