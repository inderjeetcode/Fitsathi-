import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Dumbbell, 
  Plus, 
  Check, 
  Target, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { Exercise, ExerciseCategory, EquipmentType } from '../../types';
import { exerciseService } from '../../services/exercise.service';
import { getCategoryTheme } from './ExerciseDetailModal';
import { ExerciseMedia } from '../Exercise/ExerciseMedia';

interface SelectExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  alreadySelectedIds?: string[];
}

export const SelectExerciseModal: React.FC<SelectExerciseModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  alreadySelectedIds = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');

  const categories = useMemo(() => exerciseService.getAvailableCategories(), []);
  const equipmentOptions = useMemo(() => exerciseService.getAvailableEquipment(), []);

  const exercises = useMemo(() => {
    return exerciseService.getExercises({
      category: selectedCategory,
      equipment: selectedEquipment,
      searchQuery
    });
  }, [selectedCategory, selectedEquipment, searchQuery]);

  if (!isOpen) return null;

  return (
    <div 
      id="select-exercise-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="select-exercise-modal"
        className="bg-[#141416] border border-[#262628] w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#262628] bg-gradient-to-b from-[#18181B] to-[#141416]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black">
                <Dumbbell className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight font-display">
                  Add Exercise to Routine
                </h2>
                <p className="text-xs text-zinc-400 font-medium">
                  Select from {exercises.length} available exercises
                </p>
              </div>
            </div>

            <button
              id="btn-close-select-exercise-modal"
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              id="input-select-exercise-search"
              type="text"
              placeholder="Search exercise by name or muscle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181B] border border-[#262628] focus:border-[#CCFF00] text-sm text-white placeholder-zinc-500 rounded-xl pl-10 pr-10 py-2.5 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Muscle Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-all border ${
                    isSelected
                      ? 'bg-[#CCFF00] text-[#0A0A0B] border-[#CCFF00]'
                      : 'bg-[#18181B] text-zinc-400 border-[#262628] hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercises List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-2.5 flex-1">
          {exercises.length > 0 ? (
            exercises.map((exercise) => {
              const theme = getCategoryTheme(exercise.category);
              const isAlreadyAdded = alreadySelectedIds.includes(exercise.id);

              return (
                <div
                  key={exercise.id}
                  id={`select-exercise-item-${exercise.id}`}
                  className="p-3.5 bg-[#18181B] border border-[#262628] hover:border-zinc-600 rounded-2xl flex items-center justify-between gap-3 transition-all duration-150"
                >
                  <ExerciseMedia 
                    exercise={exercise} 
                    size="thumb" 
                    className="w-12 h-12 rounded-xl shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.bg} ${theme.border} ${theme.text}`}>
                        {theme.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                        {exercise.equipment}
                      </span>
                      {exercise.isBodyweight && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30 flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          BW
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug truncate">
                      {exercise.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1 truncate">
                        <Target className="w-3 h-3 text-zinc-500 shrink-0" />
                        {exercise.targetMuscle}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
                        {exercise.defaultRestSeconds}s rest
                      </span>
                    </div>
                  </div>

                  <button
                    id={`btn-add-exercise-${exercise.id}`}
                    onClick={() => onSelectExercise(exercise)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all active:scale-95 ${
                      isAlreadyAdded
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-[#CCFF00] hover:text-[#0A0A0B]'
                        : 'bg-[#CCFF00] text-[#0A0A0B] hover:opacity-90 shadow-[0_0_12px_rgba(204,255,0,0.2)]'
                    }`}
                  >
                    {isAlreadyAdded ? (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        Add Again
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-zinc-500">
              <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-zinc-400">No exercises match your search</p>
              <p className="text-xs text-zinc-500 mt-0.5">Try searching with a different keyword or category</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262628] bg-[#161618] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
