import { supabase } from './supabase';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

type Lang = 'it'|'en'|'es'|'de'|'fr';
const SUP_LANGS: Lang[] = ['it','en','es','de','fr'];

const K = { USER_LANG: 'world:userLang', DEST_LANG: 'world:destLang' };

function defaultUserLang(): Lang {
  const code = (Localization as any)?.getLocales?.()?.[0]?.languageCode ?? 'en';
  return (SUP_LANGS as any).includes(code) ? (code as Lang) : 'en';
}

function supabaseConfigured(): boolean {
  const extra: any = (Constants as any)?.expoConfig?.extra ?? (Constants as any)?.manifestExtra ?? {};
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl ?? '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey ?? '';
  if (!url || !key) return false;
  if (/YOUR_PROJECT|localhost/i.test(url)) return false;
  if (/YOUR_ANON_KEY|anon-key-not-set/i.test(key)) return false;
  return true;
}

export async function ensureProfileRow() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const defLang = defaultUserLang();
    await supabase.from('profiles').upsert({
      id: session.user.id,
      language: defLang,
      destination_language: 'it',
      updated_at: new Date().toISOString()
    });
  } catch {}
}

export type ProfileRow = {
  id: string;
  email?: string;
  language: Lang;
  destination_language: Lang;
};

export async function getProfileWithFallback(): Promise<{ profile: ProfileRow | null, fromStorage: boolean }> {
  if (supabaseConfigured()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      const email = session?.user?.email ?? undefined;
      if (uid) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
        if (!error && data) {
          return { profile: { id: uid, email, language: (data.language || defaultUserLang()), destination_language: (data.destination_language || 'it') }, fromStorage: false };
        }
      }
    } catch {}
  }
  // Fallback AsyncStorage
  const l = (await AsyncStorage.getItem(K.USER_LANG)) as Lang | null;
  const d = (await AsyncStorage.getItem(K.DEST_LANG)) as Lang | null;
  return { profile: { id: 'local', language: (l || defaultUserLang()) as Lang, destination_language: (d || 'it') as Lang }, fromStorage: true };
}

export async function saveProfile({ language, destination_language }: { language: Lang, destination_language: Lang }) {
  // Always persist to storage as fallback
  await AsyncStorage.setItem(K.USER_LANG, language);
  await AsyncStorage.setItem(K.DEST_LANG, destination_language);

  if (supabaseConfigured()) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (uid) {
        await supabase.from('profiles').upsert({
          id: uid,
          language,
          destination_language,
          updated_at: new Date().toISOString()
        });
      }
    } catch {}
  }
}
