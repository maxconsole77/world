import Constants from 'expo-constants';

type Provider = 'deepl' | 'google' | 'none';

const cfg = {
  provider: (Constants.expoConfig?.extra as any)?.translateProvider
    || process.env.EXPO_PUBLIC_TRANSLATE_PROVIDER
    || 'none',
  deeplKey: (Constants.expoConfig?.extra as any)?.deeplKey
    || process.env.EXPO_PUBLIC_DEEPL_KEY,
  googleKey: (Constants.expoConfig?.extra as any)?.googleKey
    || process.env.EXPO_PUBLIC_GOOGLE_KEY,
};

export async function translate(text: string, source: string, target: string): Promise<string> {
  if (!text.trim()) return '';
  const provider = (cfg.provider as Provider) || 'none';

  try {
    if (provider === 'deepl' && cfg.deeplKey) {
      const res = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${cfg.deeplKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `text=${encodeURIComponent(text)}&source_lang=${source.toUpperCase()}&target_lang=${target.toUpperCase()}`
      });
      const j = await res.json();
      const out = j?.translations?.[0]?.text;
      if (out) return out;
    }

    if (provider === 'google' && cfg.googleKey) {
      const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${cfg.googleKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source, target, format: 'text' })
      });
      const j = await res.json();
      const out = j?.data?.translations?.[0]?.translatedText;
      if (out) return out;
    }

    // Fallback gratuito (LibreTranslate pubblico)
    const alt = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text' })
    });
    const jj = await alt.json();
    if (jj?.translatedText) return jj.translatedText;

    // Se anche il fallback fallisce, restituisco l’originale
    return text;
  } catch {
    return text;
  }
}

