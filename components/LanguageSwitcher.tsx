
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageCode } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { setLanguage, currentLanguage, t } = useTranslation();

  const languages: { code: LanguageCode; label: string; flag: string, titleKey: ReturnType<typeof t> }[] = [
    { code: 'es', label: 'ES', flag: '🇵🇪', titleKey: 'switchToSpanish' },
    { code: 'en', label: 'EN', flag: '🇬🇧', titleKey: 'switchToEnglish' },
  ];

  return (
    <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-full shadow-md transition-colors duration-300">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          title={t(lang.titleKey as any)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-colors duration-200
            ${currentLanguage === lang.code
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-slate-100'
            }`}
          aria-pressed={currentLanguage === lang.code}
        >
          <span role="img" aria-label={`${lang.label} flag`}>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
};