// tools/repair-locales-json.mjs
// Ripara JSON in src/locales/*.json o file passati da CLI.
// Uso:
//   node tools/repair-locales-json.mjs --all         # ripara tutti
//   node tools/repair-locales-json.mjs src/locales/it.json
//   node tools/repair-locales-json.mjs --lint src/locales/it.json  # solo verifica

import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.join(process.cwd(), 'src', 'locales');

function stripBOM(s) { return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s; }

function cleanMergeMarkers(txt) {
  // rimuove linee con marker di merge git
  return txt
    .replace(/^[ \t>*-]*<{7}.*$/gm, '')
    .replace(/^[ \t>*-]*={7}.*$/gm, '')
    .replace(/^[ \t>*-]*>{7}.*$/gm, '');
}

function stripCommentsAndTrailingCommas(s) {
  let out = '';
  let inStr = false, quote = '"', esc = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (inStr) {
      out += ch;
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === quote) inStr = false;
      continue;
    }

    if (ch === '"' || ch === "'") { inStr = true; quote = ch; out += ch; continue; }

    // commenti
    if (ch === '/' && i + 1 < s.length) {
      const nx = s[i + 1];
      if (nx === '/') { // // ...
        i += 2;
        while (i < s.length && s[i] !== '\n' && s[i] !== '\r') i++;
        out += '\n';
        continue;
      }
      if (nx === '*') { // /* ... */
        i += 2;
        while (i + 1 < s.length && !(s[i] === '*' && s[i + 1] === '/')) i++;
        i++; // salta '/'
        continue;
      }
    }

    // virgola finale prima di } o ]
    if (ch === ',') {
      let j = i + 1;
      while (j < s.length && /\s/.test(s[j])) j++;
      const nx = s[j];
      if (nx === '}' || nx === ']') {
        // salta la virgola pendente
        continue;
      }
    }

    out += ch;
  }

  // taglia tutto ciò che viene dopo l'ULTIMA '}' (spesso spazzatura che rompe il parse)
  const last = out.lastIndexOf('}');
  if (last >= 0) {
    const tail = out.slice(last + 1);
    if (/\S/.test(tail)) out = out.slice(0, last + 1);
  }
  return out;
}

function sanitize(raw) {
  let s = raw.replace(/\u0000/g, '');        // NUL
  s = stripBOM(s);
  s = cleanMergeMarkers(s);
  s = stripCommentsAndTrailingCommas(s);
  return s;
}

function jsonParseOrError(text) {
  try { return { ok: true, data: JSON.parse(text) }; }
  catch (e) { return { ok: false, err: e }; }
}

function showContext(text, pos, radius = 80) {
  const start = Math.max(0, pos - radius);
  const end = Math.min(text.length, pos + radius);
  const snippet = text.slice(start, end)
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return `...${snippet}...`;
}

function repairOne(file, lintOnly = false) {
  if (!fs.existsSync(file)) { console.error('Skip (not found):', file); return false; }

  const raw = fs.readFileSync(file, 'utf8');
  const cleaned = sanitize(raw);
  const parsed = jsonParseOrError(cleaned);

  if (!parsed.ok) {
    // prova a dare info utili
    const m = String(parsed.err?.message || '').match(/position\s+(\d+)/i);
    const pos = m ? Number(m[1]) : -1;
    console.error(`❌ ${file} non è ancora valido: ${parsed.err.message}`);
    if (pos >= 0) console.error('   Contesto:', showContext(cleaned, pos));
    return false;
  }

  if (lintOnly) {
    console.log('OK', file, '(lint)');
    return true;
  }

  // backup la prima volta
  if (!fs.existsSync(file + '.bak')) {
    fs.copyFileSync(file, file + '.bak');
  }
  fs.writeFileSync(file, JSON.stringify(parsed.data, null, 2), { encoding: 'utf8' });
  console.log('✅ Riparato', file);
  return true;
}

(function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const lint = args.includes('--lint');
  const targetsArg = args.filter(a => !a.startsWith('--'));

  let targets = targetsArg;
  if (all || !targets.length) {
    if (!fs.existsSync(LOCALES_DIR)) {
      console.error('❌ Directory non trovata:', LOCALES_DIR);
      process.exit(1);
    }
    targets = fs.readdirSync(LOCALES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(LOCALES_DIR, f));
  }

  let ok = true;
  for (const f of targets) {
    const res = repairOne(f, lint);
    ok = ok && res;
  }
  process.exit(ok ? 0 : 1);
})();
