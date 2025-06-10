
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { EMOJIS } from '../constants';
import { ToolbarButton } from './ToolbarButton';
import {
  BoldIcon, ItalicIcon, LinkIcon, ListUnorderedIcon, ListOrderedIcon,
  CodeIcon, QuoteIcon, ImageIcon, HorizontalRuleIcon, EyeIcon, CodeSimpleIcon,
} from './icons';
import { useTranslation } from '../hooks/useTranslation';

declare var marked: any;
declare var TurndownService: any;

interface MarkdownEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
}

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type EditingMode = 'raw' | 'visual';

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialContent, onContentChange }) => {
  const { t } = useTranslation();
  const [markdownContent, setMarkdownContent] = useState<string>(initialContent);
  const [editingMode, setEditingMode] = useState<EditingMode>('raw');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const [rawSelection, setRawSelection] = useState<{ start: number; end: number } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  
  const turndownServiceRef = useRef<any | null>(null);

  useEffect(() => {
    if (typeof TurndownService !== 'undefined') {
      turndownServiceRef.current = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    } else {
      console.error("TurndownService is not loaded. Visual mode editing may not work correctly.");
    }
  }, []);

  useEffect(() => {
    onContentChange(markdownContent);
  }, [markdownContent, onContentChange]);

   useEffect(() => {
    if (initialContent !== markdownContent) {
     setMarkdownContent(initialContent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent]); 

  useEffect(() => {
    if (editingMode === 'raw' && textareaRef.current) {
      if (textareaRef.current.value !== markdownContent) {
        const currentSelectionStart = textareaRef.current.selectionStart;
        const currentSelectionEnd = textareaRef.current.selectionEnd;
        textareaRef.current.value = markdownContent;
        if (document.activeElement === textareaRef.current) {
             textareaRef.current.setSelectionRange(currentSelectionStart, currentSelectionEnd);
        }
      }
    } else if (editingMode === 'visual' && visualEditorRef.current && typeof marked !== 'undefined') {
      const newHtml = marked.parse(markdownContent);
      if (visualEditorRef.current.innerHTML !== newHtml) {
        visualEditorRef.current.innerHTML = newHtml;
      }
    }
  }, [markdownContent, editingMode]);

  useEffect(() => {
    if (editingMode === 'raw' && textareaRef.current && rawSelection && document.activeElement === textareaRef.current) {
      textareaRef.current.setSelectionRange(rawSelection.start, rawSelection.end);
      setRawSelection(null); 
    }
  }, [rawSelection, editingMode]);


  const syncVisualToMarkdown = useCallback(() => {
    if (visualEditorRef.current && turndownServiceRef.current) {
      const html = visualEditorRef.current.innerHTML;
      const md = turndownServiceRef.current.turndown(html);
      setMarkdownContent(md);
    }
  }, []);

  const handleRawEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdownContent(e.target.value);
  };

  const handleRawEditorSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setRawSelection({ start: target.selectionStart, end: target.selectionEnd });
  };
  
  const handleVisualEditorInput = useCallback(() => {
    syncVisualToMarkdown();
  }, [syncVisualToMarkdown]);


  const applyRawFormat = useCallback((
    callback: (currentValue: string, selStart: number, selEnd: number) => { newValue: string; newStart: number; newEnd: number }
  ) => {
    if (!textareaRef.current) return;
    const { value, selectionStart, selectionEnd } = textareaRef.current;
    const { newValue, newStart, newEnd } = callback(value, selectionStart, selectionEnd);
    setMarkdownContent(newValue);
    textareaRef.current.focus();
    setRawSelection({ start: newStart, end: newEnd });
  }, []);

  const execVisualCommand = (command: string, value?: string) => {
    if (!visualEditorRef.current) return;
    visualEditorRef.current.focus();
    document.execCommand(command, false, value);
    syncVisualToMarkdown();
  };

  const insertVisualHTML = (html: string) => {
    execVisualCommand('insertHTML', html);
  }

  const toggleMode = () => {
    setEditingMode(prevMode => {
      const newMode = prevMode === 'raw' ? 'visual' : 'raw';
      if (newMode === 'visual' && visualEditorRef.current && typeof marked !== 'undefined') {
        visualEditorRef.current.innerHTML = marked.parse(markdownContent);
      } else if (newMode === 'raw' && textareaRef.current) {
        textareaRef.current.value = markdownContent;
      }
      return newMode;
    });
  };

  const handleBold = () => {
    if (editingMode === 'raw') {
      applyRawFormat((val, start, end) => {
        const selectedText = val.substring(start, end);
        const newText = `${val.substring(0, start)}**${selectedText}**${val.substring(end)}`;
        return { newValue: newText, newStart: start + 2, newEnd: start + 2 + selectedText.length };
      });
    } else {
      execVisualCommand('bold');
    }
  };

  const handleItalic = () => {
    if (editingMode === 'raw') {
      applyRawFormat((val, start, end) => {
        const selectedText = val.substring(start, end);
        const newText = `${val.substring(0, start)}*${selectedText}*${val.substring(end)}`;
        return { newValue: newText, newStart: start + 1, newEnd: start + 1 + selectedText.length };
      });
    } else {
      execVisualCommand('italic');
    }
  };
  
  const handleHeading = (level: HeadingLevel) => {
    if (editingMode === 'raw') {
      const prefix = '#'.repeat(level) + ' ';
      applyRawFormat((val, start, _end) => {
        let lineStart = val.lastIndexOf('\n', start -1) + 1;
        let lineEnd = val.indexOf('\n', start);
        if (lineEnd === -1) lineEnd = val.length;
        
        let currentLine = val.substring(lineStart, lineEnd);
        currentLine = currentLine.replace(/^#+\s*/, '');
        const newLine = prefix + currentLine;
        
        const newValue = val.substring(0, lineStart) + newLine + val.substring(lineEnd);
        const newCursorPos = lineStart + newLine.length;
        return { newValue, newStart: newCursorPos, newEnd: newCursorPos };
      });
    } else {
      execVisualCommand('formatBlock', `<h${level}>`);
    }
  };

  const handleLink = () => {
    const url = prompt(t('linkUrlPrompt'), 'https://');
    if (!url) return;

    if (editingMode === 'raw') {
      applyRawFormat((val, start, end) => {
        const selectedText = val.substring(start, end) || t('linkDefaultText');
        const linkText = `[${selectedText}](${url})`;
        const newText = `${val.substring(0, start)}${linkText}${val.substring(end)}`;
        return { newValue: newText, newStart: start + 1, newEnd: start + 1 + selectedText.length };
      });
    } else {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === "") {
        const linkText = prompt(t('linkDefaultText') + ':', t('linkDefaultText'));
        if (linkText) {
          insertVisualHTML(`<a href="${url}" target="_blank">${linkText}</a>`);
        }
      } else {
         execVisualCommand('createLink', url);
      }
    }
  };
  
  const handleImage = () => {
    const url = prompt(t('imageUrlPrompt'), 'https://picsum.photos/200');
    if (!url) return;
    const altText = prompt(t('imageDefaultAlt') + ':', t('imageDefaultAlt'));

    if (editingMode === 'raw') {
      applyRawFormat((val, start, _end) => {
        const imgText = `![${altText || t('imageDefaultAlt')}](${url})\n`;
        const newText = `${val.substring(0, start)}${imgText}${val.substring(start)}`;
        const newCursorPos = start + imgText.length;
        return { newValue: newText, newStart: newCursorPos, newEnd: newCursorPos };
      });
    } else {
      insertVisualHTML(`<img src="${url}" alt="${altText || t('imageDefaultAlt')}">`);
    }
  };

  const handleUnorderedList = () => {
    if (editingMode === 'raw') {
       applyRawFormat((val, start, end) => {
        const selection = val.substring(start, end);
        if (selection.includes('\n')) { // Multi-line selection
          const lines = selection.split('\n');
          const newLines = lines.map(line => `- ${line}`).join('\n');
          const newValue = val.substring(0, start) + newLines + val.substring(end);
          return { newValue, newStart: start, newEnd: start + newLines.length };
        } else { // Single line or no selection
          let lineStart = val.lastIndexOf('\n', start - 1) + 1;
          const prefix = '- ';
          const indentedText = prefix + val.substring(lineStart, end);
          const newValue = val.substring(0, lineStart) + indentedText + val.substring(end);
          return { newValue, newStart: lineStart + prefix.length, newEnd: lineStart + indentedText.length };
        }
      });
    } else {
      execVisualCommand('insertUnorderedList');
    }
  };

  const handleOrderedList = () => {
     if (editingMode === 'raw') {
      applyRawFormat((val, start, end) => {
        const selection = val.substring(start, end);
        if (selection.includes('\n')) { // Multi-line selection
          const lines = selection.split('\n');
          const newLines = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
          const newValue = val.substring(0, start) + newLines + val.substring(end);
          return { newValue, newStart: start, newEnd: start + newLines.length };
        } else { // Single line or no selection
          let lineStart = val.lastIndexOf('\n', start - 1) + 1;
          const prefix = '1. ';
          const indentedText = prefix + val.substring(lineStart, end);
          const newValue = val.substring(0, lineStart) + indentedText + val.substring(end);
          return { newValue, newStart: lineStart + prefix.length, newEnd: lineStart + indentedText.length };
        }
      });
    } else {
      execVisualCommand('insertOrderedList');
    }
  };

  const handleCodeBlock = () => {
    if (editingMode === 'raw') {
      applyRawFormat((val, start, end) => {
        const selectedText = val.substring(start, end);
        if (selectedText.includes('\n') || start === end) { 
          const newText = `${val.substring(0, start)}\`\`\`\n${selectedText || t('codePlaceholder')}\n\`\`\`${val.substring(end)}`;
          return { newValue: newText, newStart: start + 4, newEnd: start + 4 + (selectedText || t('codePlaceholder')).length };
        } else { 
          const newText = `${val.substring(0, start)}\`${selectedText}\`${val.substring(end)}`;
          return { newValue: newText, newStart: start + 1, newEnd: start + 1 + selectedText.length };
        }
      });
    } else {
      const selection = window.getSelection();
      if (selection && (selection.toString().includes('\n') || selection.toString().trim() === '')) {
        insertVisualHTML(`<pre><code>${selection.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;") || t('codePlaceholder')}</code></pre>`);
      } else if (selection && selection.toString().length > 0) {
        insertVisualHTML(`<code>${selection.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`);
      } else {
        insertVisualHTML(`<pre><code>${t('codePlaceholder')}</code></pre>`);
      }
    }
  };
  
  const handleQuote = () => {
     if (editingMode === 'raw') {
      applyRawFormat((val, start, end) => {
        const selection = val.substring(start, end);
         if (selection.includes('\n')) { // Multi-line selection
          const lines = selection.split('\n');
          const newLines = lines.map(line => `> ${line}`).join('\n');
          const newValue = val.substring(0, start) + newLines + val.substring(end);
          return { newValue, newStart: start, newEnd: start + newLines.length };
        } else { // Single line or no selection
          let lineStart = val.lastIndexOf('\n', start - 1) + 1;
          const prefix = '> ';
          const indentedText = prefix + (selection || val.substring(lineStart, end));
          const newValue = val.substring(0, lineStart) + indentedText + (selection ? val.substring(end) : val.substring(lineStart === end ? end : Math.max(end, lineStart + (selection ? selection.length : 0) ) ) );

          return { newValue, newStart: lineStart + prefix.length, newEnd: lineStart + indentedText.length };
        }
      });
    } else {
      execVisualCommand('formatBlock', '<blockquote>');
    }
  };

  const handleHorizontalRule = () => {
    if (editingMode === 'raw') {
      applyRawFormat((val, start, _end) => {
        const hrText = (start === 0 || val[start-1] === '\n' ? '' : '\n') + '---\n';
        const newText = `${val.substring(0, start)}${hrText}${val.substring(start)}`;
        const newCursorPos = start + hrText.length;
        return { newValue: newText, newStart: newCursorPos, newEnd: newCursorPos };
      });
    } else {
      insertVisualHTML('<hr>');
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    if (editingMode === 'raw') {
      applyRawFormat((val, start, _end) => {
        const newText = `${val.substring(0, start)}${emoji}${val.substring(start)}`;
        const newCursorPos = start + emoji.length;
        return { newValue: newText, newStart: newCursorPos, newEnd: newCursorPos };
      });
    } else {
      execVisualCommand('insertText', emoji);
    }
    setShowEmojiPicker(false);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 flex flex-wrap gap-1.5 items-center relative transition-colors duration-300">
        <ToolbarButton 
          onClick={toggleMode} 
          title={editingMode === 'raw' ? t('rawModeTooltip') : t('visualModeTooltip')}
        >
          {editingMode === 'raw' ? <EyeIcon className="w-5 h-5" /> : <CodeSimpleIcon className="w-5 h-5" />}
        </ToolbarButton>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1 transition-colors duration-300"></div> 
        <ToolbarButton onClick={handleBold} title={t('boldTooltip')}><BoldIcon className="w-5 h-5" /></ToolbarButton>
        <ToolbarButton onClick={handleItalic} title={t('italicTooltip')}><ItalicIcon className="w-5 h-5" /></ToolbarButton>
        {[1, 2, 3].map(level => (
          <ToolbarButton key={level} onClick={() => handleHeading(level as HeadingLevel)} title={t('headingTooltip', level)}>
            <span className="font-semibold text-sm">H{level}</span>
          </ToolbarButton>
        ))}
        <ToolbarButton onClick={handleLink} title={t('linkTooltip')}><LinkIcon className="w-5 h-5" /></ToolbarButton>
        <ToolbarButton onClick={handleImage} title={t('imageTooltip')}><ImageIcon className="w-5 h-5" /></ToolbarButton>
        <ToolbarButton onClick={handleUnorderedList} title={t('ulTooltip')}><ListUnorderedIcon className="w-5 h-5" /></ToolbarButton>
        <ToolbarButton onClick={handleOrderedList} title={t('olTooltip')}><ListOrderedIcon className="w-5 h-5" /></ToolbarButton>
        <ToolbarButton onClick={handleCodeBlock} title={t('codeTooltip')}><CodeIcon className="w-5 h-5" /></ToolbarButton>
        <ToolbarButton onClick={handleQuote} title={t('quoteTooltip')}><QuoteIcon className="w-5 h-5" /></ToolbarButton>
        <ToolbarButton onClick={handleHorizontalRule} title={t('hrTooltip')}><HorizontalRuleIcon className="w-5 h-5" /></ToolbarButton>
        <div className="relative">
          <ToolbarButton onClick={() => setShowEmojiPicker(prev => !prev)} title={t('emojiTooltip')}>
            <span className="text-lg">😀</span>
          </ToolbarButton>
          {showEmojiPicker && (
            <div className="absolute z-20 top-full mt-2 right-0 bg-slate-50 dark:bg-slate-600 p-2 rounded-md shadow-lg grid grid-cols-6 gap-1 max-h-60 min-w-[220px] overflow-y-auto border border-slate-300 dark:border-slate-500 transition-colors duration-300">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji.symbol}
                  title={emoji.label} 
                  onClick={() => handleInsertEmoji(emoji.symbol)}
                  className="p-1.5 text-xl rounded hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors flex items-center justify-center"
                  aria-label={`Insert emoji: ${emoji.label}`}
                >
                  {emoji.symbol}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {editingMode === 'raw' && (
        <textarea
          ref={textareaRef}
          value={markdownContent}
          onChange={handleRawEditorChange}
          onSelect={handleRawEditorSelect}
          className="flex-grow p-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed font-mono text-sm selection:bg-sky-300 dark:selection:bg-sky-500 selection:text-black dark:selection:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-300"
          placeholder={t('markdownPlaceholder') || "Start typing your Markdown here..."}
          spellCheck="false"
          aria-label="Markdown Editor (Raw)"
        />
      )}
      {editingMode === 'visual' && (
         <div
            ref={visualEditorRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={handleVisualEditorInput}
            onBlur={syncVisualToMarkdown}
            className="ProseMirror" // Styles are in index.html
            aria-label="Markdown Editor (Visual)"
         />
      )}
    </div>
  );
};