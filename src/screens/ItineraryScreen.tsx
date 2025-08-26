import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import Screen from "../components/Screen";
import type { Poi } from "../navigation/types";
import { useRoute } from "@react-navigation/native";

type Params = { city: "Roma" | "Parigi" | "Londra"; pois: Poi[]; startLat?: number; startLng?: number };

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function orderByNearest(startLat: number, startLng: number, pois: Poi[]) {
  const remaining = [...pois];
  const ordered: Poi[] = [];
  let curLat = startLat;
  let curLng = startLng;

  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((p, i) => {
      const d = haversine(curLat, curLng, p.lat, p.lng);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    const chosen = remaining.splice(bestIdx, 1)[0];
    ordered.push(chosen);
    curLat = chosen.lat;
    curLng = chosen.lng;
  }
  return ordered;
}

type Weather = { temp: number | null; wind: number | null; code: number | null; description: string };
const WMAP: Record<number, string> = {
  0: "Sereno",
  1: "Prevalentemente sereno",
  2: "Parzialmente nuvoloso",
  3: "Coperto",
  45: "Nebbia",
  48: "Nebbia ghiacciata",
  51: "Pioviggine leggera",
  53: "Pioviggine",
  55: "Pioviggine intensa",
  61: "Pioggia leggera",
  63: "Pioggia",
  65: "Pioggia intensa",
  71: "Neve leggera",
  73: "Neve",
  75: "Neve intensa",
  95: "Temporali",
  96: "Temporale con grandine",
  99: "Temporale forte con grandine",
};

export default function ItineraryScreen() {
  const route = useRoute();
  const { city, pois, startLat, startLng } = (route.params as Params) ?? {};

  const cityCenter: Record<Params["city"], { lat: number; lng: number }> = {
    Roma: { lat: 41.9028, lng: 12.4964 },
    Parigi: { lat: 48.8566, lng: 2.3522 },
    Londra: { lat: 51.5074, lng: -0.1278 },
  };

  const sLat = startLat ?? cityCenter[city].lat;
  const sLng = startLng ?? cityCenter[city].lng;

  const ordered = useMemo(() => orderByNearest(sLat, sLng, pois), [sLat, sLng, pois]);

  const [weather, setWeather] = useState<Weather>({ temp: null, wind: null, code: null, description: "—" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${sLat}&longitude=${sLng}&current_weather=true&timezone=auto`;
        const res = await fetch(url);
        const js = await res.json();
        const cw = js?.current_weather;
        const code = cw?.weathercode ?? null;
        setWeather({
          temp: cw?.temperature ?? null,
          wind: cw?.windspeed ?? null,
          code,
          description: code != null ? (WMAP[code] || "Meteo") : "Meteo",
        });
      } catch {
        setWeather({ temp: null, wind: null, code: null, description: "Meteo non disponibile" });
      } finally {
        setLoading(false);
      }
    })();
  }, [sLat, sLng]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 12 }}>
        <View style={{ backgroundColor: "white", borderRadius: 12, padding: 12, elevation: 2 }}>
          <Text style={{ fontWeight: "800", marginBottom: 6 }}>Meteo · {city}</Text>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ color: "#374151" }}>
              {weather.description}
              {weather.temp != null ? ` · ${weather.temp}°C` : ""}{" "}
              {weather.wind != null ? `· vento ${weather.wind} km/h` : ""}
            </Text>
          )}
        </View>

        <View style={{ backgroundColor: "white", borderRadius: 12, padding: 12, elevation: 2 }}>
          <Text style={{ fontWeight: "800", marginBottom: 8 }}>
            Itinerario consigliato ({ordered.length} tappe)
          </Text>
          {ordered.map((p, i) => {
            const prev = i === 0 ? { lat: sLat, lng: sLng } : ordered[i - 1];
            const dist = haversine(prev.lat, prev.lng, p.lat, p.lng);
            return (
              <View key={p.id} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: "#F3F4F6" }}>
                <Text style={{ fontWeight: "700" }}>{i + 1}. {p.title}</Text>
                <Text style={{ color: "#6B7280" }}>{p.category}{p.address ? ` · ${p.address}` : ""}</Text>
                <Text style={{ color: "#9CA3AF" }}>Distanza dalla tappa precedente: ~{dist.toFixed(2)} km</Text>
              </View>
            );
          })}
        </View>

        <Text style={{ color: "#6B7280", fontStyle: "italic" }}>
          Suggerimento: attiva il GPS e imposta la posizione di partenza per un percorso ancora più efficiente.
        </Text>
      </ScrollView>
    </Screen>
  );
}
