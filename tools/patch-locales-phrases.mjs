// tools/patch-locales-phrases.mjs
// - Inietta chiavi "Frasi Utili" in tutti i src/locales/*.json (IT/EN/ES/DE/FR)
// - Bonifica mojibake (Ã¢â‚¬â„¢ -> ', ecc.)
// - Salva UTF-8 senza BOM con backup .bak
//
// Uso:
//   node tools/patch-locales-phrases.mjs          # applica
//   node tools/patch-locales-phrases.mjs --dry    # anteprima

import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.join(process.cwd(), 'src', 'locales');

const additionsByLang = {
  it: {
    phrases: {
      title: "Frasi Utili",
      fromLang: "Lingua utente",
      toLang: "Lingua destinazione",
      free: { placeholder: "Scrivi qui…", translate: "Traduci" }
    }
  },
  en: {
    phrases: {
      title: "Useful Phrases",
      fromLang: "Your language",
      toLang: "Destination language",
      free: { placeholder: "Type here…", translate: "Translate" }
    }
  },
  es: {
    phrases: {
      title: "Frases Útiles",
      fromLang: "Tu idioma",
      toLang: "Idioma de destino",
      free: { placeholder: "Escribe aquí…", translate: "Traducir" }
    }
  },
  de: {
    phrases: {
      title: "Nützliche Sätze",
      fromLang: "Deine Sprache",
      toLang: "Zielsprache",
      free: { placeholder: "Hier eingeben…", translate: "Übersetzen" }
    }
  },
  fr: {
    phrases: {
      title: "Phrases utiles",
      fromLang: "Votre langue",
      toLang: "Langue de destination",
      free: { placeholder: "Écrivez ici…", translate: "Traduire" }
    }
  }
};

// Mappa sicura per mojibake comune (sostituzioni mirate)
const MAP = {
  // apostrofi e virgolette "rotte"
  "Ã¢â‚¬â„¢": "'", "â€™": "'", "â€˜": "'", "Ã¢â‚¬Å“": '"', "Ã¢â‚¬Â": '"', "â€œ": '"', "â€": '"',
  // trattini / puntini
  "Ã¢â‚¬â€œ": "–", "Ã¢â‚¬â€”": "—", "Ã¢â‚¬Â¢": "•", "Ã¢â‚¬Â¦": "…",
  // simboli valuta / gradi
  "Â€": "€", "â‚¬": "€", "Â£": "£", "Â°": "°",
  // lettere accentate comuni (utile se sfuggite)
  "Ã ": "à", "Ã¡": "á", "Ã¢": "â", "Ã¤": "ä", "Ã„": "Ä",
  "Ã¨": "è", "Ã©": "é", "Ãª": "ê", "Ã«": "ë",
  "Ã¬": "ì", "Ã­": "í", "Ã®": "î", "Ã¯": "ï",
  "Ã²": "ò", "Ã³": "ó", "Ã´": "ô", "Ã¶": "ö", "Ã–": "Ö",
  "Ã¹": "ù", "Ãº": "ú", "Ã»": "û", "Ã¼": "ü", "Ãœ": "Ü",
  "Ã±": "ñ", "Ã‘": "Ñ",
  // correzioni italiane tipiche
  "E'": "È", "e'": "è", "E’": "È", "e’": "è",
  "Qual' è": "Qual è", "Qual'  è": "Qual è" // safety
};

function stripBOM(s) { return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s; }

function readJSON(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(stripBOM(raw));
}

function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), { encoding: 'utf8' }); // UTF-8 no BOM
}

function deepSet(target, pathArr, value) {
  let cur = target;
  for (let i = 0; i < pathArr.length - 1; i++) {
    const k = pathArr[i];
    if (typeof cur[k] !== 'object' || cur[k] === null || Array.isArray(cur[k])) cur[k] = {};
    cur = cur[k];
  }
  cur[pathArr[pathArr.length - 1]] = value;
}

function injectKeys(json, lang, changes) {
  const add = additionsByLang[lang];
  if (!add) return;

  // per ciascuna chiave, se manca la inseriamo
  const want = add.phrases;
  // phrases
  if (!json.phrases) { json.phrases = {}; changes.push('add: phrases'); }

  // title
  if (json.phrases.title == null) { json.phrases.title = want.title; changes.push('add: phrases.title'); }
  // fromLang
  if (json.phrases.fromLang == null) { json.phrases.fromLang = want.fromLang; changes.push('add: phrases.fromLang'); }
  // toLang
  if (json.phrases.toLang == null) { json.phrases.toLang = want.toLang; changes.push('add: phrases.toLang'); }
  // free
  if (json.phrases.free == null || typeof json.phrases.free !== 'object') {
    json.phrases.free = { ...want.free }; changes.push('add: phrases.free');
  } else {
    if (json.phrases.free.placeholder == null) { json.phrases.free.placeholder = want.free.placeholder; changes.push('add: phrases.free.placeholder'); }
    if (json.phrases.free.translate == null) { json.phrases.free.translate = want.free.translate; changes.push('add: phrases.free.translate'); }
  }
}

const SUSPECT = /Ã|â|Â/; // caratteri tipici da mojibake

function fixOneString(s) {
  if (typeof s !== 'string') return s;
  let out = s;
  let changed = false;
  for (const [bad, good] of Object.entries(MAP)) {
    if (out.includes(bad)) { out = out.split(bad).join(good); changed = true; }
  }
  // casi generici: "IÃ¢â‚¬â„¢m" -> "I'm" se è rimasto qualche â€™
  if (SUSPECT.test(out)) {
    // tentativo "soft": latin1 -> utf8 (solo se migliora visivamente)
    const recoded = Buffer.from(out, 'latin1').toString('utf8');
    // se nella versione recoded spariscono i caratteri sospetti, prendo quella
    if (SUSPECT.test(out) && !SUSPECT.test(recoded)) {
      out = recoded; changed = true;
    }
  }
  // spazi prima di ? ! :
  out = out.replace(/\s+([?!:;])/g, '$1');
  return changed ? out : s;
}

function walk(obj, changes, pathArr = []) {
  if (typeof obj === 'string') {
    const fixed = fixOneString(obj);
    if (fixed !== obj) changes.push(`fix: ${pathArr.join('.')}`);
    return fixed;
  }
  if (Array.isArray(obj)) {
    return obj.map((v, i) => walk(v, changes, pathArr.concat(String(i))));
  }
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = walk(v, changes, pathArr.concat(k));
    }
    return out;
  }
  return obj;
}

function run(dry = false) {
  if (!fs.existsSync(LOCALES_DIR)) {
    console.error('❌ Directory non trovata:', LOCALES_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
  if (!files.length) {
    console.error('❌ Nessun file .json in', LOCALES_DIR);
    process.exit(1);
  }

  let totalChanges = 0;
  for (const file of files) {
    const full = path.join(LOCALES_DIR, file);
    let json;
    try { json = readJSON(full); }
    catch (e) { console.error(`❌ ${file} non è JSON valido:`, e.message); continue; }

    const lang = file.replace(/\.json$/, '').toLowerCase();
    const changes = [];

    // 1) inj
    injectKeys(json, lang, changes);
    // 2) sanitize
    const patched = walk(json, changes, [file]);

    if (!changes.length) {
      console.log('OK', file, '(nessuna modifica)');
      continue;
    }

    totalChanges += changes.length;

    console.log((dry ? 'DRY' : '✅'), file, `→ ${changes.length} modifiche`);
    changes.slice(0, 8).forEach((c, i) => console.log(`  - ${i + 1}. ${c}`));
    if (changes.length > 8) console.log(`  ... e altre ${changes.length - 8}.`);

    if (!dry) {
      // backup la prima volta
      if (!fs.existsSync(full + '.bak')) {
        fs.copyFileSync(full, full + '.bak');
      }
      writeJSON(full, patched);
    }
  }

  console.log(`\nTotale modifiche: ${totalChanges}`);
}

// ---- main
const dry = process.argv.includes('--dry');
run(dry);
