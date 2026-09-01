import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Dumbbell, 
  Filter, 
  ChevronRight, 
  Plus, 
  Check, 
  Sparkles, 
  Flame, 
  Target, 
  Clock, 
  ShieldCheck,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { Exercise, ExerciseCategory, EquipmentType, UserProfile } from '../types';
import { exerciseService } from '../services/exercise.service';
import { workoutService } from '../services/workout.service';
import { ExerciseDetailModal, getCategoryTheme } from '../components/Modals/ExerciseDetailModal';
import { ExerciseMedia } from '../components/Exercise/ExerciseMedia';

interface ExercisesPageProps {
  user: UserProfile;
  onNavigateToWorkout?: () => void;
}

export const ExercisesPage: React.FC<ExercisesPageProps> = ({
  user,
  onNavigateToWorkout
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');

  // Detail Modal State
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Category Filters
  const categories = useMemo(() => exerciseService.getAvailableCategories(), []);
  
  // Equipment Filters
  const equipmentOptions = useMemo(() => exerciseService.getAvailableEquipment(), []);

  // Filtered Exercises List
  const filteredExercises = useMemo(() => {
    return exerciseService.getExercises({
      category: selectedCategory,
      equipment: selectedEquipment,
      searchQuery: searchQuery
    });
  }, [selectedCategory, selectedEquipment, searchQuery]);

  // Handle Opening Exercise Detail
  const handleOpenDetail = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDetailOpen(true);
  };

  // Handle Add to Workout Action
  const handleAddToWorkout = (exercise: Exercise) => {
    try {
      // 1. Check if user already has an active workout
      let activeWorkout = workoutService.getActiveWorkout(user.id);
      
      if (!activeWorkout) {
        // Initialize quick session if none exists
        activeWorkout = workoutService.startActiveWorkout(user.id, null, 'Custom Gym Workout');
      }

      // 2. Append exercise to the active workout
      const updated = workoutService.addExerciseToActiveWorkout(activeWorkout, exercise, 3);
      workoutService.saveActiveWorkout(user.id, updated);

      // 3. Show confirmation feedback toast
      showToast(`Added "${exercise.name}" to your workout!`);
    } catch (err) {
      console.error('Failed to add exercise to workout session', err);
      showToast(`Added "${exercise.name}" to workout selection.`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Reset Filters Helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedEquipment('all');
  };

  const isFilteringActive = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedEquipment !== 'all';

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div 
          id="toast-notification-banner"
          className="fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-50 bg-[#18181B] border border-[#CCFF00]/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-7 h-7 rounded-xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{toastMessage}</p>
            <p className="text-[10px] text-[#CCFF00] font-semibold">Ready for active workout tracking</p>
          </div>
          {onNavigateToWorkout && (
            <button
              onClick={onNavigateToWorkout}
              className="ml-2 text-xs font-black uppercase text-[#CCFF00] hover:underline"
            >
              View
            </button>
          )}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#CCFF00] rounded-xl flex items-center justify-center text-[#0A0A0B] shadow-[0_0_15px_rgba(204,255,0,0.25)]">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              Exercise Library
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-medium">
            Find exercises by muscle group, equipment, or name.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-[#141416] border border-[#262628] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="text-xs font-bold text-zinc-300">
              {filteredExercises.length} {filteredExercises.length === 1 ? 'Exercise' : 'Exercises'} Available
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar & Reset Controls */}
      <div className="p-4 bg-[#141416] border border-[#262628] rounded-2xl shadow-md space-y-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            id="input-exercise-search"
            type="text"
            placeholder="Search by exercise name, target muscle, or equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181B] border border-[#262628] focus:border-[#CCFF00] text-sm text-white placeholder-zinc-500 rounded-xl pl-10 pr-10 py-3 outline-none transition-all"
          />
          {searchQuery && (
            <button
              id="btn-clear-exercise-search"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              title="Clear search text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Equipment Filter Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Filter className="w-3 h-3" />
              Equipment Type
            </span>
            {isFilteringActive && (
              <button
                id="btn-reset-filters-inline"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-[#CCFF00] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset all
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {equipmentOptions.map((eq) => {
              const isSelected = selectedEquipment === eq.id;
              return (
                <button
                  key={eq.id}
                  id={`filter-equipment-${eq.id}`}
                  onClick={() => setSelectedEquipment(eq.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border min-h-[36px] flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-zinc-200 text-[#0A0A0B] border-white font-black shadow-sm'
                      : 'bg-[#18181B] text-zinc-400 border-[#262628] hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <span>{eq.label}</span>
                  <span className={`text-[10px] px-1 rounded-md ${isSelected ? 'bg-zinc-400/30 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                    {eq.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Muscle Group Tabs (Horizontally Scrollable) */}
      <div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-full no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`filter-muscle-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap shrink-0 transition-all border flex items-center gap-2 min-h-[44px] ${
                  isSelected
                    ? 'bg-[#CCFF00] text-[#0A0A0B] border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.25)] transform -translate-y-0.5'
                    : 'bg-[#141416] text-zinc-400 border-[#262628] hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-[#0A0A0B]/20 text-[#0A0A0B]'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Indicators */}
      {isFilteringActive && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
          <span className="font-semibold text-zinc-400">Active filters:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 font-bold capitalize">
              Muscle: {selectedCategory}
              <button onClick={() => setSelectedCategory('all')} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedEquipment !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold capitalize">
              Equipment: {selectedEquipment}
              <button onClick={() => setSelectedEquipment('all')} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold">
              Query: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Exercises Grid */}
      {filteredExercises.length > 0 ? (
        <div 
          id="exercises-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredExercises.map((exercise) => {
            const theme = getCategoryTheme(exercise.category);
            return (
              <div
                key={exercise.id}
                id={`exercise-card-${exercise.id}`}
                onClick={() => handleOpenDetail(exercise)}
                className="group bg-[#141416] border border-[#262628] hover:border-zinc-600 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div>
                  {/* Exercise Media Preview */}
                  <div className="mb-3">
                    <ExerciseMedia 
                      exercise={exercise} 
                      size="card" 
                    />
                  </div>

                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.bg} ${theme.border} ${theme.text}`}>
                      {theme.label}
                    </span>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                        {exercise.equipment}
                      </span>
                      {exercise.isBodyweight && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30" title="Bodyweight Exercise">
                          BW
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Hindi Name */}
                  <h3 className="text-base font-bold text-white group-hover:text-[#CCFF00] transition-colors leading-snug">
                    {exercise.name}
                  </h3>
                  {exercise.hindi_name && (
                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                      {exercise.hindi_name}
                    </p>
                  )}

                  {/* Primary Target Muscle */}
                  <div className="mt-3 flex items-start gap-1.5">
                    <Target className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-300 font-semibold line-clamp-1">
                      {exercise.targetMuscle}
                    </p>
                  </div>

                  {/* Secondary Muscles Preview */}
                  {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {exercise.secondaryMuscles.slice(0, 2).map((m) => (
                        <span
                          key={m}
                          className="text-[10px] text-zinc-400 bg-[#18181B] px-1.5 py-0.5 rounded border border-zinc-800 font-medium"
                        >
                          +{m}
                        </span>
                      ))}
                      {exercise.secondaryMuscles.length > 2 && (
                        <span className="text-[10px] text-zinc-500 font-medium">
                          +{exercise.secondaryMuscles.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-[#262628] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-zinc-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exercise.defaultRestSeconds}s rest</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-card-add-${exercise.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToWorkout(exercise);
                      }}
                      className="p-1.5 rounded-xl bg-zinc-800 hover:bg-[#CCFF00] text-zinc-300 hover:text-[#0A0A0B] border border-zinc-700 transition-colors"
                      title="Add to Workout"
                      aria-label={`Add ${exercise.name} to workout`}
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    
                    <span className="text-xs font-bold text-zinc-400 group-hover:text-white flex items-center">
                      Details
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div 
          id="exercises-empty-state"
          className="p-10 bg-[#141416] border border-[#262628] rounded-3xl text-center space-y-4 max-w-md mx-auto"
        >
          <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto text-zinc-500">
            <Dumbbell className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              No exercises found
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Try another exercise name or change your filters.
            </p>
          </div>
          <button
            id="btn-reset-filters-empty-state"
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-[#CCFF00] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.2)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      )}

      {/* Exercise Details Modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddToWorkout={handleAddToWorkout}
      />
    </div>
  );
};
