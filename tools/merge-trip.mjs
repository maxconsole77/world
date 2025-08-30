#!/usr/bin/env node
/**
 * Merge TRIP module into an existing World repo.
 * - Adds dependencies to package.json if missing.
 * - Patches app.config.ts to include scheme 'world', permissions, JSC, notifications.
 * - Ensures src structure exists; does NOT overwrite existing files.
 */
import fs from 'node:fs';
import path from 'node:path';

const CWD = process.cwd();

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}
function ensureDeps(pkg, toAdd) {
  pkg.dependencies ||= {};
  let changed = false;
  for (const [k, v] of Object.entries(toAdd)) {
    if (!pkg.dependencies[k]) { pkg.dependencies[k] = v; changed = true; }
  }
  return changed;
}
function patchAppConfig(appConfigPath) {
  if (!fs.existsSync(appConfigPath)) return false;
  let s = fs.readFileSync(appConfigPath, 'utf8');
  const hadScheme = s.includes("scheme:");
  if (!hadScheme) {
    s = s.replace(/(expo:\s*{)/, `$1\n    scheme: 'world',`);
  }
  // Ensure android permissions & JSC
  if (!s.includes("android:")) {
    s = s.replace(/(expo:\s*{[^}]*)(})/s, (m, a, b) => {
      const block = `
  android: {
    permissions: ['RECORD_AUDIO', 'INTERNET', 'ACCESS_FINE_LOCATION'],
    jsEngine: 'jsc',
    package: 'com.world.app',
    blockedPermissions: [],
  },`;
      return a + block + b;
    });
  } else {
    if (!s.includes("jsEngine")) s = s.replace(/android:\s*{/, "android: { jsEngine: 'jsc', ");
    if (!s.includes("RECORD_AUDIO")) s = s.replace(/permissions:\s*\[/, "permissions: ['RECORD_AUDIO', ");
  }
  // Notifications
  if (!s.includes("plugins:")) {
    s = s.replace(/(expo:\s*{)/, `$1\n    plugins: [['expo-notifications']],`);
  } else if (!s.includes("expo-notifications")) {
    s = s.replace(/plugins:\s*\[/, "plugins: [['expo-notifications'], ");
  }
  fs.writeFileSync(appConfigPath, s, 'utf8');
  return true;
}

try {
  const pkgPath = path.join(CWD, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.error('package.json non trovato. Esegui da root del progetto.');
    process.exit(1);
  }
  const pkg = readJSON(pkgPath);
  const added = ensureDeps(pkg, {
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.19",
    "@react-navigation/bottom-tabs": "^6.5.20",
    "@supabase/supabase-js": "^2.45.4",
    "react-i18next": "^14.1.1",
    "i18next": "^23.10.1",
    "dayjs": "^1.11.11",
    "react-native-webview": "13.8.6"
  });
  if (added) writeJSON(pkgPath, pkg);
  const appConfigTs = fs.existsSync(path.join(CWD, 'app.config.ts')) ? path.join(CWD, 'app.config.ts') : null;
  if (appConfigTs) {
    patchAppConfig(appConfigTs);
  } else {
    console.warn('app.config.ts non trovato. Aggiungi scheme/permessi manualmente come da README.');
  }
  // Create .env.example entries if missing
  const envEx = path.join(CWD, '.env.example');
  const ENV_APPEND = `
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_TRANSLATE_PROVIDER=none
EXPO_PUBLIC_DEEPL_KEY=
EXPO_PUBLIC_GOOGLE_KEY=
EXPO_PUBLIC_SAFE_MODE=0
EXPO_PUBLIC_ENABLE_STT=0
`;
  if (fs.existsSync(envEx)) {
    const s = fs.readFileSync(envEx, 'utf8');
    let updated = s;
    for (const line of ENV_APPEND.trim().split('\n')) {
      if (!s.includes(line.split('=')[0])) updated += '\n' + line;
    }
    if (updated !== s) fs.writeFileSync(envEx, updated, 'utf8');
  } else {
    fs.writeFileSync(envEx, ENV_APPEND.trim() + '\n', 'utf8');
  }
  console.log('✔ Merge TRIP completato. Installa dipendenze mancanti e avvia.');
} catch (e) {
  console.error('Errore merge:', e);
  process.exit(1);
}
