import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Utensils, 
  BookOpen, 
  Sparkles, 
  Search, 
  Coffee, 
  Sun, 
  Sunset, 
  Moon,
  Flame
} from 'lucide-react';
import { 
  UserProfile, 
  FoodLog, 
  FoodItem, 
  MealType, 
  DailyNutritionSummary, 
  FoodCategory 
} from '../types';
import { foodService } from '../services/food.service';
import { nutritionService } from '../services/nutrition.service';

interface NutritionPageProps {
  user: UserProfile;
  foodLogs: FoodLog[];
  nutritionSummary: DailyNutritionSummary;
  onOpenAddFood: (mealType?: MealType) => void;
  onOpenCreateCustomFood: (foodToEdit?: FoodItem) => void;
  onFoodLogsUpdated: () => void;
}

export const NutritionPage: React.FC<NutritionPageProps> = ({
  user,
  foodLogs,
  nutritionSummary,
  onOpenAddFood,
  onOpenCreateCustomFood,
  onFoodLogsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'database' | 'custom'>('today');
  const [dbCategory, setDbCategory] = useState<FoodCategory>('all');
  const [dbSearch, setDbSearch] = useState('');
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDatabaseFoods();
    loadCustomFoods();
  }, [dbCategory, dbSearch, activeTab]);

  const loadDatabaseFoods = async () => {
    setLoading(true);
    try {
      const list = await foodService.getFoods(user.id, dbCategory, dbSearch);
      setAllFoods(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomFoods = async () => {
    try {
      const list = await foodService.getCustomFoods(user.id);
      setCustomFoods(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await nutritionService.deleteFoodLog(logId, user.id);
      onFoodLogsUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCustomFood = async (foodId: string) => {
    try {
      await foodService.deleteCustomFood(foodId, user.id);
      loadCustomFoods();
    } catch (err) {
      console.error(err);
    }
  };

  const mealSections: { type: MealType; label: string; icon: React.ElementType }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: Coffee },
    { type: 'lunch', label: 'Lunch', icon: Sun },
    { type: 'evening_snack', label: 'Evening Snack', icon: Sunset },
    { type: 'dinner', label: 'Dinner', icon: Moon },
    { type: 'late_snack', label: 'Late Snack / Other', icon: Utensils }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
            Diet & Nutrition
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
            Manage your daily meals and nutritional balance
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-[#161618] border border-[#262628] p-1 rounded-2xl self-start sm:self-auto">
          <button
            id="tab-nutrition-today"
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'today'
                ? 'bg-[#CCFF00] text-[#0A0A0B] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Today's Food
          </button>
          <button
            id="tab-nutrition-db"
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'database'
                ? 'bg-[#CCFF00] text-[#0A0A0B] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Food Library
          </button>
          <button
            id="tab-nutrition-custom"
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'custom'
                ? 'bg-[#CCFF00] text-[#0A0A0B] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            My Custom Foods ({customFoods.length})
          </button>
        </div>
      </div>

      {/* Daily Nutrition Summary Strip */}
      <div className="card-vibrant p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Daily Macro Breakdown
          </span>
          <span className="text-xs font-bold text-[#CCFF00]">
            {nutritionSummary.totalCalories} / {nutritionSummary.targetCalories} kcal
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-center">
            <p className="text-xl font-black text-white font-display">{nutritionSummary.totalCalories}</p>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Calories (kcal)</span>
          </div>
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-center">
            <p className="text-xl font-black text-emerald-400 font-display">{nutritionSummary.totalProtein}g</p>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Protein ({nutritionSummary.targetProtein}g)</span>
          </div>
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-center">
            <p className="text-xl font-black text-purple-400 font-display">{nutritionSummary.totalCarbs}g</p>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Carbs ({nutritionSummary.targetCarbs}g)</span>
          </div>
          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-center">
            <p className="text-xl font-black text-amber-400 font-display">{nutritionSummary.totalFat}g</p>
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Fats ({nutritionSummary.targetFat}g)</span>
          </div>
        </div>
      </div>

      {/* TAB 1: TODAY'S FOOD LOGS */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {mealSections.map((section) => {
            const SectionIcon = section.icon;
            const items = foodLogs.filter(f => f.meal_type === section.type);
            const sectionCalories = items.reduce((acc, c) => acc + (c.calories || 0), 0);
            const sectionProtein = items.reduce((acc, c) => acc + (c.protein_g || 0), 0);

            return (
              <div key={section.type} className="card-vibrant p-5">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#CCFF00]">
                      <SectionIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">{section.label}</h3>
                      <span className="text-[10px] text-zinc-500 font-bold">
                        {sectionCalories} kcal • {sectionProtein.toFixed(1)}g Protein
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAddFood(section.type)}
                    className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    Add
                  </button>
                </div>

                {/* Items List */}
                {items.length === 0 ? (
                  <p className="text-xs text-zinc-600 py-3 italic text-center">
                    No food logged for {section.label}.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {items.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-[#141416] border border-[#262628] rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{log.food_name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                            <span>{log.quantity} {log.serving_unit}</span>
                            <span>•</span>
                            <span className="text-[#CCFF00] font-black">{log.calories} kcal</span>
                            <span>•</span>
                            <span className="text-emerald-400">{log.protein_g}g P</span>
                            <span className="text-purple-400">{log.carbs_g}g C</span>
                            <span className="text-amber-400">{log.fat_g}g F</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                          title="Delete food entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: FOOD DATABASE */}
      {activeTab === 'database' && (
        <div className="card-vibrant p-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search Indian & Global Foods..."
              value={dbSearch}
              onChange={(e) => setDbSearch(e.target.value)}
              className="w-full bg-[#141416] border border-[#262628] text-sm text-white rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:border-[#CCFF00]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {allFoods.map((food) => (
              <div
                key={food.id}
                className="p-3.5 bg-[#141416] border border-[#262628] rounded-2xl flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">{food.name}</p>
                    {food.hindi_name && (
                      <span className="text-[10px] text-zinc-500 font-medium">({food.hindi_name})</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {food.serving_size} {food.serving_unit} • <strong className="text-[#CCFF00]">{food.calories} kcal</strong> • {food.protein_g}g P
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddFood()}
                  className="p-2 bg-zinc-800 hover:bg-[#CCFF00] hover:text-[#0A0A0B] text-zinc-300 rounded-xl transition-all"
                  title="Log this food"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MY CUSTOM FOODS */}
      {activeTab === 'custom' && (
        <div className="card-vibrant p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white">Your Custom Foods</h3>
            <button
              id="btn-create-custom-food-top"
              onClick={() => onOpenCreateCustomFood()}
              className="px-3.5 py-1.5 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              + Create Food
            </button>
          </div>

          {customFoods.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800">
              <p className="text-sm font-bold text-zinc-400">No custom foods created yet</p>
              <p className="text-xs text-zinc-600 mt-1">
                Add home recipes like "Homemade Paneer Roll" with custom calories and macros.
              </p>
              <button
                onClick={() => onOpenCreateCustomFood()}
                className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-[#CCFF00] text-xs font-bold rounded-xl"
              >
                + Create First Custom Food
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {customFoods.map((food) => (
                <div
                  key={food.id}
                  className="p-3.5 bg-[#141416] border border-[#262628] rounded-2xl flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{food.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <span>{food.serving_size} {food.serving_unit}</span>
                      <span>•</span>
                      <span className="text-[#CCFF00] font-black">{food.calories} kcal</span>
                      <span>•</span>
                      <span className="text-emerald-400">{food.protein_g}g Protein</span>
                      <span className="text-purple-400">{food.carbs_g}g Carbs</span>
                      <span className="text-amber-400">{food.fat_g}g Fat</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenCreateCustomFood(food)}
                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCustomFood(food.id)}
                      className="p-1.5 text-zinc-600 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
