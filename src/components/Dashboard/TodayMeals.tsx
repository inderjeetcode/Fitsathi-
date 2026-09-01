import React from 'react';
import { Plus, Check, Coffee, Sun, Sunset, Moon } from 'lucide-react';
import { FoodLog, MealType } from '../../types';

interface TodayMealsProps {
  foodLogs: FoodLog[];
  onAddMealForType: (mealType: MealType) => void;
  onOpenDietPlan: () => void;
}

interface MealSlotConfig {
  type: MealType;
  label: string;
  defaultTime: string;
  icon: React.ElementType;
  defaultImage: string;
}

export const TodayMeals: React.FC<TodayMealsProps> = ({
  foodLogs,
  onAddMealForType,
  onOpenDietPlan
}) => {
  const mealSlots: MealSlotConfig[] = [
    {
      type: 'breakfast',
      label: 'Breakfast',
      defaultTime: '8:30 AM',
      icon: Coffee,
      defaultImage: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=300&auto=format&fit=crop&q=80'
    },
    {
      type: 'lunch',
      label: 'Lunch',
      defaultTime: '1:30 PM',
      icon: Sun,
      defaultImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80'
    },
    {
      type: 'evening_snack',
      label: 'Evening Snack',
      defaultTime: '5:30 PM',
      icon: Sunset,
      defaultImage: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80'
    },
    {
      type: 'dinner',
      label: 'Dinner',
      defaultTime: '8:30 PM',
      icon: Moon,
      defaultImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="card-vibrant p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider font-display">
            Today's Meals
          </h3>
          <p className="text-zinc-500 text-xs font-medium mt-0.5">
            Log your daily nutrition meals
          </p>
        </div>
        <button
          id="btn-view-edit-diet-plan"
          onClick={onOpenDietPlan}
          className="text-xs font-black text-[#CCFF00] hover:underline"
        >
          View / Edit Diet Plan →
        </button>
      </div>

      {/* Horizontal Carousel with touch snapping */}
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar -mx-2 px-2">
        {mealSlots.map((slot) => {
          const items = foodLogs.filter(f => f.meal_type === slot.type);
          const hasItems = items.length > 0;
          const totalCalories = items.reduce((acc, c) => acc + (c.calories || 0), 0);
          const summaryText = hasItems
            ? items.map(i => i.food_name).join(', ')
            : 'No foods logged yet';

          return (
            <div
              key={slot.type}
              onClick={() => onAddMealForType(slot.type)}
              className="w-[190px] sm:w-[210px] shrink-0 bg-[#141416] border border-[#262628] hover:border-zinc-700 rounded-[22px] p-3 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1 group shadow-sm"
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-black text-white">{slot.label}</h4>
                  <span className="text-[10px] text-zinc-500 font-bold">{slot.defaultTime}</span>
                </div>
                {hasItems ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-[#CCFF00] group-hover:text-[#0A0A0B] flex items-center justify-center transition-colors">
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Meal Photo / Placeholder Image */}
              <div className="w-full h-24 rounded-xl overflow-hidden bg-zinc-900 my-1 relative">
                <img
                  src={slot.defaultImage}
                  alt={slot.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-1.5 left-2 right-2 flex justify-between items-center">
                  <span className="text-[11px] font-black text-[#CCFF00] drop-shadow-md">
                    {hasItems ? `${totalCalories} kcal` : 'Tap to log'}
                  </span>
                </div>
              </div>

              {/* Food summary text */}
              <div className="mt-1">
                <p className="text-xs font-bold text-zinc-300 truncate" title={summaryText}>
                  {hasItems ? summaryText : '+ Add item'}
                </p>
                <p className="text-[10px] text-zinc-500 font-medium">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          );
        })}

        {/* Add Other / Late Snack Card */}
        <div
          onClick={() => onAddMealForType('late_snack')}
          className="w-[160px] shrink-0 bg-[#141416] border border-dashed border-zinc-700 hover:border-[#CCFF00] rounded-[22px] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-900 group-hover:bg-[#CCFF00] group-hover:text-[#0A0A0B] text-zinc-400 flex items-center justify-center mb-2 transition-all">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-black text-white group-hover:text-[#CCFF00]">
            + Add Snack
          </span>
          <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
            Late night or snack
          </span>
        </div>
      </div>
    </div>
  );
};
