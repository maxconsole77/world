// tools/fix-tabs.mjs
// Trova il file che usa createBottomTabNavigator, rimuove i Tab "Login"/"Settings",
// e aggiunge/riattiva i Tab "Phrases" e "Weather" usando i TUOI file reali.
// Non crea file nuovi, modifica il tuo file tabs in-place.

import fs from 'fs';
import path from 'path';

const DRY = !process.argv.includes('--write');
const exts = new Set(['.tsx', '.ts', '.jsx', '.js']);
const skip = new Set(['node_modules', '.git', 'ios', 'android', 'build', 'dist']);

const must = {
  phrasesCandidates: [/phrases/i, /usefulphrases/i, /frasi/i],
  weatherCandidates: [/weather/i, /meteo/i],
};

function walk(dir, cb) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (skip.has(e.name)) continue;
      walk(path.join(dir, e.name), cb);
    } else {
      const p = path.join(dir, e.name);
      if (exts.has(path.extname(p))) cb(p);
    }
  }
}

function findTabsFile() {
  const hits = [];
  const roots = fs.existsSync('src/navigation') ? ['src/navigation'] : ['src'];
  for (const root of roots) {
    walk(root, (p) => {
      const s = fs.readFileSync(p, 'utf8');
      if (s.includes('createBottomTabNavigator') && s.includes('<Tab.Navigator')) {
        let score = 0;
        if (/root|tabs|navigator|navigation/i.test(path.basename(p))) score += 2;
        if (s.match(/name\s*=\s*["']Login["']/)) score += 1; // prob. file attuale
        hits.push({ p, score });
      }
    });
    if (hits.length) break;
  }
  if (!hits.length) throw new Error('Non trovo il file dei bottom tabs.');
  hits.sort((a, b) => b.score - a.score);
  return hits[0].p;
}

function findScreen(cands) {
  const results = [];
  walk('src', (p) => {
    const base = path.basename(p).toLowerCase();
    if (cands.some((re) => re.test(base))) results.push(p);
  });
  // preferisci .tsx → .ts → .jsx → .js
  const rank = (x) => (x.endsWith('.tsx') ? 0 : x.endsWith('.ts') ? 1 : x.endsWith('.jsx') ? 2 : 3);
  results.sort((a, b) => rank(a) - rank(b));
  return results[0] || null;
}

function relImport(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/');
  rel = rel.replace(/\.(tsx|ts|jsx|js)$/, '');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function ensureIonicons(src) {
  return src.includes('@expo/vector-icons')
    ? src
    : src.replace(/^import .*;?$/m, (m) => m + `\nimport { Ionicons } from '@expo/vector-icons';`);
}

function ensureImport(src, comp, fromPath) {
  const re = new RegExp(`import\\s+.*\\b${comp}\\b.*from\\s+['"]${fromPath}['"]`);
  if (re.test(src)) return src;
  const lastImp = [...src.matchAll(/^import .*;?$/gm)].pop();
  const idx = lastImp ? lastImp.index + lastImp[0].length : 0;
  return src.slice(0, idx) + `\nimport ${comp} from '${fromPath}';` + src.slice(idx);
}

function removeTab(src, name) {
  const re = new RegExp(
    `<Tab\\.Screen[\\s\\S]*?name\\s*=\\s*["']${name}["'][\\s\\S]*?(?:/\\>|<\\/Tab\\.Screen>)`,
    'g'
  );
  return src.replace(re, '');
}

function addTabIfMissing(src, name, comp, icon, title) {
  if (src.includes(`name="${name}"`)) return src;
  const block = `
      <Tab.Screen
        name="${name}"
        component=${comp}
        options={{
          title: '${title}',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="${icon}" color={color} size={size} />
          ),
        }}
      />`;
  const idx = src.lastIndexOf('</Tab.Navigator>');
  if (idx < 0) throw new Error('Non trovo </Tab.Navigator>.');
  return src.slice(0, idx) + block + '\n' + src.slice(idx);
}

function ensureScreenOptions(src) {
  if (src.includes('screenOptions={{')) return src;
  return src.replace(
    /<Tab\.Navigator([^>]*)>/,
    `<Tab.Navigator$1
      screenOptions={{
        headerShown: true,
        tabBarLabelStyle: { fontSize: 12 },
      }}>`
  );
}

function run() {
  const tabsFile = findTabsFile();
  let code = fs.readFileSync(tabsFile, 'utf8');

  const phrasesPath = findScreen(must.phrasesCandidates);
  const weatherPath = findScreen(must.weatherCandidates);
  if (!phrasesPath) throw new Error('Non trovo lo screen Frasi (file che contenga "phrases/usefulphrases/frasi").');
  if (!weatherPath) throw new Error('Non trovo lo screen Meteo (file che contenga "weather/meteo").');

  const phrImport = relImport(tabsFile, phrasesPath);
  const weaImport = relImport(tabsFile, weatherPath);

  code = ensureIonicons(code);
  code = ensureImport(code, 'PhrasesScreen', phrImport);
  code = ensureImport(code, 'WeatherScreen', weaImport);

  code = removeTab(code, 'Login');
  code = removeTab(code, 'Settings');

  code = ensureScreenOptions(code);
  code = addTabIfMissing(code, 'Phrases', 'PhrasesScreen', 'chatbubbles-outline', 'Frasi');
  code = addTabIfMissing(code, 'Weather', 'WeatherScreen', 'partly-sunny-outline', 'Meteo');

  if (DRY) {
    console.log('[DRY] Modificherei:', tabsFile);
    console.log(' - import PhrasesScreen from', phrImport);
    console.log(' - import WeatherScreen from', weaImport);
  } else {
    fs.writeFileSync(tabsFile, code, 'utf8');
    console.log('[WRITE] Aggiornato:', tabsFile);
  }
}

try { run(); } catch (e) {
  console.error('❌', e.message);
  process.exit(1);
}
