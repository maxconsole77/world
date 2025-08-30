import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Button from '../../components/Button';

export default function ManageProvidersModal({ visible, onClose }: { visible:boolean; onClose:()=>void }){
  return <Modal visible={visible} animationType='slide' transparent>
    <View style={styles.overlay}><View style={styles.modal}>
      <Text style={styles.title}>Gestisci provider</Text>
      <Button label='Collega Google' kind='ghost'/><Button label='Collega Facebook' kind='ghost'/><Button label='Collega Apple' kind='ghost'/>
      <Button label='Chiudi' onPress={onClose}/>
    </View></View>
  </Modal>;
}
const styles = StyleSheet.create({ overlay:{ flex:1, backgroundColor:'#0006', justifyContent:'center', padding:16 }, modal:{ backgroundColor:'#fff', borderRadius:12, padding:16 }, title:{ fontWeight:'700', fontSize:18, marginBottom:8 } });