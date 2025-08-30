// tools/patch-large-style-tokens.mjs
// Sostituisce "fontSize: 'large'" -> numero (default 18)
// e "padding: 'large'" -> numero (default 16)
// Uso:
//   node tools/patch-large-style-tokens.mjs --write
// Opzioni:
//   --set-fontsize 20   (default 18)
//   --set-padding  12   (default 16)
//   --cwd <path>        (default: process.cwd())
//   --dry-run           (stampa ma non scrive)
//   --include <glob-like>  (ripetibile; es: --include src --include app)
// Nota: esclude sempre: node_modules, .git, ios, android, build, dist

import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
const opts = {
  write: argv.includes('--write'),
  dryRun: argv.includes('--dry-run') || !argv.includes('--write'),
  cwd: getArgValue('--cwd') || process.cwd(),
  include: getAllArgValues('--include'),
  fontSize: Number(getArgValue('--set-fontsize') ?? 18),
  padding: Number(getArgValue('--set-padding') ?? 16),
};

const allowedExt = new Set(['.ts', '.tsx', '.js', '.jsx']);
const excludeDirs = new Set(['node_modules', '.git', 'ios', 'android', 'build', 'dist']);

function getArgValue(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
}
function getAllArgValues(flag) {
  const vals = [];
  let i = 0;
  while ((i = argv.indexOf(flag, i)) !== -1) {
    const v = argv[i + 1];
    if (!v || v.startsWith('--')) break;
    vals.push(v);
    i += 2;
  }
  return vals;
}

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!allowedExt.has(ext)) return false;
  if (opts.include.length > 0) {
    // Se sono state date include dirs, il file deve ricadere dentro almeno una.
    const rel = path.relative(opts.cwd, filePath).replace(/\\/g, '/');
    return opts.include.some((inc) => rel.startsWith(inc.replace(/\\/g, '/').replace(/\/+$/, '') + '/'));
  }
  return true;
}

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (excludeDirs.has(e.name)) continue;
      walk(path.join(dir, e.name), cb);
    } else {
      const p = path.join(dir, e.name);
      cb(p);
    }
  }
}

let filesScanned = 0;
let filesChanged = 0;
let totalRepl = 0;

const reFontLarge = /fontSize\s*:\s*(['"])large\1/g;          // fontSize: 'large' | "large"
const rePadLarge  = /padding\s*:\s*(['"])large\1/g;            // padding: 'large' | "large"

// Esegui
walk(opts.cwd, (file) => {
  if (!shouldProcessFile(file)) return;
  filesScanned++;
  let src = fs.readFileSync(file, 'utf8');
  let changed = false;
  let replacements = 0;

  // Sostituisci fontSize 'large' -> numero
  if (reFontLarge.test(src)) {
    src = src.replace(reFontLarge, `fontSize: ${opts.fontSize}`);
    changed = true;
    replacements++;
  }

  // Sostituisci padding 'large' -> numero
  if (rePadLarge.test(src)) {
    src = src.replace(rePadLarge, `padding: ${opts.padding}`);
    changed = true;
    replacements++;
  }

  if (changed) {
    filesChanged++;
    totalRepl += replacements;
    if (!opts.dryRun) {
      fs.writeFileSync(file, src, 'utf8');
    }
    console.log(`${opts.dryRun ? '[DRY]' : '[WRITE]'} ${file} (repl: ${replacements})`);
  }
});

console.log(`\nScan done. Files scanned: ${filesScanned}, changed: ${filesChanged}, replacements: ${totalRepl}.`);
if (opts.dryRun) {
  console.log('Nothing written (dry-run). Re-run with --write to apply changes.');
}
