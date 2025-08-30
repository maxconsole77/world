import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Card from '../../components/Card';
import { useTranslation } from 'react-i18next';

export default function TripSetupScreen(){
  const { t } = useTranslation();
  return <ScrollView contentContainerStyle={styles.wrap}>
    <Text style={styles.title}>{t('setup_trip')}</Text>
    <Card>
      <Text>Interessi principali</Text>
      <View style={{ flexDirection:'row', marginTop:8 }}>
        <Chip label="Arte & musei"/><Chip label="Storia & monumenti"/><Chip label="Cucina"/>
      </View>
      <View style={{ alignItems:'flex-end', marginTop:8 }}>
        <Button label="Seleziona tutto" kind='ghost'/>
      </View>
    </Card>
    <Card>
      <Text>Ritmo per fascia (Mattino/Pomeriggio/Sera/Notte)</Text>
    </Card>
    <View style={{height:12}}/>
    <Button label="Genera itinerario"/>
  </ScrollView>;
}
const styles = StyleSheet.create({ wrap:{ padding:16 }, title:{ fontSize:22, fontWeight:'700', marginBottom:12 } });