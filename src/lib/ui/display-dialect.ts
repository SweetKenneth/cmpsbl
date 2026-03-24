/**
 * Display Dialects — Legacy Code Skins for Developers Playground
 * Display-only rendering of code in classic programming paradigms.
 * IMPORTANT: This is purely visual. Execution always uses modern JS/TS.
 */

export type DisplayDialect =
  | 'modern'
  | 'lisp'
  | 'c'
  | 'smalltalk'
  | 'hacker';

export const DIALECT_LABELS: Record<DisplayDialect, string> = {
  modern: 'Modern (JS/TS)',
  lisp: 'Lisp / S-Expression',
  c: 'C / Systems',
  smalltalk: 'Smalltalk',
  hacker: 'Hacker / Terminal'
};

export const DIALECT_DESCRIPTIONS: Record<DisplayDialect, string> = {
  modern: 'Standard JavaScript/TypeScript syntax',
  lisp: 'Functional S-expression style (display only)',
  c: 'Systems programming aesthetic (display only)',
  smalltalk: 'Message-passing object style (display only)',
  hacker: 'Terminal/CLI aesthetic (display only)'
};
