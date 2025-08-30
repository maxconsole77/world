import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Button from '../../components/Button';
import { signOut } from '../../services/supabase/auth';
import { useTranslation } from 'react-i18next';

export default function AccountSettingsScreen(){
  const { t } = useTranslation();
  async function logout(){ try{ await signOut(); Alert.alert('Logout','Fatto'); }catch(e:any){ Alert.alert('Errore', e.message);} }
  return <View style={styles.wrap}>
    <Text style={styles.title}>Impostazioni Account</Text>
    <Button label={t('manage_providers')} kind='ghost' onPress={()=>Alert.alert('Provider','Apri modale gestisci provider')}/>
    <View style={{height:12}}/>
    <Button label={t('logout')} onPress={logout}/>
  </View>;
}
const styles = StyleSheet.create({ wrap:{ flex:1, padding:16 }, title:{ fontSize:22, fontWeight:'700', marginBottom:12 } });