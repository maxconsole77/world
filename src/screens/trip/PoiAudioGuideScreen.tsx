import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button';

export default function PoiAudioGuideScreen(){
  return <View style={styles.wrap}>
    <Text style={styles.title}>Audioguida del POI</Text>
    <Button label="Play/Pausa"/>
  </View>;
}
const styles = StyleSheet.create({ wrap:{ flex:1, padding:16 }, title:{ fontSize:22, fontWeight:'700', marginBottom:12 } });