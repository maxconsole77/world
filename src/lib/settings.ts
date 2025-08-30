// src/lib/settings.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const K = {
  USER_LANG: 'world:userLang',
  DEST_LANG: 'world:destLang',
};

export async function getUserLang(defaultLang: string): Promise<string> {
  return (await AsyncStorage.getItem(K.USER_LANG)) || defaultLang;
}
export async function setUserLang(lang: string) {
  await AsyncStorage.setItem(K.USER_LANG, lang);
}

export async function getDestLang(defaultLang: string): Promise<string> {
  return (await AsyncStorage.getItem(K.DEST_LANG)) || defaultLang;
}
export async function setDestLang(lang: string) {
  await AsyncStorage.setItem(K.DEST_LANG, lang);
}
