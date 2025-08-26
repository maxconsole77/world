import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import Screen from "../components/Screen";
import { POI } from "../data/poi";
import AttractionsPicker from "./AttractionsPicker";
import { useNavigation } from "@react-navigation/native";
import type { Poi } from "../navigation/types";

const CITIES = ["Roma", "Parigi", "Londra"] as const;
type City = typeof CITIES[number];

export default function ToursScreen() {
  const [city, setCity] = useState<City>("Roma");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<Poi[]>([]);
  const navigation = useNavigation<any>();

  const cityData = useMemo(() => POI[city], [city]);

  const onSaveSelection = (sel: Poi[]) => {
    setSelected(sel);
    setPickerOpen(false);
  };

  const goItinerary = () => {
    if (!selected.length) {
      Alert.alert("Seleziona attrazioni", "Scegli almeno 2 attrazioni per creare un itinerario.");
      return;
    }
    navigation.navigate("Itinerary", { city, pois: selected });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {CITIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCity(c)}
              style={{
                backgroundColor: c === city ? "#007AFF" : "#E5E7EB",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: c === city ? "white" : "#111827", fontWeight: "700" }}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={{ flex: 1, backgroundColor: "#111827", padding: 12, borderRadius: 12 }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
              Scegli attrazioni
            </Text>
          </Pressable>
          <Pressable
            onPress={goItinerary}
            style={{ flex: 1, backgroundColor: "#007AFF", padding: 12, borderRadius: 12 }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
              Genera itinerario
            </Text>
          </Pressable>
        </View>

        {selected.length > 0 && (
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 12 }}>
            <Text style={{ fontWeight: "800", marginBottom: 8 }}>Selezionati ({selected.length})</Text>
            {selected.map((p) => (
              <Text key={p.id} style={{ color: "#374151" }}>• {p.title} ({p.category})</Text>
            ))}
          </View>
        )}

        {Object.entries(cityData).map(([family, list]) => (
          <View key={family} style={{ backgroundColor: "white", borderRadius: 12, padding: 12 }}>
            <Text style={{ fontWeight: "800", marginBottom: 6 }}>{family}</Text>
            {list.slice(0, 3).map((p) => (
              <Text key={p.id} style={{ color: "#4B5563" }}>• {p.title}</Text>
            ))}
            <Text style={{ marginTop: 6, color: "#6B7280", fontStyle: "italic" }}>
              Usa “Scegli attrazioni” per la lista completa.
            </Text>
          </View>
        ))}
      </ScrollView>

      <AttractionsPicker
        visible={pickerOpen}
        city={city}
        data={cityData}
        initialSelectedIds={selected.map((s) => s.id)}
        onClose={() => setPickerOpen(false)}
        onSave={onSaveSelection}
      />
    </Screen>
  );
}
