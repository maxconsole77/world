import Constants from 'expo-constants';

type Provider = 'deepl' | 'google' | 'none';

const cfg = {
  provider:
    ((Constants.expoConfig?.extra as any)?.translateProvider as Provider) ||
    (process.env.EXPO_PUBLIC_TRANSLATE_PROVIDER as Provider) ||
    'none',
  deeplKey:
    (Constants.expoConfig?.extra as any)?.deeplKey ||
    process.env.EXPO_PUBLIC_DEEPL_KEY ||
    '',
  googleKey:
    (Constants.expoConfig?.extra as any)?.googleKey ||
    process.env.EXPO_PUBLIC_GOOGLE_KEY ||
    '',
};

// ---------- helpers ----------
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
const hasPct = (s: string) => /%[0-9A-Fa-f]{2}/.test(s);
function cleanOut(s: string) {
  if (!s) return s;
  let out = s;
  // decode %xx se presente
  if (hasPct(out)) {
    try { out = decodeURIComponent(out.replace(/\+/g, ' ')); } catch {}
  }
  // normalizza spazi prima di ?!., apostrofi tipografici → semplici
  out = out.replace(/\s+([?!.,;:])/g, '$1').replace(/[’`´]/g, "'").replace(/\s{2,}/g, ' ').trim();
  return out;
}
function tooSimilar(a: string, b: string) {
  // se oltre il 70% delle parole coincidono, probabile traduzione scarsa
  const A = a.toLowerCase().split(/\s+/);
  const B = b.toLowerCase().split(/\s+/);
  let same = 0;
  for (const w of A) if (B.includes(w)) same++;
  return A.length && same / A.length >= 0.7;
}

function toDeepL(lang: string) {
  const l = lang.toLowerCase();
  if (l === 'auto') return 'auto';
  const map: Record<string, string> = { en: 'EN', it: 'IT', es: 'ES', de: 'DE', fr: 'FR' };
  return map[l] || l.toUpperCase();
}
function toGoogle(lang: string) { return lang.toLowerCase(); }

// ---------- providers ----------
async function tryDeepl(text: string, source: string, target: string) {
  if (!cfg.deeplKey) return null;
  const src = toDeepL(source);
  const dst = toDeepL(target);
  const url = 'https://api-free.deepl.com/v2/translate';
  const body =
    `text=${encodeURIComponent(text)}` +
    (src !== 'auto' ? `&source_lang=${encodeURIComponent(src)}` : '') +
    `&target_lang=${encodeURIComponent(dst)}`;

  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `DeepL-Auth-Key ${cfg.deeplKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });
      if (!r.ok) { await sleep(250 * (i + 1)); continue; }
      const j = await r.json();
      const out = j?.translations?.[0]?.text as string | undefined;
      if (out) return cleanOut(out);
    } catch {}
  }
  return null;
}

async function tryGoogle(text: string, source: string, target: string) {
  if (!cfg.googleKey) return null;
  const src = toGoogle(source);
  const dst = toGoogle(target);
  const url = `https://translation.googleapis.com/language/translate/v2?key=${cfg.googleKey}`;
  const payload: any = { q: text, target: dst, format: 'text' };
  if (src !== 'auto') payload.source = src;

  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) { await sleep(250 * (i + 1)); continue; }
      const j = await r.json();
      const out = j?.data?.translations?.[0]?.translatedText as string | undefined;
      if (out) return cleanOut(out);
    } catch {}
  }
  return null;
}

const LIBRE = [
  'https://libretranslate.de/translate',
  'https://translate.astian.org/translate',
];

async function tryLibre(text: string, source: string, target: string) {
  for (const ep of LIBRE) {
    for (let i = 0; i < 2; i++) {
      try {
        const r = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            source: source.toLowerCase(), // 'auto' supportato
            target: target.toLowerCase(),
            format: 'text',
          }),
        });
        if (!r.ok) { await sleep(250 * (i + 1)); continue; }
        const j = await r.json();
        const out = j?.translatedText as string | undefined;
        if (out) return cleanOut(out);
      } catch {}
    }
  }
  return null;
}

// ---------- API pubblica ----------
/**
 * Traduce text da `source` -> `target`.
 * - Usa prima il provider scelto con `source='auto'` (migliora qualità).
 * - Fallback su LibreTranslate.
 * - Pulisce output URL-encoded e spaziatura.
 * - Se il risultato è troppo simile all'input, restituisce l'originale (evita "Dov'è la stop?").
 */
export async function translate(text: string, source: string, target: string): Promise<string> {
  const input = (text ?? '').trim();
  if (!input) return '';

  const s = (source || 'auto').slice(0, 5).toLowerCase();
  const t = (target || 'en').slice(0, 5).toLowerCase();

  if (s !== 'auto' && s === t) return input;

  // Provider principale con auto-detect
  if (cfg.provider === 'deepl') {
    const out = await tryDeepl(input, 'auto', t);
    if (out && !tooSimilar(input, out)) return out;
  } else if (cfg.provider === 'google') {
    const out = await tryGoogle(input, 'auto', t);
    if (out && !tooSimilar(input, out)) return out;
  }

  // Fallback gratuiti
  const out = await tryLibre(input, 'auto', t);
  if (out && !tooSimilar(input, out)) return out;

  return input; // ultima spiaggia
}


