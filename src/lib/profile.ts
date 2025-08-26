import { supabase } from './supabase';
import * as Localization from 'expo-localization';

type Lang = 'it'|'en'|'es'|'de'|'fr';
const SUP_LANGS: Lang[] = ['it','en','es','de','fr'];

function defaultUserLang(): Lang {
  const code = Localization.getLocales?.()[0]?.languageCode ?? 'en';
  return (SUP_LANGS as string[]).includes(code) ? (code as Lang) : 'en';
}

/** Crea o aggiorna la riga del profilo con default sensati. */
export async function ensureProfileRow() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const defLang = defaultUserLang();
  await supabase.from('profiles').upsert({
    id: session.user.id,
    language: defLang,
    destination_language: 'it',
    updated_at: new Date().toISOString()
  });
}
