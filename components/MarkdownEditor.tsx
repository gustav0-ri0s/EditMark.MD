
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { EMOJIS } from '../constants';
import { ToolbarButton } from './ToolbarButton';
import {
  BoldIcon, ItalicIcon, LinkIcon, ListUnorderedIcon, ListOrderedIcon,
  CodeIcon, QuoteIcon, ImageIcon, HorizontalRuleIcon, EyeIcon, CodeSimpleIcon,
  CopyIcon, // Added CopyIcon
} from './icons';
import { useTranslation } from '../hooks/useTranslation';

declare var marked: any;
declare var TurndownService: any;

interface MarkdownEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  onCopyContent: () => Promise<void>; // Renamed from onCopyRequest for clarity with App.tsx
  showCopiedMessage: boolean; // Renamed from isCopyInProgressOrDone
}

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type EditingMode = 'raw' | 'visual';

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  initialContent, 
  onContentChange,
  onCopyContent,
  showCopiedMessage
}) => {
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
    // Only update markdownContent from initialContent if they are different
    // This prevents resetting user input if initialContent reference changes but value is same
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
        // Restore selection only if the textarea is focused to avoid errors
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
    // Use a timeout to ensure the state update has propagated before setting selection
    setTimeout(() => {
       if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newStart, newEnd);
       }
    }, 0);
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
        // Ensure textarea value is updated if content changed in visual mode
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
        // Find end of the line cursor is on, or end of selection if multiline
        let searchPos = Math.max(start, _end);
        let lineEnd = val.indexOf('\n', searchPos);
        if (lineEnd === -1) lineEnd = val.length;
        
        let currentLine = val.substring(lineStart, lineEnd);
        // Remove existing heading prefix from the current line only
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
      let selectedText = selection ? selection.toString() : '';
      if (!selectedText.trim()) {
        selectedText = prompt(t('linkTextPrompt') || 'Enter link text:', t('linkDefaultText')) || t('linkDefaultText');
         if(selectedText) execVisualCommand('insertHTML', `<a href="${url}" target="_blank">${selectedText}</a>`);
      } else {
         execVisualCommand('createLink', url);
      }
    }
  };
  
  const handleImage = () => {
    const url = prompt(t('imageUrlPrompt'), 'https://picsum.photos/200');
    if (!url) return;
    const altText = prompt(t('imageAltPrompt') || t('imageDefaultAlt') + ':', t('imageDefaultAlt'));

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
        if (selection.includes('\n')) { 
          const lines = selection.split('\n');
          const newLines = lines.map(line => line.trim() === '' ? line : `- ${line}`).join('\n');
          const newValue = val.substring(0, start) + newLines + val.substring(end);
          return { newValue, newStart: start, newEnd: start + newLines.length };
        } else { 
          let lineStart = val.lastIndexOf('\n', start - 1) + 1;
          const currentLine = val.substring(lineStart, end);
          const prefix = '- ';
          const newTextForLine = prefix + currentLine;
          const newValue = val.substring(0, lineStart) + newTextForLine + val.substring(end);
          return { newValue, newStart: lineStart + prefix.length, newEnd: lineStart + newTextForLine.length };
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
        if (selection.includes('\n')) { 
          const lines = selection.split('\n');
          const newLines = lines.map((line, index) => line.trim() === '' ? line : `${index + 1}. ${line}`).join('\n');
          const newValue = val.substring(0, start) + newLines + val.substring(end);
          return { newValue, newStart: start, newEnd: start + newLines.length };
        } else { 
          let lineStart = val.lastIndexOf('\n', start - 1) + 1;
          const currentLine = val.substring(lineStart, end);
          const prefix = '1. ';
          const newTextForLine = prefix + currentLine;
          const newValue = val.substring(0, lineStart) + newTextForLine + val.substring(end);
          return { newValue, newStart: lineStart + prefix.length, newEnd: lineStart + newTextForLine.length };
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
        if (selectedText.includes('\n') || start === end || val.substring(val.lastIndexOf('\n', start -1)+1, start).trim() === '' ) { 
          const newText = `${val.substring(0, start)}\`\`\`\n${selectedText || t('codePlaceholder')}\n\`\`\`\n${val.substring(end)}`;
          return { newValue: newText, newStart: start + 4, newEnd: start + 4 + (selectedText || t('codePlaceholder')).length };
        } else { 
          const newText = `${val.substring(0, start)}\`${selectedText}\`${val.substring(end)}`;
          return { newValue: newText, newStart: start + 1, newEnd: start + 1 + selectedText.length };
        }
      });
    } else {
      const selection = window.getSelection();
      const selectedText = selection ? selection.toString() : '';
      if (selectedText.includes('\n') || selectedText.trim() === '') {
        insertVisualHTML(`<pre><code>${selectedText.replace(/</g, "&lt;").replace(/>/g, "&gt;") || t('codePlaceholder')}</code></pre>`);
      } else {
        insertVisualHTML(`<code>${selectedText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`);
      }
    }
  };
  
  const handleQuote = () => {
     if (editingMode === 'raw') {
      applyRawFormat((val, start, end) => {
        const selection = val.substring(start, end);
         if (selection.includes('\n')) { 
          const lines = selection.split('\n');
          const newLines = lines.map(line => line.trim() === '' ? line : `> ${line}`).join('\n');
          const newValue = val.substring(0, start) + newLines + val.substring(end);
          return { newValue, newStart: start, newEnd: start + newLines.length };
        } else { 
          let lineStart = val.lastIndexOf('\n', start - 1) + 1;
          const currentLineOriginal = val.substring(lineStart, end);
          const prefix = '> ';
          const newTextForLine = prefix + currentLineOriginal;
          const newValue = val.substring(0, lineStart) + newTextForLine + val.substring(end);
          return { newValue, newStart: lineStart + prefix.length, newEnd: lineStart + newTextForLine.length };
        }
      });
    } else {
      execVisualCommand('formatBlock', '<blockquote>');
    }
  };

  const handleHorizontalRule = () => {
    if (editingMode === 'raw') {
      applyRawFormat((val, start, _end) => {
        const prevChar = val[start-1];
        const needsNewlineBefore = start > 0 && prevChar !== '\n';
        const hrText = (needsNewlineBefore ? '\n' : '') + '---\n';
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
          title={editingMode === 'raw' ? t('visualModeTooltip') : t('rawModeTooltip')} /* Corrected tooltip logic */
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
         {/* Copy Button Section */}
        <div className="ml-auto flex items-center pl-2 space-x-2">
            {showCopiedMessage && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
                {t('copiedMessage')}
            </span>
            )}
            <ToolbarButton
                onClick={onCopyContent}
                title={t('copyButton')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
                <CopyIcon className="w-5 h-5" />
            </ToolbarButton>
        </div>
      </div>
      
      {editingMode === 'raw' && (
        <textarea
          ref={textareaRef}
          value={markdownContent} /* Controlled component */
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
            onBlur={syncVisualToMarkdown} // Sync on blur to catch any final changes
            className="ProseMirror" // Styles are in index.html
            aria-label="Markdown Editor (Visual)"
         />
      )}
    </div>
  );
};