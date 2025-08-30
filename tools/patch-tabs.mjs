// tools/patch-tabs.mjs
// Scova il file che usa createBottomTabNavigator, elimina i Tab "Login"/"Settings",
// e inserisce/riattiva i Tab "Phrases" e "Weather" puntando ai file REALI del progetto.
// Non altera il nome del file dei tabs.

// Uso:
//   node tools/patch-tabs.mjs        (dry-run)
//   node tools/patch-tabs.mjs --write

import fs from 'fs';
import path from 'path';

const DRY = process.argv.includes('--write') ? false : true;

const exts = new Set(['.tsx', '.ts', '.jsx', '.js']);
const skipDirs = new Set(['node_modules', '.git', 'ios', 'android', 'build', 'dist']);

function walk(dir, cb) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (skipDirs.has(ent.name)) continue;
      walk(path.join(dir, ent.name), cb);
    } else {
      const p = path.join(dir, ent.name);
      if (exts.has(path.extname(p))) cb(p);
    }
  }
}

function findTabsFile() {
  const cands = [];
  const roots = fs.existsSync('src/navigation') ? ['src/navigation'] : ['src'];
  for (const root of roots) {
    walk(root, (p) => {
      const txt = fs.readFileSync(p, 'utf8');
      if (txt.includes('createBottomTabNavigator')) {
        let score = 0;
        const base = path.basename(p);
        if (/root|tabs|navigator|navigation/i.test(base)) score += 2;
        if (txt.includes('<Tab.Navigator')) score += 1;
        cands.push({ p, score });
      }
    });
    if (cands.length) break;
  }
  if (!cands.length) throw new Error('Impossibile trovare un file con createBottomTabNavigator.');
  cands.sort((a, b) => b.score - a.score);
  return cands[0].p;
}

function findScreen(patterns) {
  const results = [];
  walk('src', (p) => {
    const base = path.basename(p).toLowerCase();
    if (patterns.some((re) => re.test(base))) results.push(p);
  });
  // preferisci *.tsx, poi *.ts, poi js/jsx
  results.sort((a, b) => {
    const rank = (x) =>
      path.extname(x) === '.tsx' ? 0 :
      path.extname(x) === '.ts'  ? 1 :
      path.extname(x) === '.jsx' ? 2 : 3;
    return rank(a) - rank(b);
  });
  return results[0];
}

function relImport(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/');
  rel = rel.replace(/\.(tsx|ts|jsx|js)$/, '');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function ensureImport(src, what, from) {
  const re = new RegExp(`import\\s+.*\\b${what}\\b.*from\\s+['"]${from}['"]`);
  if (re.test(src)) return src;
  // inserisci dopo l’ultimo import
  const lastImport = [...src.matchAll(/^import .*;?$/gm)].pop();
  const idx = lastImport ? lastImport.index + lastImport[0].length : 0;
  const ins = `\nimport ${what} from '${from}';`;
  return src.slice(0, idx) + ins + src.slice(idx);
}

function ensureIonicons(src) {
  if (src.includes("@expo/vector-icons")) return src;
  const lastImport = [...src.matchAll(/^import .*;?$/gm)].pop();
  const idx = lastImport ? lastImport.index + lastImport[0].length : 0;
  const ins = `\nimport { Ionicons } from '@expo/vector-icons';`;
  return src.slice(0, idx) + ins + src.slice(idx);
}

function removeTab(src, tabName) {
  const re =
    new RegExp(
      `<Tab\\.Screen[\\s\\S]*?name\\s*=\\s*["']${tabName}["'][\\s\\S]*?(?:/\\>|<\\/Tab\\.Screen>)`,
      'g'
    );
  return src.replace(re, '');
}

function insertTabIfMissing(src, tabName, compName, iconName, title) {
  if (src.includes(`name="${tabName}"`)) return src;
  const block = `
      <Tab.Screen
        name="${tabName}"
        component=${compName}
        options={{
          title: '${title}',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="${iconName}" color={color} size={size} />
          ),
        }}
      />`;
  const idx = src.lastIndexOf('</Tab.Navigator>');
  if (idx === -1) throw new Error('Impossibile trovare </Tab.Navigator>.');
  return src.slice(0, idx) + block + '\n' + src.slice(idx);
}

function ensureScreenOptions(src) {
  // se esistono già, non toccare; altrimenti aggiungi un set "sicuro"
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
  let src = fs.readFileSync(tabsFile, 'utf8');

  // trova i file reali degli screen
  const phrFile = findScreen([
    /phrases/i, /usefulphrases/i, /frasi/i
  ]);
  const weaFile = findScreen([
    /weather/i, /meteo/i
  ]);

  if (!phrFile) throw new Error('Non trovo lo screen delle Frasi (phrases/usefulphrases/frasi).');
  if (!weaFile) throw new Error('Non trovo lo screen del Meteo (weather/meteo).');

  const phrImport = relImport(tabsFile, phrFile);
  const weaImport = relImport(tabsFile, weaFile);

  // nomi component usati nell’import
  const phrComp = 'PhrasesScreen';
  const weaComp = 'WeatherScreen';

  // importa Ionicons + screens
  src = ensureIonicons(src);
  src = ensureImport(src, phrComp, phrImport);
  src = ensureImport(src, weaComp, weaImport);

  // rimuovi Login/Settings dal navigator
  src = removeTab(src, 'Login');
  src = removeTab(src, 'Settings');

  // assicura screenOptions sicure
  src = ensureScreenOptions(src);

  // inserisci Phrases/Weather se mancanti
  src = insertTabIfMissing(src, 'Phrases', phrComp, 'chatbubbles-outline', 'Frasi');
  src = insertTabIfMissing(src, 'Weather', weaComp, 'partly-sunny-outline', 'Meteo');

  if (DRY) {
    console.log('Dry-run OK. Verrebbero modificati: ' + tabsFile);
  } else {
    fs.writeFileSync(tabsFile, src, 'utf8');
    console.log('Modificato: ' + tabsFile);
  }
}

try {
  run();
} catch (e) {
  console.error('[patch-tabs] Errore:', e.message);
  process.exit(1);
}
