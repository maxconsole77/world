import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import it from '../locales/it.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';

const locales = (Localization as any)?.getLocales?.() ?? [];
const primary = locales[0];

const detectedLang =
  primary?.languageCode ||
  primary?.languageTag?.split?.('-')?.[0] ||
  (Localization as any)?.locale?.split?.('-')?.[0] ||
  'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it as any },
      en: { translation: en as any },
      es: { translation: es as any },
      de: { translation: de as any },
      fr: { translation: fr as any }
    },
    lng: detectedLang || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },

    // 🔧 Fix web: niente Suspense, init sincrono
    react: { useSuspense: false },
    initImmediate: false
  });

export default i18n;

