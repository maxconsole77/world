import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Button from '../../components/Button';

export default function AddToDaypartModal({ visible, onClose }: { visible:boolean; onClose:()=>void }){
  return <Modal visible={visible} animationType='slide' transparent>
    <View style={styles.overlay}><View style={styles.modal}>
      <Text style={styles.title}>Aggiungi a Giorno/Fascia</Text>
      <Button label='Mattino' kind='ghost'/><Button label='Pomeriggio' kind='ghost'/><Button label='Sera' kind='ghost'/><Button label='Notte' kind='ghost'/>
      <Button label='Chiudi' onPress={onClose}/>
    </View></View>
  </Modal>;
}
const styles = StyleSheet.create({ overlay:{ flex:1, backgroundColor:'#0006', justifyContent:'center', padding:16 }, modal:{ backgroundColor:'#fff', borderRadius:12, padding:16 }, title:{ fontWeight:'700', fontSize:18, marginBottom:8 } });