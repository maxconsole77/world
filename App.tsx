import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TripNavigator from './src/navigation/TripNavigator';
import LoginScreen from './src/screens/auth/LoginScreen';
import AccountSettingsScreen from './src/screens/auth/AccountSettingsScreen';
import './src/i18n';

const Tab = createBottomTabNavigator();

export default function App(){
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Trip" component={TripNavigator}/>
        <Tab.Screen name="Login" component={LoginScreen}/>
        <Tab.Screen name="Settings" component={AccountSettingsScreen}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
