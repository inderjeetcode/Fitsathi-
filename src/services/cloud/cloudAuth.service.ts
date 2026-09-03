import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, localDb } from '../../lib/supabase';

export type AuthMode = 'unauthenticated' | 'local_authenticated' | 'cloud_authenticated';

export interface CloudAuthState {
  mode: AuthMode;
  localUserId: string | null;
  cloudUserId: string | null;
  cloudEmail: string | null;
  isCloudAuthenticated: boolean;
  isLocalAuthenticated: boolean;
  session: Session | null;
}

export interface CloudAuthResult {
  success: boolean;
  error?: string;
  user?: User | null;
  session?: Session | null;
}

/**
 * Cloud Authentication Bridge
 * Distinguishes clearly between:
 * 1. Local authenticated user (local simulator in localDb)
 * 2. Cloud/Supabase authenticated user (real Supabase Auth JWT)
 * 3. Unauthenticated user
 */
class CloudAuthService {
  /**
   * Retrieves the current active Supabase Auth session if configured and valid.
   * Never throws; returns null if offline, unconfigured, or expired.
   */
  async getCloudAuthSession(): Promise<Session | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) {
        return null;
      }
      return data.session;
    } catch (err) {
      console.warn('[CloudAuth] Unable to retrieve Supabase session:', err);
      return null;
    }
  }

  /**
   * Returns true only if a valid, non-expired Supabase Auth session exists.
   * Local mock IDs will strictly return false here to prevent RLS violations.
   */
  async isCloudAuthenticated(): Promise<boolean> {
    const session = await this.getCloudAuthSession();
    return Boolean(session?.user?.id);
  }

  /**
   * Returns the authenticated Supabase user UUID (matching auth.uid() in RLS),
   * or null if not authenticated with Supabase.
   */
  async getCloudUserId(): Promise<string | null> {
    const session = await this.getCloudAuthSession();
    return session?.user?.id ?? null;
  }

  /**
   * Returns the email associated with the active Supabase session, or null.
   */
  async getCloudUserEmail(): Promise<string | null> {
    const session = await this.getCloudAuthSession();
    return session?.user?.email ?? null;
  }

  /**
   * Inspects both local storage state and Supabase Auth to determine the overall auth mode.
   */
  async getAuthState(): Promise<CloudAuthState> {
    const session = await this.getCloudAuthSession();
    const cloudUserId = session?.user?.id ?? null;
    const cloudEmail = session?.user?.email ?? null;
    const isCloudAuth = Boolean(cloudUserId);

    const localUserId = localDb.getCurrentUserId();
    const isLocalAuth = Boolean(localUserId);

    let mode: AuthMode = 'unauthenticated';
    if (isCloudAuth) {
      mode = 'cloud_authenticated';
    } else if (isLocalAuth) {
      mode = 'local_authenticated';
    }

    return {
      mode,
      localUserId,
      cloudUserId,
      cloudEmail,
      isCloudAuthenticated: isCloudAuth,
      isLocalAuthenticated: isLocalAuth,
      session
    };
  }

  /**
   * Subscribes to Supabase Auth state changes (sign in, sign out, token refresh).
   * Returns an unsubscribe function to prevent memory leaks.
   */
  subscribeToCloudAuth(callback: (state: CloudAuthState) => void): () => void {
    if (!isSupabaseConfigured || !supabase) {
      // If Supabase is not configured, deliver initial state and return no-op
      this.getAuthState().then(callback).catch(() => {});
      return () => {};
    }

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const localUserId = localDb.getCurrentUserId();
        const cloudUserId = session?.user?.id ?? null;
        const cloudEmail = session?.user?.email ?? null;
        const isCloudAuth = Boolean(cloudUserId);
        const isLocalAuth = Boolean(localUserId);

        let mode: AuthMode = 'unauthenticated';
        if (isCloudAuth) {
          mode = 'cloud_authenticated';
        } else if (isLocalAuth) {
          mode = 'local_authenticated';
        }

        callback({
          mode,
          localUserId,
          cloudUserId,
          cloudEmail,
          isCloudAuthenticated: isCloudAuth,
          isLocalAuthenticated: isLocalAuth,
          session
        });
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.warn('[CloudAuth] Failed to subscribe to auth state changes:', err);
      return () => {};
    }
  }

  /**
   * Cloud Sign-in using real Supabase Auth credentials
   */
  async signInWithSupabase(email: string, password: string): Promise<CloudAuthResult> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase cloud is not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error during Supabase sign-in';
      return { success: false, error: message };
    }
  }

  /**
   * Cloud Sign-up using real Supabase Auth credentials
   */
  async signUpWithSupabase(email: string, password: string, metadata?: Record<string, unknown>): Promise<CloudAuthResult> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase cloud is not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error during Supabase sign-up';
      return { success: false, error: message };
    }
  }

  /**
   * Cloud Sign-out from Supabase Auth
   */
  async signOutFromCloud(): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error during Supabase sign-out';
      return { success: false, error: message };
    }
  }
}

export const cloudAuthService = new CloudAuthService();
