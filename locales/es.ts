
export const es = {
  // App.tsx
  appTitle: "Generador README.md",
  appSubtitle: "Crea el README de tu proyecto con facilidad. Usa las herramientas del editor y luego genera el Markdown para copiar.",
  editorTitle: "Editor",
  previewTitle: "Markdown Generado",
  generateButton: "Generar y Previsualizar",
  previewPlaceholder: "Haz clic en \"Generar y Previsualizar\" para ver tu Markdown aquí.",
  copyButton: "Copiar Markdown",
  copiedMessage: "¡Copiado!",
  footerText: "Construido con React, TypeScript y Tailwind CSS.",
  createdBy: "Creado por Gustavo Rios",
  copyFailedAlert: "Error al copiar texto. Revisa la consola para más detalles.",
  previewErrorText: "Error al renderizar la vista previa. Contenido raw:",


  // MarkdownEditor.tsx
  rawModeTooltip: "Cambiar a Modo Raw", // Tooltip when in Visual mode, to switch to Raw
  visualModeTooltip: "Cambiar a Modo Visual", // Tooltip when in Raw mode, to switch to Visual
  boldTooltip: "Negrita",
  italicTooltip: "Cursiva",
  headingTooltip: (level: number) => `Encabezado ${level}`,
  linkTooltip: "Insertar Enlace",
  imageTooltip: "Insertar Imagen",
  ulTooltip: "Lista Desordenada",
  olTooltip: "Lista Ordenada",
  codeTooltip: "Bloque de Código / Código en línea",
  quoteTooltip: "Cita",
  hrTooltip: "Línea Horizontal",
  emojiTooltip: "Insertar Emoji",
  markdownPlaceholder: "Empieza a escribir tu Markdown aquí...",
  
  linkUrlPrompt: "Introduce la URL:",
  linkDefaultText: "texto del enlace",
  linkTextPrompt: "Introduce el texto del enlace:",
  imageUrlPrompt: "Introduce la URL de la imagen:",
  imageDefaultAlt: "imagen",
  imageAltPrompt: "Introduce el texto alternativo de la imagen:",
  codePlaceholder: "código aquí",

  // LanguageSwitcher.tsx
  switchToSpanish: "Cambiar a Español",
  switchToEnglish: "Cambiar a Inglés",

  // ThemeSwitcher.tsx
  themeToggleLight: "Cambiar a Modo Claro",
  themeToggleDark: "Cambiar a Modo Oscuro",
};

export type TranslationKeys = typeof es;
export type TranslationKey = keyof TranslationKeys;