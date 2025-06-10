
import { useContext } from 'react';
import { LanguageContext, LanguageCode } from '../contexts/LanguageContext';
import { es, en, TranslationKeys, TranslationKey } from '../locales';

const translations: Record<LanguageCode, TranslationKeys> = {
  es,
  en,
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  const { language, setLanguage } = context;

  const t = (key: TranslationKey, ...args: any[]): string => {
    const translationSet = translations[language];
    // Ensure the key exists, otherwise TypeScript might not catch if TranslationKey is too broad
    if (!Object.prototype.hasOwnProperty.call(translationSet, key)) {
      console.warn(`Translation key "${key}" not found for language "${language}".`);
      return key; // Return the key itself as a fallback
    }
    
    const value = translationSet[key as keyof TranslationKeys]; // Type assertion after check

    if (typeof value === 'function') {
      return (value as (...a: any[]) => string)(...args);
    }
    return value as string;
  };

  return { t, setLanguage, currentLanguage: language };
};
