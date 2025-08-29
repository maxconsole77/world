import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { speak } from '../lib/speech';
import { translate } from '../lib/translate';
import { useSTT } from '../hooks/useSTT';

// Lingue disponibili
const LANGS = ['it', 'en', 'es', 'de', 'fr'] as const;
type Lang = typeof LANGS[number];

// Categorie disponibili per il frasario
const CATS = ['greetings', 'directions', 'food', 'emergency', 'shopping'] as const;
type CatKey = typeof CATS[number];

// Normalizza testi per matching nel frasario
function norm(s: string) {
  return (s || '')
    .toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(/[?!.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Cerca la traduzione “di dizionario” nelle risorse i18n
function phrasebookLookup(i18n: any, text: string, from: Lang, to: Lang): string | null {
  const n = norm(text);
  for (const cat of CATS) {
    const src = (i18n.getResource(from, 'translation', `phrases.${cat}`) || {}) as Record<string, string>;
    const dst = (i18n.getResource(to, 'translation', `phrases.${cat}`) || {}) as Record<string, string>;
    for (const id of Object.keys(src)) {
      if (!/^\d+$/.test(id)) continue;
      if (norm(src[id]) === n) return dst[id] || null;
    }
  }
  return null;
}

export default function UsefulPhrasesScreen() {
  const { t, i18n } = useTranslation();

  // Lingue
  const [fromLang, setFromLang] = useState<Lang>('it');
  const [toLang, setToLang] = useState<Lang>('en');
  function swapLangs() { setFromLang(toLang); setToLang(fromLang); }

  // Categoria corrente
  const [cat, setCat] = useState<CatKey>('greetings');

  // Evidenza card in riproduzione
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Input libero
  const [freeIn, setFreeIn] = useState('');
  const [freeOut, setFreeOut] = useState('');

  // “Ascolta risposta”
  const [replyOut, setReplyOut] = useState('');

  // STT
  const sttAsk = useSTT();
  const sttReply = useSTT();

  useEffect(() => {
    (async () => {
      const savedFrom = (await AsyncStorage.getItem('profile.language')) || i18n.language || 'it';
      const savedTo = (await AsyncStorage.getItem('profile.destinationLanguage')) || 'en';
      setFromLang(savedFrom.slice(0, 2) as Lang);
      setToLang(savedTo.slice(0, 2) as Lang);
    })();
  }, [i18n.language]);

  // Frasi per la categoria selezionata
  const items = useMemo(() => {
    const src = (i18n.getResource(fromLang, 'translation', `phrases.${cat}`) || {}) as Record<string, string>;
    const dst = (i18n.getResource(toLang, 'translation', `phrases.${cat}`) || {}) as Record<string, string>;
    const idxs = Object.keys(src).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
    return idxs.map(id => ({ id, from: src[id], to: dst[id] }));
  }, [i18n, fromLang, toLang, cat]);

  // Traduzione input libero: prima frasario, poi API (auto-detect), pulizia output
  async function onTranslateFree() {
    const txt = freeIn.trim();
    if (!txt) return;

    const pb = phrasebookLookup(i18n, txt, fromLang, toLang);
    if (pb) { setFreeOut(pb); return; }

    const out = await translate(txt, 'auto', toLang); // auto-detect migliora qualità
    setFreeOut(out);
  }

  // TTS: se non c'è traduzione, parla l'originale in lingua di origine
  function onSpeak(textDst?: string) {
    const hasDst = !!(textDst && textDst.trim());
    const text = hasDst ? textDst! : freeIn.trim();
    const lang = hasDst ? toLang : fromLang;
    if (!text) return;
    setPlayingId(text);
    speak(text, lang);
    setTimeout(() => setPlayingId(null), 1200);
  }

  // STT azioni
  async function startAskDictation() { sttAsk.reset(); await sttAsk.start(langToBcp47(fromLang)); }
  async function stopAskDictation() { await sttAsk.stop(); if (sttAsk.result) setFreeIn(sttAsk.result); }

  async function startReplyListen() { sttReply.reset(); await sttReply.start(langToBcp47(toLang)); }
  async function stopReplyListen() {
    await sttReply.stop();
    const heard = sttReply.result.trim();
    if (!heard) return;
    const pb = phrasebookLookup(i18n, heard, toLang, fromLang);
    setReplyOut(pb || (await translate(heard, 'auto', fromLang)));
  }

  // Chip lingua (disabilita quando coincide con l’altra)
  function LangChip({ code, active, disabled, onPress }:
    { code: Lang; active: boolean; disabled?: boolean; onPress: () => void }) {
    return (
      <Pressable
        disabled={!!disabled}
        onPress={onPress}
        style={[styles.langChip, active && styles.langActive, disabled && styles.langDisabled]}
      >
        <Text style={[styles.langText, active && styles.langTextActive, disabled && styles.langTextMuted]}>
          {code.toUpperCase()}
        </Text>
      </Pressable>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 28 }}>
      <Text style={styles.pageTitle}>{t('phrases.title', { defaultValue: 'Frasi Utili' })}</Text>

      {/* Sezione: Lingue */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('phrases.fromLang', { defaultValue: 'Lingua utente' })}</Text>
          <Pressable onPress={swapLangs} style={styles.swapBtn}>
            <Text style={styles.swapText}>{fromLang.toUpperCase()} ⇄ {toLang.toUpperCase()}</Text>
            <Ionicons name="swap-horizontal" size={18} color="#0A84FF" />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {LANGS.map(l => (
            <LangChip key={'from-'+l} code={l} active={fromLang===l} disabled={toLang===l} onPress={() => setFromLang(l)} />
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { marginTop: 4 }]}>
          {t('phrases.toLang', { defaultValue: 'Lingua destinazione' })}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {LANGS.map(l => (
            <LangChip key={'to-'+l} code={l} active={toLang===l} disabled={fromLang===l} onPress={() => setToLang(l)} />
          ))}
        </ScrollView>
      </View>

      {/* Sezione: Traduttore */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('phrases.usefulTitle', { defaultValue: 'Traduttore' })}</Text>

        <View style={styles.freeBox}>
          <TextInput
            value={freeIn}
            onChangeText={setFreeIn}
            placeholder={t('phrases.free.placeholder', { defaultValue: 'Scrivi qui…' })}
            style={styles.input}
            multiline
          />

          <View style={styles.freeActions}>
            {/* Mic domanda (from) */}
            <Pressable
              onPress={sttAsk.isRecording ? stopAskDictation : startAskDictation}
              disabled={!sttAsk.available}
              style={[styles.btnGhost, !sttAsk.available && styles.btnDisabled]}
            >
              <Ionicons name={sttAsk.isRecording ? 'stop' : 'mic'} size={18} color={sttAsk.available ? '#0A84FF' : '#94A3B8'} />
              <Text style={[styles.btnGhostText, !sttAsk.available && { color: '#94A3B8' }]}>{fromLang.toUpperCase()}</Text>
            </Pressable>

            {/* Traduci → toLang */}
            <Pressable onPress={onTranslateFree} style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>{t('phrases.free.translate', { defaultValue: 'Traduci' })}</Text>
            </Pressable>

            {/* TTS: priorità al tradotto; se manca, parla l’originale */}
            <Pressable onPress={() => onSpeak(freeOut)} style={styles.btnGhost}>
              <Ionicons name="volume-high" size={18} color="#0A84FF" />
              <Text style={styles.btnGhostText}>{toLang.toUpperCase()}</Text>
            </Pressable>
          </View>

          {!!freeOut && (
            <View style={styles.outputBubble}>
              <Text selectable style={styles.outputText}>{freeOut}</Text>
            </View>
          )}

          {/* Ascolta risposta (to → from) */}
          <View style={[styles.freeActions, { marginTop: 6 }]}>
            <Pressable
              onPress={sttReply.isRecording ? stopReplyListen : startReplyListen}
              disabled={!sttReply.available}
              style={[styles.btnGhost, !sttReply.available && styles.btnDisabled]}
            >
              <Ionicons name={sttReply.isRecording ? 'stop' : 'mic'} size={18} color={sttReply.available ? '#0A84FF' : '#94A3B8'} />
              <Text style={[styles.btnGhostText, !sttReply.available && { color: '#94A3B8' }]}>{toLang.toUpperCase()}</Text>
            </Pressable>

            <View style={{ flex: 1 }}>
              {!!replyOut && (
                <View style={[styles.outputBubble, { marginTop: 0 }]}>
                  <Text selectable style={styles.outputText}>{replyOut}</Text>
                  <Text style={styles.replyNote}>{toLang.toUpperCase()} → {fromLang.toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>

          {(!sttAsk.available || !sttReply.available) && (
            <Text style={styles.muted}>
              Il microfono per dettatura richiede un development build con “react-native-voice”. In Expo Go i pulsanti sono disabilitati.
            </Text>
          )}
        </View>
      </View>

      {/* Sezione: Categorie */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('phrases.usefulTitle', { defaultValue: 'Frasi per categorie' })}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
          {CATS.map(k => (
            <Pressable key={k} onPress={() => setCat(k)} style={[styles.catChip, cat === k && styles.catActive]}>
              <Text style={[styles.catText, cat === k && styles.catTextActive]}>{t(`phrases.cat.${k}`)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Elenco frasi */}
        <View style={{ gap: 10 }}>
          {items.map(it => {
            const active = playingId === it.to || playingId === it.from;
            return (
              <View key={it.id} style={[styles.card, active && styles.cardActive]}>
                {/* TTS a sinistra, a tutta altezza */}
                <Pressable onPress={() => onSpeak(it.to)} style={styles.ttsBtn}>
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Ionicons name="play" size={18} color="#111" />
                    <Text style={styles.ttsCode}>{toLang.toUpperCase()}</Text>
                  </View>
                </Pressable>

                <View style={{ flex: 1 }}>
                  <Text selectable style={styles.lineFrom}>{it.from}</Text>
                  <Text selectable style={styles.lineTo}>{it.to}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function langToBcp47(l: Lang) {
  switch (l) {
    case 'it': return 'it-IT';
    case 'en': return 'en-US';
    case 'es': return 'es-ES';
    case 'de': return 'de-DE';
    case 'fr': return 'fr-FR';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8F9FA' },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 8 },

  section: { marginTop: 6, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontWeight: '700', color: '#111', marginBottom: 6, fontSize: 16 },

  // Lingue
  langChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#0A84FF', backgroundColor: '#fff', marginRight: 8 },
  langActive: { backgroundColor: '#0A84FF' },
  langDisabled: { opacity: 0.4 },
  langText: { color: '#0A84FF', fontWeight: '700' },
  langTextActive: { color: '#fff', fontWeight: '700' },
  langTextMuted: { color: '#64748B' },
  swapBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#0A84FF', backgroundColor: '#fff' },
  swapText: { color: '#0A84FF', fontWeight: '700' },

  // Traduttore
  freeBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 10 },
  input: { minHeight: 60, fontSize: 16, color: '#111' },
  freeActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  btnPrimary: { backgroundColor: '#0A84FF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnGhost: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#0A84FF', backgroundColor: '#fff' },
  btnGhostText: { color: '#0A84FF', fontWeight: '700' },
  btnDisabled: { borderColor: '#CBD5E1' },
  outputBubble: { marginTop: 8, backgroundColor: '#F1F5F9', borderRadius: 10, padding: 10 },
  outputText: { color: '#111', fontSize: 16 },
  replyNote: { marginTop: 6, color: '#64748B', fontSize: 12 },
  muted: { marginTop: 6, color: '#64748B' },

  // Categorie + cards
  catChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#0A84FF', backgroundColor: '#fff', marginRight: 8 },
  catActive: { backgroundColor: '#0A84FF' },
  catText: { color: '#0A84FF', fontWeight: '700' },
  catTextActive: { color: '#fff', fontWeight: '700' },

  card: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 12, alignItems: 'stretch' },
  cardActive: { borderColor: '#0A84FF', borderWidth: 2, shadowColor: '#0A84FF', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },

  ttsBtn: { width: 72, borderRadius: 12, backgroundColor: '#F1F5F9', alignSelf: 'stretch' },
  ttsCode: { fontSize: 12, color: '#111', fontWeight: '700' },

  lineFrom: { fontSize: 16, color: '#111', fontWeight: '700' },
  lineTo: { fontSize: 14, color: '#4B5563', marginTop: 2 },
});

