import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

// Ensure marked is declared as it's loaded globally via CDN
declare var marked: any;

interface MarkdownPreviewProps {
  markdown: string;
  // onCopy and showCopiedMessage are removed
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdown }) => {
  const { t } = useTranslation(); // t might still be used for error messages or future additions

  const parsedHtml = React.useMemo(() => {
    if (!markdown) {
      return '';
    }
    if (typeof marked === 'undefined' || typeof marked.parse !== 'function') {
      console.warn('marked.js is not loaded. Preview will show raw markdown as fallback.');
      const escapedMarkdown = markdown.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre style="white-space: pre-wrap; word-break: break-word; font-family: monospace; font-size: 0.875rem;">${escapedMarkdown}</pre>`;
    }
    try {
      return marked.parse(markdown);
    } catch (error) {
      console.error("Error parsing markdown:", error);
      const escapedMarkdown = markdown.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      // Use translation for user-facing error part
      return `<p>${t('previewErrorText') || 'Error rendering preview. Raw content:'}</p><pre style="white-space: pre-wrap; word-break: break-word; font-family: monospace; font-size: 0.875rem;">${escapedMarkdown}</pre>`;
    }
  }, [markdown, t]);

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-grow overflow-auto ProseMirror p-4" // Added p-4 for consistency if footer is removed
        dangerouslySetInnerHTML={{ __html: parsedHtml }}
        aria-live="polite" // Announce changes to screen readers
      />
      {/* Footer with copy button removed */}
    </div>
  );
};