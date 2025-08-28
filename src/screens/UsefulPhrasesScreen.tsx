import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { speak } from '../lib/speech';
import { translate } from '../lib/translate';

// lingue supportate (codice i18n)
const LANGS: { code: string; label: string }[] = [
  { code: 'it', label: 'IT' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'de', label: 'DE' },
  { code: 'fr', label: 'FR' },
];

// categorie supportate come in locales
const CATS: { key: keyof typeof catKeys; i18n: string }[] = [
  { key: 'greetings', i18n: 'phrases.cat.greetings' },
  { key: 'directions', i18n: 'phrases.cat.directions' },
  { key: 'food', i18n: 'phrases.cat.food' },
  { key: 'emergency', i18n: 'phrases.cat.emergency' },
  { key: 'shopping', i18n: 'phrases.cat.shopping' },
];
const catKeys = { greetings: 1, directions: 1, food: 1, emergency: 1, shopping: 1 };

type CatKey = keyof typeof catKeys;

export default function UsefulPhrasesScreen() {
  const { t, i18n } = useTranslation();

  // carico default da profilo salvato (se l’hai già messo in AsyncStorage in ProfileScreen)
  const [fromLang, setFromLang] = useState('it');
  const [toLang, setToLang] = useState('en');

  const [cat, setCat] = useState<CatKey>('greetings');
  const [playingId, setPlayingId] = useState<string | null>(null);

  // input libero
  const [freeIn, setFreeIn] = useState('');
  const [freeOut, setFreeOut] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      const savedFrom = (await AsyncStorage.getItem('profile.language')) || i18n.language || 'it';
      const savedTo = (await AsyncStorage.getItem('profile.destinationLanguage')) || 'en';
      setFromLang(savedFrom.slice(0,2));
      setToLang(savedTo.slice(0,2));
    })();
  }, [i18n.language]);

  // estraggo le frasi dalle risorse i18n: assumo stesso indice in tutte le lingue
  const items = useMemo(() => {
    const src = (i18n.getResource(fromLang, 'translation', `phrases.${cat}`) || {}) as Record<string,string>;
    const dst = (i18n.getResource(toLang,   'translation', `phrases.${cat}`) || {}) as Record<string,string>;
    const idxs = Object.keys(src).filter(k => /^\d+$/.test(k)).sort((a,b)=>Number(a)-Number(b));
    return idxs.map(id => ({
      id, from: src[id], to: dst[id]
    }));
  }, [i18n, fromLang, toLang, cat]);

  async function onTranslateFree() {
    const txt = freeIn.trim();
    if (!txt) return;
    const out = await translate(txt, fromLang, toLang);
    setFreeOut(out);
  }

  function onSpeak(text: string) {
    setPlayingId(text); // evidenzio il riquadro
    speak(text, toLang);
    setTimeout(() => setPlayingId(null), 1500);
  }

  function LangChip({code, active, onPress}:{code:string; active:boolean; onPress:()=>void}) {
    return (
      <Pressable onPress={onPress} style={[styles.langChip, active && styles.langActive]}>
        <Text style={[styles.langText, active && styles.langTextActive]}>{code.toUpperCase()}</Text>
      </Pressable>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      <Text style={styles.title}>{t('phrases.title', { defaultValue: 'Frasi Utili' })}</Text>

      {/* Selettori lingua */}
      <View style={styles.row}>
        <Text style={styles.label}>{t('phrases.fromLang', { defaultValue: 'Lingua utente' })}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {LANGS.map(l => (
            <LangChip key={'from-'+l.code} code={l.code} active={fromLang===l.code} onPress={()=>setFromLang(l.code)} />
          ))}
        </ScrollView>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('phrases.toLang', { defaultValue: 'Lingua destinazione' })}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {LANGS.map(l => (
            <LangChip key={'to-'+l.code} code={l.code} active={toLang===l.code} onPress={()=>setToLang(l.code)} />
          ))}
        </ScrollView>
      </View>

      {/* Input libero + traduzione */}
      <View style={styles.freeBox}>
        <TextInput
          ref={inputRef}
          value={freeIn}
          onChangeText={setFreeIn}
          placeholder={t('phrases.free.placeholder', { defaultValue: 'Scrivi qui…' })}
          style={styles.input}
          multiline
        />
        <View style={styles.freeActions}>
          <Pressable onPress={onTranslateFree} style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>{t('phrases.free.translate', { defaultValue: 'Traduci' })}</Text>
          </Pressable>
          <Pressable onPress={() => onSpeak(freeOut || freeIn)} style={styles.btnGhost}>
            <Ionicons name="volume-high" size={18} color="#0A84FF" />
            <Text style={styles.btnGhostText}>{(toLang || '—').toUpperCase()}</Text>
          </Pressable>
        </View>

        {!!freeOut && (
          <View style={styles.outputBubble}>
            <Text style={styles.outputText}>{freeOut}</Text>
          </View>
        )}
      </View>

      {/* Categorie */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
        {CATS.map(c => (
          <Pressable key={String(c.key)} onPress={()=>setCat(c.key)} style={[styles.catChip, cat===c.key && styles.catActive]}>
            <Text style={[styles.catText, cat===c.key && styles.catTextActive]}>{t(c.i18n)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Elenco frasi */}
      <View style={{ gap: 10 }}>
        {items.map(it => {
          const active = playingId === it.to;
          return (
            <View key={it.id} style={[styles.card, active && styles.cardActive]}>
              {/* TTS a sinistra */}
              <Pressable onPress={() => onSpeak(it.to)} style={styles.ttsBtn}>
                <Ionicons name="play" size={18} color="#111" />
                <Text style={styles.ttsCode}>{toLang.toUpperCase()}</Text>
              </Pressable>

              <View style={{ flex: 1 }}>
                <Text selectable style={styles.lineFrom}>{it.from}</Text>
                <Text selectable style={styles.lineTo}>{it.to}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, backgroundColor:'#F8F9FA' },
  title:{ fontSize:24, fontWeight:'800', color:'#111', marginBottom:8 },

  row:{ marginTop:6, marginBottom:2 },
  label:{ fontWeight:'700', color:'#111', marginBottom:6 },

  langChip:{ paddingVertical:6, paddingHorizontal:12, borderRadius:16, borderWidth:1, borderColor:'#0A84FF', backgroundColor:'#fff', marginRight:8 },
  langActive:{ backgroundColor:'#0A84FF' },
  langText:{ color:'#0A84FF', fontWeight:'700' },
  langTextActive:{ color:'#fff', fontWeight:'700' },

  freeBox:{ backgroundColor:'#fff', borderRadius:12, borderWidth:1, borderColor:'#eee', padding:10, marginTop:10 },
  input:{ minHeight:60, fontSize:16, color:'#111' },
  freeActions:{ flexDirection:'row', alignItems:'center', gap:10, marginTop:8 },
  btnPrimary:{ backgroundColor:'#0A84FF', paddingVertical:8, paddingHorizontal:12, borderRadius:10 },
  btnPrimaryText:{ color:'#fff', fontWeight:'700' },
  btnGhost:{ flexDirection:'row', alignItems:'center', gap:6, paddingVertical:6, paddingHorizontal:10, borderRadius:10, borderWidth:1, borderColor:'#0A84FF', backgroundColor:'#fff' },
  btnGhostText:{ color:'#0A84FF', fontWeight:'700' },

  catChip:{ paddingVertical:8, paddingHorizontal:12, borderRadius:20, borderWidth:1, borderColor:'#0A84FF', backgroundColor:'#fff', marginRight:8 },
  catActive:{ backgroundColor:'#0A84FF' },
  catText:{ color:'#0A84FF', fontWeight:'700' },
  catTextActive:{ color:'#fff', fontWeight:'700' },

  card:{ flexDirection:'row', gap:12, backgroundColor:'#fff', borderRadius:12, borderWidth:1, borderColor:'#eee', padding:12 },
  cardActive:{ borderColor:'#0A84FF', borderWidth:2, shadowColor:'#0A84FF', shadowOpacity:0.15, shadowRadius:8, shadowOffset:{ width:0, height:2 } },
  ttsBtn:{ width:64, height:64, borderRadius:12, backgroundColor:'#F1F5F9', alignItems:'center', justifyContent:'center', gap:2 },
  ttsCode:{ fontSize:12, color:'#111', fontWeight:'700' },

  lineFrom:{ fontSize:16, color:'#111', fontWeight:'700' },
  lineTo:{ fontSize:14, color:'#4B5563', marginTop:2 }
});

