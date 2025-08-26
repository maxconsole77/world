import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UsefulPhrasesScreen from '../screens/UsefulPhrasesScreen';
import TripScreen from '../screens/TripScreen';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type MainTabParamList = {
  Trip: undefined;
  Phrases: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Trip"
        component={TripScreen}
        options={{
          title: t('tabs.trip'),
          tabBarIcon: ({ color, size }) => <Ionicons name="map" color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Phrases"
        component={UsefulPhrasesScreen}
        options={{
          title: t('tabs.usefulPhrases'),
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // sync session at mount + subscribe to changes
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}


