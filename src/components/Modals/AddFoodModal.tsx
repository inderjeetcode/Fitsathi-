import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Minus, Check, Sparkles, Utensils } from 'lucide-react';
import { FoodItem, FoodCategory, MealType, UserProfile } from '../../types';
import { foodService } from '../../services/food.service';
import { nutritionService } from '../../services/nutrition.service';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  initialMealType?: MealType;
  onFoodLogged: () => void;
  onOpenCreateCustomFood: () => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  user,
  initialMealType = 'breakfast',
  onFoodLogged,
  onOpenCreateCustomFood
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('all');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Selected food for quantity customization
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [logging, setLogging] = useState(false);

  const categories: { id: FoodCategory; label: string }[] = [
    { id: 'all', label: 'All Foods' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'rice_grains', label: 'Rice & Grains' },
    { id: 'dal_legumes', label: 'Dal & Legumes' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'eggs', label: 'Eggs' },
    { id: 'chicken_meat', label: 'Chicken & Meat' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'snacks', label: 'Snacks & Nuts' },
    { id: 'beverages', label: 'Beverages' },
    { id: 'indian_meals', label: 'Indian Thali / Meals' }
  ];

  // Load foods
  useEffect(() => {
    if (!isOpen) return;
    setMealType(initialMealType);
    loadFoods();
  }, [isOpen, selectedCategory, searchQuery]);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const list = await foodService.getFoods(user.id, selectedCategory, searchQuery);
      setFoods(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantity(food.serving_size > 0 ? food.serving_size : 1);
  };

  const handleLogFood = async () => {
    if (!selectedFood) return;
    setLogging(true);
    try {
      await nutritionService.logFood(
        selectedFood,
        quantity,
        mealType,
        user.id
      );
      onFoodLogged();
      setSelectedFood(null);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  if (!isOpen) return null;

  // Live nutrition preview if food selected
  const calculated = selectedFood
    ? nutritionService.calculateNutrition(selectedFood, quantity)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#141416] border border-[#262628] w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#262628] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-display">
                {selectedFood ? 'Adjust Food Quantity' : 'Add Food to Today'}
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                {selectedFood ? 'Review calculated macros' : 'Search Indian & Global Foods'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (selectedFood) setSelectedFood(null);
              else onClose();
            }}
            className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: FOOD LIST & SEARCH */}
        {!selectedFood ? (
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5">
            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search Indian food (e.g., Poha, Paneer, Rice, Dal)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-sm text-white placeholder:text-zinc-500 rounded-2xl pl-10 pr-4 py-3 outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* Category horizontal pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#CCFF00] text-[#0A0A0B] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                      : 'bg-[#161618] border border-[#262628] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Custom Food Creation banner */}
            <div className="mb-3 flex items-center justify-between p-3 bg-purple-950/20 border border-purple-500/30 rounded-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-300">Can't find your food?</span>
              </div>
              <button
                id="btn-add-custom-food-link"
                onClick={() => {
                  onClose();
                  onOpenCreateCustomFood();
                }}
                className="text-xs font-black text-[#CCFF00] hover:underline"
              >
                + Create Custom Food
              </button>
            </div>

            {/* Food Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="p-8 text-center text-zinc-500 text-xs">Loading food library...</div>
              ) : foods.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-bold text-zinc-400">No foods found matching "{searchQuery}"</p>
                  <p className="text-xs text-zinc-600 mt-1">Try another keyword or create a custom food.</p>
                </div>
              ) : (
                foods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="p-3.5 bg-[#161618] border border-[#262628] hover:border-zinc-700 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:bg-zinc-800/40 group"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white truncate">{food.name}</p>
                        {food.is_custom && (
                          <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400 mt-1">
                        <span className="text-zinc-300 font-bold">
                          {food.serving_size} {food.serving_unit}
                        </span>
                        <span>•</span>
                        <span className="text-[#CCFF00] font-black">{food.calories} kcal</span>
                        <span>•</span>
                        <span className="text-emerald-400">{food.protein_g}g P</span>
                        <span className="text-purple-400">{food.carbs_g}g C</span>
                        <span className="text-amber-400">{food.fat_g}g F</span>
                      </div>
                    </div>

                    <button className="w-8 h-8 rounded-xl bg-zinc-800 group-hover:bg-[#CCFF00] group-hover:text-[#0A0A0B] text-zinc-400 flex items-center justify-center transition-all shrink-0">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* STEP 2: QUANTITY & MEAL SELECTOR */
          <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-5">
            {/* Selected Food Overview Card */}
            <div className="p-4 bg-[#161618] border border-[#262628] rounded-2xl">
              <h3 className="text-base font-black text-white">{selectedFood.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Base: {selectedFood.serving_size} {selectedFood.serving_unit} = {selectedFood.calories} kcal
              </p>
            </div>

            {/* Meal Slot Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Select Meal
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'breakfast', label: 'Breakfast' },
                  { id: 'lunch', label: 'Lunch' },
                  { id: 'evening_snack', label: 'Snack' },
                  { id: 'dinner', label: 'Dinner' },
                  { id: 'late_snack', label: 'Late Snack' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMealType(m.id as MealType)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                      mealType === m.id
                        ? 'bg-[#CCFF00] text-[#0A0A0B] shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                        : 'bg-[#161618] border border-[#262628] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Quantity ({selectedFood.serving_unit})
              </label>
              <div className="flex items-center gap-4 bg-[#161618] border border-[#262628] rounded-2xl p-2 justify-between">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - (selectedFood.serving_unit === 'g' ? 25 : 1)))}
                  className="w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors active:scale-95"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-24 bg-transparent text-center text-3xl font-black text-white font-display outline-none"
                  />
                  <span className="text-xs text-zinc-400 font-bold block">{selectedFood.serving_unit}</span>
                </div>

                <button
                  onClick={() => setQuantity(quantity + (selectedFood.serving_unit === 'g' ? 25 : 1))}
                  className="w-11 h-11 rounded-xl bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] flex items-center justify-center transition-all active:scale-95 shadow-[0_0_10px_rgba(204,255,0,0.2)]"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Live Nutrition Calculation */}
            {calculated && (
              <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">
                  Calculated Nutrition for {quantity} {selectedFood.serving_unit}
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-[#141416] rounded-xl border border-zinc-800">
                    <p className="text-lg font-black text-[#CCFF00] font-display">{calculated.calories}</p>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Calories</span>
                  </div>
                  <div className="p-2 bg-[#141416] rounded-xl border border-zinc-800">
                    <p className="text-lg font-black text-emerald-400 font-display">{calculated.protein_g}g</p>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Protein</span>
                  </div>
                  <div className="p-2 bg-[#141416] rounded-xl border border-zinc-800">
                    <p className="text-lg font-black text-purple-400 font-display">{calculated.carbs_g}g</p>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Carbs</span>
                  </div>
                  <div className="p-2 bg-[#141416] rounded-xl border border-zinc-800">
                    <p className="text-lg font-black text-amber-400 font-display">{calculated.fat_g}g</p>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Fats</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedFood(null)}
                className="flex-1 py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors"
              >
                Back to Search
              </button>
              <button
                type="button"
                id="btn-confirm-add-food"
                onClick={handleLogFood}
                disabled={logging}
                className="flex-[2] py-3.5 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all active:scale-95 disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                {logging ? 'Adding...' : "Add to Today's Food"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
