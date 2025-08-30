// tools/patch-large-style-tokens.mjs
// Patch v2: normalizza 'large' su proprietà RN/Navigation che richiedono numeri o boolean.
// Uso:
//   node tools/patch-large-style-tokens.mjs --write
// Opzioni:
//   --set-fontsize 18  --set-pad 16  --set-margin 16  --set-gap 12
//   --set-gesture 35   --set-statusbar 0
//   --cwd <path>       --include <dir> (ripetibile)  --dry-run

import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
const opts = {
  write: argv.includes('--write'),
  dryRun: argv.includes('--dry-run') || !argv.includes('--write'),
  cwd: getArg('--cwd') || process.cwd(),
  include: getAll('--include'),
  fontSize: num(getArg('--set-fontsize'), 18),
  pad: num(getArg('--set-pad'), 16),
  margin: num(getArg('--set-margin'), 16),
  gap: num(getArg('--set-gap'), 12),
  gesture: num(getArg('--set-gesture'), 35),
  statusbar: num(getArg('--set-statusbar'), 0),
};

const allowExt = new Set(['.ts', '.tsx', '.js', '.jsx']);
const excludeDirs = new Set(['node_modules', '.git', 'ios', 'android', 'build', 'dist']);

function getArg(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
}
function getAll(flag) {
  const out = [];
  let i = 0;
  while ((i = argv.indexOf(flag, i)) !== -1) {
    const v = argv[i + 1];
    if (!v || v.startsWith('--')) break;
    out.push(v);
    i += 2;
  }
  return out;
}
function num(v, dflt) { const n = Number(v); return Number.isFinite(n) ? n : dflt; }

function shouldProcess(file) {
  const ext = path.extname(file).toLowerCase();
  if (!allowExt.has(ext)) return false;
  if (opts.include.length > 0) {
    const rel = path.relative(opts.cwd, file).replace(/\\/g, '/');
    return opts.include.some(inc => rel.startsWith(inc.replace(/\\/g, '/').replace(/\/+$/, '') + '/'));
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
      cb(path.join(dir, e.name));
    }
  }
}

// Regex mirati (evitiamo di toccare ActivityIndicator size="large")
const q = `(['"])large\\1`;
const reFontSize = new RegExp(`fontSize\\s*:\\s*${q}`, 'g');
const rePadding  = new RegExp(`padding\\s*:\\s*${q}`, 'g');
const rePadX     = new RegExp(`padding(?:Top|Right|Bottom|Left|Horizontal|Vertical)\\s*:\\s*${q}`, 'g');
const reMargin   = new RegExp(`margin\\s*:\\s*${q}`, 'g');
const reMarginX  = new RegExp(`margin(?:Top|Right|Bottom|Left|Horizontal|Vertical)\\s*:\\s*${q}`, 'g');
const reGap      = new RegExp(`(?:\\b|\\W)(?:gap|rowGap|columnGap)\\s*:\\s*${q}`, 'g');

const reGesture  = new RegExp(`gestureResponseDistance\\s*:\\s*${q}`, 'g');
const reStatus   = new RegExp(`headerStatusBarHeight\\s*:\\s*${q}`, 'g');
const reHdrLarge = new RegExp(`headerLargeTitle\\s*:\\s*${q}`, 'g');

let scanned = 0, changed = 0, total = 0;

walk(opts.cwd, (file) => {
  if (!shouldProcess(file)) return;
  const ext = path.extname(file).toLowerCase();
  if (!allowExt.has(ext)) return;

  let src = fs.readFileSync(file, 'utf8');
  const before = src;

  src = src
    .replace(reFontSize,  `fontSize: ${opts.fontSize}`)
    .replace(rePadding,   `padding: ${opts.pad}`)
    .replace(rePadX,      (m) => m.replace(q, `${opts.pad}`))
    .replace(reMargin,    `margin: ${opts.margin}`)
    .replace(reMarginX,   (m) => m.replace(q, `${opts.margin}`))
    .replace(reGap,       (m) => m.replace(q, `${opts.gap}`))
    .replace(reGesture,   `gestureResponseDistance: ${opts.gesture}`)
    .replace(reStatus,    `headerStatusBarHeight: ${opts.statusbar}`)
    .replace(reHdrLarge,  `headerLargeTitle: true`);

  scanned++;
  if (src !== before) {
    changed++;
    // contiamo in modo grossolano le sostituzioni fatte
    const reps = (before.match(/'large'|"large"/g) || []).length - (src.match(/'large'|"large"/g) || []).length;
    total += Math.max(1, reps);
    if (!opts.dryRun) fs.writeFileSync(file, src, 'utf8');
    console.log(`${opts.dryRun ? '[DRY]' : '[WRITE]'} ${file}`);
  }
});

console.log(`\nScan done. Files scanned: ${scanned}, changed: ${changed}, approx replacements: ${total}.`);
if (opts.dryRun) console.log('Nothing written (dry-run). Re-run with --write to apply.');

