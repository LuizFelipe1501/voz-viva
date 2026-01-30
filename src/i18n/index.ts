import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ptBR } from './translations/pt-BR';
import { enUS } from './translations/en-US';
import { esES } from './translations/es-ES';
import { frFR } from './translations/fr-FR';

const LANGUAGE_KEY = 'ouvidoria-language';

const savedLanguage = localStorage.getItem(LANGUAGE_KEY) || 'pt-BR';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
      'es-ES': { translation: esES },
      'fr-FR': { translation: frFR },
    },
    lng: savedLanguage,
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (lang: string) => {
  localStorage.setItem(LANGUAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export default i18n;
