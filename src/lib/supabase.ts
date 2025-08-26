import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra: any =
  (Constants as any)?.expoConfig?.extra ??
  (Constants as any)?.manifestExtra ??
  {};

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  extra.supabaseUrl;

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  extra.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Config mancante: imposta EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_ANON_KEY ' +
    'oppure extra.supabaseUrl/extra.supabaseAnonKey in app.config.ts'
  );
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost',             // placeholder per non crashare
  supabaseAnonKey || 'anon-key-not-set',         // placeholder
  { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }
);
