import * as Speech from 'expo-speech';

const VOICE_MAP: Record<string, string> = {
  it: 'it-IT',
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
  fr: 'fr-FR'
};

export function speak(text: string, lang: string) {
  if (!text) return;
  const voice = VOICE_MAP[lang] ?? lang;
  try {
    Speech.stop();
    Speech.speak(text, { language: voice, rate: 1.0, pitch: 1.0 });
  } catch {
    // no-op
  }
}

export function stopSpeak() {
  try { Speech.stop(); } catch {}
}
