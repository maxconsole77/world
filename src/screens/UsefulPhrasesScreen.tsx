import { speak, ensureVoice } from '../lib/speech'; // ← tienilo se hai rimosso il vecchio import
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Localization from 'expo-localization';
import { supabase } from '../lib/supabase';
import { translateText } from '../lib/translate';

const CATS = ['greetings','directions','food','emergency','shopping'] as const;
type Cat = typeof CATS[number];

export default function UsefulPhrasesScreen() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [destLang, setDestLang] = useState<'it'|'en'|'es'|'de'|'fr'>('it');
  const [cat, setCat] = useState<Cat>('greetings');

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
    if (!Voice) return Alert.alert('Dettatura', 'Non disponibile in Expo Go; usa una dev build.');
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

  const data = useMemo(() => Array.from({length: 15}).map((_, i) => i), [cat]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('phrases.usefulTitle')}</Text>

      {/* Box traduzione in alto */}
      <View style={styles.transBox}>
        <TextInput style={styles.input} placeholder={t('phrases.freeInputPlaceholder') as string} value={input} onChangeText={setInput} />
        <View style={styles.row}>
          <Pressable style={styles.btn} onPress={doTranslate}><Text style={styles.btnText}>{t('phrases.translate')}</Text></Pressable>
          <Pressable style={[styles.btnOutline, { marginLeft: 8 }]} onPress={doVoice}><Text style={styles.btnOutlineText}>{t('phrases.speak')}</Text></Pressable>
        </View>
      </View>

      {/* Selettore ambito */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowScroll}>
        {CATS.map(c => (
          <Pressable key={c} onPress={() => setCat(c)} style={[styles.chip, cat===c && styles.chipActive]}>
            <Text style={[styles.chipText, cat===c && styles.chipTextActive]}>{t(`phrases.cat.${c}`)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Lista frasi per ambito: tua lingua -> lingua destinazione */}
      <FlatList
        data={data}
        keyExtractor={(i) => `${cat}-${i}`}
        renderItem={({ item: i }) => {
          const from = t(`phrases.${cat}.${i}`);
          const to = t(`phrases.${cat}.${i}`, { lng: destLang });
          return (
            <View style={styles.card}>
              <View style={{ flex:1 }}>
                <Text style={styles.line}>• {from}</Text>
                <Text style={styles.sub}>{to}</Text>
              </View>
              <Pressable style={styles.play} onPress={() => speak(to, destLang)}>
                <Text style={{ color: 'white' }}>▶</Text>
              </Pressable>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16,backgroundColor:'#F8F9FA'},
  title:{fontSize:24,fontWeight:'800',color:'#111',marginBottom:8},

  transBox:{backgroundColor:'white',borderRadius:12,padding:12,borderWidth:1,borderColor:'#eee', marginBottom:8},
  input:{borderWidth:1,borderColor:'#ddd',borderRadius:12,padding:12,backgroundColor:'#fff',marginBottom:8},
  row:{flexDirection:'row', alignItems:'center'},
  rowScroll:{paddingVertical:8, paddingRight:8},
  btn:{backgroundColor:'#0A84FF',padding:12,borderRadius:12,alignItems:'center'},
  btnText:{color:'white',fontWeight:'700'},
  btnOutline:{borderWidth:1,borderColor:'#0A84FF',padding:12,borderRadius:12,alignItems:'center'},
  btnOutlineText:{color:'#0A84FF',fontWeight:'700'},

  chip:{paddingVertical:8,paddingHorizontal:12,borderRadius:20,borderColor:'#0A84FF',borderWidth:1,backgroundColor:'white',marginRight:8},
  chipActive:{backgroundColor:'#0A84FF'}, chipText:{color:'#0A84FF'}, chipTextActive:{color:'white',fontWeight:'700'},

  card:{backgroundColor:'white',borderRadius:12,padding:12,marginBottom:8,borderWidth:1,borderColor:'#eee', flexDirection:'row', alignItems:'center'},
  line:{color:'#111'}, sub:{color:'#333',opacity:0.85,fontSize:12},
  play:{width:32,height:32,borderRadius:16,backgroundColor:'#0A84FF',alignItems:'center',justifyContent:'center', marginLeft:8},
});
