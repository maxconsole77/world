import React from "react";
import { ImageBackground, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = { children: React.ReactNode };

export default function Screen({ children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ImageBackground
      source={require("../../assets/images/bg-light.png")}
      resizeMode="cover"
      style={{ flex: 1, backgroundColor: "#F6F7FB" }}
    >
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 8,
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        {children}
      </View>
    </ImageBackground>
  );
}
