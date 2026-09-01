import React, { useState } from 'react';
import { X, Check, BookOpen, Plus, Trash2 } from 'lucide-react';
import { DietPlan, DietPlanMeal, FitnessGoal, MealType, UserProfile } from '../../types';
import { dietService } from '../../services/diet.service';

interface CreateDietPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onPlanCreated: () => void;
}

export const CreateDietPlanModal: React.FC<CreateDietPlanModalProps> = ({
  isOpen,
  onClose,
  user,
  onPlanCreated
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<FitnessGoal>('muscle_gain');
  const [targetCalories, setTargetCalories] = useState<number>(2200);
  const [targetProtein, setTargetProtein] = useState<number>(120);
  const [targetCarbs, setTargetCarbs] = useState<number>(250);
  const [targetFat, setTargetFat] = useState<number>(65);
  const [budget, setBudget] = useState<number>(350);

  const [meals, setMeals] = useState<DietPlanMeal[]>([
    {
      id: 'm1',
      diet_plan_id: '',
      meal_type: 'breakfast',
      food_id: 'f-oats-banana',
      food_name: 'Oats with Banana & Honey',
      quantity: 1,
      serving_unit: 'bowl',
      calories: 310,
      protein_g: 8.5,
      carbs_g: 56,
      fat_g: 5.5,
      fiber_g: 6.5
    },
    {
      id: 'm2',
      diet_plan_id: '',
      meal_type: 'lunch',
      food_id: 'f-roti-paneer-salad',
      food_name: 'Roti (2 pcs), Paneer Bhurji & Salad',
      quantity: 1,
      serving_unit: 'plate',
      calories: 450,
      protein_g: 24,
      carbs_g: 48,
      fat_g: 18,
      fiber_g: 7.5
    }
  ]);

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddMealRow = (mealType: MealType) => {
    const newMeal: DietPlanMeal = {
      id: 'm-' + Math.random().toString(36).substring(2, 7),
      diet_plan_id: '',
      meal_type: mealType,
      food_id: 'custom',
      food_name: 'Custom Food Item',
      quantity: 1,
      serving_unit: 'serving',
      calories: 200,
      protein_g: 10,
      carbs_g: 25,
      fat_g: 6,
      fiber_g: 3
    };
    setMeals([...meals, newMeal]);
  };

  const handleRemoveMealRow = (id: string) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const handleUpdateMeal = (id: string, field: keyof DietPlanMeal, value: any) => {
    setMeals(meals.map(m => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await dietService.createDietPlan(
        {
          user_id: user.id,
          name: name.trim(),
          description: description.trim(),
          goal,
          target_calories: Number(targetCalories),
          target_protein_g: Number(targetProtein),
          target_carbs_g: Number(targetCarbs),
          target_fat_g: Number(targetFat),
          budget: Number(budget),
          meals
        },
        user.id
      );
      onPlanCreated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totals = dietService.calculatePlanTotals(meals);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#141416] border border-[#262628] w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-[#262628] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-display">
                Create Custom Diet Plan
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Design your manual meal structure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Plan Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. High Protein Vegetarian Cutting Plan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Description & Notes
            </label>
            <textarea
              rows={2}
              placeholder="Overview of foods, timing, water intake..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#161618] border border-[#262628] text-sm text-white rounded-2xl p-3 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Target Fitness Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as FitnessGoal)}
                className="w-full bg-[#161618] border border-[#262628] text-sm text-white rounded-2xl px-3 py-2.5 outline-none"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="weight_gain">Weight Gain</option>
                <option value="maintenance">Maintenance</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Daily Budget (₹ / day)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
              />
            </div>
          </div>

          {/* Target Macros Grid */}
          <div className="p-4 bg-[#161618] border border-[#262628] rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Daily Target Macros</h4>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#CCFF00]">Calories</label>
                <input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white rounded-xl p-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-emerald-400">Protein (g)</label>
                <input
                  type="number"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white rounded-xl p-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-purple-400">Carbs (g)</label>
                <input
                  type="number"
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white rounded-xl p-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-amber-400">Fat (g)</label>
                <input
                  type="number"
                  value={targetFat}
                  onChange={(e) => setTargetFat(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-white rounded-xl p-2"
                />
              </div>
            </div>
          </div>

          {/* Meals List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Plan Meals</h4>
              <div className="flex gap-1.5">
                {(['breakfast', 'lunch', 'evening_snack', 'dinner'] as MealType[]).map((mt) => (
                  <button
                    key={mt}
                    type="button"
                    onClick={() => handleAddMealRow(mt)}
                    className="text-[10px] font-bold bg-zinc-900 border border-zinc-800 hover:border-[#CCFF00] px-2 py-1 rounded-lg text-zinc-300 capitalize"
                  >
                    +{mt.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="p-3 bg-[#161618] border border-[#262628] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] font-black uppercase bg-zinc-800 px-2 py-1 rounded text-zinc-300">
                      {meal.meal_type.replace('_', ' ')}
                    </span>
                    <input
                      type="text"
                      value={meal.food_name}
                      onChange={(e) => handleUpdateMeal(meal.id, 'food_name', e.target.value)}
                      className="bg-transparent text-xs font-bold text-white outline-none flex-1 border-b border-transparent focus:border-zinc-700"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={meal.calories}
                      onChange={(e) => handleUpdateMeal(meal.id, 'calories', Number(e.target.value))}
                      className="w-16 bg-zinc-900 text-xs text-center font-bold text-[#CCFF00] rounded-lg p-1"
                      title="kcal"
                    />
                    <span className="text-[10px] text-zinc-500 font-bold">kcal</span>

                    <input
                      type="number"
                      value={meal.protein_g}
                      onChange={(e) => handleUpdateMeal(meal.id, 'protein_g', Number(e.target.value))}
                      className="w-12 bg-zinc-900 text-xs text-center font-bold text-emerald-400 rounded-lg p-1"
                      title="Protein (g)"
                    />
                    <span className="text-[10px] text-zinc-500 font-bold">P</span>

                    <button
                      type="button"
                      onClick={() => handleRemoveMealRow(meal.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Meals Calculated Totals vs Target */}
            <div className="mt-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-bold">Calculated Plan Total:</span>
              <div className="flex items-center gap-3">
                <span className="text-[#CCFF00] font-black">{totals.calories} kcal</span>
                <span className="text-emerald-400 font-bold">{totals.protein_g}g P</span>
                <span className="text-purple-400 font-bold">{totals.carbs_g}g C</span>
                <span className="text-amber-400 font-bold">{totals.fat_g}g F</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase rounded-2xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-diet-plan"
              disabled={saving}
              className="flex-[2] py-3 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {saving ? 'Saving...' : 'Save Diet Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
