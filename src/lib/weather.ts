export type WeatherSummary = {
  tmin?: number;
  tmax?: number;
  precipProb?: number;
  precipSum?: number;
  summary: string;
  code?: number;
};

const WMAP: Record<number, string> = {
  0:'Sereno', 1:'Perlopiù sereno', 2:'Variabile', 3:'Nuvoloso',
  45:'Nebbia', 48:'Nebbia ghiacciata',
  51:'Pioviggine lieve', 53:'Pioviggine', 55:'Pioviggine intensa',
  61:'Pioggia lieve', 63:'Pioggia', 65:'Pioggia intensa',
  71:'Neve lieve', 73:'Neve', 75:'Neve intensa',
  80:'Rovesci leggeri', 81:'Rovesci', 82:'Rovesci forti',
  95:'Temporali', 96:'Tempesta con grandine', 99:'Tempesta forte con grandine'
};

export async function getDailyWeather(lat: number, lon: number, date: Date): Promise<WeatherSummary> {
  // Open-Meteo: no key, daily forecast
  const start = date.toISOString().slice(0,10);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_mean,weathercode&timezone=auto&start_date=${start}&end_date=${start}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  const d = data?.daily;
  const tmax = d?.temperature_2m_max?.[0];
  const tmin = d?.temperature_2m_min?.[0];
  const pprob = d?.precipitation_probability_mean?.[0];
  const psum = d?.precipitation_sum?.[0];
  const code = d?.weathercode?.[0];
  return {
    tmin, tmax,
    precipProb: pprob,
    precipSum: psum,
    code,
    summary: WMAP[code ?? 0] ?? '—'
  };
}
