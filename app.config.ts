// app.config.ts
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { ConfigContext, ExpoConfig } from 'expo/config';

const exists = (rel: string) => fs.existsSync(path.join(__dirname, rel));
const hasExpoRouter = () => exists('node_modules/expo-router/package.json');

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,

    name: 'World',
    slug: 'world',
    scheme: 'world',
    version: '0.3.1',
    orientation: 'portrait',

    icon: exists('./assets/icon.png') ? './assets/icon.png' : undefined,
    userInterfaceStyle: 'automatic',
    splash: exists('./assets/splash.png')
      ? { image: './assets/splash.png', resizeMode: 'contain', backgroundColor: '#F8F9FA' }
      : undefined,

    ios: {
      ...config.ios,
      jsEngine: 'jsc', // aiuta a evitare i crash "non-std C++ exception" in debug
      supportsTablet: false,
      bundleIdentifier: 'com.world.app',
      infoPlist: {
        ...(config.ios?.infoPlist ?? {}),
        NSMicrophoneUsageDescription:
          "L'app usa il microfono per la dettatura e per ascoltare le risposte.",
        NSSpeechRecognitionUsageDescription:
          "L'app trascrive la tua voce in testo per la traduzione.",
        NSLocationWhenInUseUsageDescription:
          "L'app usa la posizione per meteo e luoghi vicini."
      }
    },

    android: {
      ...config.android,
      jsEngine: 'jsc',
      package: 'com.world.app',
      adaptiveIcon:
        exists('./assets/adaptive-icon-foreground.png') && exists('./assets/adaptive-icon-background.png')
          ? {
              foregroundImage: './assets/adaptive-icon-foreground.png',
              backgroundImage: './assets/adaptive-icon-background.png'
            }
          : undefined,
      permissions: [
        ...(config.android?.permissions ?? []),
        'RECORD_AUDIO',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION'
      ]
    },

    // 👉 plugin attivato SOLO se realmente installato
    plugins: [
      ...(hasExpoRouter() ? (['expo-router'] as const) : [])
    ],

    extra: {
      ...(config.extra ?? {}),
      // Supabase
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://YOUR_PROJECT.supabase.co',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'YOUR_ANON_KEY',

      // Traduzioni (usati da src/lib/translate.ts)
      translateProvider: process.env.EXPO_PUBLIC_TRANSLATE_PROVIDER ?? 'none', // 'deepl' | 'google' | 'none'
      deeplKey: process.env.EXPO_PUBLIC_DEEPL_KEY ?? '',
      googleKey: process.env.EXPO_PUBLIC_GOOGLE_KEY ?? '',

      // EAS project id
      eas: { projectId: '372b8f5e-6c91-4073-822d-f55ef081cf6f' }
    }
  };
};

