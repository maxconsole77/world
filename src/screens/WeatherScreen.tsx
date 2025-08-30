import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import dayjs from 'dayjs';
import { useTranslation, TFunction } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { CITIES, CityKey } from '../data/pois';
import {
  getDailyWeather,
  getHourlyWeather,
  summarizeDayparts,
  WeatherSummary,
  DaypartSummary
} from '../lib/weather';
import WeatherMap, { WeatherMapMode } from '../components/WeatherMap';

// ora centrale per ogni fascia (locale)
const PART_ANCHOR: Record<'night'|'morning'|'afternoon'|'evening', number> = {
  night: 2,       // 02:00
  morning: 9,     // 09:00
  afternoon: 15,  // 15:00
  evening: 20     // 20:00
};

export default function WeatherScreen() {
  const { t } = useTranslation();

  const [city, setCity] = useState<CityKey>('rome');
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedPart, setSelectedPart] = useState<'night'|'morning'|'afternoon'|'evening' | null>(null);
  const [mapMode, setMapMode] = useState<WeatherMapMode>('forecast'); // 'forecast' | 'radar'
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [parts, setParts] = useState<DaypartSummary[]>([]);

  const date = useMemo(() => dayjs().add(selectedDay, 'day'), [selectedDay]);

  useEffect(() => {
    (async () => {
      try {
        const c = CITIES[city];
        const [wDaily, h] = await Promise.all([
          getDailyWeather(c.lat, c.lon, date.toDate()),
          getHourlyWeather(c.lat, c.lon, date.toDate())
        ]);
        setWeather(wDaily);
        setParts(summarizeDayparts(h));
      } catch {
        setWeather(null);
        setParts([]);
      }
    })();
  }, [city, selectedDay, date]);

  // ISO locale per Windy: centro della fascia selezionata (o 12:00 se nulla)
  const forecastTimeISO = useMemo(() => {
    const d = date.toDate();
    const hour = selectedPart ? PART_ANCHOR[selectedPart] : 12;
    const local = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, 0, 0);
    return local.toISOString(); // in WeatherMap estraggo i campi locali
  }, [date, selectedPart]);

  const minDeg = weather ? `${Math.round(weather.tmin ?? 0)}\u00B0` : '';
  const maxDeg = weather ? `${Math.round(weather.tmax ?? 0)}\u00B0` : '';

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={s.title}>{t('weather.title', { defaultValue: 'Meteo' })}</Text>

      {/* Città */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {(Object.keys(CITIES) as CityKey[]).map(key => (
          <Pressable key={key} onPress={() => { setCity(key); }} style={[s.chip, city === key && s.chipActive]}>
            <Text style={[s.chipText, city === key && s.chipTextActive]}>
              {CITIES[key].label || '—'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Giorni */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {Array.from({ length: 10 }).map((_, i) => {
          const d = dayjs().add(i, 'day');
          const label = i === 0 ? t('trip.today', { defaultValue: 'Oggi' }) : d.format('DD MMM');
          const active = i === selectedDay;
          return (
            <Pressable key={i} onPress={() => { setSelectedDay(i); setSelectedPart(null); }} style={[s.chip, active && s.chipActive]}>
              <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Dettagli giornalieri */}
      <View style={s.box}>
        <Text style={s.boxTitle}>
          {t('weather.detailsFor', {
            city: CITIES[city].label,
            date: date.format('DD MMM'),
            defaultValue: `Dettagli meteo per ${CITIES[city].label} il ${date.format('DD MMM')}`
          })}
        </Text>

        {weather ? (
          <View>
            <Text style={s.line}>
              {t('trip.tempMinMax', { min: minDeg, max: maxDeg, defaultValue: `min ${minDeg} / max ${maxDeg}` })}
            </Text>
            {typeof weather.precipProb === 'number' && (
              <Text style={s.line}>
                {t('trip.rainProb', { p: Math.round(weather.precipProb), defaultValue: `Pioggia ${Math.round(weather.precipProb)}%` })}
              </Text>
            )}
          </View>
        ) : (
          <Text style={s.muted}>{t('trip.weatherNA', { defaultValue: 'Dati meteo non disponibili' })}</Text>
        )}
      </View>

      {/* Dayparts - tap per ancorare la mappa */}
      <Text style={s.section}>{t('weather.dayparts', { defaultValue: 'Fasce orarie' })}</Text>
      <View style={s.grid}>
        {parts.map((p) => {
          const icon = iconForWMO(p.weathercode);
          const active = selectedPart === p.key;
          return (
            <Pressable key={p.key} onPress={() => { setSelectedPart(p.key); setMapMode('forecast'); }} style={[s.card, active && s.cardActive]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name={icon.name as any} size={20} color={icon.color} />
                <Text style={[s.cardTitle, { marginLeft: 6 }]}>{labelForPart(t, p.key)}</Text>
              </View>
              <Text style={s.cardLine}>{`${fmtDeg(p.tmin)} / ${fmtDeg(p.tmax)}`}</Text>
              {typeof p.precipProb === 'number' && (
                <Text style={s.cardMuted}>{t('trip.rainProb', { p: Math.round(p.precipProb), defaultValue: `Pioggia ${Math.round(p.precipProb)}%` })}</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Selettore mappa */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.row, {marginTop: 4}]}>
        {(['forecast','radar'] as WeatherMapMode[]).map(m => (
          <Pressable key={m} onPress={() => setMapMode(m)} style={[s.chipSmall, mapMode === m && s.chipActive]}>
            <Text style={[s.chipTextSmall, mapMode === m && s.chipTextActive]}>
              {m === 'forecast'
                ? t('weather.mapForecast', { defaultValue: 'Previsioni' })
                : t('weather.mapRadar', { defaultValue: 'Radar' })
              }
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Mappa meteo: più alta + binding dell'ora */}
      <Text style={s.section}>{t('weather.map', { defaultValue: 'Mappa meteo' })}</Text>
      <WeatherMap
        lat={CITIES[city].lat}
        lon={CITIES[city].lon}
        mode={mapMode}
        timeISO={mapMode === 'forecast' ? forecastTimeISO : null}
      />
    </ScrollView>
  );
}

function labelForPart(t: TFunction, k: 'night' | 'morning' | 'afternoon' | 'evening'): string {
  switch (k) {
    case 'morning':   return t('weather.parts.morning', { defaultValue: 'Mattino' });
    case 'afternoon': return t('weather.parts.afternoon', { defaultValue: 'Pomeriggio' });
    case 'evening':   return t('weather.parts.evening', { defaultValue: 'Sera' });
    case 'night':     return t('weather.parts.night', { defaultValue: 'Notte' });
  }
}

function fmtDeg(n?: number) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  return `${Math.round(n)}\u00B0`;
}

/** WMO -> Ionicons */
function iconForWMO(code?: number): { name: string; color: string } {
  const c = code ?? 0;
  if (c === 0) return { name: 'sunny-outline', color: '#F59E0B' };
  if (c === 1 || c === 2) return { name: 'partly-sunny-outline', color: '#F59E0B' };
  if (c === 3 || c === 45 || c === 48) return { name: 'cloudy-outline', color: '#64748B' };
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(c)) return { name: 'rainy-outline', color: '#0EA5E9' };
  if ([71,73,75,77,85,86].includes(c)) return { name: 'snow-outline', color: '#60A5FA' };
  if ([95,96,99].includes(c)) return { name: 'thunderstorm-outline', color: '#8B5CF6' };
  return { name: 'cloudy-outline', color: '#64748B' };
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 8 },
  row: { paddingVertical: 8, paddingRight: 8 },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: '#0A84FF',
    borderWidth: 1,
    backgroundColor: 'white',
    marginRight: 8,
    minWidth: 64,
    alignItems: 'center'
  },
  chipSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderColor: '#0A84FF',
    borderWidth: 1,
    backgroundColor: 'white',
    marginRight: 8,
    minWidth: 56,
    alignItems: 'center'
  },
  chipActive: { backgroundColor: '#0A84FF' },
  chipText: { color: '#0A84FF', fontWeight: '700' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  chipTextSmall: { color: '#0A84FF' },

  box: { backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
  boxTitle: { fontWeight: '700', marginBottom: 6, color: '#111' },
  line: { color: '#111', marginTop: 2 },
  muted: { color: '#666', fontStyle: 'italic' },

  section: { marginTop: 10, marginBottom: 6, fontWeight: '700', color: '#111' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  card: { width: '48%', backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 12 },
  cardActive: { borderColor: '#0A84FF', borderWidth: 2 },
  cardTitle: { fontWeight: '700', color: '#111' },
  cardLine: { color: '#111', marginTop: 2 },
  cardMuted: { color: '#666', marginTop: 2 }
});

