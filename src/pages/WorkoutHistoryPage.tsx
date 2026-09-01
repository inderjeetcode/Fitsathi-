import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Clock, 
  Zap, 
  Layers, 
  Calendar, 
  Sparkles, 
  Trash2, 
  Filter, 
  Plus, 
  Play, 
  Eye, 
  Flame, 
  Check, 
  Dumbbell, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { UserProfile, WorkoutSessionLog } from '../types';
import { workoutService } from '../services/workout.service';
import { filterSessionsByPeriod } from '../utils/workoutAnalytics';
import { WorkoutDetailModal } from '../components/Modals/WorkoutDetailModal';

interface WorkoutHistoryPageProps {
  user: UserProfile;
  onStartWorkout: () => void;
  onViewAnalytics?: () => void;
}

export const WorkoutHistoryPage: React.FC<WorkoutHistoryPageProps> = ({
  user,
  onStartWorkout,
  onViewAnalytics
}) => {
  const [sessions, setSessions] = useState<WorkoutSessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month' | '3months'>('all');
  const [selectedSessionForModal, setSelectedSessionForModal] = useState<WorkoutSessionLog | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await workoutService.getWorkoutSessions(user.id);
      setSessions(data);
    } catch (err) {
      console.error('Error loading workout sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user.id]);

  const filteredSessions = useMemo(
    () => filterSessionsByPeriod(sessions, selectedPeriod),
    [sessions, selectedPeriod]
  );

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await workoutService.deleteWorkoutSession(sessionId, user.id);
      await loadSessions();
      showToast('Workout session removed from history.');
    } catch (err) {
      console.error('Failed to delete workout session', err);
      showToast('Failed to delete workout session.');
    }
  };

  const feelingEmojis: Record<string, { emoji: string; color: string }> = {
    'Crushed It': { emoji: '🔥', color: 'text-amber-400 bg-amber-400/15 border-amber-400/30' },
    'Great': { emoji: '💪', color: 'text-[#CCFF00] bg-[#CCFF00]/15 border-[#CCFF00]/30' },
    'Moderate': { emoji: '👍', color: 'text-cyan-400 bg-cyan-400/15 border-cyan-400/30' },
    'Tough': { emoji: '⚡', color: 'text-purple-400 bg-purple-400/15 border-purple-400/30' },
    'Exhausted': { emoji: '😮‍💨', color: 'text-zinc-400 bg-zinc-800 border-zinc-700' }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          id="history-page-toast"
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black shadow-[0_0_20px_rgba(204,255,0,0.25)]">
            <History className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight uppercase">
              Workout History
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
              Review completed workouts, volume logs, and performance breakdowns.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onViewAnalytics && (
            <button
              id="btn-nav-history-analytics"
              onClick={onViewAnalytics}
              className="px-3.5 py-2.5 rounded-xl bg-[#141416] border border-[#262628] hover:border-zinc-600 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-2 transition-colors min-h-[44px]"
            >
              <TrendingUp className="w-4 h-4 text-[#CCFF00]" />
              <span>Workout Analytics</span>
            </button>
          )}

          <button
            id="btn-history-start-workout"
            onClick={onStartWorkout}
            className="px-4 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.25)] transition-all active:scale-95 min-h-[44px]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Workout</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-[#262628] pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          {(['all', 'week', 'month', '3months'] as const).map((period) => (
            <button
              key={period}
              id={`filter-history-${period}`}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPeriod === period
                  ? 'bg-[#CCFF00] text-[#0A0A0B] font-black shadow-[0_0_12px_rgba(204,255,0,0.25)]'
                  : 'bg-[#18181B] text-zinc-400 hover:text-white border border-[#262628]'
              }`}
            >
              {period === 'all' && 'All Workouts'}
              {period === 'week' && 'This Week'}
              {period === 'month' && 'This Month'}
              {period === '3months' && 'Last 3 Months'}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
          {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Workouts History List */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500">
          <Dumbbell className="w-8 h-8 mx-auto text-[#CCFF00] animate-bounce mb-2" />
          <p className="text-xs font-bold">Loading your workout sessions...</p>
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const feeling = session.feeling || session.session_feeling;
            const feelingInfo = feeling ? feelingEmojis[feeling] : null;

            return (
              <div
                key={session.id}
                id={`session-card-${session.id}`}
                className="card-vibrant p-5 sm:p-6 space-y-4 hover:border-zinc-600 transition-all cursor-pointer group"
                onClick={() => setSelectedSessionForModal(session)}
              >
                {/* Header & Meta Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262628]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-white font-display group-hover:text-[#CCFF00] transition-colors">
                        {session.routine_name}
                      </h3>
                      {session.pr_count > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase flex items-center gap-1 border border-amber-400/30">
                          <Sparkles className="w-3 h-3" />
                          {session.pr_count} PR{session.pr_count > 1 ? 's' : ''}
                        </span>
                      )}
                      {feelingInfo && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${feelingInfo.color}`}>
                          <span>{feelingInfo.emoji}</span>
                          <span>{feeling}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>
                        {new Date(session.completed_at || session.log_date).toLocaleDateString('en-US', {
                          weekday: 'short',
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

                  <div className="flex items-center gap-4 self-start sm:self-auto">
                    {/* Quick Metric Pills */}
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <div className="flex items-center gap-1 text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{session.duration_minutes}m</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#CCFF00] font-bold">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{session.total_volume_kg.toLocaleString()} kg</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-300">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span>{session.total_sets} sets</span>
                      </div>
                    </div>

                    <button
                      id={`btn-view-session-details-${session.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSessionForModal(session);
                      }}
                      className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exercises Quick Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {session.exercises?.map((ex, idx) => {
                    const completedSets = ex.sets.filter((s) => s.completed);
                    const topSet = completedSets.reduce((max, s) => {
                      const w = s.actualWeightKg ?? 0;
                      return w > (max?.actualWeightKg ?? 0) ? s : max;
                    }, completedSets[0]);

                    return (
                      <div
                        key={idx}
                        className="p-2.5 bg-[#18181B] border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-white truncate max-w-[140px]">
                          {ex.exerciseName}
                        </span>
                        {topSet ? (
                          <span className="text-[11px] font-mono text-[#CCFF00]">
                            {topSet.actualWeightKg ?? topSet.targetWeightKg}kg × {topSet.actualReps ?? topSet.targetReps}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500">
                            {completedSets.length} sets
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Session Notes if any */}
                {session.notes && (
                  <p className="text-xs text-zinc-400 italic bg-[#18181B] p-2.5 rounded-xl border border-zinc-800/60">
                    "{session.notes}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div 
          id="history-empty-state"
          className="card-vibrant p-12 text-center space-y-4 max-w-md mx-auto"
        >
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-[#CCFF00]">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              No Workouts Completed Yet
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Complete your first workout session to start building your history and tracking your strength milestones.
            </p>
          </div>
          <button
            id="btn-start-first-workout"
            onClick={onStartWorkout}
            className="px-6 py-3 rounded-2xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Workout</span>
          </button>
        </div>
      )}

      {/* Workout Detail Modal */}
      <WorkoutDetailModal
        isOpen={Boolean(selectedSessionForModal)}
        session={selectedSessionForModal}
        onClose={() => setSelectedSessionForModal(null)}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
};
