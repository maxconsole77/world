import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Button from '../../components/Button';

export default function ExternalShareModal({ visible, onClose }: { visible:boolean; onClose:()=>void }){
  return <Modal visible={visible} animationType='slide' transparent>
    <View style={styles.overlay}><View style={styles.modal}>
      <Text style={styles.title}>Condivisione esterna</Text>
      <Button label='Instagram' kind='ghost'/><Button label='Facebook' kind='ghost'/><Button label='WhatsApp' kind='ghost'/>
      <Button label='Condividi' onPress={onClose}/>
    </View></View>
  </Modal>;
}
const styles = StyleSheet.create({ overlay:{ flex:1, backgroundColor:'#0006', justifyContent:'center', padding:16 }, modal:{ backgroundColor:'#fff', borderRadius:12, padding:16 }, title:{ fontWeight:'700', fontSize:18, marginBottom:8 } });