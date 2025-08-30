import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'World',
  slug: 'world-trip-addon',
  scheme: 'world',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  plugins: [['expo-notifications']],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.world.app',
  },
  android: {
    package: 'com.world.app',
    permissions: ['RECORD_AUDIO','INTERNET','ACCESS_FINE_LOCATION'],
    jsEngine: 'jsc',
  },
  extra: {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_TRANSLATE_PROVIDER: process.env.EXPO_PUBLIC_TRANSLATE_PROVIDER,
    EXPO_PUBLIC_DEEPL_KEY: process.env.EXPO_PUBLIC_DEEPL_KEY,
    EXPO_PUBLIC_GOOGLE_KEY: process.env.EXPO_PUBLIC_GOOGLE_KEY,
    EXPO_PUBLIC_SAFE_MODE: process.env.EXPO_PUBLIC_SAFE_MODE,
    EXPO_PUBLIC_ENABLE_STT: process.env.EXPO_PUBLIC_ENABLE_STT,
  }
};

export default config;
