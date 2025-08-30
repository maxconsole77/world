import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ScrollView } from 'react-native';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { getDailyWeather, WeatherSummary } from '../lib/weather';
import { POI, POIS, CityKey, CITIES } from '../data/pois';
import i18nInstance from '../lib/i18n';

type Filter = 'all' | 'indoor' | 'outdoor';

function Chip({ label, active, onPress, small = false }: { label: string | undefined; active: boolean; onPress: () => void; small?: boolean; }) {
  return (
    <Pressable onPress={onPress} style={[small ? styles.chipSmall : styles.chip, active && styles.chipActive]}>
      <Text style={[small ? styles.chipTextSmall : styles.chipText, active && styles.chipTextActive]}>
        {label && label.trim() ? label : '—'}
      </Text>
    </Pressable>
  );
}

const LangToLocale: Record<string, string> = { it:'it-IT', en:'en-US', es:'es-ES', de:'de-DE', fr:'fr-FR' };

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

  const curLang = (i18nInstance as any)?.language?.split?.('-')?.[0] || 'en';
  const locale = LangToLocale[curLang] || 'en-US';
  const fmtEUR = (n: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('trip.title', { defaultValue: 'Trip' })}</Text>

      {/* Città */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {(Object.keys(CITIES) as CityKey[]).map(key => (
          <Chip key={key} label={CITIES[key].label} active={city === key} onPress={() => setCity(key)} />
        ))}
      </ScrollView>

      {/* Giorni */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {Array.from({ length: 10 }).map((_, i) => {
          const d = dayjs().add(i, 'day');
          const label = i === 0 ? t('trip.today', { defaultValue: 'Oggi' }) : d.format('DD MMM');
          return <Chip key={i} label={label} active={i === selectedDay} onPress={() => setSelectedDay(i)} />;
        })}
      </ScrollView>

      {/* Filtri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {(['all', 'indoor', 'outdoor'] as const).map(f => (
          <Chip key={f} small label={t(`trip.filter.${f}`, { defaultValue: f === 'all' ? 'Tutti' : f })} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      {/* Suggeriti */}
      <Text style={styles.sectionTitle}>{t('trip.suggested', { defaultValue: 'Itinerario suggerito' })}</Text>
      <FlatList
        data={suggested}
        keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.poiName}>{item.name}</Text>
              <Text style={styles.poiMeta}>
                {item.category} • {item.indoor ? t('trip.indoor', { defaultValue: 'Indoor' }) : t('trip.outdoor', { defaultValue: 'Outdoor' })} • {item.hours ?? t('trip.hoursNA', { defaultValue: 'Sempre aperto' })}
              </Text>
              {!!item.price && <Text style={styles.poiPrice}>{t('trip.priceLabel', { defaultValue: 'Prezzo:' })} {fmtEUR(item.price)}</Text>}
              {!!item.tags?.length && <Text style={styles.poiTags}>{item.tags.map(tg => `#${tg}`).join(' ')}</Text>}
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      {/* Tutti i POI */}
      <Text style={styles.sectionTitle}>{t('trip.allPOI', { defaultValue: 'Tutti i POI' })}</Text>
      <FlatList
        data={filtered}
        keyExtractor={p => 'all-' + p.id}
        renderItem={({ item }) => (
          <View style={styles.cardSm}>
            <Text style={styles.poiNameSm}>{item.name}</Text>
            <Text style={styles.poiMetaSm}>
              {item.category} • {item.indoor ? t('trip.indoor', { defaultValue: 'Indoor' }) : t('trip.outdoor', { defaultValue: 'Outdoor' })} • {item.hours ?? t('trip.hoursNA', { defaultValue: 'Sempre aperto' })}
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

  sectionTitle: { marginTop: 8, marginBottom: 6, fontSize: 16, fontWeight: '700', color: '#111' },

  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee', flexDirection: 'row' },
  poiName: { fontWeight: '800', color: '#111', fontSize: 16 },
  poiMeta: { color: '#333', opacity: 0.9, marginTop: 2 },
  poiPrice: { color: '#111', marginTop: 2, fontWeight: '700' },
  poiTags: { color: '#555', marginTop: 4, fontStyle: 'italic' },

  cardSm: { backgroundColor: 'white', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
  poiNameSm: { fontWeight: '700', color: '#111' },
  poiMetaSm: { color: '#333', opacity: 0.9, marginTop: 2 }
});
