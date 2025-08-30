import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function ChecklistScreen(){
  return <View style={styles.wrap}>
    <Text style={styles.title}>Checklist</Text>
    <Card><Text>Passaporto</Text></Card>
    <Card><Text>Assicurazione viaggio (PDF)</Text></Card>
    <Button label="Aggiungi elemento"/>
  </View>;
}
const styles = StyleSheet.create({ wrap:{ flex:1, padding:16 }, title:{ fontSize:22, fontWeight:'700', marginBottom:12 } });