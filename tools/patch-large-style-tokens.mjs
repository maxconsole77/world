// tools/patch-large-style-tokens.mjs
// Patch v3: sostituisce 'large' su proprietà che DEVONO essere numeriche/booleane.
// Evita ActivityIndicator size="large".
import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
const opts = {
  write: argv.includes('--write'),
  dry: !argv.includes('--write') || argv.includes('--dry-run'),
  cwd: get('--cwd') || process.cwd(),
  include: all('--include'),
  fontSize: num(get('--set-fontsize'), 18),
  pad: num(get('--set-pad'), 16),
  margin: num(get('--set-margin'), 16),
  gap: num(get('--set-gap'), 12),
  gesture: num(get('--set-gesture'), 35),
  statusbar: num(get('--set-statusbar'), 0),
  height: num(get('--set-height'), 44),
  width: num(get('--set-width'), 44),
  radius: num(get('--set-radius'), 12),
  lineHeight: num(get('--set-lineheight'), 22),
  letterSpacing: num(get('--set-letterspacing'), 0.25),
};
function get(f){const i=argv.indexOf(f);return i>=0&&argv[i+1]&&!argv[i+1].startsWith('--')?argv[i+1]:null}
function all(f){const out=[];let i=0;while((i=argv.indexOf(f,i))!==-1){const v=argv[i+1];if(!v||v.startsWith('--'))break;out.push(v);i+=2}return out}
function num(v,d){const n=Number(v);return Number.isFinite(n)?n:d}

const allowExt = new Set(['.ts','.tsx','.js','.jsx']);
const excludeDirs = new Set(['node_modules','.git','ios','android','build','dist']);

const q = `(['"])large\\1`;
const re = {
  fontSize: new RegExp(`fontSize\\s*:\\s*${q}`,'g'),
  padding:  new RegExp(`padding\\s*:\\s*${q}`,'g'),
  padX:     new RegExp(`padding(?:Top|Right|Bottom|Left|Horizontal|Vertical)\\s*:\\s*${q}`,'g'),
  margin:   new RegExp(`margin\\s*:\\s*${q}`,'g'),
  marginX:  new RegExp(`margin(?:Top|Right|Bottom|Left|Horizontal|Vertical)\\s*:\\s*${q}`,'g'),
  gap:      new RegExp(`(?:\\b|\\W)(?:gap|rowGap|columnGap)\\s*:\\s*${q}`,'g'),
  height:   new RegExp(`(?:^|\\W)(?:height|minHeight|maxHeight|top|bottom)\\s*:\\s*${q}`,'g'),
  width:    new RegExp(`(?:^|\\W)(?:width|minWidth|maxWidth|left|right)\\s*:\\s*${q}`,'g'),
  border:   new RegExp(`border(?:Radius|TopLeftRadius|TopRightRadius|BottomLeftRadius|BottomRightRadius|Width)\\s*:\\s*${q}`,'g'),
  lineH:    new RegExp(`lineHeight\\s*:\\s*${q}`,'g'),
  letterSp: new RegExp(`letterSpacing\\s*:\\s*${q}`,'g'),
  gesture:  new RegExp(`gestureResponseDistance\\s*:\\s*${q}`,'g'),
  status:   new RegExp(`headerStatusBarHeight\\s*:\\s*${q}`,'g'),
  hdrLarge: new RegExp(`headerLargeTitle\\s*:\\s*${q}`,'g'),
};
// Evita di toccare ActivityIndicator size="large"
const reActivity = /(<ActivityIndicator[^>]*\bsize\s*=\s*["']large["'])|(\bsize\s*:\s*["']large["'])/g;

let scanned=0, changed=0;

walk(opts.cwd, (file)=>{
  if(!shouldProcess(file)) return;
  let src = fs.readFileSync(file,'utf8');
  const before = src;

  // proteggi ActivityIndicator
  const placeholders = [];
  src = src.replace(reActivity, (m)=>{placeholders.push(m); return `__KEEP_ACTIVITY_${placeholders.length-1}__`});

  src = src
    .replace(re.fontSize, `fontSize: ${opts.fontSize}`)
    .replace(re.padding,  `padding: ${opts.pad}`)
    .replace(re.padX,     (m)=>m.replace(new RegExp(q), `${opts.pad}`))
    .replace(re.margin,   `margin: ${opts.margin}`)
    .replace(re.marginX,  (m)=>m.replace(new RegExp(q), `${opts.margin}`))
    .replace(re.gap,      (m)=>m.replace(new RegExp(q), `${opts.gap}`))
    .replace(re.height,   (m)=>m.replace(new RegExp(q), `${opts.height}`))
    .replace(re.width,    (m)=>m.replace(new RegExp(q), `${opts.width}`))
    .replace(re.border,   (m)=>m.replace(new RegExp(q), `${opts.radius}`))
    .replace(re.lineH,    `lineHeight: ${opts.lineHeight}`)
    .replace(re.letterSp, `letterSpacing: ${opts.letterSpacing}`)
    .replace(re.gesture,  `gestureResponseDistance: ${opts.gesture}`)
    .replace(re.status,   `headerStatusBarHeight: ${opts.status}`)
    .replace(re.hdrLarge, `headerLargeTitle: true`);

  // ripristina ActivityIndicator
  src = src.replace(/__KEEP_ACTIVITY_(\d+)__/g, (_,i)=>placeholders[Number(i)]);

  scanned++;
  if(src!==before){
    changed++;
    if(!opts.dry) fs.writeFileSync(file,src,'utf8');
    console.log(`${opts.dry?'[DRY]':'[WRITE]'} ${path.relative(opts.cwd,file)}`);
  }
});
console.log(`\nScan done. Files scanned: ${scanned}, changed: ${changed}. ${opts.dry?'(dry-run)':''}`);

function shouldProcess(p){
  const ext = path.extname(p).toLowerCase();
  if(!allowExt.has(ext)) return false;
  if(opts.include.length>0){
    const rel = path.relative(opts.cwd,p).replace(/\\/g,'/');
    return opts.include.some(inc=>rel.startsWith(inc.replace(/\\/g,'/').replace(/\/+$/,'')+'/'));
  }
  const seg = p.split(path.sep);
  return !seg.some(s=>excludeDirs.has(s));
}
