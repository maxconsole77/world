import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { saveProfile, getProfileWithFallback, type ProfileRow } from '../lib/profile';
import { supabase } from '../lib/supabase';

const LANGS: Array<'it'|'en'|'es'|'de'|'fr'> = ['it','en','es','de','fr'];

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [userLang, setUserLang] = useState<'it'|'en'|'es'|'de'|'fr'>('en');
  const [destLang, setDestLang] = useState<'it'|'en'|'es'|'de'|'fr'>('it');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState<'supabase'|'storage'>('storage');

  useEffect(() => {
    (async () => {
      try {
        const { profile, fromStorage } = await getProfileWithFallback();
        if (profile) {
          setEmail(profile.email);
          setUserLang(profile.language);
          setDestLang(profile.destination_language);
          setSource(fromStorage ? 'storage' : 'supabase');
          i18n.changeLanguage(profile.language);
        }
      } catch (e:any) {
        console.warn('Profile load error', e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSave() {
    setSaving(true);
    try {
      if (userLang === destLang) {
        Alert.alert(t('profile.title', { defaultValue: 'Profilo' }), t('phrases.sameLangMsg', { defaultValue: 'Le lingue non possono coincidere. Scegline due diverse.' }));
        return;
      }
      await saveProfile({ language: userLang, destination_language: destLang });
      i18n.changeLanguage(userLang);
      Alert.alert(t('profile.title', { defaultValue: 'Profilo' }), t('profile.saved', { defaultValue: 'Preferenze salvate.' }));
    } catch (e:any) {
      Alert.alert(t('profile.title', { defaultValue: 'Profilo' }), e?.message || 'Errore di salvataggio.');
    } finally {
      setSaving(false);
    }
  }

  async function onSignOut() {
    try { await supabase.auth.signOut(); } catch {}
  }

  if (loading) return <View style={styles.container}><Text style={styles.title}>Loading…</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('profile.title', { defaultValue: 'Profilo' })}</Text>

      <View style={styles.rowBetween}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email || t('auth.offline', { defaultValue: 'offline' })}</Text>
      </View>

      <View style={styles.rowBetween}>
        <Text style={styles.label}>{t('phrases.fromLang', { defaultValue: 'Lingua utente' })}</Text>
        <View style={styles.langRow}>
          {LANGS.map(l => (
            <Pressable key={'u-'+l} onPress={() => setUserLang(l)} style={[styles.chip, userLang===l && styles.chipActive]}>
              <Text style={[styles.chipText, userLang===l && styles.chipTextActive]}>{l.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.rowBetween}>
        <Text style={styles.label}>{t('phrases.toLang', { defaultValue: 'Lingua destinazione' })}</Text>
        <View style={styles.langRow}>
          {LANGS.map(l => (
            <Pressable key={'d-'+l} onPress={() => setDestLang(l)} disabled={l===userLang} style={[styles.chip, destLang===l && styles.chipActive, l===userLang && styles.chipDisabled]}>
              <Text style={[styles.chipText, destLang===l && styles.chipTextActive]}>{l.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable onPress={onSave} disabled={saving} style={[styles.btn, saving && { opacity: .6 }]}>
        <Text style={styles.btnTxt}>{t('profile.save', { defaultValue: 'Salva' })}</Text>
      </Pressable>

      <Pressable onPress={onSignOut} style={[styles.btnOutline]}>
        <Text style={styles.btnOutlineTxt}>{t('auth.signOut', { defaultValue: 'Esci' })}</Text>
      </Pressable>

      <Text style={styles.hint}>
        {source === 'supabase'
          ? t('profile.synced', { defaultValue: 'Sincronizzato con Supabase • RLS attive' })
          : t('profile.localOnly', { defaultValue: 'Offline: preferenze salvate solo sul dispositivo' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:24, backgroundColor:'#F8F9FA' },
  title:{ fontSize:24, fontWeight:'800', marginBottom:16 },
  rowBetween:{ marginBottom:12 },
  label:{ fontWeight:'700', marginBottom:6 },
  value:{ backgroundColor:'#fff', padding:12, borderRadius:10, borderWidth:1, borderColor:'#eee' },
  langRow:{ flexDirection:'row', flexWrap:'wrap', gap:8, justifyContent:'flex-end' },
  chip:{ paddingVertical:8, paddingHorizontal:12, borderRadius:999, borderWidth:1, borderColor:'#0A84FF', backgroundColor:'#fff' },
  chipActive:{ backgroundColor:'#0A84FF' },
  chipText:{ color:'#0A84FF', fontWeight:'700' },
  chipTextActive:{ color:'#fff' },
  chipDisabled:{ opacity:.4 },
  btn:{ marginTop:18, backgroundColor:'#0A84FF', padding:14, borderRadius:12, alignItems:'center' },
  btnTxt:{ color:'#fff', fontWeight:'700' },
  btnOutline:{ marginTop:10, padding:12, borderRadius:12, alignItems:'center', borderWidth:1, borderColor:'#0A84FF', backgroundColor:'#fff' },
  btnOutlineTxt:{ color:'#0A84FF', fontWeight:'700' },
  hint:{ marginTop:14, textAlign:'center', color:'#64748B' }
});
