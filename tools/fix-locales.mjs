// tools/fix-locales.mjs
import fs from 'fs';
import path from 'path';

// cartella dei dizionari
const dir = path.join(process.cwd(), 'src', 'locales');

// rimuove caratteri di controllo non permessi (esclusi \t \n \r)
const badCtl = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function stripBOM(buf) {
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    return buf.slice(3);
  }
  return buf;
}

// Trova la fine del top-level { ... } ignorando testo nelle stringhe
function findTopLevelObjectEnd(s) {
  let depth = 0;
  let inStr = false;
  let esc = false;
  let startSeen = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') { inStr = false; continue; }
      continue;
    }
    // non in stringa
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{') { depth++; startSeen = true; continue; }
    if (ch === '}') {
      depth--;
      if (depth === 0 && startSeen) return i; // fine dell'oggetto top-level
      continue;
    }
  }
  return -1;
}

for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json'))) {
  const p = path.join(dir, f);
  let buf = fs.readFileSync(p);
  buf = stripBOM(buf);

  let s = buf.toString('utf8').replace(badCtl, '');

  // Prova parse diretto
  let obj;
  try {
    obj = JSON.parse(s);
  } catch (e) {
    // recupero: taglia tutto quello che c'è dopo la fine del top-level object
    const end = findTopLevelObjectEnd(s);
    if (end >= 0) {
      const trimmed = s.slice(0, end + 1);
      try {
        obj = JSON.parse(trimmed);
        s = trimmed;
        console.warn(`⚠️  Riparato (trailing garbage rimosso): ${f}`);
      } catch (e2) {
        console.error(`❌ JSON non valido (anche dopo trim): ${f} - ${e2.message}`);
        process.exitCode = 1;
        continue;
      }
    } else {
      console.error(`❌ JSON non valido: ${f} - ${e.message}`);
      process.exitCode = 1;
      continue;
    }
  }

  // riscrive "pretty" in UTF-8 senza BOM
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), { encoding: 'utf8' });
  console.log(`✅ Sistemato ${f}`);
}

console.log('Fatto.');
