// src/screens/HomeIntroScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TextInput, Pressable, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

export default function HomeIntroScreen() {
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const sendMagicLink = async () => {
    if (!email) return Alert.alert(t('auth.error'), 'Inserisci la tua email.');
    try {
      setSending(true);
      const redirectTo = Linking.createURL('/auth'); // assicurati che world://auth sia tra i redirect in Supabase
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      Alert.alert(t('auth.sent'), t('auth.checkInbox'));
    } catch (e: any) {
      Alert.alert(t('auth.error'), e.message ?? 'Errore sconosciuto');
    } finally {
      setSending(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const proceed = () => {
    // porta l'utente alla tua tab/home principale senza dipendere dal gate dello Stack
    try { nav.navigate('Main'); } catch { /* fallback: resta qui */ }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/intro-bg.jpg')}
      resizeMode="cover"
      style={styles.bg}
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Image source={require('../../assets/images/world-logo.png')} style={styles.logo} />
        <Text style={styles.title}>World</Text>
        <Text style={styles.subtitle}>{t('intro.subtitle')}</Text>

        {!session ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('auth.title')}</Text>
            <Text style={styles.caption}>{t('auth.caption')}</Text>
            <TextInput
              style={styles.input}
              placeholder="email@domain.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
              value={email}
            />
            <Pressable style={styles.btn} onPress={sendMagicLink} disabled={sending}>
              <Text style={styles.btnText}>{sending ? '...' : t('auth.sendLink')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Benvenuto 👋</Text>
            <Text style={styles.caption}>{session.user.email}</Text>
            <Pressable style={[styles.btn, { marginTop: 10 }]} onPress={proceed}>
              <Text style={styles.btnText}>Continua</Text>
            </Pressable>
            <Pressable style={[styles.btnOutline, { marginTop: 8 }]} onPress={signOut}>
              <Text style={styles.btnOutlineText}>Esci</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  content: { padding: 24 },
  logo: { width: 92, height: 92, marginBottom: 8 },
  title: { fontSize: 36, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', opacity: 0.9, marginBottom: 16 },
  card: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#212529', marginBottom: 6 },
  caption: { color: '#212529', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, backgroundColor: '#fff' },
  btn: { backgroundColor: '#008CBA', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnOutline: { borderWidth: 1, borderColor: '#008CBA', padding: 12, borderRadius: 12, alignItems: 'center' },
  btnOutlineText: { color: '#008CBA', fontWeight: '700' },
});

