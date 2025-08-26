import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Alert,
  Share,
} from "react-native";
import Screen from "../components/Screen";
import { Ionicons } from "@expo/vector-icons";
import * as RNLinking from "react-native/Libraries/Linking/Linking";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

type Params = {
  id?: string;
  title?: string;
  image?: string;
  city?: string;
  category?: string;
  description?: string;
  address?: string;
  lat?: number;
  lng?: number;
};

export default function AttractionDetailsScreen({ route }: { route: { params?: Params } }) {
  const p = route?.params ?? {};
  const nav = useNavigation<any>();
  const { user } = useAuth();

  const title = p.title ?? "Attrazione";
  const city = p.city ?? "";
  const category = p.category ?? "";
  const address = p.address ?? "";
  const lat = typeof p.lat === "number" ? p.lat : undefined;
  const lng = typeof p.lng === "number" ? p.lng : undefined;

  const openInMaps = async () => {
    try {
      let url = "";
      if (lat != null && lng != null) url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      else if (address) url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      else url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(title + " " + city)}`;

      const supported = await RNLinking.canOpenURL(url);
      if (supported) await RNLinking.openURL(url);
      else Alert.alert("Impossibile aprire le mappe");
    } catch (e: any) {
      Alert.alert("Errore", e?.message ?? "Impossibile aprire le mappe");
    }
  };

  const shareAttraction = async () => {
    try {
      const msg = `${title}${city ? " · " + city : ""}\n${address ? address + "\n" : ""}${
        lat != null && lng != null ? `https://www.google.com/maps?q=${lat},${lng}` : ""
      }`;
      await Share.share({ message: msg.trim() });
    } catch {}
  };

  const addToFavorites = async () => {
    try {
      if (!user) {
        Alert.alert("Login richiesto", "Accedi per salvare tra i preferiti.", [
          { text: "Annulla", style: "cancel" },
          { text: "Vai al Login", onPress: () => nav.navigate("Login") },
        ]);
        return;
      }
      const { error } = await supabase.from("favorites").upsert({
        user_id: user.id,
        poi_id: p.id ?? `${title}-${city}`.toLowerCase().replace(/\s+/g, "-"),
        title,
        city,
        category,
        address,
        lat,
        lng,
        created_at: new Date().toISOString(),
      }, { onConflict: "user_id,poi_id" });
      if (error) throw error;
      Alert.alert("Salvato", "Aggiunto ai preferiti ✅");
    } catch (e: any) {
      Alert.alert("Errore", e?.message ?? "Non è stato possibile salvare");
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        {p.image ? (
          <Image
            source={{ uri: p.image }}
            style={{ width: "100%", height: 220, borderRadius: 14, marginBottom: 14 }}
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 180,
              borderRadius: 14,
              backgroundColor: "#E5E7EB",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Ionicons name="image-outline" size={42} color="#9CA3AF" />
          </View>
        )}

        <Text style={{ fontSize: 24, fontWeight: "800" }}>{title}</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          {city ? (
            <View style={{ backgroundColor: "#EEF2FF", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 }}>
              <Text style={{ color: "#3730A3", fontWeight: "600" }}>{city}</Text>
            </View>
          ) : null}
          {category ? (
            <View style={{ backgroundColor: "#ECFDF5", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 }}>
              <Text style={{ color: "#065F46", fontWeight: "600" }}>{category}</Text>
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <Pressable
            onPress={openInMaps}
            style={{ flex: 1, backgroundColor: "#007AFF", padding: 12, borderRadius: 12, alignItems: "center" }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>
              <Ionicons name="map-outline" size={16} color="white" />  Apri in Mappe
            </Text>
          </Pressable>
          <Pressable
            onPress={addToFavorites}
            style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#CBD5E1", alignItems: "center", minWidth: 48 }}
          >
            <Ionicons name="heart-outline" size={20} color="#111827" />
          </Pressable>
          <Pressable
            onPress={shareAttraction}
            style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#CBD5E1", alignItems: "center", minWidth: 48 }}
          >
            <Ionicons name="share-social-outline" size={20} color="#111827" />
          </Pressable>
        </View>

        {address ? (
          <View style={{ marginTop: 14, backgroundColor: "white", padding: 12, borderRadius: 12, elevation: 2 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>Indirizzo</Text>
            <Text style={{ color: "#374151" }}>{address}</Text>
          </View>
        ) : null}

        {p.description ? (
          <View style={{ marginTop: 14, backgroundColor: "white", padding: 12, borderRadius: 12, elevation: 2 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>Descrizione</Text>
            <Text style={{ color: "#374151", lineHeight: 22 }}>{p.description}</Text>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
