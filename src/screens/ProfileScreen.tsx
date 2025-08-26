import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Localization from 'expo-localization';
import { supabase } from '../lib/supabase';

const LANGS = ['it','en','es','de','fr'] as const;

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const def = (Localization.getLocales?.()[0]?.languageCode ?? 'en') as string;

  const [email, setEmail] = useState('');
  const [userLang, setUserLang] = useState<string>(i18n.language || def);
  const [destLang, setDestLang] = useState<string>('it');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setEmail(session.user.email || '');

      const { data } = await supabase
        .from('profiles')
        .select('language,destination_language')
        .eq('id', session.user.id)
        .single();

      if (data?.language) { setUserLang(data.language); i18n.changeLanguage(data.language); }
      else { setUserLang(def); i18n.changeLanguage(def); }

      if (data?.destination_language) setDestLang(data.destination_language);
    })();
  }, []);

  const save = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return Alert.alert('Auth', 'Devi accedere prima.');

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      language: userLang,
      destination_language: destLang,
      updated_at: new Date().toISOString()
    });

    if (error) Alert.alert('Errore', error.message);
    else Alert.alert('✓', t('profile.saved'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('profile.title')}</Text>

      <Text style={styles.label}>{t('profile.email')}</Text>
      <Text style={styles.value}>{email || '-'}</Text>

      <Text style={styles.label}>{t('profile.language')}</Text>
      <View style={styles.row}>
        {LANGS.map(l => (
          <Pressable key={l} onPress={() => { setUserLang(l); i18n.changeLanguage(l); }}
            style={[styles.chip, userLang===l && styles.chipActive]}>
            <Text style={[styles.chipText, userLang===l && styles.chipTextActive]}>{l.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>{t('profile.destinationLanguage')}</Text>
      <View style={styles.row}>
        {LANGS.map(l => (
          <Pressable key={l} onPress={() => setDestLang(l)}
            style={[styles.chip, destLang===l && styles.chipActive]}>
            <Text style={[styles.chipText, destLang===l && styles.chipTextActive]}>{l.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.btn} onPress={save}><Text style={styles.btnText}>{t('profile.save')}</Text></Pressable>
      <Pressable style={[styles.btnOutline,{marginTop:8}]} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.btnOutlineText}>{t('profile.signOut')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16,backgroundColor:'#F8F9FA'},
  title:{fontSize:24,fontWeight:'800',color:'#111',marginBottom:12},
  label:{color:'#333',marginTop:8,marginBottom:4,opacity:0.9},
  value:{color:'#111',fontWeight:'700'},
  row:{flexDirection:'row',flexWrap:'wrap',gap:8},
  chip:{paddingVertical:6,paddingHorizontal:10,borderRadius:20,borderColor:'#0A84FF',borderWidth:1,backgroundColor:'white',marginBottom:8},
  chipActive:{backgroundColor:'#0A84FF'},
  chipText:{color:'#0A84FF'},
  chipTextActive:{color:'white',fontWeight:'700'},
  btn:{marginTop:12,backgroundColor:'#0A84FF',padding:12,borderRadius:12,alignItems:'center'},
  btnText:{color:'white',fontWeight:'700'},
  btnOutline:{borderWidth:1,borderColor:'#0A84FF',padding:12,borderRadius:12,alignItems:'center'},
  btnOutlineText:{color:'#0A84FF',fontWeight:'700'}
});
