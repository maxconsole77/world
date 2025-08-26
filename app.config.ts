// app.config.ts
import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';
import fs from 'fs';
import path from 'path';

const exists = (p: string) => fs.existsSync(path.resolve(__dirname, p));

const config: ExpoConfig = {
  name: 'World',
  slug: 'world',
  scheme: 'world',
  version: '0.3.1',
  orientation: 'portrait',

  // Usa icone/splash solo se esistono (evita errori)
  icon: exists('./assets/icon.png') ? './assets/icon.png' : undefined,
  userInterfaceStyle: 'automatic',
  splash: exists('./assets/splash.png')
    ? { image: './assets/splash.png', resizeMode: 'contain', backgroundColor: '#F8F9FA' }
    : undefined,

  ios: {
    jsEngine: 'jsc', // ← forza JSC su iOS (aiuta con crash "non-std C++ exception")
    supportsTablet: false,
    bundleIdentifier: 'com.world.app',
    infoPlist: {
      NSMicrophoneUsageDescription: 'Usiamo il microfono per la dettatura e la traduzione vocale.',
      NSSpeechRecognitionUsageDescription: 'Usiamo il riconoscimento vocale per trascrivere e tradurre ciò che dici.',
      NSLocationWhenInUseUsageDescription: 'Usiamo la posizione per meteo e luoghi vicini.'
    }
  },

  android: {
    jsEngine: 'jsc', // opzionale ma coerente
    package: 'com.world.app',
    adaptiveIcon:
      exists('./assets/adaptive-icon-foreground.png') && exists('./assets/adaptive-icon-background.png')
        ? {
            foregroundImage: './assets/adaptive-icon-foreground.png',
            backgroundImage: './assets/adaptive-icon-background.png'
          }
        : undefined,
    permissions: ['RECORD_AUDIO', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION']
  },

  plugins: [],

  extra: {
    // Leggi da .env se presenti, altrimenti fallback (sostituisci con i tuoi)
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://YOUR_PROJECT.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'YOUR_ANON_KEY',
    eas: { projectId: '372b8f5e-6c91-4073-822d-f55ef081cf6f' }
  }
};

export default config;
