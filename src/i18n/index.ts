import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import rw from '../locales/rw.json';
import fr from '../locales/fr.json';

const LANGUAGE_STORAGE_KEY = '@app_language';

const resources = {
  en: { translation: en },
  rw: { translation: rw },
  fr: { translation: fr },
};

const getDeviceLanguage = (): string => {
  try {
    const locales = RNLocalize.getLocales();
    if (locales.length > 0) {
      const languageCode = locales[0].languageCode;
      if (languageCode === 'rw' || languageCode === 'fr') {
        return languageCode;
      }
    }
  } catch (error) {
    console.log('Failed to get device language:', error);
  }
  return 'en';
};

// Initialize i18n synchronously BEFORE exporting
// This ensures i18n is ready when any component tries to use it
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    initImmediate: false, // Force synchronous initialization
  });

console.log('i18n initialized:', i18n.isInitialized);

// This function will be called by the app after initialization
export const initializeLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
    } else {
      // Try to use device language
      const deviceLanguage = getDeviceLanguage();
      if (deviceLanguage !== 'en') {
        await i18n.changeLanguage(deviceLanguage);
      }
    }
  } catch (error) {
    console.log('Failed to load saved language:', error);
  }
};

export const changeLanguage = async (language: string) => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  i18n.changeLanguage(language);
};

export const getCurrentLanguage = () => i18n.language;

export default i18n;
