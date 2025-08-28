// src/lib/weather.ts
// Sorgente: Open-Meteo (senza chiave) per daily + hourly; radar: RainViewer (usato nella WebView della mappa)
export type WeatherSummary = {
  summary?: string;
  tmin?: number;
  tmax?: number;
  precipProb?: number;
  precipSum?: number;
  humidity?: number;
  wind?: number;
  pressure?: number;
  uv?: number;
  visibility?: number;
};

export type WeatherHour = {
  timeISO: string;   // ISO string in timezone locale scelto da Open-Meteo
  hour: number;      // 0..23
  temp?: number;
  precipProb?: number;
  weathercode?: number;
  wind?: number;
  humidity?: number;
};

export type DaypartKey = 'night' | 'morning' | 'afternoon' | 'evening';

export type DaypartSummary = {
  key: DaypartKey;
  from: number; // starting hour
  to: number;   // ending hour inclusive
  tmin?: number;
  tmax?: number;
  precipProb?: number; // max prob %
  weathercode?: number; // dominante
};

const OM_BASE = 'https://api.open-meteo.com/v1/forecast';

// Mappa codici WMO -> descrizione stringa breve IT (fallback EN se vuoi)
export function wmoToText(code?: number): string {
  if (code == null) return '';
  // Riferimento: https://open-meteo.com/en/docs
  const map: Record<number, string> = {
    0: 'Sereno',
    1: 'Preval. sereno',
    2: 'Parzialmente nuvoloso',
    3: 'Nuvoloso',
    45: 'Nebbia',
    48: 'Nebbia ghiaccio',
    51: 'Pioviggine leggera',
    53: 'Pioviggine',
    55: 'Pioviggine intensa',
    56: 'Pioggerella gelata',
    57: 'Pioggerella gelata forte',
    61: 'Pioggia debole',
    63: 'Pioggia',
    65: 'Pioggia forte',
    66: 'Pioggia gelata',
    67: 'Pioggia gelata forte',
    71: 'Neve debole',
    73: 'Neve',
    75: 'Neve forte',
    77: 'Neve granulare',
    80: 'Rovesci leggeri',
    81: 'Rovesci',
    82: 'Rovesci forti',
    85: 'Rovesci di neve leggeri',
    86: 'Rovesci di neve',
    95: 'Temporale',
    96: 'Temporale con grandine',
    99: 'Temporale con forte grandine'
  };
  return map[code] ?? `Codice meteo ${code}`;
}

export async function getDailyWeather(lat: number, lon: number, date: Date): Promise<WeatherSummary | null> {
  const d = dateToYMD(date);
  const url =
    `${OM_BASE}?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weathercode` +
    `&timezone=auto&start_date=${d}&end_date=${d}`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const j = await res.json();

  const tmax = getNum(j?.daily?.temperature_2m_max?.[0]);
  const tmin = getNum(j?.daily?.temperature_2m_min?.[0]);
  const pprob = getNum(j?.daily?.precipitation_probability_max?.[0]);
  const psum = getNum(j?.daily?.precipitation_sum?.[0]);
  const code = getNum(j?.daily?.weathercode?.[0]);

  const summary = wmoToText(code ?? undefined);

  return {
    summary,
    tmax: isFiniteNum(tmax) ? tmax : undefined,
    tmin: isFiniteNum(tmin) ? tmin : undefined,
    precipProb: isFiniteNum(pprob) ? pprob : undefined,
    precipSum: isFiniteNum(psum) ? psum : undefined
  };
}

export async function getHourlyWeather(lat: number, lon: number, date: Date): Promise<WeatherHour[]> {
  const d = dateToYMD(date);
  const url =
    `${OM_BASE}?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,precipitation_probability,weathercode,windspeed_10m,relativehumidity_2m` +
    `&timezone=auto&start_date=${d}&end_date=${d}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const j = await res.json();

  const times: string[] = j?.hourly?.time ?? [];
  const temps: number[] = j?.hourly?.temperature_2m ?? [];
  const probs: number[] = j?.hourly?.precipitation_probability ?? [];
  const codes: number[] = j?.hourly?.weathercode ?? [];
  const winds: number[] = j?.hourly?.windspeed_10m ?? [];
  const hums: number[] = j?.hourly?.relativehumidity_2m ?? [];

  const out: WeatherHour[] = times.map((iso: string, idx: number) => {
    const h = new Date(iso).getHours();
    return {
      timeISO: iso,
      hour: h,
      temp: getNum(temps[idx]),
      precipProb: getNum(probs[idx]),
      weathercode: getNum(codes[idx]),
      wind: getNum(winds[idx]),
      humidity: getNum(hums[idx])
    };
  });

  return out;
}

export function summarizeDayparts(hours: WeatherHour[]): DaypartSummary[] {
  // 4 fasce: 0-5 notte, 6-11 mattino, 12-17 pomeriggio, 18-23 sera
  const buckets: Record<DaypartKey, number[]> = {
    night: range(0, 5),
    morning: range(6, 11),
    afternoon: range(12, 17),
    evening: range(18, 23)
  };

  const pick = (list: WeatherHour[]): DaypartSummary => {
    const temps = list.map(x => x.temp).filter(isFiniteNum) as number[];
    const probs = list.map(x => x.precipProb).filter(isFiniteNum) as number[];
    const codes = list.map(x => x.weathercode).filter(isFiniteNum) as number[];
    const tmin = temps.length ? Math.min(...temps) : undefined;
    const tmax = temps.length ? Math.max(...temps) : undefined;
    const precipProb = probs.length ? Math.max(...probs) : undefined;
    const weathercode = dominantCode(codes);
    return { key: 'morning', from: 0, to: 0, tmin, tmax, precipProb, weathercode };
  };

  const result: DaypartSummary[] = [];
  (Object.keys(buckets) as DaypartKey[]).forEach((key) => {
    const hoursSel = hours.filter(h => buckets[key].includes(h.hour));
    const dp = pick(hoursSel);
    dp.key = key;
    dp.from = buckets[key][0];
    dp.to = buckets[key][buckets[key].length - 1];
    result.push(dp);
  });
  return result;
}

// helpers
function dateToYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function getNum(v: any): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function isFiniteNum(n: any): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}
function range(a: number, b: number): number[] {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}
function dominantCode(codes: number[]): number | undefined {
  if (!codes.length) return undefined;
  const cnt: Record<number, number> = {};
  for (const c of codes) cnt[c] = (cnt[c] || 0) + 1;
  let best = codes[0], bestN = 0;
  for (const k of Object.keys(cnt)) {
    const n = cnt[+k];
    if (n > bestN) { bestN = n; best = +k; }
  }
  return best;
}
