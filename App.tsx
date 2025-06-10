
import React, { useState, useCallback, useEffect } from 'react';
import { MarkdownEditor } from './components/MarkdownEditor';
import { MarkdownPreview } from './components/MarkdownPreview';
import { GithubIcon } from './components/icons';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { useTranslation } from './hooks/useTranslation';

const App: React.FC = () => {
  const { t } = useTranslation();

  const getDefaultReadmeContent = () => `
# ${t('appTitle')}

${t('appSubtitle')}

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install my-project
\`\`\`

## Usage

\`\`\`javascript
// Code example
const project = require('my-project');
project.doSomething();
\`\`\`

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
`;

  const [editorContent, setEditorContent] = useState<string>(() => getDefaultReadmeContent());
  const [finalMarkdown, setFinalMarkdown] = useState<string>('');
  const [showCopiedMessage, setShowCopiedMessage] = useState<boolean>(false);
  
  useEffect(() => {
     setEditorContent(prevContent => {
        const currentDefaultTitle = t('appTitle'); 
        const isDefaultContent = prevContent.includes("# My Awesome Project") || // old en default
                                 prevContent.includes("# Generador README.md") || // old es default
                                 prevContent.trim() === getDefaultReadmeContent().trim() || // current default
                                 prevContent.includes(currentDefaultTitle); // check if title matches current lang's default title

        if (isDefaultContent) {
          return getDefaultReadmeContent();
        }
        return prevContent;
     });
     if (finalMarkdown.includes("My Awesome Project") || finalMarkdown.includes("Generador README.md")) {
        setFinalMarkdown(""); 
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);


  const handleGenerateMarkdown = useCallback(() => {
    setFinalMarkdown(editorContent);
  }, [editorContent]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!finalMarkdown) return;
    try {
      await navigator.clipboard.writeText(finalMarkdown);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text. See console for details.');
    }
  }, [finalMarkdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col relative transition-colors duration-300">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-30 flex items-center space-x-2">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <header className="mb-6 text-center pt-12 sm:pt-10 lg:pt-8">
        <div className="flex items-center justify-center space-x-3">
          <GithubIcon className="w-10 h-10 text-sky-500 dark:text-sky-400" />
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-cyan-400 dark:from-sky-400 dark:to-cyan-300">
            {t('appTitle')}
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">
          {t('appSubtitle')}
        </p>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col bg-white dark:bg-slate-800 shadow-2xl rounded-lg overflow-hidden transition-colors duration-300">
          <h2 className="text-xl font-semibold p-4 bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-colors duration-300">{t('editorTitle')}</h2>
          <MarkdownEditor
            initialContent={editorContent}
            onContentChange={setEditorContent}
          />
        </div>

        <div className="flex flex-col bg-white dark:bg-slate-800 shadow-2xl rounded-lg overflow-hidden transition-colors duration-300">
          <div className="flex justify-between items-center p-4 bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-colors duration-300">
            <h2 className="text-xl font-semibold">{t('previewTitle')}</h2>
            <button
              onClick={handleGenerateMarkdown}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md shadow-md transition-colors duration-150 text-sm"
            >
              {t('generateButton')}
            </button>
          </div>
          {finalMarkdown ? (
            <MarkdownPreview markdown={finalMarkdown} onCopy={handleCopyToClipboard} showCopiedMessage={showCopiedMessage} />
          ) : (
            <div className="p-6 text-slate-500 dark:text-slate-400 flex-grow flex items-center justify-center transition-colors duration-300">
              <p>{t('previewPlaceholder')}</p>
            </div>
          )}
        </div>
      </div>
      <footer className="text-center text-xs text-slate-500 dark:text-slate-500 pt-8 transition-colors duration-300">
        <p>{t('footerText')}</p>
        <p className="mt-1">
          {t('createdBy')}{' '}
          <a
            href="https://github.com/gustav0-ri0s/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-150"
          >
            <GithubIcon className="w-3 h-3 mr-1" />
            gustav0-ri0s
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
