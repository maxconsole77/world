import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Localization from 'expo-localization';
import { supabase } from '../lib/supabase';
import { translateText } from '../lib/translate';
import { speak, ensureVoice } from '../lib/speech';

const CATS = ['greetings','directions','food','emergency','shopping'] as const;

export default function PhrasesScreen() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [destLang, setDestLang] = useState<'it'|'en'|'es'|'de'|'fr'>('it');
  const yourLang = (i18n.language || (Localization.getLocales?.()[0]?.languageCode ?? 'en')) as any;

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('profiles')
        .select('destination_language')
        .eq('id', session.user.id)
        .single();
      if (data?.destination_language) setDestLang(data.destination_language);
    })();
  }, []);

  const doVoice = async () => {
    const Voice = await ensureVoice();
    if (!Voice) return Alert.alert('Voce', 'Dettatura non disponibile in Expo Go; serve dev build.');
    try {
      await Voice.start(yourLang);
      Voice.onSpeechResults = (e:any) => { const vals = e.value || []; if (vals[0]) setInput(vals[0]); };
    } catch (e:any) { Alert.alert('Voce', e?.message || 'Errore'); }
  };

  const doTranslate = async () => {
    if (!input.trim()) return;
    const out = await translateText(input.trim(), yourLang, destLang);
    Alert.alert('↔︎', out);
    speak(out, destLang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('phrases.title')}</Text>
      <Text style={styles.caption}>{t('phrases.yourLangFirst')}</Text>

      <FlatList
        data={CATS as any}
        keyExtractor={(k) => k}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cat}>{t(`phrases.cat.${item}`)}</Text>
            {Array.from({ length: 15 }).map((_, i) => {
              const from = t(`phrases.${item}.${i}`);
              const to = t(`phrases.${item}.${i}`, { lng: destLang });
              return (
                <View key={i} style={styles.lineRow}>
                  <View style={{ flex:1 }}>
                    <Text style={styles.line}>• {from}</Text>
                    <Text style={styles.sub}>{to}</Text>
                  </View>
                  <Pressable style={styles.play} onPress={() => speak(to, destLang)}>
                    <Text style={{ color: 'white' }}>▶</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <View style={styles.transBox}>
        <TextInput style={styles.input} placeholder="Scrivi o parla…" value={input} onChangeText={setInput} />
        <View style={{ flexDirection:'row', gap:8 }}>
          <Pressable style={styles.btn} onPress={doTranslate}><Text style={styles.btnText}>Traduci</Text></Pressable>
          <Pressable style={styles.btnOutline} onPress={doVoice}><Text style={styles.btnOutlineText}>Parla</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16,backgroundColor:'#F8F9FA'},
  title:{fontSize:24,fontWeight:'800',color:'#111'},
  caption:{color:'#333',marginBottom:8,opacity:0.9},
  card:{backgroundColor:'white',borderRadius:12,padding:12,marginBottom:12,borderWidth:1,borderColor:'#eee'},
  cat:{fontSize:16,fontWeight:'700',color:'#111',marginBottom:6},
  lineRow:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:6},
  line:{color:'#111'}, sub:{color:'#333',opacity:0.85,fontSize:12},
  play:{width:32,height:32,borderRadius:16,backgroundColor:'#0A84FF',alignItems:'center',justifyContent:'center'},
  transBox:{backgroundColor:'white',borderRadius:12,padding:12,borderWidth:1,borderColor:'#eee'},
  input:{borderWidth:1,borderColor:'#ddd',borderRadius:12,padding:12,backgroundColor:'#fff',marginBottom:8},
  btn:{backgroundColor:'#0A84FF',padding:12,borderRadius:12,alignItems:'center'}, btnText:{color:'white',fontWeight:'700'},
  btnOutline:{borderWidth:1,borderColor:'#0A84FF',padding:12,borderRadius:12,alignItems:'center'}, btnOutlineText:{color:'#0A84FF',fontWeight:'700'}
});
