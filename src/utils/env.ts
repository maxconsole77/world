import Constants from 'expo-constants';

type Env = {
  SUPABASE_URL: string | undefined;
  SUPABASE_ANON_KEY: string | undefined;
  TRANSLATE_PROVIDER: 'deepl' | 'google' | 'none';
  DEEPL_KEY?: string;
  GOOGLE_KEY?: string;
  SAFE_MODE: boolean;
  ENABLE_STT: boolean;
};

const expo = Constants.expoConfig?.extra ?? {};

const ENV: Env = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || (expo.EXPO_PUBLIC_SUPABASE_URL as string | undefined),
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || (expo.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined),
  TRANSLATE_PROVIDER: (process.env.EXPO_PUBLIC_TRANSLATE_PROVIDER || expo.EXPO_PUBLIC_TRANSLATE_PROVIDER || 'none') as Env['TRANSLATE_PROVIDER'],
  DEEPL_KEY: (process.env.EXPO_PUBLIC_DEEPL_KEY || expo.EXPO_PUBLIC_DEEPL_KEY) as string | undefined,
  GOOGLE_KEY: (process.env.EXPO_PUBLIC_GOOGLE_KEY || expo.EXPO_PUBLIC_GOOGLE_KEY) as string | undefined,
  SAFE_MODE: (process.env.EXPO_PUBLIC_SAFE_MODE || expo.EXPO_PUBLIC_SAFE_MODE || '0') === '1',
  ENABLE_STT: (process.env.EXPO_PUBLIC_ENABLE_STT || expo.EXPO_PUBLIC_ENABLE_STT || '0') === '1',
};

export default ENV;
