import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { View, Text } from 'react-native';
import { FF } from './src/appcfg/featureFlags';
import RootNavigator from './src/navigation/RootNavigator';

if (FF.I18N) { require('./src/lib/i18n'); }

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DefaultTheme}>
        {!FF.NAVIGATION ? (
          <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#F8F9FA'}}>
            <Text style={{fontSize:18,fontWeight:'700'}}>World — I18N ON</Text>
            <Text>FF: NAV={String(FF.NAVIGATION)} TABS={String(FF.TABS)} ICONS={String(FF.ICONS)}</Text>
          </View>
        ) : FF.TABS ? (
          <RootNavigator />
        ) : (
          <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#F8F9FA'}}>
            <Text style={{fontSize:18,fontWeight:'700'}}>Nav OK</Text>
            <Text>FF: NAV={String(FF.NAVIGATION)} TABS={String(FF.TABS)} ICONS={String(FF.ICONS)}</Text>
          </View>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

