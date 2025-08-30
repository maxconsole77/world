import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function PhotosScreen(){
  return <ScrollView contentContainerStyle={styles.wrap}>
    <Text style={styles.title}>Foto & Album</Text>
    <View style={{ flexDirection:'row', gap:8 }}>
      <Button label="Carica foto"/><Button label="Crea album" kind='ghost'/>
    </View>
    <Card><Text>IMG_2045.jpg — #sunset POI: Ponte Sisto</Text></Card>
    <Card><Text>IMG_2050.jpg — #food @Trastevere</Text></Card>
  </ScrollView>;
}
const styles = StyleSheet.create({ wrap:{ padding:16 }, title:{ fontSize:22, fontWeight:'700', marginBottom:12 } });