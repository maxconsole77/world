// src/appcfg/featureFlags.ts
import Constants from 'expo-constants';

type Boolish = boolean | string | number | undefined | null;
const extra: any =
  (Constants as any)?.expoConfig?.extra ??
  (Constants as any)?.manifestExtra ?? {};

const toBool = (v: Boolish, def = false) => {
  if (v === true || v === false) return v;
  if (v === 1 || v === 0) return Boolean(v);
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['1','true','yes','on'].includes(s)) return true;
    if (['0','false','no','off'].includes(s)) return false;
  }
  return def;
};

export const FF = {
  SAFE_MODE: toBool(process.env.EXPO_PUBLIC_SAFE_MODE ?? extra.safeMode, false),
  NAV:       toBool(process.env.EXPO_PUBLIC_NAV       ?? extra.nav,       true),
  TABS:      toBool(process.env.EXPO_PUBLIC_TABS      ?? extra.tabs,      true),
  ICONS:     toBool(process.env.EXPO_PUBLIC_ICONS     ?? extra.icons,     true),
  I18N:      true,
} as const;

// Log minimal SOLO in dev
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log(`FF → SAFE=${FF.SAFE_MODE} NAV=${FF.NAV} TABS=${FF.TABS} ICONS=${FF.ICONS}`);
}
