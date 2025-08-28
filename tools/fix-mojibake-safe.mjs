// tools/fix-mojibake-safe.mjs
// Correzione MIRATA di sequenze mojibake comuni (UTF-8 letto come Latin-1).
// Non ricodifica l'intera stringa: sostituisce solo pattern noti (piÃ¹->più, Ã©->é, Â°->°, â€™->’, â‚¬->€ ...)

import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.join(process.cwd(), 'src', 'locales');

// mapping mirato: aggiungi qui se noti altri casi
const MAP = {
  'piÃ¹': 'più', 'PiÃ¹': 'Più',
  'Ã ': 'à', 'Ã¡': 'á', 'Ã¢': 'â', 'Ã¤': 'ä', 'Ã„': 'Ä',
  'Ã¨': 'è', 'Ã©': 'é', 'Ãª': 'ê', 'Ãë': 'ë',
  'Ã¬': 'ì', 'Ã­': 'í', 'Ã®': 'î', 'Ã¯': 'ï',
  'Ã²': 'ò', 'Ã³': 'ó', 'Ã´': 'ô', 'Ã¶': 'ö', 'Ã–': 'Ö',
  'Ã¹': 'ù', 'Ãº': 'ú', 'Ã»': 'û', 'Ã¼': 'ü', 'Ãœ': 'Ü',
  'Ã±': 'ñ', 'Ã‘': 'Ñ',

  'Â°': '°', 'Â€': '€', 'â‚¬': '€',
  'â€™': '’', 'â€˜': '‘', 'â€œ': '“', 'â€': '”', 'â€“': '–', 'â€”': '—', 'â€¢': '•',

  // casi italiani frequenti
  "E'": 'È', "e'": 'è', "E’": 'È', "e’": 'è',
  "Dov'e": "Dov'è", "Dov’": "Dov’", // fallback
};

// fix extra stile/apostrofi
function postFix(s) {
  return s
    .replace(/\s+\?/g, '?')
    .replace(/Qual['’]\s*è/gi, 'Qual è');
}

function fixOne(str) {
  if (typeof str !== 'string') return str;
  let out = str;
  let changed = false;

  for (const [bad, good] of Object.entries(MAP)) {
    if (out.includes(bad)) {
      out = out.split(bad).join(good);
      changed = true;
    }
  }
  if (changed) out = postFix(out);
  return { out, changed };
}

function walk(obj, changes = [], pathArr = []) {
  if (typeof obj === 'string') {
    const { out, changed } = fixOne(obj);
    if (changed) changes.push({ path: pathArr.join('.'), from: obj, to: out });
    return out;
  }
  if (Array.isArray(obj)) {
    return obj.map((v, i) => walk(v, changes, pathArr.concat(String(i))));
  }
  if (obj && typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = walk(v, changes, pathArr.concat(k));
    }
    return res;
  }
  return obj;
}

function stripBOM(s) {
  return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}

function loadJSON(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(stripBOM(raw));
}

function saveJSON(p, obj) {
  // backup .bak la prima volta
  if (!fs.existsSync(p + '.bak')) {
    fs.copyFileSync(p, p + '.bak');
  }
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), { encoding: 'utf8' }); // UTF-8 senza BOM
}

function run(files, dry = false) {
  let total = 0;
  for (const file of files) {
    const full = path.join(LOCALES_DIR, file);
    if (!fs.existsSync(full)) {
      console.warn('Skip (not found):', file);
      continue;
    }
    let json;
    try { json = loadJSON(full); }
    catch (e) { console.error(`❌ ${file} non è JSON valido:`, e.message); continue; }

    const changes = [];
    const patched = walk(json, changes, [file]);
    if (!changes.length) {
      console.log('OK', file);
      continue;
    }
    total += changes.length;

    console.log(`${dry ? 'DRY' : '✅'} ${file} -> ${changes.length} sostituzioni`);
    changes.slice(0, 8).forEach((c, i) => {
      console.log(`  - ${i+1}. ${c.path.replace(`${file}.`, '')}`);
      console.log(`      "${c.from}"`);
      console.log(`      -> "${c.to}"`);
    });
    if (changes.length > 8) console.log(`  ... e altre ${changes.length - 8}.`);

    if (!dry) saveJSON(full, patched);
  }
  console.log(`Totale sostituzioni: ${total}`);
}

(function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const all = args.includes('--all');
  let targets = args.filter(a => !a.startsWith('--'));
  if (all || !targets.length) {
    targets = (fs.existsSync(LOCALES_DIR) ? fs.readdirSync(LOCALES_DIR) : []).filter(f => f.endsWith('.json'));
  }
  run(targets, dry);
})();
