import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2, ChevronRight, Utensils, Zap, Sparkles } from 'lucide-react';
import { UserProfile, DietPlan } from '../types';
import { dietService } from '../services/diet.service';
import { nutritionService } from '../services/nutrition.service';

interface DietPlansPageProps {
  user: UserProfile;
  onOpenCreatePlan: () => void;
  onPlanApplied: () => void;
}

export const DietPlansPage: React.FC<DietPlansPageProps> = ({
  user,
  onOpenCreatePlan,
  onPlanApplied
}) => {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [user.id]);

  const loadPlans = async () => {
    try {
      const list = await dietService.getDietPlans(user.id);
      setPlans(list);
      if (list.length > 0 && !selectedPlan) {
        setSelectedPlan(list[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyPlan = async (plan: DietPlan) => {
    setApplying(true);
    try {
      // Log all meals from the plan into today's food log
      for (const meal of plan.meals) {
        await nutritionService.logFood(
          {
            id: meal.food_id || 'plan-food',
            user_id: user.id,
            name: meal.food_name,
            serving_size: meal.quantity,
            serving_unit: meal.serving_unit,
            calories: meal.calories,
            protein_g: meal.protein_g,
            carbs_g: meal.carbs_g,
            fat_g: meal.fat_g,
            fiber_g: meal.fiber_g,
            category: 'indian_meals',
            is_custom: true,
            created_at: new Date().toISOString()
          },
          meal.quantity,
          meal.meal_type,
          user.id
        );
      }
      setAppliedSuccess(true);
      onPlanApplied();
      setTimeout(() => setAppliedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await dietService.deleteDietPlan(planId, user.id);
      loadPlans();
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
            Diet Plans & Meal Structures
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
            Organize full-day meal schedules and log entire days in 1 click
          </p>
        </div>

        <button
          id="btn-create-diet-plan"
          onClick={onOpenCreatePlan}
          className="px-4 py-2.5 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Create Custom Plan
        </button>
      </div>

      {appliedSuccess && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">
            Diet Plan successfully logged into Today's Food list! Check your nutrition summary.
          </span>
        </div>
      )}

      {/* Grid Layout: Plan Selector & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Plan Cards */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Available Plans ({plans.length})
          </h3>

          {plans.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            const totals = dietService.calculatePlanTotals(plan.meals);

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#161618] border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                    : 'bg-[#141416] border-[#262628] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {plan.goal.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-black text-white mt-1.5">{plan.name}</h4>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#CCFF00]' : 'text-zinc-600'}`} />
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                  {plan.description || 'Structured daily meal plan.'}
                </p>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-800/80 text-[11px] font-bold">
                  <span className="text-[#CCFF00]">{totals.calories} kcal</span>
                  <span className="text-emerald-400">{totals.protein_g}g P</span>
                  <span className="text-purple-400">{totals.carbs_g}g C</span>
                  <span className="text-amber-400">{totals.fat_g}g F</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Plan Details */}
        <div className="lg:col-span-7">
          {selectedPlan ? (
            <div className="card-vibrant p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#CCFF00]">
                    {selectedPlan.goal.replace('_', ' ')} Target
                  </span>
                  <h2 className="text-xl font-black text-white font-display mt-0.5">
                    {selectedPlan.name}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    {selectedPlan.description}
                  </p>
                </div>

                <button
                  onClick={() => handleDeletePlan(selectedPlan.id)}
                  className="p-2 text-zinc-600 hover:text-red-400"
                  title="Delete Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Target vs Actual Grid */}
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
                  <p className="text-lg font-black text-[#CCFF00] font-display">
                    {selectedPlan.target_calories}
                  </p>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Target kcal</span>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
                  <p className="text-lg font-black text-emerald-400 font-display">
                    {selectedPlan.target_protein_g}g
                  </p>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Protein</span>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
                  <p className="text-lg font-black text-purple-400 font-display">
                    {selectedPlan.target_carbs_g}g
                  </p>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Carbs</span>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
                  <p className="text-lg font-black text-amber-400 font-display">
                    {selectedPlan.target_fat_g}g
                  </p>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Fat</span>
                </div>
              </div>

              {/* Meals in Plan */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Included Meals ({selectedPlan.meals.length})
                </h3>

                <div className="space-y-2">
                  {selectedPlan.meals.map((meal, idx) => (
                    <div
                      key={meal.id || idx}
                      className="p-3.5 bg-[#141416] border border-[#262628] rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded">
                            {meal.meal_type.replace('_', ' ')}
                          </span>
                          <p className="text-xs font-bold text-white">{meal.food_name}</p>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          {meal.quantity} {meal.serving_unit} • {meal.calories} kcal • {meal.protein_g}g P • {meal.carbs_g}g C • {meal.fat_g}g F
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Click Apply Button */}
              <button
                id="btn-apply-diet-plan-today"
                onClick={() => handleApplyPlan(selectedPlan)}
                disabled={applying}
                className="w-full py-3.5 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-[#0A0A0B]" />
                {applying ? 'Logging Meals...' : "Log All Meals to Today's Food (1-Click)"}
              </button>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#141416] border border-[#262628] rounded-[24px]">
              <p className="text-zinc-500 text-sm font-bold">Select a plan to view meal details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
