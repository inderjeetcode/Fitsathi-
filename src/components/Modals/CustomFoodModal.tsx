import React, { useState } from 'react';
import { X, Check, Utensils } from 'lucide-react';
import { FoodItem, UserProfile } from '../../types';
import { foodService } from '../../services/food.service';

interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  editingFood?: FoodItem | null;
  onFoodSaved: (food: FoodItem) => void;
}

export const CustomFoodModal: React.FC<CustomFoodModalProps> = ({
  isOpen,
  onClose,
  user,
  editingFood,
  onFoodSaved
}) => {
  const [name, setName] = useState(editingFood?.name || '');
  const [servingSize, setServingSize] = useState(editingFood?.serving_size || 1);
  const [servingUnit, setServingUnit] = useState(editingFood?.serving_unit || 'piece');
  const [calories, setCalories] = useState(editingFood?.calories || 250);
  const [protein, setProtein] = useState(editingFood?.protein_g || 10);
  const [carbs, setCarbs] = useState(editingFood?.carbs_g || 30);
  const [fat, setFat] = useState(editingFood?.fat_g || 8);
  const [fiber, setFiber] = useState(editingFood?.fiber_g || 2);
  const [category, setCategory] = useState(editingFood?.category || 'breakfast');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      if (editingFood) {
        const updated = await foodService.updateCustomFood(
          {
            ...editingFood,
            name: name.trim(),
            serving_size: Number(servingSize) || 1,
            serving_unit: servingUnit,
            calories: Number(calories) || 0,
            protein_g: Number(protein) || 0,
            carbs_g: Number(carbs) || 0,
            fat_g: Number(fat) || 0,
            fiber_g: Number(fiber) || 0,
            category
          },
          user.id
        );
        onFoodSaved(updated);
      } else {
        const created = await foodService.addCustomFood(
          {
            name: name.trim(),
            serving_size: Number(servingSize) || 1,
            serving_unit: servingUnit,
            calories: Number(calories) || 0,
            protein_g: Number(protein) || 0,
            carbs_g: Number(carbs) || 0,
            fat_g: Number(fat) || 0,
            fiber_g: Number(fiber) || 0,
            category
          },
          user.id
        );
        onFoodSaved(created);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#141416] border border-[#262628] w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#262628] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-display">
                {editingFood ? 'Edit Custom Food' : 'Create Custom Food'}
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Save to your private food library
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Food Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Homemade Paneer Roll, Mom's Khichdi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-sm text-white rounded-2xl px-4 py-3 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Serving Size
              </label>
              <input
                type="number"
                min="1"
                required
                value={servingSize}
                onChange={(e) => setServingSize(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-sm text-white rounded-2xl px-4 py-3 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Serving Unit
              </label>
              <input
                type="text"
                required
                placeholder="e.g. piece, roll, bowl, g"
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-sm text-white rounded-2xl px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#CCFF00] mb-1.5">
                Calories (kcal) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-sm font-bold text-white rounded-2xl px-4 py-3 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                Protein (g) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] focus:border-emerald-400 text-sm font-bold text-white rounded-2xl px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-1.5">
                Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] focus:border-purple-400 text-sm text-white rounded-2xl px-3 py-2.5 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] focus:border-amber-400 text-sm text-white rounded-2xl px-3 py-2.5 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Fiber (g)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={fiber}
                onChange={(e) => setFiber(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] focus:border-zinc-500 text-sm text-white rounded-2xl px-3 py-2.5 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase rounded-2xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-custom-food"
              disabled={saving}
              className="flex-[2] py-3 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {saving ? 'Saving...' : 'Save Food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
