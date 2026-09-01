import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Zap, 
  Calendar, 
  Layers, 
  Trophy, 
  BarChart3, 
  Activity, 
  Clock,
  ChevronDown
} from 'lucide-react';
import { WorkoutSessionLog } from '../../types';
import { 
  calculateWorkoutStreak, 
  getWeeklyWorkoutStats, 
  getMonthlyWorkoutStats, 
  getExerciseProgressionData, 
  ExerciseProgressPoint 
} from '../../utils/workoutAnalytics';
import { ExerciseMedia } from '../Exercise/ExerciseMedia';

interface WorkoutAnalyticsViewProps {
  sessions: WorkoutSessionLog[];
  onStartWorkout?: () => void;
}

export const WorkoutAnalyticsView: React.FC<WorkoutAnalyticsViewProps> = ({
  sessions,
  onStartWorkout
}) => {
  // Weekly & Monthly stats
  const weeklyStats = useMemo(() => getWeeklyWorkoutStats(sessions, 8), [sessions]);
  const monthlyStats = useMemo(() => getMonthlyWorkoutStats(sessions, 6), [sessions]);
  const currentStreak = useMemo(() => calculateWorkoutStreak(sessions), [sessions]);

  // Overall aggregate metrics
  const totalVolumeAllTime = useMemo(
    () => sessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0),
    [sessions]
  );
  const totalSetsAllTime = useMemo(
    () => sessions.reduce((acc, s) => acc + (s.total_sets || 0), 0),
    [sessions]
  );
  const totalMinutesAllTime = useMemo(
    () => sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0),
    [sessions]
  );

  // List of unique exercises performed in history
  const uniqueExercises = useMemo(() => {
    const map = new Map<string, { id: string; name: string; category: any; equipment: any; targetMuscle: string }>();
    for (const s of sessions) {
      for (const ex of s.exercises || []) {
        if (!map.has(ex.exerciseId)) {
          map.set(ex.exerciseId, {
            id: ex.exerciseId,
            name: ex.exerciseName,
            category: ex.category,
            equipment: ex.equipment,
            targetMuscle: ex.targetMuscle
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [sessions]);

  // Selected exercise for progression analysis
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    uniqueExercises[0]?.id || ''
  );

  // Update selected if previously empty and exercises loaded
  React.useEffect(() => {
    if (!selectedExerciseId && uniqueExercises.length > 0) {
      setSelectedExerciseId(uniqueExercises[0].id);
    }
  }, [uniqueExercises, selectedExerciseId]);

  const progressionData = useMemo(
    () => getExerciseProgressionData(sessions, selectedExerciseId),
    [sessions, selectedExerciseId]
  );

  const [progressionMetric, setProgressionMetric] = useState<'weight' | '1rm' | 'volume'>('weight');

  // Chart helpers for Weekly Volume
  const maxWeeklyVolume = Math.max(...weeklyStats.map((w) => w.totalVolumeKg), 1000);
  const maxWeeklyWorkouts = Math.max(...weeklyStats.map((w) => w.workoutCount), 5);

  if (sessions.length === 0) {
    return (
      <div className="card-vibrant p-10 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto text-[#CCFF00]">
          <BarChart3 className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white font-display">No Analytics Available Yet</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Complete your first workout to start tracking training volume, workout streaks, and exercise strength progression.
          </p>
        </div>
        {onStartWorkout && (
          <button
            onClick={onStartWorkout}
            className="px-5 py-2.5 bg-[#CCFF00] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.2)]"
          >
            Start Workout
          </button>
        )}
      </div>
    );
  }

  const selectedExercise = uniqueExercises.find((e) => e.id === selectedExerciseId);

  return (
    <div className="space-y-6">
      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Workout Streak */}
        <div className="card-vibrant p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Streak</span>
            <Flame className="w-4 h-4 text-[#FF5C00]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            {currentStreak} <span className="text-xs font-normal text-zinc-400">days</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {currentStreak > 0 ? '🔥 On a roll!' : 'Start a workout today'}
          </p>
        </div>

        {/* Total Workouts Completed */}
        <div className="card-vibrant p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Workouts</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            {sessions.length}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            ~{(sessions.length / 4).toFixed(1)} workouts / wk avg
          </p>
        </div>

        {/* Total Training Volume */}
        <div className="card-vibrant p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Volume</span>
            <Zap className="w-4 h-4 text-[#CCFF00]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            {(totalVolumeAllTime / 1000).toFixed(1)}k <span className="text-xs font-normal text-zinc-400">kg</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {totalSetsAllTime.toLocaleString()} total sets logged
          </p>
        </div>

        {/* Time Under Tension */}
        <div className="card-vibrant p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            {Math.floor(totalMinutesAllTime / 60)}h {totalMinutesAllTime % 60}m
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            ~{Math.round(totalMinutesAllTime / (sessions.length || 1))} min avg / session
          </p>
        </div>
      </div>

      {/* 2-Column Analytics Layout: Weekly Volume Bar Chart & Monthly Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Training Volume SVG Chart */}
        <div className="lg:col-span-8 card-vibrant p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#CCFF00]" />
                Weekly Training Volume & Frequency
              </h3>
              <p className="text-xs text-zinc-400">
                Total weight lifted (kg) and workout counts over the last 8 weeks
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-[#CCFF00]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#CCFF00]" /> Volume (kg)
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" /> Workouts
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-4">
            <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-4 px-2">
              {weeklyStats.map((week, idx) => {
                const volumeHeightPercent = Math.max(8, Math.round((week.totalVolumeKg / maxWeeklyVolume) * 100));
                const workoutHeightPercent = Math.max(8, Math.round((week.workoutCount / maxWeeklyWorkouts) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 bg-zinc-900 border border-zinc-700 text-[10px] text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                      <p className="font-bold">{week.weekLabel}</p>
                      <p className="text-[#CCFF00]">{week.totalVolumeKg.toLocaleString()} kg ({week.workoutCount} workouts)</p>
                    </div>

                    <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-full pb-1">
                      {/* Volume Bar */}
                      <div 
                        style={{ height: `${volumeHeightPercent}%` }}
                        className="w-1/2 bg-gradient-to-t from-[#CCFF00]/40 to-[#CCFF00] rounded-t-md transition-all duration-300 group-hover:brightness-125"
                      />
                      {/* Workout Count Bar */}
                      <div 
                        style={{ height: `${workoutHeightPercent}%` }}
                        className="w-1/2 bg-gradient-to-t from-cyan-500/40 to-cyan-400 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                      />
                    </div>

                    <span className="text-[10px] text-zinc-500 font-bold tracking-tight text-center truncate w-full">
                      {week.weekLabel.split(' ')[0]} {week.weekLabel.split(' ')[1]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="lg:col-span-4 card-vibrant p-6 space-y-4">
          <h3 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Monthly Consistency
          </h3>

          <div className="space-y-2.5">
            {monthlyStats.map((month, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#18181B] border border-zinc-800/80 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">{month.monthLabel}</p>
                  <p className="text-[11px] text-zinc-400">
                    {month.workoutCount} workout{month.workoutCount !== 1 ? 's' : ''} logged
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-[#CCFF00]">
                    {month.totalVolumeKg.toLocaleString()} kg
                  </span>
                  <p className="text-[10px] text-zinc-500 font-semibold">
                    ~{Math.round(month.totalDurationMinutes / 60)} hrs training
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXERCISE PROGRESSION TRACKER */}
      <div className="card-vibrant p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#CCFF00]" />
              Exercise Strength Progression
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select any exercise to see historical weight, 1RM, and volume evolution across your workouts.
            </p>
          </div>

          {/* Exercise Dropdown Selector */}
          <div className="flex items-center gap-3">
            {uniqueExercises.length > 0 && (
              <select
                id="select-analytics-exercise"
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white font-bold text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#CCFF00] transition-colors"
              >
                {uniqueExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            )}

            {/* Metric Toggle */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
              <button
                onClick={() => setProgressionMetric('weight')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  progressionMetric === 'weight'
                    ? 'bg-[#CCFF00] text-[#0A0A0B] font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Weight
              </button>
              <button
                onClick={() => setProgressionMetric('1rm')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  progressionMetric === '1rm'
                    ? 'bg-[#CCFF00] text-[#0A0A0B] font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                1RM
              </button>
              <button
                onClick={() => setProgressionMetric('volume')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  progressionMetric === 'volume'
                    ? 'bg-[#CCFF00] text-[#0A0A0B] font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Volume
              </button>
            </div>
          </div>
        </div>

        {selectedExercise && progressionData.length > 0 ? (
          <div className="space-y-6">
            {/* Selected Exercise Header Card */}
            <div className="p-4 bg-[#18181B] border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                  <ExerciseMedia exercise={selectedExercise} size="sm" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">{selectedExercise.name}</h4>
                  <p className="text-xs text-zinc-400">
                    Logged in <strong className="text-zinc-200">{progressionData.length}</strong> workout sessions
                  </p>
                </div>
              </div>

              {/* Quick Highs */}
              <div className="flex items-center gap-4 text-center sm:text-right w-full sm:w-auto justify-around sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Best Weight</span>
                  <span className="text-base font-black text-white font-mono">
                    {Math.max(...progressionData.map((p) => p.maxWeightKg))} kg
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Best 1RM</span>
                  <span className="text-base font-black text-[#CCFF00] font-mono">
                    {Math.max(...progressionData.map((p) => p.bestEstimated1RM))} kg
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Peak Volume</span>
                  <span className="text-base font-black text-cyan-400 font-mono">
                    {Math.max(...progressionData.map((p) => p.totalVolumeKg)).toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Progression Timeline Steps */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Progression History
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {progressionData.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#18181B] border border-zinc-800/80 rounded-2xl space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-zinc-500">
                        Session #{idx + 1}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-zinc-400">Max Weight:</span>
                        <span className="text-sm font-black text-white font-mono">
                          {point.maxWeightKg} kg
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-zinc-400">Est. 1RM:</span>
                        <span className="text-sm font-bold text-[#CCFF00] font-mono">
                          {point.bestEstimated1RM} kg
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-[11px]">
                        <span className="text-zinc-500">Volume:</span>
                        <span className="text-zinc-300 font-mono">
                          {point.totalVolumeKg.toLocaleString()} kg ({point.totalSets} sets)
                        </span>
                      </div>
                    </div>

                    {point.bestSet && (
                      <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 flex items-center justify-between">
                        <span>Top set:</span>
                        <span className="font-mono text-zinc-200 font-bold">
                          {point.bestSet.weightKg}k × {point.bestSet.reps}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#18181B] border border-zinc-800 rounded-2xl text-zinc-400">
            <p className="text-xs font-bold">
              No historical entries for this exercise yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
