import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationDE from './locales/de.json';
import translationEN from './locales/en.json';

i18n
  .use(initReactI18next) // bind react-i18next to i18next
  .init({
    resources: {
      de: { translation: translationDE },
      en: { translation: translationEN }
    },
    lng: 'en',           // Default-Sprache (wird später von LanguageLoader überschrieben)
    fallbackLng: 'en',   // Fallback, falls Übersetzung fehlt
    interpolation: {
      escapeValue: false // React escaped bereits automatisch
    }
  });

export default i18n;

