import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { UserProfile, FitnessGoal, ActivityLevel, FoodPreference } from '../types';
import { profileService } from '../services/profile.service';

interface OnboardingPageProps {
  initialUser: UserProfile;
  onComplete: (user: UserProfile) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  initialUser,
  onComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 7;

  // Form State
  const [goal, setGoal] = useState<FitnessGoal>(initialUser.fitness_goal || 'weight_loss');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(initialUser.gender || 'male');
  const [age, setAge] = useState<number>(initialUser.age || 27);
  const [heightCm, setHeightCm] = useState<number>(initialUser.height_cm || 175);
  const [weightKg, setWeightKg] = useState<number>(initialUser.weight_kg || 78.5);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(initialUser.target_weight_kg || 70);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initialUser.activity_level || 'moderately_active');
  const [dietPref, setDietPref] = useState<FoodPreference>(initialUser.food_preference || 'vegetarian');

  // Step 7: Calculated targets
  const targets = profileService.calculateTargets(
    weightKg,
    heightCm,
    age,
    gender,
    activityLevel,
    goal
  );

  const handleFinish = async () => {
    const updatedProfile: UserProfile = {
      ...initialUser,
      fitness_goal: goal,
      gender,
      age,
      height_cm: heightCm,
      weight_kg: weightKg,
      target_weight_kg: targetWeightKg,
      activity_level: activityLevel,
      food_preference: dietPref,
      diet_preference: dietPref,
      daily_calories_target: targets.calories,
      daily_protein_target: targets.protein,
      daily_protein_target_g: targets.protein,
      daily_carbs_target: targets.carbs,
      daily_carbs_target_g: targets.carbs,
      daily_fat_target: targets.fat,
      daily_fat_target_g: targets.fat,
      daily_water_glasses: targets.waterGlasses,
      daily_sleep_hours: targets.sleepHours,
      daily_step_goal: targets.stepGoal,
      onboarding_completed: true
    };

    const saved = await profileService.updateProfile(updatedProfile);
    onComplete(saved);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-[#141416] border border-[#262628] rounded-[32px] p-6 sm:p-8 shadow-2xl relative">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black text-xs">
              {step}
            </div>
            <span className="text-xs font-bold text-zinc-400">Step {step} of {totalSteps}</span>
          </div>

          {/* Progress Pill Track */}
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i + 1 <= step ? 'w-4 bg-[#CCFF00]' : 'w-2 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: GOAL SELECTION */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                What is your primary fitness goal?
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                We'll tailor your daily nutrition, calorie targets and macro balance.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'weight_loss', label: 'Weight & Fat Loss', desc: 'Burn excess fat while retaining lean muscle' },
                { id: 'muscle_gain', label: 'Muscle Building & Hypertrophy', desc: 'High protein focus with caloric surplus' },
                { id: 'weight_gain', label: 'Weight & Bulk Gain', desc: 'Increase healthy body mass and stamina' },
                { id: 'maintenance', label: 'Maintain Current Weight', desc: 'Sustain balanced health and vitality' },
                { id: 'general_fitness', label: 'General Fitness & Energy', desc: 'Improve stamina, sleep and daily vitality' }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setGoal(item.id as FitnessGoal)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    goal === item.id
                      ? 'bg-[#161618] border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                      : 'bg-[#141416] border-[#262628] hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-black text-white">{item.label}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                  {goal === item.id && (
                    <div className="w-5 h-5 rounded-full bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: GENDER & AGE */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                Tell us about yourself
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Used to compute precise Basal Metabolic Rate (BMR).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['male', 'female', 'other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g as any)}
                    className={`py-3.5 rounded-2xl text-xs font-black uppercase transition-all ${
                      gender === g
                        ? 'bg-[#CCFF00] text-[#0A0A0B] shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                        : 'bg-[#161618] border border-[#262628] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                Your Age (Years)
              </label>
              <input
                type="number"
                min="12"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-xl font-bold text-white rounded-2xl p-4 outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 3: HEIGHT & WEIGHT */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                Height & Current Weight
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your physical metrics to establish baseline caloric needs.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                min="50"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-2xl font-black text-white rounded-2xl p-4 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="25"
                max="300"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] focus:border-[#CCFF00] text-2xl font-black text-white rounded-2xl p-4 outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: TARGET WEIGHT */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                What is your target weight?
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Set realistic milestones for healthy sustainable progress.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-emerald-400 mb-2">
                Target Goal Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="25"
                max="300"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                className="w-full bg-[#161618] border border-[#262628] focus:border-emerald-400 text-3xl font-black text-white rounded-2xl p-4 outline-none"
                autoFocus
              />
            </div>

            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-xs space-y-1">
              <span className="text-zinc-400">Weight delta:</span>
              <p className="text-white font-bold">
                {Math.abs(weightKg - targetWeightKg).toFixed(1)} kg {weightKg > targetWeightKg ? 'deficit to burn' : 'surplus to gain'}
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: ACTIVITY LEVEL */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                Daily Activity Level
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                How active is your lifestyle outside dedicated workouts?
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little to no exercise' },
                { id: 'lightly_active', label: 'Lightly Active', desc: '1-3 days of light exercise/walking' },
                { id: 'moderately_active', label: 'Moderately Active', desc: '3-5 days of moderate exercise' },
                { id: 'very_active', label: 'Very Active', desc: '6-7 days of intense workouts' },
                { id: 'extra_active', label: 'Extra Active', desc: 'Daily intense training or physical labor job' }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActivityLevel(item.id as ActivityLevel)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    activityLevel === item.id
                      ? 'bg-[#161618] border-[#CCFF00]'
                      : 'bg-[#141416] border-[#262628] hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-black text-white">{item.label}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                  {activityLevel === item.id && (
                    <Check className="w-4 h-4 text-[#CCFF00] stroke-[3]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: DIETARY PREFERENCE */}
        {step === 6 && (
          <div className="space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                Dietary Preference
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Select your food lifestyle to optimize macro sources.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'vegetarian', label: 'Vegetarian', desc: 'Dairy, pulses, grains, veggies' },
                { id: 'non_vegetarian', label: 'Non-Vegetarian', desc: 'Chicken, fish, eggs, meat' },
                { id: 'eggetarian', label: 'Eggetarian', desc: 'Vegetarian + Eggs' },
                { id: 'vegan', label: 'Vegan', desc: '100% plant-based' }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setDietPref(item.id as FoodPreference)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    dietPref === item.id
                      ? 'bg-[#161618] border-[#CCFF00]'
                      : 'bg-[#141416] border-[#262628] hover:border-zinc-700'
                  }`}
                >
                  <h4 className="text-xs font-black text-white">{item.label}</h4>
                  <p className="text-[10px] text-zinc-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: CALCULATED PLAN & FINISH */}
        {step === 7 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-[#0A0A0B] flex items-center justify-center font-black mx-auto mb-2 shadow-[0_0_20px_rgba(204,255,0,0.3)]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                Your Custom Plan is Ready!
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Computed using scientific Mifflin-St Jeor equation.
              </p>
            </div>

            <div className="p-5 bg-[#161618] border border-[#262628] rounded-2xl space-y-4">
              <div className="text-center pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Daily Calorie Target
                </span>
                <p className="text-4xl font-black text-[#CCFF00] font-display mt-0.5">
                  {targets.calories} <span className="text-sm font-bold text-zinc-400">kcal/day</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                  <p className="text-base font-black text-emerald-400 font-display">{targets.protein}g</p>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Protein</span>
                </div>
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                  <p className="text-base font-black text-purple-400 font-display">{targets.carbs}g</p>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Carbs</span>
                </div>
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                  <p className="text-base font-black text-amber-400 font-display">{targets.fat}g</p>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Fat</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="text-zinc-400 font-bold">
                  💧 <strong className="text-cyan-400">{targets.waterGlasses}</strong> gl
                </div>
                <div className="text-zinc-400 font-bold">
                  🌙 <strong className="text-purple-400">{targets.sleepHours}</strong> hrs
                </div>
                <div className="text-zinc-400 font-bold">
                  ⚡ <strong className="text-[#FF5C00]">{targets.stepGoal}</strong> steps
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-6 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="py-3.5 px-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button
              type="button"
              id="btn-onboarding-next"
              onClick={() => setStep(step + 1)}
              className="py-3.5 px-6 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all active:scale-95 ml-auto"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-onboarding-finish"
              onClick={handleFinish}
              className="py-3.5 px-6 bg-[#CCFF00] hover:bg-[#b3e600] text-[#0A0A0B] font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.3)] transition-all active:scale-95 ml-auto"
            >
              <span>Go to FitSathi Dashboard</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
