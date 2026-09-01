import React from 'react';
import { 
  Dumbbell, 
  Clock, 
  Zap, 
  Sparkles, 
  ChevronRight, 
  History, 
  Play,
  Calendar
} from 'lucide-react';
import { WorkoutSessionLog } from '../../types';

interface RecentWorkoutCardProps {
  recentSession: WorkoutSessionLog | null;
  workoutStreak: number;
  onViewDetails: (session: WorkoutSessionLog) => void;
  onViewHistory: () => void;
  onStartWorkout: () => void;
}

export const RecentWorkoutCard: React.FC<RecentWorkoutCardProps> = ({
  recentSession,
  workoutStreak,
  onViewDetails,
  onViewHistory,
  onStartWorkout
}) => {
  const feelingEmojis: Record<string, { emoji: string; color: string }> = {
    'Crushed It': { emoji: '🔥', color: 'text-amber-400 bg-amber-400/15 border-amber-400/30' },
    'Great': { emoji: '💪', color: 'text-[#CCFF00] bg-[#CCFF00]/15 border-[#CCFF00]/30' },
    'Moderate': { emoji: '👍', color: 'text-cyan-400 bg-cyan-400/15 border-cyan-400/30' },
    'Tough': { emoji: '⚡', color: 'text-purple-400 bg-purple-400/15 border-purple-400/30' },
    'Exhausted': { emoji: '😮‍💨', color: 'text-zinc-400 bg-zinc-800 border-zinc-700' }
  };

  const feeling = recentSession?.feeling || recentSession?.session_feeling;
  const feelingInfo = feeling ? feelingEmojis[feeling] : null;

  return (
    <div 
      id="dashboard-recent-workout-card"
      className="card-vibrant p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider">
              Recent Workout Activity
            </h3>
            <p className="text-[11px] text-zinc-400">
              {workoutStreak > 0 ? `🔥 ${workoutStreak}-day workout streak` : 'Track your consistency'}
            </p>
          </div>
        </div>

        <button
          id="btn-recent-view-history"
          onClick={onViewHistory}
          className="text-xs font-bold text-zinc-400 hover:text-[#CCFF00] flex items-center gap-1 transition-colors"
        >
          <span>All History</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentSession ? (
        <div 
          onClick={() => onViewDetails(recentSession)}
          className="p-4 bg-[#18181B] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl space-y-3 cursor-pointer transition-all group"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-[#CCFF00]/15 text-[#CCFF00] text-[10px] font-black uppercase tracking-wider border border-[#CCFF00]/30">
                  Last Completed
                </span>
                {recentSession.pr_count > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-amber-400/30">
                    <Sparkles className="w-2.5 h-2.5" />
                    {recentSession.pr_count} PR{recentSession.pr_count > 1 ? 's' : ''}
                  </span>
                )}
                {feelingInfo && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${feelingInfo.color}`}>
                    <span>{feelingInfo.emoji}</span>
                    <span>{feeling}</span>
                  </span>
                )}
              </div>
              <h4 className="text-base font-black text-white group-hover:text-[#CCFF00] transition-colors mt-1 font-display">
                {recentSession.routine_name}
              </h4>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3 h-3 text-zinc-500" />
                <span>
                  {new Date(recentSession.completed_at || recentSession.log_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </p>
            </div>

            <div className="flex flex-col items-end text-right font-mono">
              <span className="text-sm font-black text-[#CCFF00]">
                {recentSession.total_volume_kg.toLocaleString()} kg
              </span>
              <span className="text-[11px] text-zinc-400">
                {recentSession.duration_minutes} min • {recentSession.total_sets} sets
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
            <span>{recentSession.exercises?.length || 0} exercises completed</span>
            <span className="text-[#CCFF00] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              View Workout Summary <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#18181B] border border-zinc-800 rounded-2xl text-center space-y-2">
          <p className="text-xs text-zinc-400">
            No completed workouts logged yet.
          </p>
          <button
            onClick={onStartWorkout}
            className="px-4 py-2 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start First Workout</span>
          </button>
        </div>
      )}
    </div>
  );
};
