import { auth, googleProvider, signInWithPopup, signOut as fbSignOut, handleFirestoreError, OperationType, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { localDb } from '../lib/supabase';
import { UserProfile } from '../types';

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (auth.currentUser) {
      try {
        const snap = await getDoc(doc(db, 'profiles', auth.currentUser.uid));
        if (snap.exists()) {
          return snap.data() as UserProfile;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `profiles/${auth.currentUser.uid}`);
      }
    }

    const currentId = localDb.getCurrentUserId();
    if (!currentId) return null;
    const profiles = localDb.getProfiles();
    return profiles[currentId] || null;
  },

  async signInWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const profileRef = doc(db, 'profiles', user.uid);
      const snap = await getDoc(profileRef);
      
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        localDb.setCurrentUserId(profile.id);
        localDb.saveProfile(profile);
        return profile;
      }

      // Create new profile in Firestore
      const newProfile: UserProfile = {
        id: user.uid,
        email: user.email || 'user@example.com',
        full_name: user.displayName || user.email?.split('@')[0] || 'User',
        age: 26,
        gender: 'male',
        height_cm: 175,
        weight_kg: 70,
        target_weight_kg: 68,
        fitness_goal: 'general_fitness',
        activity_level: 'moderate',
        food_preference: 'vegetarian',
        diet_preference: 'vegetarian',
        allergies: [],
        daily_calories_target: 2200,
        daily_protein_target: 120,
        daily_protein_target_g: 120,
        daily_carbs_target: 275,
        daily_carbs_target_g: 275,
        daily_fat_target: 65,
        daily_fat_target_g: 65,
        daily_water_glasses: 8,
        daily_step_goal: 10000,
        daily_sleep_hours: 8,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(profileRef, newProfile);
      localDb.setCurrentUserId(newProfile.id);
      localDb.saveProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error('Google Sign-in failed', error);
      throw error;
    }
  },

  async login(email: string, _password?: string): Promise<UserProfile> {
    const profiles = localDb.getProfiles();
    const existing = Object.values(profiles).find(p => p.email.toLowerCase() === email.toLowerCase());
    
    if (existing) {
      localDb.setCurrentUserId(existing.id);
      return existing;
    }

    const newId = 'user-' + Math.random().toString(36).substring(2, 9);
    const newProfile: UserProfile = {
      id: newId,
      email,
      full_name: email.split('@')[0],
      age: 25,
      gender: 'male',
      height_cm: 172,
      weight_kg: 68,
      fitness_goal: 'general_fitness',
      activity_level: 'moderate',
      food_preference: 'vegetarian',
      diet_preference: 'vegetarian',
      allergies: [],
      daily_calories_target: 2000,
      daily_protein_target: 100,
      daily_protein_target_g: 100,
      daily_carbs_target: 250,
      daily_carbs_target_g: 250,
      daily_fat_target: 60,
      daily_fat_target_g: 60,
      daily_water_glasses: 8,
      daily_step_goal: 10000,
      daily_sleep_hours: 8,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    localDb.saveProfile(newProfile);
    localDb.setCurrentUserId(newId);
    return newProfile;
  },

  async signup(email: string, _password?: string, fullName?: string): Promise<UserProfile> {
    const name = fullName || email.split('@')[0];
    const newId = 'user-' + Math.random().toString(36).substring(2, 9);
    const newProfile: UserProfile = {
      id: newId,
      email,
      full_name: name,
      age: 25,
      gender: 'male',
      height_cm: 172,
      weight_kg: 68,
      fitness_goal: 'general_fitness',
      activity_level: 'moderate',
      food_preference: 'vegetarian',
      diet_preference: 'vegetarian',
      allergies: [],
      daily_calories_target: 2000,
      daily_protein_target: 100,
      daily_protein_target_g: 100,
      daily_carbs_target: 250,
      daily_carbs_target_g: 250,
      daily_fat_target: 60,
      daily_fat_target_g: 60,
      daily_water_glasses: 8,
      daily_step_goal: 10000,
      daily_sleep_hours: 8,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localDb.saveProfile(newProfile);
    localDb.setCurrentUserId(newId);
    return newProfile;
  },

  async resetPassword(_email: string): Promise<void> {
    return;
  },

  async logout(): Promise<void> {
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore
    }
    localDb.setCurrentUserId(null);
  },

  async switchTestUser(userId: string): Promise<UserProfile | null> {
    localDb.setCurrentUserId(userId);
    const profiles = localDb.getProfiles();
    return profiles[userId] || null;
  }
};
