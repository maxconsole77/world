import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  if (user) return <>{children}</>;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>Accedi per continuare</Text>
      <Text style={{ color: "#6B7280", textAlign: "center", marginBottom: 16 }}>
        Questa sezione è riservata agli utenti registrati.
      </Text>
      <Pressable
        onPress={() => navigation.navigate("Login")}
        style={{ backgroundColor: "#007AFF", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Vai al Login</Text>
      </Pressable>
    </View>
  );
};
