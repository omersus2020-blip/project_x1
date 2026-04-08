import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
// Optional: import * as Updates from 'expo-updates';

import en from './translations/en.json';
import he from './translations/he.json';
import ar from './translations/ar.json';

// Define the available languages
export const resources = {
  en: { translation: en },
  he: { translation: he },
  ar: { translation: ar },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already inherently protects from XSS
    },
  });

/**
 * Changes the app language and forces RTL/LTR layout changes natively.
 * @param lang - the language code ('en', 'he', 'ar')
 */
export const changeAppLanguage = (lang: string) => {
  return i18n.changeLanguage(lang).then(() => {
    const isRtl = lang === 'he' || lang === 'ar';
    
    if (I18nManager.isRTL !== isRtl) {
      I18nManager.allowRTL(isRtl);
      I18nManager.forceRTL(isRtl);
      
      // Changing native RTL usually requires a full app reload on Android/iOS
      // If you add expo-updates later, uncomment:
      // Updates.reloadAsync();
    }
  });
};

export default i18n;
