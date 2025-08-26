// src/lib/speech.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo =
  (Constants as any)?.appOwnership === 'expo' ||
  (Constants as any)?.executionEnvironment === 'storeClient';
const isWeb = Platform.OS === 'web';

// Carico expo-speech in modo sicuro (opzionale su dev build/standalone)
let ExpoSpeech: any = null;
try {
  // require evita problemi di treeshaking su web / ambienti senza modulo
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ExpoSpeech = require('expo-speech');
} catch {
  ExpoSpeech = null;
}

/** True se il TTS è utilizzabile nell'ambiente corrente. */
export function canSpeak(): boolean {
  if (isExpoGo) return false; // disattivato in Expo Go (prevenzione crash)
  if (isWeb) return typeof window !== 'undefined' && 'speechSynthesis' in window;
  return !!ExpoSpeech?.speak;
}

/** TTS: parla il testo nella lingua indicata (se supportata). No-op in Expo Go. */
export function speak(text: string, lang?: string) {
  if (!text) return;
  try {
    if (isExpoGo) return; // evita crash in Expo Go

    if (isWeb && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new (window as any).SpeechSynthesisUtterance(text);
      if (lang) u.lang = lang;
      (window as any).speechSynthesis.speak(u);
      return;
    }

    ExpoSpeech?.speak?.(text, { language: lang });
  } catch {
    // silenzioso: niente crash in produzione
  }
}

/** Stop TTS se possibile (web o expo-speech). */
export function stopSpeaking() {
  try {
    if (isExpoGo) return;
    if (isWeb && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      (window as any).speechSynthesis.cancel();
      return;
    }
    ExpoSpeech?.stop?.();
  } catch {}
}

// STT: carico react-native-voice SOLO fuori da Expo Go e fuori dal web
let Voice: any = null;

/** Ritorna il modulo STT (react-native-voice) se disponibile; altrimenti null. */
export async function ensureVoice() {
  if (isExpoGo || isWeb) return null; // non disponibile in Expo Go / web
  if (Voice) return Voice;
  try {
    const mod = await import('react-native-voice'); // nativo: presente in dev build/standalone
    Voice = mod?.default ?? mod;
  } catch {
    Voice = null;
  }
  return Voice;
}
