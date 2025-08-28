// src/appcfg/featureFlags.ts
export const FF = {
  I18N: process.env.EXPO_PUBLIC_FF_I18N === '1',
  NAVIGATION: process.env.EXPO_PUBLIC_FF_NAV === '1',
  TABS: process.env.EXPO_PUBLIC_FF_TABS === '1',
  ICONS: process.env.EXPO_PUBLIC_FF_ICONS === '1',
  PROFILE_SCREEN: process.env.EXPO_PUBLIC_FF_PROFILE === '1',
  PHRASES_SCREEN: process.env.EXPO_PUBLIC_FF_PHRASES === '1',
  TRIP_SCREEN: process.env.EXPO_PUBLIC_FF_TRIP === '1',
  TRIP_WEATHER: process.env.EXPO_PUBLIC_FF_TRIP_WEATHER === '1', // mete0
  SUPABASE: process.env.EXPO_PUBLIC_FF_SUPABASE === '1',
  TTS: process.env.EXPO_PUBLIC_FF_TTS === '1',
  STT: process.env.EXPO_PUBLIC_FF_STT === '1', // solo dev build
};
