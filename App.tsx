// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import './src/lib/i18n';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <NavigationContainer theme={DefaultTheme}>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}
