import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import Chip from './Chip';
type Props = { items: {label:string, active?:boolean, onPress?:()=>void}[]; onClear?:()=>void };
export default function FilterBar({ items, onClear }: Props){
  return <View style={styles.wrap}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:12}}>
      {items.map((it, idx)=>(<Chip key={idx} label={it.label} active={it.active} onPress={it.onPress}/>))}
      {onClear ? <Text onPress={onClear} style={styles.clear}>Azzera filtri</Text> : null}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({ wrap:{ borderBottomWidth:1, borderColor:'#E0E0E0', paddingVertical:8 }, clear:{ color:'#0A84FF', paddingHorizontal:8, paddingVertical:6 } });