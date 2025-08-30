import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import TripNavigator from './TripNavigator';
import PhrasesScreen from '../screens/PhrasesScreen';
import WeatherScreen from '../screens/WeatherScreen';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: Platform.select({
          ios: { height: 64, paddingBottom: 12, paddingTop: 8 },
          default: { height: 56, paddingBottom: 6, paddingTop: 6 },
        }),
      }}
      backBehavior="history"
      sceneContainerStyle={{ backgroundColor: '#fff' }}
    >
      <Tab.Screen
        name="Trip"
        component={TripNavigator}
        options={{
          title: 'Trip',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="walk-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Phrases"
        component={PhrasesScreen}
        options={{
          title: 'Frasi',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Weather"
        component={WeatherScreen}
        options={{
          title: 'Meteo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="partly-sunny-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
