import { localDb } from '../lib/supabase';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { UserProfile } from '../types';
import { cloudAuthService, CloudAuthState, AuthMode, CloudAuthResult } from './cloud/cloudAuth.service';

const defaultProfile = (id: string, email: string, fullName?: string): UserProfile => ({
  id,
  email,
  full_name: fullName || email.split('@')[0] || 'User',
  age: 25,
  gender: 'male',
  height_cm: 172,
  weight_kg: 68,
  target_weight_kg: 68,
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
  updated_at: new Date().toISOString(),
});

function fromCloudProfile(row: any, fallback: UserProfile): UserProfile {
  return {
    ...fallback,
    id: row.id,
    name: row.name,
    full_name: row.name || fallback.full_name,
    age: row.age ?? fallback.age,
    gender: row.gender ?? fallback.gender,
    height_cm: Number(row.height_cm ?? fallback.height_cm),
    weight_kg: Number(row.current_weight_kg ?? fallback.weight_kg),
    target_weight_kg: row.target_weight_kg ?? fallback.target_weight_kg,
    fitness_goal: row.goal ?? fallback.fitness_goal,
    activity_level: row.activity_level ?? fallback.activity_level,
    onboarding_completed: row.onboarding_completed ?? fallback.onboarding_completed,
    created_at: row.created_at ?? fallback.created_at,
    updated_at: row.updated_at ?? fallback.updated_at,
  } as UserProfile;
}

async function getCloudProfile(id: string, email: string, metadata?: Record<string, any>) {
  if (!supabase) return null;

  const localProfiles = localDb.getProfiles();
  const localProfile = localProfiles[id] || defaultProfile(id, email, metadata?.full_name || metadata?.name);
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();

  if (error) throw error;

  if (data) {
    const profile = fromCloudProfile(data, localProfile);
    localDb.saveProfile(profile);
    localDb.setCurrentUserId(profile.id);
    return profile;
  }

  const profile = localProfile;
  const { error: insertError } = await supabase.from('profiles').insert({
    id,
    name: profile.full_name,
    age: profile.age,
    gender: profile.gender,
    height_cm: profile.height_cm,
    current_weight_kg: profile.weight_kg,
    target_weight_kg: profile.target_weight_kg,
    goal: profile.fitness_goal,
    activity_level: profile.activity_level,
    onboarding_completed: profile.onboarding_completed,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  });

  if (insertError) throw insertError;
  localDb.saveProfile(profile);
  localDb.setCurrentUserId(profile.id);
  return profile;
}

export const authService = {
  // ==========================================
  // CLOUD AUTHENTICATION BRIDGE (Milestone 7C)
  // ==========================================
  async getCloudAuthSession() {
    return cloudAuthService.getCloudAuthSession();
  },

  async isCloudAuthenticated(): Promise<boolean> {
    return cloudAuthService.isCloudAuthenticated();
  },

  async getCloudUserId(): Promise<string | null> {
    return cloudAuthService.getCloudUserId();
  },

  async getCloudUserEmail(): Promise<string | null> {
    return cloudAuthService.getCloudUserEmail();
  },

  async getAuthState(): Promise<CloudAuthState> {
    return cloudAuthService.getAuthState();
  },

  subscribeToCloudAuth(callback: (state: CloudAuthState) => void): () => void {
    return cloudAuthService.subscribeToCloudAuth(callback);
  },

  async signInWithSupabase(email: string, password: string): Promise<CloudAuthResult> {
    return cloudAuthService.signInWithSupabase(email, password);
  },

  async signUpWithSupabase(email: string, password: string, metadata?: Record<string, unknown>): Promise<CloudAuthResult> {
    return cloudAuthService.signUpWithSupabase(email, password, metadata);
  },

  async signOutFromCloud(): Promise<{ success: boolean; error?: string }> {
    return cloudAuthService.signOutFromCloud();
  },

  // ==========================================
  // CORE PROFILE & LOCAL AUTHENTICATION
  // ==========================================
  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      return getCloudProfile(
        session.user.id,
        session.user.email || 'user@example.com',
        session.user.user_metadata
      );
    }

    const currentId = localDb.getCurrentUserId();
    if (!currentId) return null;
    return localDb.getProfiles()[currentId] || null;
  },

  async signInWithGoogle(): Promise<UserProfile> {
    if (!supabase) throw new Error('Supabase Auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;

    // OAuth redirects away from this page. The returned session is handled by App on reload.
    return defaultProfile('', 'google@redirect.local', 'Google User');
  },

  async login(email: string, password?: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      if (!password) throw new Error('Password is required.');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Login succeeded but no user session was returned.');
      return getCloudProfile(data.user.id, data.user.email || email, data.user.user_metadata) as Promise<UserProfile>;
    }

    const profiles = localDb.getProfiles();
    const existing = Object.values(profiles).find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      localDb.setCurrentUserId(existing.id);
      return existing;
    }
    const profile = defaultProfile('user-' + crypto.randomUUID(), email);
    localDb.saveProfile(profile);
    localDb.setCurrentUserId(profile.id);
    return profile;
  },

  async signup(email: string, password?: string, fullName?: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || email.split('@')[0] } },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Account could not be created.');
      if (!data.session) {
        throw new Error('Account created. Please verify your email, then sign in.');
      }
      return getCloudProfile(data.user.id, data.user.email || email, data.user.user_metadata) as Promise<UserProfile>;
    }

    const profile = defaultProfile('user-' + crypto.randomUUID(), email, fullName);
    localDb.saveProfile(profile);
    localDb.setCurrentUserId(profile.id);
    return profile;
  },

  async resetPassword(email: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      return;
    }
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    localDb.setCurrentUserId(null);
  },

  async switchTestUser(userId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      throw new Error('Test-user switching is disabled while Supabase Auth is enabled.');
    }
    localDb.setCurrentUserId(userId);
    return localDb.getProfiles()[userId] || null;
  },
};
