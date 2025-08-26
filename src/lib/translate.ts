import Constants from 'expo-constants';

type Lang = 'it'|'en'|'es'|'de'|'fr';

const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));
const backoff = (n:number)=> {
  const base = Math.min(1000 * (2 ** n), 8000);
  return base/2 + Math.random()*base/2; // jitter
};

export async function translateText(text: string, from: Lang, to: Lang): Promise<string> {
  if (!text) return '';
  const extra: any = (Constants as any).expoConfig?.extra || {};
  const provider = extra.translationProvider || 'none';
  const key = extra.translationApiKey || '';

  if (provider === 'none' || !key) return text; // fallback “graceful”

  const deepl = async () => {
    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Content-Type':'application/x-www-form-urlencoded',
        'Authorization': `DeepL-Auth-Key ${key}`
      },
      body: `text=${encodeURIComponent(text)}&source_lang=${from.toUpperCase()}&target_lang=${to.toUpperCase()}`
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    return data?.translations?.[0]?.text ?? text;
  };

  const google = async () => {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ q: text, source: from, target: to, format: 'text' })
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    return data?.data?.translations?.[0]?.translatedText ?? text;
  };

  const exec = provider === 'deepl' ? deepl : google;

  for (let attempt = 0; attempt < 4; attempt++) {
    try { return await exec(); }
    catch (e:any) {
      const code = Number(String(e?.message||'').replace(/\D/g,''));
      if ([429,500,502,503,504].includes(code) || !code) {
        await sleep(backoff(attempt));
        continue;
      }
      break;
    }
  }
  return text;
}
