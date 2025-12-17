import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables
const getEnvVar = (key: string) => {
  // Try import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const val = (import.meta as any).env[key];
    if (val) return val;
  }

  // Try process.env (Legacy/Node)
  if (typeof process !== 'undefined' && process.env) {
    const val = process.env[key];
    if (val) return val;
  }

  return undefined;
};

// Check for VITE_ prefixed (Vite standard) and non-prefixed (System standard)
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY');

export const isSupabaseConnected = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConnected) {
  console.warn('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Initialize Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);