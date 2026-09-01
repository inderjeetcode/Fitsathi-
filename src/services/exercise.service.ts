import { Exercise, ExerciseCategory, EquipmentType } from '../types';
import { INITIAL_EXERCISES } from '../data/exercises';

export interface ExerciseFilterOptions {
  category?: ExerciseCategory | 'all';
  equipment?: EquipmentType | 'all';
  searchQuery?: string;
  isBodyweightOnly?: boolean;
}

export const exerciseService = {
  /**
   * Retrieves all exercises with optional combined filtering for muscle category, equipment, and search text.
   */
  getExercises(options: ExerciseFilterOptions = {}): Exercise[] {
    const {
      category = 'all',
      equipment = 'all',
      searchQuery = '',
      isBodyweightOnly = false
    } = options;

    const trimmedQuery = searchQuery.toLowerCase().trim();

    return INITIAL_EXERCISES.filter((exercise) => {
      // 1. Muscle Category Filter
      if (category !== 'all' && exercise.category !== category) {
        return false;
      }

      // 2. Equipment Filter
      if (equipment !== 'all' && exercise.equipment !== equipment) {
        return false;
      }

      // 3. Bodyweight-only Filter
      if (isBodyweightOnly && !exercise.isBodyweight) {
        return false;
      }

      // 4. Search Query (matches name, hindi_name, targetMuscle, secondaryMuscles, equipment, category)
      if (trimmedQuery) {
        const nameMatch = exercise.name.toLowerCase().includes(trimmedQuery);
        const hindiMatch = exercise.hindi_name ? exercise.hindi_name.toLowerCase().includes(trimmedQuery) : false;
        const targetMatch = exercise.targetMuscle.toLowerCase().includes(trimmedQuery);
        const categoryMatch = exercise.category.toLowerCase().includes(trimmedQuery);
        const equipmentMatch = exercise.equipment.toLowerCase().includes(trimmedQuery);
        const secondaryMatch = exercise.secondaryMuscles
          ? exercise.secondaryMuscles.some((m) => m.toLowerCase().includes(trimmedQuery))
          : false;

        if (!nameMatch && !hindiMatch && !targetMatch && !categoryMatch && !equipmentMatch && !secondaryMatch) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Retrieves a single exercise by ID.
   */
  getExerciseById(id: string): Exercise | null {
    if (!id) return null;
    return INITIAL_EXERCISES.find((ex) => ex.id === id) || null;
  },

  /**
   * Returns list of unique muscle categories present in the database.
   */
  getAvailableCategories(): { id: ExerciseCategory | 'all'; label: string; count: number }[] {
    const categories: { id: ExerciseCategory | 'all'; label: string }[] = [
      { id: 'all', label: 'All' },
      { id: 'chest', label: 'Chest' },
      { id: 'back', label: 'Back' },
      { id: 'legs', label: 'Legs' },
      { id: 'shoulders', label: 'Shoulders' },
      { id: 'biceps', label: 'Biceps' },
      { id: 'triceps', label: 'Triceps' },
      { id: 'core', label: 'Core' },
      { id: 'cardio', label: 'Cardio' }
    ];

    return categories.map((cat) => {
      const count = cat.id === 'all'
        ? INITIAL_EXERCISES.length
        : INITIAL_EXERCISES.filter((ex) => ex.category === cat.id).length;
      return { ...cat, count };
    });
  },

  /**
   * Returns list of equipment types present in the database.
   */
  getAvailableEquipment(): { id: EquipmentType | 'all'; label: string; count: number }[] {
    const equipmentTypes: { id: EquipmentType | 'all'; label: string }[] = [
      { id: 'all', label: 'All' },
      { id: 'barbell', label: 'Barbell' },
      { id: 'dumbbell', label: 'Dumbbell' },
      { id: 'machine', label: 'Machine' },
      { id: 'cable', label: 'Cable' },
      { id: 'bodyweight', label: 'Bodyweight' },
      { id: 'kettlebell', label: 'Kettlebell' },
      { id: 'bands', label: 'Bands' },
      { id: 'none', label: 'None' }
    ];

    return equipmentTypes.map((eq) => {
      const count = eq.id === 'all'
        ? INITIAL_EXERCISES.length
        : INITIAL_EXERCISES.filter((ex) => ex.equipment === eq.id).length;
      return { ...eq, count };
    });
  },

  /**
   * Validates dataset integrity (IDs, required fields, rest time).
   */
  validateDatabase(): { valid: boolean; errors: string[]; totalCount: number } {
    const errors: string[] = [];
    const idSet = new Set<string>();

    INITIAL_EXERCISES.forEach((ex, idx) => {
      if (!ex.id || typeof ex.id !== 'string') {
        errors.push(`Exercise at index ${idx} is missing a valid string ID.`);
      } else if (idSet.has(ex.id)) {
        errors.push(`Duplicate exercise ID found: "${ex.id}"`);
      } else {
        idSet.add(ex.id);
      }

      if (!ex.name || typeof ex.name !== 'string') {
        errors.push(`Exercise "${ex.id || idx}" is missing a name.`);
      }

      if (!ex.targetMuscle || typeof ex.targetMuscle !== 'string') {
        errors.push(`Exercise "${ex.id || idx}" is missing targetMuscle.`);
      }

      if (!ex.category || typeof ex.category !== 'string') {
        errors.push(`Exercise "${ex.id || idx}" is missing category.`);
      }

      if (!ex.equipment || typeof ex.equipment !== 'string') {
        errors.push(`Exercise "${ex.id || idx}" is missing equipment.`);
      }

      if (typeof ex.isBodyweight !== 'boolean') {
        errors.push(`Exercise "${ex.id || idx}" isBodyweight must be boolean.`);
      }

      if (typeof ex.defaultRestSeconds !== 'number' || ex.defaultRestSeconds <= 0) {
        errors.push(`Exercise "${ex.id || idx}" defaultRestSeconds must be positive number.`);
      }

      if (!Array.isArray(ex.instructions) || ex.instructions.length === 0) {
        errors.push(`Exercise "${ex.id || idx}" must have at least one instruction step.`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      totalCount: INITIAL_EXERCISES.length
    };
  }
};
