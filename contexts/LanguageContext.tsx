
import React, { createContext, useState, ReactNode } from 'react';

export type LanguageCode = 'es' | 'en';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: LanguageCode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, defaultLanguage = 'es' }) => {
  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};