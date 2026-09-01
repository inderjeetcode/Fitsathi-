import React, { useState, useEffect } from 'react';
import { Dumbbell, Play, Plus, Clock, Layers, ChevronRight, Calendar } from 'lucide-react';
import { UserProfile, WorkoutRoutine } from '../../types';
import { workoutService } from '../../services/workout.service';
import { calculateRoutineEstimatedMinutes, getDayName } from '../../utils/routineCalculations';

interface TodaysWorkoutCardProps {
  user: UserProfile;
  onStartWorkout: (routine: WorkoutRoutine) => void;
  onCreateRoutine: () => void;
  onViewAllRoutines: () => void;
}

export const TodaysWorkoutCard: React.FC<TodaysWorkoutCardProps> = ({
  user,
  onStartWorkout,
  onCreateRoutine,
  onViewAllRoutines
}) => {
  const [todaysRoutine, setTodaysRoutine] = useState<WorkoutRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const todayDayIndex = new Date().getDay();
  const todayDayName = getDayName(todayDayIndex);

  useEffect(() => {
    let isMounted = true;
    workoutService.getRoutines(user.id)
      .then((routines) => {
        if (!isMounted) return;
        const matching = routines.find(
          (r) => r.days_of_week && r.days_of_week.includes(todayDayIndex)
        );
        setTodaysRoutine(matching || null);
      })
      .catch((err) => {
        console.error('Failed to get today routine for dashboard', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user.id, todayDayIndex]);

  if (isLoading) {
    return (
      <div className="p-5 bg-[#141416] border border-[#262628] rounded-3xl animate-pulse flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-28 h-4 bg-zinc-800 rounded" />
          <div className="w-48 h-6 bg-zinc-800 rounded" />
        </div>
        <div className="w-24 h-10 bg-zinc-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div
      id="dashboard-todays-workout-card"
      className="p-5 sm:p-6 bg-gradient-to-br from-[#18181B] via-[#161619] to-[#141416] border border-[#262628] hover:border-[#CCFF00]/40 rounded-3xl shadow-lg transition-all"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black shadow-[0_0_12px_rgba(204,255,0,0.2)]">
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] block">
              Today's Workout
            </span>
            <span className="text-xs text-zinc-400 font-bold">
              {todayDayName} Split
            </span>
          </div>
        </div>

        <button
          onClick={onViewAllRoutines}
          className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-0.5 transition-colors"
        >
          All Routines
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {todaysRoutine ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5 min-w-0">
            <h3 className="text-lg sm:text-xl font-black text-white font-display tracking-tight truncate">
              {todaysRoutine.name}
            </h3>

            <div className="flex items-center gap-3 text-xs text-zinc-300 flex-wrap">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#CCFF00]" />
                {todaysRoutine.exercises?.length || 0} Exercises
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                ~{todaysRoutine.estimated_minutes || calculateRoutineEstimatedMinutes(todaysRoutine.exercises || [])} min
              </span>
            </div>

            {todaysRoutine.target_muscles && todaysRoutine.target_muscles.length > 0 && (
              <div className="flex items-center gap-1 pt-1 flex-wrap">
                {todaysRoutine.target_muscles.slice(0, 3).map((m) => (
                  <span
                    key={m}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#141416] border border-zinc-800 text-zinc-300 capitalize"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            id="btn-dashboard-start-workout"
            onClick={() => onStartWorkout(todaysRoutine)}
            className="py-3 px-5 rounded-2xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.25)] transition-all active:scale-95 shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Workout
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <p className="text-sm font-bold text-white">
              No workout scheduled for today
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enjoy your rest day or pick a custom training split to jump into.
            </p>
          </div>

          <button
            id="btn-dashboard-create-routine"
            onClick={onCreateRoutine}
            className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Plan Routine
          </button>
        </div>
      )}
    </div>
  );
};
