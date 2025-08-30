import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function HomeIntroScreen() {
  const { t } = useTranslation();
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ fontSize:22, fontWeight:'700' }}>{t('intro.subtitle')}</Text>
    </View>
  );
}
