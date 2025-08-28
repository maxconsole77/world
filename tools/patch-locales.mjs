// tools/patch-locales.mjs
import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.join(process.cwd(), 'src', 'locales');

// Chiavi da applicare/mergiare per OGNI lingua
const COMMON_PATCH = {
  tabs: {
    trip: 'Trip',
    weather: 'Weather',
    phrases: 'Phrases',
    profile: 'Profile',
    diagnostics: 'Diagnostics'
  },
  trip: {
    title: 'Trip',
    today: 'Today',
    filter: { all: 'All', indoor: 'Indoor', outdoor: 'Outdoor' },
    indoor: 'Indoor',
    outdoor: 'Outdoor',
    hoursNA: 'Always open',
    suggested: 'Suggested itinerary',
    allPOI: 'All POIs',
    priceLabel: 'Price:',
    tempMinMax: 'min {{min}} / max {{max}}',
    rainProb: 'Rain {{p}}%',
    weatherNA: 'Weather data not available',
    badWeatherHint: 'Bad weather: prefer indoor activities'
  },
  weather: {
    title: 'Weather',
    detailsFor: 'Weather details for {{city}} on {{date}}',
    map: 'Weather map',
    humidity: 'Humidity: {{v}}%',
    wind: 'Wind: {{v}} km/h',
    precip: 'Precipitation: {{v}} mm',
    pressure: 'Pressure: {{v}} hPa',
    uv: 'UV: {{v}}',
    visibility: 'Visibility: {{v}} m'
  }
};

// Traduzioni per lingua (sovrascrivono i default EN sopra)
const PER_LANG = {
  it: {
    tabs: { trip: 'Trip', weather: 'Meteo', phrases: 'Frasi Utili', profile: 'Profilo', diagnostics: 'Diagnostica' },
    trip: {
      title: 'Trip',
      today: 'Oggi',
      filter: { all: 'Tutti', indoor: 'Indoor', outdoor: 'Outdoor' },
      indoor: 'Indoor',
      outdoor: 'Outdoor',
      hoursNA: 'Sempre aperto',
      suggested: 'Itinerario suggerito',
      allPOI: 'Tutti i POI',
      priceLabel: 'Prezzo:',
      tempMinMax: 'min {{min}} / max {{max}}',
      rainProb: 'Pioggia {{p}}%',
      weatherNA: 'Dati meteo non disponibili',
      badWeatherHint: 'Meteo sfavorevole: preferisci attività indoor'
    },
    weather: {
      title: 'Meteo',
      detailsFor: 'Dettagli meteo per {{city}} il {{date}}',
      map: 'Mappa meteo',
      humidity: 'Umidità: {{v}}%',
      wind: 'Vento: {{v}} km/h',
      precip: 'Precipitazioni: {{v}} mm',
      pressure: 'Pressione: {{v}} hPa',
      uv: 'UV: {{v}}',
      visibility: 'Visibilità: {{v}} m'
    }
  },
  es: {
    tabs: { trip: 'Ruta', weather: 'Tiempo', phrases: 'Frases', profile: 'Perfil', diagnostics: 'Diagnóstico' },
    trip: {
      title: 'Ruta',
      today: 'Hoy',
      filter: { all: 'Todos', indoor: 'Interior', outdoor: 'Exterior' },
      indoor: 'Interior',
      outdoor: 'Exterior',
      hoursNA: 'Siempre abierto',
      suggested: 'Itinerario sugerido',
      allPOI: 'Todos los POI',
      priceLabel: 'Precio:',
      tempMinMax: 'mín {{min}} / máx {{max}}',
      rainProb: 'Lluvia {{p}}%',
      weatherNA: 'Datos del tiempo no disponibles',
      badWeatherHint: 'Mal tiempo: mejor actividades de interior'
    },
    weather: {
      title: 'Tiempo',
      detailsFor: 'Detalles del tiempo para {{city}} el {{date}}',
      map: 'Mapa del tiempo',
      humidity: 'Humedad: {{v}}%',
      wind: 'Viento: {{v}} km/h',
      precip: 'Precipitación: {{v}} mm',
      pressure: 'Presión: {{v}} hPa',
      uv: 'UV: {{v}}',
      visibility: 'Visibilidad: {{v}} m'
    }
  },
  de: {
    tabs: { trip: 'Tour', weather: 'Wetter', phrases: 'Sätze', profile: 'Profil', diagnostics: 'Diagnose' },
    trip: {
      title: 'Tour',
      today: 'Heute',
      filter: { all: 'Alle', indoor: 'Innen', outdoor: 'Außen' },
      indoor: 'Innen',
      outdoor: 'Außen',
      hoursNA: 'Immer geöffnet',
      suggested: 'Vorgeschlagene Route',
      allPOI: 'Alle POIs',
      priceLabel: 'Preis:',
      tempMinMax: 'min {{min}} / max {{max}}',
      rainProb: 'Regen {{p}}%',
      weatherNA: 'Keine Wetterdaten verfügbar',
      badWeatherHint: 'Schlechtes Wetter: besser Indoor-Aktivitäten'
    },
    weather: {
      title: 'Wetter',
      detailsFor: 'Wetterdetails für {{city}} am {{date}}',
      map: 'Wetterkarte',
      humidity: 'Luftfeuchtigkeit: {{v}}%',
      wind: 'Wind: {{v}} km/h',
      precip: 'Niederschlag: {{v}} mm',
      pressure: 'Luftdruck: {{v}} hPa',
      uv: 'UV: {{v}}',
      visibility: 'Sichtweite: {{v}} m'
    }
  },
  fr: {
    tabs: { trip: 'Parcours', weather: 'Météo', phrases: 'Phrases', profile: 'Profil', diagnostics: 'Diagnostic' },
    trip: {
      title: 'Parcours',
      today: 'Aujourd’hui',
      filter: { all: 'Tous', indoor: 'Intérieur', outdoor: 'Extérieur' },
      indoor: 'Intérieur',
      outdoor: 'Extérieur',
      hoursNA: 'Toujours ouvert',
      suggested: 'Itinéraire suggéré',
      allPOI: 'Tous les POI',
      priceLabel: 'Prix :',
      tempMinMax: 'min {{min}} / max {{max}}',
      rainProb: 'Pluie {{p}}%',
      weatherNA: 'Données météo indisponibles',
      badWeatherHint: 'Mauvais temps : privilégiez l’intérieur'
    },
    weather: {
      title: 'Météo',
      detailsFor: 'Détails météo pour {{city}} le {{date}}',
      map: 'Carte météo',
      humidity: 'Humidité : {{v}}%',
      wind: 'Vent : {{v}} km/h',
      precip: 'Précipitations : {{v}} mm',
      pressure: 'Pression : {{v}} hPa',
      uv: 'UV : {{v}}',
      visibility: 'Visibilité : {{v}} m'
    }
  }
};

function deepMerge(target, patch) {
  if (typeof target !== 'object' || target === null) return patch;
  const out = Array.isArray(target) ? [...target] : { ...target };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMerge(out[k] ?? {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function stripBOM(s) {
  return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;
}

function loadJSON(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(stripBOM(raw));
}

function saveJSON(p, obj) {
  const text = JSON.stringify(obj, null, 2);
  fs.writeFileSync(p, text, { encoding: 'utf8' }); // UTF-8 no BOM
}

for (const file of fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'))) {
  const full = path.join(LOCALES_DIR, file);
  let lang = path.basename(file, '.json').toLowerCase();
  if (!['it','en','es','de','fr'].includes(lang)) continue;

  try {
    const cur = loadJSON(full);
    // merge: common EN defaults -> then localized overrides for the language
    let merged = deepMerge(cur, COMMON_PATCH);
    if (PER_LANG[lang]) merged = deepMerge(merged, PER_LANG[lang]);
    saveJSON(full, merged);
    console.log(`✅ Patched ${file}`);
  } catch (e) {
    console.error(`❌ Errore su ${file}:`, e.message);
    process.exitCode = 1;
  }
}

console.log('Done.');
