import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';

type Props = { label: string; onPress?: () => void; kind?: 'primary'|'ghost'; style?: ViewStyle };
export default function Button({ label, onPress, kind='primary', style }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.btn, kind==='ghost' ? styles.ghost : styles.primary, style]}>
      <Text style={kind==='ghost' ? styles.txtGhost : styles.txt}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: '#0A84FF' },
  primary: { backgroundColor: '#0A84FF' },
  ghost: { backgroundColor: '#fff' },
  txt: { color: '#fff', fontWeight: '600' },
  txtGhost: { color: '#0A84FF', fontWeight: '600' },
});