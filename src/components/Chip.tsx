import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
type Props = { label: string; active?: boolean; onPress?: () => void };
export default function Chip({ label, active, onPress }: Props) {
  return <Pressable onPress={onPress} style={[styles.chip, active? styles.active: null]}><Text style={active? styles.txtActive: styles.txt}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({
  chip:{paddingVertical:6, paddingHorizontal:10, borderRadius:16, borderWidth:1, borderColor:'#CED4DA', marginRight:8, backgroundColor:'#FAFAFA'},
  active:{ backgroundColor:'#0A84FF', borderColor:'#0A84FF' },
  txt:{color:'#212529'}, txtActive:{color:'#fff'}
});