import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Localization from 'expo-localization';
import { getUserLang, setUserLang, getDestLang, setDestLang } from '../lib/settings';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const defaultLang = (Localization as any)?.getLocales?.()?.[0]?.languageCode || 'en';

  const [email, setEmail] = useState('');
  const [userLang, setUL] = useState(defaultLang);
  const [destLang, setDL] = useState(defaultLang);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setUL(await getUserLang(defaultLang));
      setDL(await getDestLang(defaultLang));
    })();
  }, []);

  async function save() {
    try {
      setSaving(true);
      await setUserLang(userLang);
      await setDestLang(destLang);
      await i18n.changeLanguage(userLang);
      Alert.alert(t('profile.saved'));
    } finally { setSaving(false); }
  }

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:'700', marginBottom:12 }}>{t('profile.title')}</Text>

      <Text style={{ fontWeight:'600' }}>{t('profile.email')}</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com"
        autoCapitalize="none" keyboardType="email-address"
        style={{ borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10, marginBottom:12 }} />

      <Text style={{ fontWeight:'600' }}>{t('profile.language')}</Text>
      <TextInput value={userLang} onChangeText={setUL} placeholder="it/en/es/de/fr"
        style={{ borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10, marginBottom:12 }} />

      <Text style={{ fontWeight:'600' }}>{t('profile.destinationLanguage')}</Text>
      <TextInput value={destLang} onChangeText={setDL} placeholder="it/en/es/de/fr"
        style={{ borderWidth:1,borderColor:'#ddd',borderRadius:8,padding:10, marginBottom:16 }} />

      <Pressable onPress={save} disabled={saving}
        style={{ backgroundColor:'#0A84FF', padding:12, borderRadius:10, opacity: saving?0.6:1 }}>
        <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>{t('profile.save')}</Text>
      </Pressable>
    </View>
  );
}
