import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ScrollView } from 'react-native';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { getDailyWeather, WeatherSummary } from '../lib/weather';
import { POI, POIS, CityKey, CITIES } from '../data/pois';

type Filter = 'all' | 'indoor' | 'outdoor';

export default function TripScreen() {
  const { t } = useTranslation();
  const [city, setCity] = useState<CityKey>('rome');
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [filter, setFilter] = useState<Filter>('all');
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const date = useMemo(() => dayjs().add(selectedDay, 'day'), [selectedDay]);

  useEffect(() => {
    (async () => {
      try {
        const isExpoGo =
          (Constants as any)?.appOwnership === 'expo' ||
          (Constants as any)?.executionEnvironment === 'storeClient';

        if (isExpoGo) {
          // Evita chiamate/metodi che possono causare crash in Expo Go
          setWeather(null);
          return;
        }

        const c = CITIES[city];
        const w = await getDailyWeather(c.lat, c.lon, date.toDate());
        setWeather(w);
      } catch {
        setWeather(null);
      }
    })();
  }, [city, selectedDay, date]);

  const isBadWeather = useMemo(() => {
    if (!weather) return false;
    return (weather.precipProb ?? 0) >= 40 || (weather.precipSum ?? 0) >= 2;
  }, [weather]);

  const filtered = useMemo(() => {
    let list = POIS.filter(p => p.city === city);
    if (filter === 'indoor') list = list.filter(p => p.indoor === true);
    if (filter === 'outdoor') list = list.filter(p => p.indoor === false);
    return list;
  }, [city, filter]);

  const suggested = useMemo(() => {
    const base = filtered.slice();
    const preferIndoor = isBadWeather;
    base.sort((a, b) => {
      const ai = preferIndoor ? (a.indoor ? 0 : 1) : (a.indoor ? 1 : 0);
      const bi = preferIndoor ? (b.indoor ? 0 : 1) : (b.indoor ? 1 : 0);
      if (ai !== bi) return ai - bi;
      const mid = (v: number) => Math.abs(v - 15);
      return mid(a.price ?? 15) - mid(b.price ?? 15);
    });
    const picked: POI[] = [];
    const seenCat = new Set<string>();
    for (const p of base) {
      if (picked.length >= 6) break;
      if (!seenCat.has(p.category) || picked.length < 3) {
        picked.push(p);
        seenCat.add(p.category);
      }
    }
    return picked;
  }, [filtered, isBadWeather]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('trip.title')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {(Object.keys(CITIES) as CityKey[]).map(key => (
          <Pressable key={key} onPress={() => setCity(key)} style={[styles.chip, city === key && styles.chipActive]}>
            <Text style={[styles.chipText, city === key && styles.chipTextActive]}>{CITIES[key].label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {Array.from({ length: 10 }).map((_, i) => {
          const d = dayjs().add(i, 'day');
          const label = i === 0 ? t('trip.today') : d.format('DD MMM');
          const active = i === selectedDay;
          return (
            <Pressable key={i} onPress={() => setSelectedDay(i)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.weatherBox}>
        <Text style={styles.weatherTitle}>
          {t('trip.weatherFor', { city: CITIES[city].label, date: date.format('DD MMM') })}
        </Text>
        {weather ? (
          <Text style={styles.weatherLine}>
            {weather.summary} —{' '}
            {t('trip.tempMinMax', {
              min: Math.round(weather.tmin ?? 0),
              max: Math.round(weather.tmax ?? 0),
            })}
            {!!weather.precipProb && ` — ${t('trip.rainProb', { p: Math.round(weather.precipProb) })}`}
          </Text>
        ) : (
          <Text style={styles.weatherLineMuted}>{t('trip.weatherNA')}</Text>
        )}
        {isBadWeather && <Text style={styles.badWeather}>{t('trip.badWeatherHint')}</Text>}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {(['all', 'indoor', 'outdoor'] as Filter[]).map(f => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chipSmall, filter === f && styles.chipActive]}>
            <Text style={[styles.chipTextSmall, filter === f && styles.chipTextActive]}>{t(`trip.filter.${f}`)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>{t('trip.suggested')}</Text>
      <FlatList
        data={suggested}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.poiName}>{item.name}</Text>
              <Text style={styles.poiMeta}>
                {item.category} • {item.indoor ? t('trip.indoor') : t('trip.outdoor')} • {item.hours ?? t('trip.hoursNA')}
              </Text>
              {!!item.price && <Text style={styles.poiPrice}>{t('trip.price', { v: item.price })}</Text>}
              {!!item.tags?.length && <Text style={styles.poiTags}>{item.tags.map(tg => `#${tg}`).join(' ')}</Text>}
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <Text style={styles.sectionTitle}>{t('trip.allPOI')}</Text>
      <FlatList
        data={filtered}
        keyExtractor={p => 'all-' + p.id}
        renderItem={({ item }) => (
          <View style={styles.cardSm}>
            <Text style={styles.poiNameSm}>{item.name}</Text>
            <Text style={styles.poiMetaSm}>
              {item.category} • {item.indoor ? t('trip.indoor') : t('trip.outdoor')} • {item.hours ?? t('trip.hoursNA')}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 8 },
  rowScroll: { paddingVertical: 8, paddingRight: 8 },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderColor: '#0A84FF',
    borderWidth: 1,
    backgroundColor: 'white',
    marginRight: 8,
  },
  chipSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderColor: '#0A84FF',
    borderWidth: 1,
    backgroundColor: 'white',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#0A84FF' },
  chipText: { color: '#0A84FF', fontWeight: '700' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  chipTextSmall: { color: '#0A84FF' },

  weatherBox: { backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
  weatherTitle: { fontWeight: '700', marginBottom: 4, color: '#111' },
  weatherLine: { color: '#111' },
  weatherLineMuted: { color: '#666', fontStyle: 'italic' },
  badWeather: { marginTop: 4, color: '#D9480F', fontWeight: '700' },

  sectionTitle: { marginTop: 8, marginBottom: 6, fontSize: 16, fontWeight: '700', color: '#111' },

  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee', flexDirection: 'row' },
  poiName: { fontWeight: '800', color: '#111', fontSize: 16 },
  poiMeta: { color: '#333', opacity: 0.9, marginTop: 2 },
  poiPrice: { color: '#111', marginTop: 2, fontWeight: '700' },
  poiTags: { color: '#555', marginTop: 4, fontStyle: 'italic' },

  cardSm: { backgroundColor: 'white', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
  poiNameSm: { fontWeight: '700', color: '#111' },
  poiMetaSm: { color: '#333', opacity: 0.9, marginTop: 2 },
});
