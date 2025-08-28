// tools/patch-it-apostrophes.mjs
// Patch "sicura": apre src/locales/it.json, corregge apostrofi/accenti nelle frasi
// Esempi: "Dovè la fermata" -> "Dov'è la fermata?", "E' piccante" -> "È piccante?"

import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'src', 'locales', 'it.json');

function stripBOM(s) {
  return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}

function readJSON(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(stripBOM(raw));
}

function writeJSON(p, obj) {
  const txt = JSON.stringify(obj, null, 2);
  fs.writeFileSync(p, txt, { encoding: 'utf8' }); // UTF-8 senza BOM
}

function fixItalianApostrophes(s) {
  if (typeof s !== 'string') return s;

  let out = s;

  // Normalizza apostrofo "curly" -> semplice
  out = out.replace(/\u2019/g, "'").replace(/\u2032/g, "'"); // ’ ′

  // Correzioni puntuali note
  // "Dovè la fermata" o "Dove' la fermata" -> "Dov'è la fermata?"
  out = out.replace(/Dov[èe']\s+la\s+fermata\??/gi, "Dov'è la fermata?");

  // "E' piccante" / "E’ piccante" -> "È piccante?"
  out = out.replace(/E['’]?\s+piccante\??/g, "È piccante?");

  // Correzioni generiche di E'/e'
  // Inizio parola o dopo spazio/punteggiatura: E' -> È / e' -> è
  out = out
    .replace(/(^|\s|\(|\[|{|["“])E'(?=\s|$)/g, "$1È")
    .replace(/(^|\s|\(|\[|{|["“])e'(?=\s|$)/g, "$1è")
    .replace(/(^|\s|\(|\[|{|["“])E’(?=\s|$)/g, "$1È")
    .replace(/(^|\s|\(|\[|{|["“])e’(?=\s|$)/g, "$1è");

  // "Qual'è" -> "Qual è"
  out = out.replace(/Qual['’]\s*è/gi, "Qual è");

  // Spazi prima del punto interrogativo
  out = out.replace(/\s+\?/g, "?");

  return out;
}

function walk(obj, onString, pathArr = [], changes = []) {
  if (typeof obj === 'string') {
    const fixed = onString(obj);
    if (fixed !== obj) changes.push({ path: pathArr.join('.'), from: obj, to: fixed });
    return fixed;
  }
  if (Array.isArray(obj)) {
    return obj.map((v, i) => walk(v, onString, pathArr.concat(String(i)), changes));
  }
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = walk(v, onString, pathArr.concat(k), changes);
    }
    return out;
  }
  return obj;
}

(function main() {
  if (!fs.existsSync(FILE)) {
    console.error('❌ Non trovo:', FILE);
    process.exit(1);
  }

  let json;
  try {
    json = readJSON(FILE);
  } catch (e) {
    console.error('❌ it.json non è JSON valido:', e.message);
    process.exit(1);
  }

  const changes = [];
  const patched = walk(json, fixItalianApostrophes, [], changes);

  if (!changes.length) {
    console.log('ℹ️ Nessuna modifica necessaria.');
    process.exit(0);
  }

  writeJSON(FILE, patched);

  console.log(`✅ Patch applicata a it.json (${changes.length} modifiche)`);
  // Mostra le prime 10 modifiche per controllo visivo
  changes.slice(0, 10).forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.path}: "${c.from}" -> "${c.to}"`);
  });
  if (changes.length > 10) {
    console.log(`  ... e altre ${changes.length - 10} modifiche.`);
  }
})();
