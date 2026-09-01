import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { localDb } from '../lib/supabase';
import { UserProfile, FitnessGoal, ActivityLevel } from '../types';

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        const snap = await getDoc(doc(db, 'profiles', userId));
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          localDb.saveProfile(data);
          return data;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `profiles/${userId}`);
      }
    }

    const profiles = localDb.getProfiles();
    return profiles[userId] || null;
  },

  async updateProfile(userIdOrProfile: string | UserProfile, updates?: Partial<UserProfile>): Promise<UserProfile> {
    let userId: string;
    let newProfileData: UserProfile;

    if (typeof userIdOrProfile === 'string') {
      userId = userIdOrProfile;
      const existing = await this.getProfile(userId);
      newProfileData = {
        ...(existing || {} as UserProfile),
        ...updates,
        id: userId,
        updated_at: new Date().toISOString()
      };
    } else {
      userId = userIdOrProfile.id;
      newProfileData = {
        ...userIdOrProfile,
        updated_at: new Date().toISOString()
      };
    }

    if (auth.currentUser && auth.currentUser.uid === userId) {
      try {
        await setDoc(doc(db, 'profiles', userId), newProfileData);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `profiles/${userId}`);
      }
    }

    localDb.saveProfile(newProfileData);
    return newProfileData;
  },

  calculateTargets(
    weightKg: number,
    heightCm: number,
    age: number,
    gender: 'male' | 'female' | 'other',
    activityLevel: ActivityLevel,
    fitnessGoal: FitnessGoal
  ) {
    // 1. Calculate BMR (Mifflin-St Jeor)
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    // 2. Activity Multipliers
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      light: 1.375,
      moderately_active: 1.55,
      moderate: 1.55,
      very_active: 1.725,
      active: 1.725,
      extra_active: 1.9
    };
    const tdee = bmr * (multipliers[activityLevel] || 1.375);

    // 3. Goal Adjustments
    let calorieTarget = tdee;
    if (fitnessGoal === 'weight_loss') calorieTarget -= 450;
    else if (fitnessGoal === 'weight_gain' || fitnessGoal === 'muscle_gain') calorieTarget += 300;

    calorieTarget = Math.max(1200, Math.round(calorieTarget));

    // 4. Macro Splits
    let proteinPerKg = 1.6;
    if (fitnessGoal === 'muscle_gain' || fitnessGoal === 'weight_gain') proteinPerKg = 2.0;
    else if (fitnessGoal === 'weight_loss') proteinPerKg = 1.8;

    const proteinG = Math.round(weightKg * proteinPerKg);
    const fatG = Math.round((calorieTarget * 0.25) / 9);
    const remainingCalories = calorieTarget - (proteinG * 4 + fatG * 9);
    const carbsG = Math.max(50, Math.round(remainingCalories / 4));

    // 5. Water & Sleep Goals
    const waterGlasses = Math.round((weightKg * 0.033 * 1000) / 250);

    return {
      calories: calorieTarget,
      protein: proteinG,
      carbs: carbsG,
      fat: fatG,
      waterGlasses: Math.max(6, waterGlasses),
      sleepHours: 8,
      stepGoal: 10000
    };
  },

  async calculateAndSaveTargets(
    userId: string,
    profile: Pick<UserProfile, 'age' | 'gender' | 'height_cm' | 'weight_kg' | 'fitness_goal' | 'activity_level'>
  ): Promise<UserProfile> {
    const targets = this.calculateTargets(
      profile.weight_kg,
      profile.height_cm,
      profile.age,
      profile.gender,
      profile.activity_level,
      profile.fitness_goal
    );

    const calculatedTargets: Partial<UserProfile> = {
      ...profile,
      daily_calories_target: targets.calories,
      daily_protein_target: targets.protein,
      daily_protein_target_g: targets.protein,
      daily_carbs_target: targets.carbs,
      daily_carbs_target_g: targets.carbs,
      daily_fat_target: targets.fat,
      daily_fat_target_g: targets.fat,
      daily_water_glasses: targets.waterGlasses,
      daily_step_goal: targets.stepGoal,
      daily_sleep_hours: targets.sleepHours
    };

    return this.updateProfile(userId, calculatedTargets);
  }
};
