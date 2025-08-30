import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
type Props = { text: string; tone?: 'info'|'success'|'warning' };
export default function Banner({ text, tone='info' }: Props) {
  const map = { info: ['#E1F5FE','#B3E5FC'], success: ['#DCFCE7','#A7F3D0'], warning: ['#FFF3CD','#FFDF80'] } as const;
  const [bg,border] = map[tone];
  return <View style={[styles.box, { backgroundColor: bg, borderColor: border }]}>
    <Text style={styles.txt}>{text}</Text>
  </View>;
}
const styles = StyleSheet.create({ box:{ borderWidth:2, borderRadius:8, padding:10, marginVertical:8 }, txt:{ color:'#212529' } });