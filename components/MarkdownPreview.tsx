
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface MarkdownPreviewProps {
  markdown: string;
  onCopy: () => void;
  showCopiedMessage: boolean;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdown, onCopy, showCopiedMessage }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-grow p-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 overflow-auto transition-colors duration-300">
        <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
          {markdown || t('previewPlaceholder')}
        </pre>
      </div>
      <div className="p-3 bg-slate-100 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-600 flex justify-end items-center transition-colors duration-300">
        {showCopiedMessage && (
          <span className="text-sm text-green-500 dark:text-green-400 mr-3 transition-opacity duration-300">
            {t('copiedMessage')}
          </span>
        )}
        <button
          onClick={onCopy}
          disabled={!markdown}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow-md transition-colors duration-150 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('copyButton')}
        </button>
      </div>
    </div>
  );
};