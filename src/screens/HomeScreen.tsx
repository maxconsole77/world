import React from "react";
import { View, Text, Pressable } from "react-native";
import Screen from "../components/Screen";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: "800" }}>Benvenuto 👋</Text>
      <View style={{ gap: 10 }}>
        <Pressable
          onPress={() => navigation.navigate("Tours")}
          style={{ backgroundColor: "#007AFF", padding: 12, borderRadius: 10 }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Crea itinerario</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Phrases")}
          style={{ backgroundColor: "white", padding: 12, borderRadius: 10 }}
        >
          <Text style={{ textAlign: "center", fontWeight: "700" }}>Frasi utili</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
