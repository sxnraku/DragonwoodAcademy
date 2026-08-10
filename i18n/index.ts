import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Language, SavedGame } from '../types';
import { loadGame, saveGame } from '../services/storageService';
import enTranslations from './locales/en.json';
import ptBrTranslations from './locales/pt-BR.json';
import ptPtTranslations from './locales/pt-PT.json';

const LOCALES: Record<Language, Record<string, string>> = {
  'en': enTranslations,
  'pt-BR': ptBrTranslations,
  'pt-PT': ptPtTranslations,
};

interface LocalizationContextType {
  language: Language;
  t: (key: string, options?: Record<string, string | number>) => string;
  changeLanguage: (lang: Language) => void;
  isLocalizationLoaded: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt-PT');
  const [translations, setTranslations] = useState<Record<string, string>>(ptPtTranslations);
  const [isLocalizationLoaded, setIsLocalizationLoaded] = useState(true);

  const loadTranslationsForLanguage = useCallback((lang: Language) => {
    const selectedLocale = LOCALES[lang] || LOCALES['pt-PT'] || LOCALES['en'];
    setTranslations(selectedLocale);
    setLanguage(lang);
    setIsLocalizationLoaded(true);
  }, []);

  useEffect(() => {
    const savedGame = loadGame();
    const initialLang = savedGame?.language || 'pt-PT';
    loadTranslationsForLanguage(initialLang);
  }, [loadTranslationsForLanguage]);

  const changeLanguage = (lang: Language) => {
    loadTranslationsForLanguage(lang);
    const savedGame = loadGame();
    if (savedGame) {
      saveGame({ ...savedGame, language: lang });
    }
  };

  const t = useCallback((key: string, options?: Record<string, string | number>) => {
    if (!translations) return key;
    let translation = translations[key] || key;
    if (options) {
      Object.keys(options).forEach(optionKey => {
        translation = translation.replace(`{${optionKey}}`, String(options[optionKey]));
      });
    }
    return translation;
  }, [translations]);

  const value = { language, t, changeLanguage, isLocalizationLoaded };

  return React.createElement(
    LocalizationContext.Provider,
    { value },
    children
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

