import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageLoader() {
  const { i18n } = useTranslation();

  useEffect(() => {
    fetch('http://localhost:3000/api/setup')
      .then(res => res.json())
      .then(data => {
        const lang = data.language || 'en';
        i18n.changeLanguage(lang);
      })
      .catch(() => {
        i18n.changeLanguage('en'); // Fallback
      });
  }, [i18n]);

  return null; // Rendert nichts sichtbar
}

