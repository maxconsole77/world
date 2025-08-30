import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button';
import { signInWithOAuth, signInWithEmail, sendMagicLink } from '../../services/supabase/auth';

export default function LoginScreen(){
  const { t } = useTranslation();
  async function oauth(p:'google'|'facebook'|'apple'){
    try{ await signInWithOAuth(p); } catch(e:any){ Alert.alert('Auth', e.message); }
  }
  async function emailPwd(){
    try{ await signInWithEmail('demo@example.com','demo1234'); } catch(e:any){ Alert.alert('Auth', e.message); }
  }
  async function magic(){
    try{ await sendMagicLink('demo@example.com'); Alert.alert('Magic link','Controlla la tua email.'); } catch(e:any){ Alert.alert('Auth', e.message); }
  }
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('auth_title')}</Text>
      <Button label="Continua con Google" onPress={()=>oauth('google')}/>
      <View style={{height:8}}/>
      <Button label="Continua con Facebook" kind='ghost' onPress={()=>oauth('facebook')}/>
      <View style={{height:8}}/>
      <Button label="Continua con Apple" kind='ghost' onPress={()=>oauth('apple')}/>
      <View style={{height:16}}/>
      <Button label="Email + Password" kind='ghost' onPress={emailPwd}/>
      <View style={{height:8}}/>
      <Pressable onPress={magic}><Text style={styles.link}>Magic Link</Text></Pressable>
    </View>
  );
}
const styles = StyleSheet.create({ wrap:{ flex:1, padding:16, justifyContent:'center' }, title:{ fontSize:22, fontWeight:'700', marginBottom:16 }, link:{ color:'#0A84FF', textAlign:'center', marginTop:8 } });