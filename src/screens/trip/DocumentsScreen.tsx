import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function DocumentsScreen(){
  return <View style={styles.wrap}>
    <Text style={styles.title}>Documenti</Text>
    <View style={{ flexDirection:'row', gap:8, marginBottom:8 }}>
      <Button label="Andata" kind='ghost'/><Button label="Ritorno" kind='ghost'/><Button label="In loco" kind='ghost'/>
    </View>
    <Card><Text>Volo AZ157 — PDF</Text><Button label="Scarica" kind='ghost' style={{marginTop:8}}/></Card>
  </View>;
}
const styles = StyleSheet.create({ wrap:{ flex:1, padding:16 }, title:{ fontSize:22, fontWeight:'700', marginBottom:12 } });