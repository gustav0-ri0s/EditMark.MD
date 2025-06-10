
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? t('themeToggleLight') : t('themeToggleDark')}
      aria-label={isDark ? t('themeToggleLight') : t('themeToggleDark')}
      className="p-2.5 rounded-full flex items-center justify-center transition-all duration-300 
                 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-700 dark:hover:bg-slate-600/80 
                 text-slate-600 dark:text-slate-300 shadow-md"
    >
      {isDark ? (
        <SunIcon className="w-5 h-5 text-yellow-400" />
      ) : (
        <MoonIcon className="w-5 h-5 text-indigo-400" />
      )}
    </button>
  );
};
