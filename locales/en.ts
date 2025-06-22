
import { TranslationKeys } from './es'; // Import the type

export const en: TranslationKeys = {
  // App.tsx
  appTitle: "README.md Generator",
  appSubtitle: "Craft your project's README with ease. Use the editor tools and then generate Markdown to copy.",
  editorTitle: "Editor",
  previewTitle: "Generated Markdown",
  generateButton: "Generate & Preview",
  previewPlaceholder: "Click \"Generate & Preview\" to see your Markdown here.",
  copyButton: "Copy Markdown",
  copiedMessage: "Copied!",
  footerText: "Built with React, TypeScript, and Tailwind CSS.",
  createdBy: "Created by Gustavo Rios",
  copyFailedAlert: "Failed to copy text. See console for details.",
  previewErrorText: "Error rendering preview. Raw content:",

  // MarkdownEditor.tsx
  rawModeTooltip: "Switch to Raw Mode", // Tooltip when in Visual mode, to switch to Raw
  visualModeTooltip: "Switch to Visual Mode", // Tooltip when in Raw mode, to switch to Visual
  boldTooltip: "Bold",
  italicTooltip: "Italic",
  headingTooltip: (level: number) => `Heading ${level}`,
  linkTooltip: "Insert Link",
  imageTooltip: "Insert Image",
  ulTooltip: "Unordered List",
  olTooltip: "Ordered List",
  codeTooltip: "Code Block / Inline Code",
  quoteTooltip: "Blockquote",
  hrTooltip: "Horizontal Rule",
  emojiTooltip: "Insert Emoji",
  markdownPlaceholder: "Start typing your Markdown here...",

  linkUrlPrompt: "Enter URL:",
  linkDefaultText: "link text",
  linkTextPrompt: "Enter link text:",
  imageUrlPrompt: "Enter image URL:",
  imageDefaultAlt: "image",
  imageAltPrompt: "Enter image alt text:",
  codePlaceholder: "code here",
  
  // LanguageSwitcher.tsx
  switchToSpanish: "Switch to Spanish",
  switchToEnglish: "Switch to English",

  // ThemeSwitcher.tsx
  themeToggleLight: "Switch to Light Mode",
  themeToggleDark: "Switch to Dark Mode",
};