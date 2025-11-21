import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, initializeLanguage } from '../i18n';

type Language = 'en' | 'rw' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage() as Language);

  useEffect(() => {
    // Initialize language from storage on mount
    initializeLanguage().then(() => {
      setLanguageState(i18n.language as Language);
    });
  }, []);

  useEffect(() => {
    setLanguageState(i18n.language as Language);
  }, [i18n.language]);

  const setLanguage = async (newLanguage: Language) => {
    await changeLanguage(newLanguage);
    setLanguageState(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
