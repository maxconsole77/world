import React from 'react';
import { View, StyleSheet } from 'react-native';
export default function Card({ children }: React.PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}
const styles = StyleSheet.create({ card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#DEE2E6', marginBottom: 12 } });