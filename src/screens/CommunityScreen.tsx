import React from "react";
import { View, Text } from "react-native";
import Screen from "../components/Screen";

export default function CommunityScreen() {
  return (
    <Screen>
      <View style={{ backgroundColor: "white", borderRadius: 12, padding: 12 }}>
        <Text style={{ fontWeight: "800", marginBottom: 6 }}>Community</Text>
        <Text style={{ color: "#6B7280" }}>
          Area community in arrivo (Fase 2): post, foto/video, segnalazioni e moderazione (AI + backoffice).
        </Text>
      </View>
    </Screen>
  );
}
