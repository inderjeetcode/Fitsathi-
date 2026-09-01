import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Calendar, 
  Play, 
  Edit3, 
  Trash2, 
  Copy, 
  Clock, 
  Layers, 
  Target, 
  Check, 
  Sparkles, 
  Flame, 
  ChevronRight, 
  ShieldCheck,
  AlertCircle,
  History,
  Trophy,
  Zap,
  RotateCcw,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { UserProfile, WorkoutRoutine, WorkoutSessionLog, PersonalRecord } from '../types';
import { workoutService } from '../services/workout.service';
import { DeleteRoutineModal } from '../components/Modals/DeleteRoutineModal';
import { getDayName, formatDaysOfWeek, calculateRoutineEstimatedMinutes } from '../utils/routineCalculations';
import { WorkoutHistoryPage } from './WorkoutHistoryPage';
import { PersonalRecordsPage } from './PersonalRecordsPage';
import { WorkoutAnalyticsView } from '../components/Workout/WorkoutAnalyticsView';

interface WorkoutPageProps {
  user: UserProfile;
  onCreateRoutine: () => void;
  onEditRoutine: (routineId: string) => void;
  onNavigateToExercises?: () => void;
  onStartWorkout?: (routine?: WorkoutRoutine | null) => void;
  initialTab?: 'routines' | 'history' | 'prs' | 'analytics';
}

const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon to Sun

export const WorkoutPage: React.FC<WorkoutPageProps> = ({
  user,
  onCreateRoutine,
  onEditRoutine,
  onNavigateToExercises,
  onStartWorkout,
  initialTab = 'routines'
}) => {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSessionLog[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'routines' | 'history' | 'prs' | 'analytics'>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active workout check
  const activeWorkoutState = workoutService.getActiveWorkout(user.id);

  // Delete modal state
  const [routineToDelete, setRoutineToDelete] = useState<WorkoutRoutine | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Current Day
  const todayDayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon ...
  const todayDayName = getDayName(todayDayIndex);

  // Load all routines, sessions, PRs
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [routinesData, sessionsData, prsData] = await Promise.all([
        workoutService.getRoutines(user.id),
        workoutService.getWorkoutSessions(user.id),
        workoutService.getPersonalRecords(user.id)
      ]);
      setRoutines(routinesData);
      setWorkoutSessions(sessionsData);
      setPersonalRecords(prsData);
    } catch (err) {
      console.error('Failed to load workout data', err);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Today's Scheduled Routines
  const todaysRoutines = useMemo(() => {
    return routines.filter((r) => r.days_of_week && r.days_of_week.includes(todayDayIndex));
  }, [routines, todayDayIndex]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Start Workout Action
  const handleStartWorkout = (routine?: WorkoutRoutine | null) => {
    try {
      workoutService.startActiveWorkout(user.id, routine);
      if (onStartWorkout) {
        onStartWorkout(routine);
      }
    } catch (err) {
      console.error('Failed to start workout', err);
      showToast('Starting workout session...');
    }
  };

  // Duplicate Routine Action
  const handleDuplicateRoutine = async (routine: WorkoutRoutine) => {
    try {
      const duplicated = await workoutService.createRoutine(user.id, {
        name: `${routine.name} (Copy)`,
        description: routine.description,
        target_muscles: routine.target_muscles,
        estimated_minutes: routine.estimated_minutes,
        days_of_week: [], // Clear schedule on duplicate
        exercises: JSON.parse(JSON.stringify(routine.exercises || []))
      });

      await loadData();
      showToast(`Routine duplicated as "${duplicated.name}"`);
    } catch (err) {
      console.error('Failed to duplicate routine', err);
      showToast('Failed to duplicate routine.');
    }
  };

  // Delete Routine Flow
  const handleOpenDeleteModal = (routine: WorkoutRoutine) => {
    setRoutineToDelete(routine);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (routine: WorkoutRoutine) => {
    try {
      await workoutService.deleteRoutine(routine.id, user.id);
      setIsDeleteModalOpen(false);
      setRoutineToDelete(null);
      await loadData();
      showToast(`Routine "${routine.name}" deleted.`);
    } catch (err) {
      console.error('Failed to delete routine', err);
      showToast('Failed to delete routine.');
    }
  };

  // Delete Session from History
  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this workout session from your history?')) {
      await workoutService.deleteWorkoutSession(sessionId, user.id);
      await loadData();
      showToast('Workout session removed from history.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          id="workout-page-toast"
          className="fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-50 bg-[#18181B] border border-[#CCFF00]/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-7 h-7 rounded-xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#CCFF00] rounded-xl flex items-center justify-center text-[#0A0A0B] shadow-[0_0_20px_rgba(204,255,0,0.25)]">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                Workouts & Training
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
                Execute workouts, plan training splits, and track personal records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {onNavigateToExercises && (
            <button
              id="btn-nav-exercise-library"
              onClick={onNavigateToExercises}
              className="px-3.5 py-2.5 rounded-xl bg-[#141416] border border-[#262628] hover:border-zinc-600 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
            >
              Exercise Library
            </button>
          )}

          <button
            id="btn-start-quick-workout"
            onClick={() => handleStartWorkout(null)}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#CCFF00]/50 text-zinc-300 hover:text-[#CCFF00] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Quick Workout
          </button>

          <button
            id="btn-create-routine-top"
            onClick={onCreateRoutine}
            className="px-4 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.25)] transition-all active:scale-95 min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Create Routine
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262628] pb-3 overflow-x-auto">
        <button
          id="tab-btn-routines"
          onClick={() => setActiveTab('routines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'routines'
              ? 'bg-[#CCFF00] text-[#0A0A0B] font-black shadow-[0_0_15px_rgba(204,255,0,0.25)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Routines & Split</span>
        </button>

        <button
          id="tab-btn-history"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'history'
              ? 'bg-[#CCFF00] text-[#0A0A0B] font-black shadow-[0_0_15px_rgba(204,255,0,0.25)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Workout History ({workoutSessions.length})</span>
        </button>

        <button
          id="tab-btn-prs"
          onClick={() => setActiveTab('prs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'prs'
              ? 'bg-[#CCFF00] text-[#0A0A0B] font-black shadow-[0_0_15px_rgba(204,255,0,0.25)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Personal Records ({personalRecords.length})</span>
        </button>

        <button
          id="tab-btn-analytics"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'analytics'
              ? 'bg-[#CCFF00] text-[#0A0A0B] font-black shadow-[0_0_15px_rgba(204,255,0,0.25)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics & Progress</span>
        </button>
      </div>

      {/* ACTIVE WORKOUT IN PROGRESS CARD (if one exists) */}
      {activeWorkoutState && (
        <div 
          id="active-workout-in-progress-card"
          className="p-5 sm:p-6 bg-gradient-to-r from-[#18181B] via-zinc-900 to-[#18181B] border-2 border-[#CCFF00] rounded-3xl shadow-[0_0_30px_rgba(204,255,0,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black">
                <Play className="w-6 h-6 fill-current" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#18181B] animate-ping" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-[#0A0A0B] text-[10px] font-black uppercase tracking-wider">
                Workout in progress
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                {activeWorkoutState.routineName || 'Active Workout'}
              </h3>
              <p className="text-xs text-zinc-400">
                Started at {new Date(activeWorkoutState.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {activeWorkoutState.exercises.length} exercises
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-resume-active-workout"
              onClick={() => onStartWorkout && onStartWorkout(null)}
              className="px-6 py-3 rounded-2xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Resume Workout
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: ROUTINES & SPLIT */}
      {activeTab === 'routines' && (
        <div className="space-y-8">
          {/* SECTION 1: TODAY'S SCHEDULED WORKOUT (HERO CARD) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#CCFF00]" />
                Today's Workout ({todayDayName})
              </h2>
              <span className="text-[11px] font-bold text-zinc-400">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {todaysRoutines.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {todaysRoutines.map((routine) => {
                  const estimatedMins = routine.estimated_minutes || calculateRoutineEstimatedMinutes(routine.exercises || []);
                  const totalSetsCount = (routine.exercises || []).reduce((acc, e) => acc + (e.sets?.length || 0), 0);

                  return (
                    <div
                      key={routine.id}
                      id={`today-routine-card-${routine.id}`}
                      className="p-5 sm:p-6 bg-gradient-to-r from-[#18181B] via-[#161619] to-[#141416] border-2 border-[#CCFF00]/40 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#CCFF00] text-[#0A0A0B] text-[10px] font-black uppercase tracking-wider">
                            Scheduled for Today
                          </span>
                          {routine.target_muscles && routine.target_muscles.map((muscle) => (
                            <span
                              key={muscle}
                              className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider border border-zinc-700"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>

                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                            {routine.name}
                          </h3>
                          {routine.description && (
                            <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-1">
                              {routine.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-300 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-[#CCFF00]" />
                            <span>{routine.exercises?.length || 0} Exercises ({totalSetsCount} sets)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            <span>~{estimatedMins} min estimated</span>
                          </div>
                        </div>

                        {/* Exercise Pills Preview */}
                        {routine.exercises && routine.exercises.length > 0 && (
                          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
                            {routine.exercises.slice(0, 4).map((ex, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-xl bg-[#141416] border border-zinc-800 text-[11px] text-zinc-300 font-medium whitespace-nowrap"
                              >
                                {ex.exerciseName}
                              </span>
                            ))}
                            {routine.exercises.length > 4 && (
                              <span className="text-[11px] text-zinc-500 font-bold px-1.5">
                                +{routine.exercises.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                        <button
                          id={`btn-edit-today-routine-${routine.id}`}
                          onClick={() => onEditRoutine(routine.id)}
                          className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                          title="Edit Routine"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          id={`btn-start-today-routine-${routine.id}`}
                          onClick={() => handleStartWorkout(routine)}
                          className="px-6 py-3.5 rounded-2xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Start Workout
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Rest / Unscheduled State */
              <div 
                id="today-rest-day-card"
                className="p-6 bg-[#141416] border border-[#262628] rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      No workout scheduled for today ({todayDayName})
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                      Take a rest day, start a quick workout, or pick any routine below.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-quick-workout-hero"
                    onClick={() => handleStartWorkout(null)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all"
                  >
                    Quick Workout
                  </button>
                  <button
                    id="btn-create-routine-hero"
                    onClick={onCreateRoutine}
                    className="px-4 py-2.5 rounded-xl bg-[#CCFF00] text-[#0A0A0B] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:opacity-90 transition-all shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    Schedule Routine
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: WEEKLY SCHEDULE STRIP */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Weekly Training Split
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {DAYS_ORDER.map((dayIdx) => {
                const isToday = dayIdx === todayDayIndex;
                const scheduledForDay = routines.filter(
                  (r) => r.days_of_week && r.days_of_week.includes(dayIdx)
                );

                return (
                  <div
                    key={dayIdx}
                    id={`weekly-day-card-${dayIdx}`}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between min-h-[90px] transition-all ${
                      isToday
                        ? 'bg-[#18181B] border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                        : 'bg-[#141416] border-[#262628]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-black uppercase tracking-wider ${isToday ? 'text-[#CCFF00]' : 'text-zinc-400'}`}>
                        {getDayName(dayIdx, true)}
                      </span>
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                      )}
                    </div>

                    <div>
                      {scheduledForDay.length > 0 ? (
                        <div className="space-y-1">
                          {scheduledForDay.map((r) => (
                            <p key={r.id} className="text-xs font-bold text-white truncate" title={r.name}>
                              {r.name}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] font-semibold text-zinc-500">
                          Rest Day
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: MY ROUTINES LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white font-display tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#CCFF00]" />
                  My Saved Routines
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                  {routines.length}
                </span>
              </div>

              <button
                id="btn-create-routine-secondary"
                onClick={onCreateRoutine}
                className="text-xs font-black uppercase tracking-wider text-[#CCFF00] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                New Routine
              </button>
            </div>

            {routines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routines.map((routine) => {
                  const estimatedMins = routine.estimated_minutes || calculateRoutineEstimatedMinutes(routine.exercises || []);
                  const totalSets = (routine.exercises || []).reduce((acc, e) => acc + (e.sets?.length || 0), 0);
                  const isScheduledToday = routine.days_of_week && routine.days_of_week.includes(todayDayIndex);

                  return (
                    <div
                      key={routine.id}
                      id={`routine-card-${routine.id}`}
                      className="bg-[#141416] border border-[#262628] hover:border-zinc-600 rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isScheduledToday && (
                              <span className="px-2 py-0.5 rounded-md bg-[#CCFF00]/15 text-[#CCFF00] text-[10px] font-black uppercase tracking-wider border border-[#CCFF00]/30">
                                Today
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider border border-zinc-700">
                              {formatDaysOfWeek(routine.days_of_week)}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              id={`btn-duplicate-routine-${routine.id}`}
                              onClick={() => handleDuplicateRoutine(routine)}
                              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                              title="Duplicate Routine"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-edit-routine-${routine.id}`}
                              onClick={() => onEditRoutine(routine.id)}
                              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                              title="Edit Routine"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-delete-routine-${routine.id}`}
                              onClick={() => handleOpenDeleteModal(routine)}
                              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
                              title="Delete Routine"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Routine Name & Description */}
                        <div>
                          <h3 className="text-base font-bold text-white font-display tracking-tight leading-snug">
                            {routine.name}
                          </h3>
                          {routine.description && (
                            <p className="text-xs text-zinc-400 font-medium mt-1 line-clamp-2">
                              {routine.description}
                            </p>
                          )}
                        </div>

                        {/* Target Muscle Badges */}
                        {routine.target_muscles && routine.target_muscles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {routine.target_muscles.map((muscle) => (
                              <span
                                key={muscle}
                                className="px-2 py-0.5 rounded-md bg-[#18181B] text-zinc-300 text-[10px] font-semibold border border-zinc-800 capitalize"
                              >
                                {muscle}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Meta stats */}
                        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                          <div className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-[#CCFF00]" />
                            <span>{routine.exercises?.length || 0} Exercises ({totalSets} sets)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>~{estimatedMins} min</span>
                          </div>
                        </div>
                      </div>

                      {/* Start Workout Button */}
                      <div className="pt-2 border-t border-[#262628]">
                        <button
                          id={`btn-card-start-workout-${routine.id}`}
                          onClick={() => handleStartWorkout(routine)}
                          className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-[#CCFF00] text-zinc-200 hover:text-[#0A0A0B] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Start Workout
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty Routines State */
              <div 
                id="routines-empty-state"
                className="p-10 bg-[#141416] border border-[#262628] rounded-3xl text-center space-y-4 max-w-md mx-auto"
              >
                <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto text-zinc-500">
                  <Dumbbell className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    No Workout Routines Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Create a customized workout split with your favorite exercises and sets.
                  </p>
                </div>
                <button
                  id="btn-create-first-routine"
                  onClick={onCreateRoutine}
                  className="px-5 py-2.5 bg-[#CCFF00] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Create First Routine
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WORKOUT HISTORY */}
      {activeTab === 'history' && (
        <WorkoutHistoryPage
          user={user}
          onStartWorkout={() => handleStartWorkout(null)}
          onViewAnalytics={() => setActiveTab('analytics')}
        />
      )}

      {/* TAB 3: PERSONAL RECORDS (PRS) */}
      {activeTab === 'prs' && (
        <PersonalRecordsPage
          user={user}
          onStartWorkout={() => handleStartWorkout(null)}
          onViewAnalytics={() => setActiveTab('analytics')}
        />
      )}

      {/* TAB 4: ANALYTICS & PROGRESS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#CCFF00]" />
                Workout Analytics & Progression
              </h2>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                Detailed breakdown of your workout volume, frequency, and strength progress over time.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="px-4 py-2 bg-[#161618] border border-[#262628] hover:border-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition-all flex items-center gap-2"
            >
              <History className="w-4 h-4 text-[#CCFF00]" />
              View Session Logs
            </button>
          </div>

          <WorkoutAnalyticsView
            sessions={workoutSessions}
            onStartWorkout={() => handleStartWorkout(null)}
          />
        </div>
      )}

      {/* Delete Routine Confirmation Modal */}
      <DeleteRoutineModal
        routine={routineToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRoutineToDelete(null);
        }}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
