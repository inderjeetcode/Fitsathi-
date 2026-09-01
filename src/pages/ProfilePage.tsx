import React, { useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { UserProfile, FitnessGoal, ActivityLevel, FoodPreference } from '../types';
import { profileService } from '../services/profile.service';

interface ProfilePageProps {
  user: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onProfileUpdated
}) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAutoCalculate = () => {
    const suggested = profileService.calculateTargets(
      formData.weight_kg,
      formData.height_cm,
      formData.age,
      formData.gender,
      formData.activity_level,
      formData.fitness_goal
    );

    setFormData(prev => ({
      ...prev,
      daily_calories_target: suggested.calories,
      daily_protein_target: suggested.protein,
      daily_protein_target_g: suggested.protein,
      daily_carbs_target: suggested.carbs,
      daily_carbs_target_g: suggested.carbs,
      daily_fat_target: suggested.fat,
      daily_fat_target_g: suggested.fat,
      daily_water_glasses: suggested.waterGlasses,
      daily_sleep_hours: suggested.sleepHours,
      daily_step_goal: suggested.stepGoal
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await profileService.updateProfile(formData);
      onProfileUpdated(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
          User Profile & Daily Targets
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
          Configure body biometric parameters and customized macro targets
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-2 text-emerald-400 text-xs font-bold animate-in fade-in">
          <Check className="w-4 h-4 stroke-[3]" />
          Profile and targets updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Biometrics Card */}
        <div className="card-vibrant p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Personal & Biometric Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="w-full bg-[#141416] border border-[#262628] focus:border-[#CCFF00] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full bg-[#141416] border border-[#262628] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="12"
                max="120"
                value={formData.age}
                onChange={(e) => handleChange('age', Number(e.target.value))}
                className="w-full bg-[#141416] border border-[#262628] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                min="50"
                max="250"
                value={formData.height_cm}
                onChange={(e) => handleChange('height_cm', Number(e.target.value))}
                className="w-full bg-[#141416] border border-[#262628] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={formData.weight_kg}
                onChange={(e) => handleChange('weight_kg', Number(e.target.value))}
                className="w-full bg-[#141416] border border-[#262628] text-sm text-white rounded-2xl px-4 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-emerald-400 mb-1.5">
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={formData.target_weight_kg || ''}
                onChange={(e) => handleChange('target_weight_kg', Number(e.target.value))}
                className="w-full bg-[#141416] border border-[#262628] focus:border-emerald-400 text-sm font-bold text-white rounded-2xl px-4 py-2.5 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                Activity Level
              </label>
              <select
                value={formData.activity_level}
                onChange={(e) => handleChange('activity_level', e.target.value as ActivityLevel)}
                className="w-full bg-[#141416] border border-[#262628] text-sm text-white rounded-2xl px-3 py-2.5 outline-none"
              >
                <option value="sedentary">Sedentary (Desk Job)</option>
                <option value="lightly_active">Lightly Active (1-3 days)</option>
                <option value="moderately_active">Moderately Active (3-5 days)</option>
                <option value="very_active">Very Active (6-7 days)</option>
                <option value="extra_active">Extra Active (Athlete)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                Fitness Goal
              </label>
              <select
                value={formData.fitness_goal}
                onChange={(e) => handleChange('fitness_goal', e.target.value as FitnessGoal)}
                className="w-full bg-[#141416] border border-[#262628] text-sm text-white rounded-2xl px-3 py-2.5 outline-none"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="weight_gain">Weight Gain</option>
                <option value="maintenance">Maintenance</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5">
                Diet Preference
              </label>
              <select
                value={formData.food_preference}
                onChange={(e) => {
                  handleChange('food_preference', e.target.value as FoodPreference);
                  handleChange('diet_preference', e.target.value as FoodPreference);
                }}
                className="w-full bg-[#141416] border border-[#262628] text-sm text-white rounded-2xl px-3 py-2.5 outline-none"
              >
                <option value="vegetarian">Vegetarian (Indian)</option>
                <option value="non_vegetarian">Non-Vegetarian</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Daily Target Macros & Goals Card */}
        <div className="card-vibrant p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Daily Nutritional & Lifestyle Targets
            </h3>
            <button
              type="button"
              id="btn-recalculate-targets"
              onClick={handleAutoCalculate}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-[#CCFF00] text-zinc-300 hover:text-[#CCFF00] text-xs font-black rounded-xl flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recalculate via Science Formulas
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-[#CCFF00] mb-1.5">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={formData.daily_calories_target}
                onChange={(e) => handleChange('daily_calories_target', Number(e.target.value))}
                className="w-full bg-[#141416] border border-[#262628] focus:border-[#CCFF00] text-lg font-black text-white rounded-2xl p-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-emerald-400 mb-1.5">
                Protein (g)
              </label>
              <input
                type="number"
                value={formData.daily_protein_target}
                onChange={(e) => {
                  handleChange('daily_protein_target', Number(e.target.value));
                  handleChange('daily_protein_target_g', Number(e.target.value));
                }}
                className="w-full bg-[#141416] border border-[#262628] focus:border-emerald-400 text-lg font-black text-emerald-300 rounded-2xl p-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-purple-400 mb-1.5">
                Carbs (g)
              </label>
              <input
                type="number"
                value={formData.daily_carbs_target}
                onChange={(e) => {
                  handleChange('daily_carbs_target', Number(e.target.value));
                  handleChange('daily_carbs_target_g', Number(e.target.value));
                }}
                className="w-full bg-[#141416] border border-[#262628] focus:border-purple-400 text-lg font-black text-purple-300 rounded-2xl p-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-amber-400 mb-1.5">
                Fat (g)
              </label>
              <input
                type="number"
                value={formData.daily_fat_target}
                onChange={(e) => {
                  handleChange('daily_fat_target', Number(e.target.value));
                  handleChange('daily_fat_target_g', Number(e.target.value));
                }}
                className="w-full bg-[#141416] border border-[#262628] focus:border-amber-400 text-lg font-black text-amber-300 rounded-2xl p-3 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-cyan-400 mb-1.5">
                Water Target (Glasses)
              </label>
              <input
                type="number"
                value={formData.daily_water_glasses}
                onChange={(e) => handleChange('daily_water_glasses', Number(e.target.value))}
                className="w-full bg-[#141416] border border-[#262628] text-sm text-white rounded-2xl p-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-indigo-400 mb-1.5">
                Sleep Target (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.daily_sleep_hours}
                onChange={(e) => handleChange('daily_sleep_hours', Number(e.target.value))}
                className="w-full bg-[#141416] border border-[#262628] text-sm text-white rounded-2xl p-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#FF5C00] mb-1.5">
                Daily Step Goal
              </label>
              <input
                type="number"
                step="500"
                value={formData.daily_step_goal}
                onChange={(e) => handleChange('daily_step_goal', Number(e.target.value))}
                className="w-full bg-[#141416] border border-[#262628] text-sm text-white rounded-2xl p-2.5 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="btn-save-profile"
          disabled={saving}
          className="w-full py-4 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.3)] transition-all active:scale-95 disabled:opacity-50"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          {saving ? 'Saving...' : 'Save Profile & Targets'}
        </button>
      </form>
    </div>
  );
};
