// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar, View, Text } from 'react-native';

import './src/lib/i18n';
import RootNavigator from './src/navigation/RootNavigator';

const SAFE_MODE = process.env.EXPO_PUBLIC_SAFE_MODE === '1'; // attivalo mettendo EXPO_PUBLIC_SAFE_MODE=1 nel .env

export default function App() {
  if (SAFE_MODE) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>World (Safe Mode)</Text>
          <Text style={{ marginTop: 8, opacity: 0.8 }}>UI minima per testare l’avvio</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DefaultTheme}>
        <StatusBar barStyle="dark-content" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
