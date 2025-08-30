import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import it from './locales/it.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import fr from './locales/fr.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: { it: { translation: it }, en: { translation: en }, es: { translation: es }, de: { translation: de }, fr: { translation: fr } },
    lng: 'it',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
