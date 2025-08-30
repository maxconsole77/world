import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button';

export default function PeopleInvitesScreen(){
  return <View style={styles.wrap}>
    <Text style={styles.title}>Persone & Inviti</Text>
    <Button label="Invita amici"/>
  </View>;
}
const styles = StyleSheet.create({ wrap:{ flex:1, padding:16 }, title:{ fontSize:22, fontWeight:'700', marginBottom:12 } });