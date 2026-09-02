import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The Supabase publishable key is intentionally safe to ship in a browser bundle.
// RLS remains the security boundary; the service-role key is never imported here.
const DEFAULT_SUPABASE_URL = 'https://jtzprmqmkuanbjiothki.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xD77twp-fsak1h1sWyU5gw__BdHJ1YO';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
