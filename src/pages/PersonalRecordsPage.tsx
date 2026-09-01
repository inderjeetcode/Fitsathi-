import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Search, 
  Filter, 
  Play, 
  Flame, 
  Zap, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Dumbbell, 
  ChevronRight, 
  Layers
} from 'lucide-react';
import { UserProfile, PersonalRecord, ExerciseCategory } from '../types';
import { workoutService } from '../services/workout.service';
import { exerciseService } from '../services/exercise.service';
import { ExerciseMedia } from '../components/Exercise/ExerciseMedia';

interface PersonalRecordsPageProps {
  user: UserProfile;
  onStartWorkout: () => void;
  onViewAnalytics?: () => void;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'all', label: 'All Records' },
  { key: 'chest', label: 'Chest' },
  { key: 'back', label: 'Back' },
  { key: 'legs', label: 'Legs' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'arms', label: 'Arms' },
  { key: 'core', label: 'Core' }
];

export const PersonalRecordsPage: React.FC<PersonalRecordsPageProps> = ({
  user,
  onStartWorkout,
  onViewAnalytics
}) => {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPR, setSelectedPR] = useState<PersonalRecord | null>(null);

  const loadPRs = async () => {
    setLoading(true);
    try {
      const data = await workoutService.getPersonalRecords(user.id);
      setRecords(data);
    } catch (err) {
      console.error('Error loading PRs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPRs();
  }, [user.id]);

  // Enrich PRs with exercise metadata (category, equipment, targetMuscle)
  const enrichedRecords = useMemo(() => {
    return records.map((pr) => {
      const exMeta = exerciseService.getExerciseById(pr.exercise_id);
      return {
        ...pr,
        category: exMeta?.category || 'other',
        equipment: exMeta?.equipment || 'barbell',
        targetMuscle: exMeta?.targetMuscle || 'full_body'
      };
    });
  }, [records]);

  // Filter by category and search
  const filteredRecords = useMemo(() => {
    return enrichedRecords.filter((pr) => {
      const matchesSearch = pr.exercise_name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'chest') return pr.category === 'chest' || pr.targetMuscle.includes('chest');
      if (selectedCategory === 'back') return pr.category === 'back' || pr.targetMuscle.includes('back') || pr.targetMuscle.includes('lats');
      if (selectedCategory === 'legs') return pr.category === 'legs' || pr.targetMuscle.includes('quad') || pr.targetMuscle.includes('glute') || pr.targetMuscle.includes('hamstring') || pr.targetMuscle.includes('calves');
      if (selectedCategory === 'shoulders') return pr.category === 'shoulders' || pr.targetMuscle.includes('shoulder') || pr.targetMuscle.includes('deltoid');
      if (selectedCategory === 'arms') return pr.category === 'arms' || pr.targetMuscle.includes('bicep') || pr.targetMuscle.includes('tricep');
      if (selectedCategory === 'core') return pr.category === 'core' || pr.targetMuscle.includes('ab') || pr.targetMuscle.includes('core');

      return true;
    });
  }, [enrichedRecords, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-[#0A0A0B] flex items-center justify-center font-black shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight uppercase">
              Personal Records
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
              Hall of fame for your heaviest lifts, peak estimated 1RMs, and rep records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onViewAnalytics && (
            <button
              id="btn-nav-prs-analytics"
              onClick={onViewAnalytics}
              className="px-3.5 py-2.5 rounded-xl bg-[#141416] border border-[#262628] hover:border-zinc-600 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-2 transition-colors min-h-[44px]"
            >
              <TrendingUp className="w-4 h-4 text-[#CCFF00]" />
              <span>Strength Progression</span>
            </button>
          )}

          <button
            id="btn-prs-start-workout"
            onClick={onStartWorkout}
            className="px-4 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.25)] transition-all active:scale-95 min-h-[44px]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Workout</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            id="input-search-prs"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search personal records by exercise name..."
            className="w-full bg-[#141416] border border-[#262628] focus:border-amber-400/60 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              id={`cat-pr-${cat.key}`}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-amber-400 text-[#0A0A0B] font-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : 'bg-[#18181B] text-zinc-400 hover:text-white border border-[#262628]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRs Grid */}
      {loading ? (
        <div className="p-12 text-center text-zinc-500">
          <Trophy className="w-8 h-8 mx-auto text-amber-400 animate-bounce mb-2" />
          <p className="text-xs font-bold">Loading your personal records...</p>
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((pr) => (
            <div
              key={pr.id || pr.exercise_id}
              id={`pr-card-${pr.exercise_id}`}
              className="card-vibrant p-5 space-y-4 hover:border-amber-500/50 transition-all border border-amber-500/20 group"
            >
              {/* Exercise Info & Media Header */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#262628]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                    <ExerciseMedia
                      exercise={{
                        id: pr.exercise_id,
                        name: pr.exercise_name,
                        category: pr.category as any,
                        equipment: pr.equipment as any,
                        targetMuscle: pr.targetMuscle
                      }}
                      size="sm"
                    />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border border-amber-400/30 mb-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      PR
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                      {pr.exercise_name}
                    </h3>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>

              {/* 3 Metrics: Best Weight, Best Reps, Best 1RM */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-[#18181B] border border-zinc-800/80 rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">
                    Best Weight
                  </span>
                  <span className="text-sm sm:text-base font-black text-white font-mono">
                    {pr.best_weight_kg} <span className="text-[10px] font-normal text-zinc-500">kg</span>
                  </span>
                </div>

                <div className="p-2.5 bg-[#18181B] border border-zinc-800/80 rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">
                    Best Reps
                  </span>
                  <span className="text-sm sm:text-base font-black text-white font-mono">
                    {pr.best_reps} <span className="text-[10px] font-normal text-zinc-500">reps</span>
                  </span>
                </div>

                <div className="p-2.5 bg-[#18181B] border border-zinc-800/80 rounded-xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">
                    Est. 1RM
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#CCFF00] font-mono">
                    {pr.best_estimated_1rm} <span className="text-[10px] font-normal text-zinc-500">kg</span>
                  </span>
                </div>
              </div>

              {/* Achievement Footer */}
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-[#262628]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Achieved: {pr.achieved_date}</span>
                </div>
                <span className="capitalize text-zinc-400 font-semibold">{pr.targetMuscle}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div 
          id="prs-empty-state"
          className="card-vibrant p-12 text-center space-y-4 max-w-md mx-auto"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-400">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              No Personal Records Yet
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Start an active workout and log your sets. FitSathi will automatically detect your best sets and record your achievements!
            </p>
          </div>
          <button
            id="btn-start-pr-workout"
            onClick={onStartWorkout}
            className="px-6 py-3 rounded-2xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Workout</span>
          </button>
        </div>
      )}
    </div>
  );
};
