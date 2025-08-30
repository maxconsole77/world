import { useEffect, useRef, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Constants from 'expo-constants';

// Hook per Speech-To-Text basato su react-native-voice (solo dev build / standalone)
type VoiceModule = any;

export function useSTT() {
  const [available, setAvailable] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const VoiceRef = useRef<VoiceModule | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        if (Platform.OS === 'web') { setAvailable(false); return; }
        const anyC = Constants as any;
        const isExpoGo = anyC?.appOwnership === 'expo' || anyC?.executionEnvironment === 'storeClient';
        if (isExpoGo) { setAvailable(false); return; } // in Expo Go non funziona

        const mod = await import('react-native-voice');
        const Voice = mod?.default ?? mod;
        if (!mounted) return;

        Voice.onSpeechResults = (e: any) => {
          const v = (e?.value && e.value[0]) ? String(e.value[0]) : '';
          setResult(v);
        };
        Voice.onSpeechError = (e: any) => {
          setError(String(e?.error?.message ?? 'Unknown STT error'));
        };

        VoiceRef.current = Voice;
        setAvailable(true);
      } catch {
        setAvailable(false);
      }
    }
    load();

    return () => {
      mounted = false;
      try {
        const v = VoiceRef.current;
        if (v) {
          v.destroy().then(() => v.removeAllListeners?.());
        }
      } catch {}
    };
  }, []);

  async function ensureAndroidMicPermission() {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Permesso microfono',
          message: 'Il microfono serve per la dettatura e per ascoltare le risposte.',
          buttonPositive: 'OK'
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }

  async function start(lang: string) {
    setResult('');
    setError(null);
    const Voice = VoiceRef.current;
    if (!available || !Voice) { setError('STT non disponibile su questo build'); return; }

    // Android: chiedi permesso a runtime
    const ok = await ensureAndroidMicPermission();
    if (!ok) { setError('Permesso microfono negato'); return; }

    try {
      await Voice.start(lang || 'en-US');
      setIsRecording(true);
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setIsRecording(false);
    }
  }

  async function stop() {
    const Voice = VoiceRef.current;
    if (!Voice) return;
    try { await Voice.stop(); } catch {}
    setIsRecording(false);
  }

  function reset() {
    setResult('');
    setError(null);
  }

  return { available, isRecording, result, error, start, stop, reset };
}
