import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function TripItineraryDayScreen(){
  return <ScrollView contentContainerStyle={styles.wrap}>
    <Text style={styles.title}>Itinerario — Oggi</Text>
    {['Mattino','Pomeriggio','Sera','Notte'].map((p)=> (
      <Card key={p}><Text style={styles.h}>{p}</Text><Text>Meteo: — • Pioggia: —%</Text><Button label="Ricalcola" kind='ghost' style={{marginTop:8}}/></Card>
    ))}
  </ScrollView>;
}
const styles = StyleSheet.create({ wrap:{ padding:16 }, title:{ fontSize:22, fontWeight:'700', marginBottom:12 }, h:{ fontWeight:'700', marginBottom:6 } });