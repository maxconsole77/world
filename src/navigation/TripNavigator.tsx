import React from 'react';
import { Platform } from 'react-native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import TripSetupScreen from '../screens/trip/TripSetupScreen';
import TripItineraryDayScreen from '../screens/trip/TripItineraryDayScreen';
import DocumentsScreen from '../screens/trip/DocumentsScreen';
import PhotosScreen from '../screens/trip/PhotosScreen';
import ChecklistScreen from '../screens/trip/ChecklistScreen';
import AudioGuideDayScreen from '../screens/trip/AudioGuideDayScreen';
import PeopleInvitesScreen from '../screens/trip/PeopleInvitesScreen';
import PoiAudioGuideScreen from '../screens/trip/PoiAudioGuideScreen';

export type TripStackParamList = {
  Setup: undefined;
  ItineraryDay: undefined;
  Documents: undefined;
  Photos: undefined;
  Checklist: undefined;
  AudioDay: undefined;
  People: undefined;
  PoiAudio: undefined;
};

const Stack = createNativeStackNavigator<TripStackParamList>();

const defaultScreenOptions: NativeStackNavigationOptions = {
  headerShown: true,
  // iOS large title abilitato solo su iOS, con dimensioni numeriche
  headerLargeTitle: Platform.OS === 'ios',
  headerTitleStyle: { fontSize: 17, fontWeight: '600' },
  headerLargeTitleStyle: Platform.OS === 'ios' ? { fontSize: 34, fontWeight: '700' } : undefined,
  // stile contenuto con padding numerico
  contentStyle: { padding: 16, backgroundColor: 'white' },
  // gesture & animazioni sicure
  gestureEnabled: true,
  gestureResponseDistance: 35,
  headerBackTitleVisible: false,
  animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade_from_bottom',
};

export default function TripNavigator() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen name="Setup" component={TripSetupScreen} options={{ title: 'Setup' }} />
      <Stack.Screen name="ItineraryDay" component={TripItineraryDayScreen} options={{ title: 'Itinerario' }} />
      <Stack.Screen name="Documents" component={DocumentsScreen} options={{ title: 'Documenti' }} />
      <Stack.Screen name="Photos" component={PhotosScreen} options={{ title: 'Foto' }} />
      <Stack.Screen name="Checklist" component={ChecklistScreen} options={{ title: 'Checklist' }} />
      <Stack.Screen name="AudioDay" component={AudioGuideDayScreen} options={{ title: 'Audio Giorno' }} />
      <Stack.Screen name="People" component={PeopleInvitesScreen} options={{ title: 'Persone' }} />
      <Stack.Screen name="PoiAudio" component={PoiAudioGuideScreen} options={{ title: 'Audio POI' }} />
    </Stack.Navigator>
  );
}
