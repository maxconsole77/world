import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import TripScreen from '../screens/TripScreen';
import UsefulPhrasesScreen from '../screens/UsefulPhrasesScreen';
import WeatherScreen from '../screens/WeatherScreen';
import i18n from '../lib/i18n';
import PhrasesScreen from '../screens/PhrasesScreen';
import WeatherScreen from '../components/WeatherMap';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Trip"
        component={TripScreen}
        options={{
          title: i18n.t('tabs.trip', { defaultValue: 'Trip' }),
          tabBarIcon: ({ color, size }) => <Ionicons name="map" color={color} size={size} />,
        }}
      />

      <Tab.Screen
        name="Phrases"
        component={UsefulPhrasesScreen}
        options={{
          title: i18n.t('tabs.phrases', { defaultValue: 'Phrases' }),
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" color={color} size={size} />,
        }}
      />

      <Tab.Screen
        name="Weather"
        component={WeatherScreen}
        options={{
          title: i18n.t('tabs.weather', { defaultValue: 'Weather' }),
          tabBarIcon: ({ color, size }) => <Ionicons name="cloud" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
