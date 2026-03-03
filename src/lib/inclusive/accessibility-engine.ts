/**
 * INCLUSIVE — Accessibility Engine
 * @origin(ptchbl) — Migrated from PTCHBL accessibility-engine.ts
 * 
 * Runtime DOM manipulation engine for adaptive accessibility.
 * Provides real-time accessibility adjustments: font size, contrast,
 * reading guides, dyslexia fonts, cursor sizing, and more.
 * 
 * Integrates with INCLUSIVE's adaptiveInterface.ts for profile-based activation.
 */

// ════════════════════════════════════════
// State Interface
// ════════════════════════════════════════

export interface AccessibilityState {
  fontSize: number;        // percentage (100 = default)
  lineHeight: string;      // 'normal' | '1.5' | '2' | '2.5'
  contrast: 'normal' | 'high' | 'inverse';
  linkHighlight: boolean;
  grayscale: boolean;
  dyslexiaFont: boolean;
  reducedMotion: boolean;
  readerMode: boolean;
  readingGuide: boolean;
  cursorSize: 'normal' | 'large';
}

export const DEFAULT_STATE: AccessibilityState = {
  fontSize: 100,
  lineHeight: 'normal',
  contrast: 'normal',
  linkHighlight: false,
  grayscale: false,
  dyslexiaFont: false,
  reducedMotion: false,
  readerMode: false,
  readingGuide: false,
  cursorSize: 'normal',
};

// ════════════════════════════════════════
// Accessibility Engine
// ════════════════════════════════════════

const STORAGE_KEY = 'inclusive-a11y-preferences';
const STYLE_ID = 'inclusive-a11y-styles';
const CLASS_PREFIX = 'inclusive-';

export class InclusiveAccessibilityEngine {
  private state: AccessibilityState;
  private readingGuideElement?: HTMLElement;

  constructor() {
    this.state = this.loadState();
  }

  // ── State Persistence ──

  private loadState(): AccessibilityState {
    if (typeof window === 'undefined') return { ...DEFAULT_STATE };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : { ...DEFAULT_STATE };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  private saveState(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('[INCLUSIVE] Failed to save preferences:', e);
    }
  }

  getState(): AccessibilityState {
    return { ...this.state };
  }

  // ── Font Size ──

  setFontSize(size: number): void {
    this.state.fontSize = Math.max(50, Math.min(200, size));
    document.documentElement.style.fontSize = `${this.state.fontSize}%`;
    this.saveState();
  }

  increaseFontSize(step = 10): void {
    this.setFontSize(this.state.fontSize + step);
  }

  decreaseFontSize(step = 10): void {
    this.setFontSize(this.state.fontSize - step);
  }

  // ── Line Height ──

  setLineHeight(height: string): void {
    this.state.lineHeight = height;
    document.body.style.lineHeight = height === 'normal' ? '' : height;
    this.saveState();
  }

  // ── Contrast ──

  setContrast(mode: 'normal' | 'high' | 'inverse'): void {
    this.state.contrast = mode;
    document.body.classList.remove(`${CLASS_PREFIX}contrast-high`, `${CLASS_PREFIX}contrast-inverse`);
    if (mode === 'high') document.body.classList.add(`${CLASS_PREFIX}contrast-high`);
    if (mode === 'inverse') document.body.classList.add(`${CLASS_PREFIX}contrast-inverse`);
    this.saveState();
  }

  // ── Link Highlighting ──

  toggleLinkHighlight(enabled?: boolean): void {
    this.state.linkHighlight = enabled ?? !this.state.linkHighlight;
    document.body.classList.toggle(`${CLASS_PREFIX}link-highlight`, this.state.linkHighlight);
    this.saveState();
  }

  // ── Grayscale ──

  toggleGrayscale(enabled?: boolean): void {
    this.state.grayscale = enabled ?? !this.state.grayscale;
    document.body.classList.toggle(`${CLASS_PREFIX}grayscale`, this.state.grayscale);
    this.saveState();
  }

  // ── Dyslexia Font ──

  toggleDyslexiaFont(enabled?: boolean): void {
    this.state.dyslexiaFont = enabled ?? !this.state.dyslexiaFont;
    document.body.style.fontFamily = this.state.dyslexiaFont ? "'OpenDyslexic', 'Comic Sans MS', sans-serif" : '';
    if (this.state.dyslexiaFont) {
      document.body.style.letterSpacing = '0.1em';
      document.body.style.wordSpacing = '0.2em';
    } else {
      document.body.style.letterSpacing = '';
      document.body.style.wordSpacing = '';
    }
    this.saveState();
  }

  // ── Reduced Motion ──

  toggleReducedMotion(enabled?: boolean): void {
    this.state.reducedMotion = enabled ?? !this.state.reducedMotion;
    document.documentElement.style.setProperty(
      '--inclusive-transition-speed',
      this.state.reducedMotion ? '0s' : ''
    );
    document.body.classList.toggle(`${CLASS_PREFIX}reduce-motion`, this.state.reducedMotion);
    this.saveState();
  }

  // ── Reader Mode ──

  toggleReaderMode(enabled?: boolean): void {
    this.state.readerMode = enabled ?? !this.state.readerMode;
    document.body.classList.toggle(`${CLASS_PREFIX}reader-mode`, this.state.readerMode);
    this.saveState();
  }

  // ── Reading Guide ──

  toggleReadingGuide(enabled?: boolean): void {
    this.state.readingGuide = enabled ?? !this.state.readingGuide;

    if (this.state.readingGuide) {
      this.createReadingGuide();
      document.addEventListener('mousemove', this.handleMouseMove);
    } else {
      this.removeReadingGuide();
      document.removeEventListener('mousemove', this.handleMouseMove);
    }
    this.saveState();
  }

  private createReadingGuide(): void {
    if (this.readingGuideElement) return;
    this.readingGuideElement = document.createElement('div');
    this.readingGuideElement.className = `${CLASS_PREFIX}reading-guide`;
    this.readingGuideElement.style.cssText = `
      position: fixed; left: 0; right: 0; height: 2px;
      background: hsl(var(--primary, 220 90% 56%));
      pointer-events: none; z-index: 999998; opacity: 0.8;
    `;
    document.body.appendChild(this.readingGuideElement);
  }

  private removeReadingGuide(): void {
    if (this.readingGuideElement) {
      this.readingGuideElement.remove();
      this.readingGuideElement = undefined;
    }
  }

  private handleMouseMove = (e: MouseEvent): void => {
    if (this.readingGuideElement) {
      this.readingGuideElement.style.top = `${e.clientY}px`;
    }
  };

  // ── Cursor Size ──

  setCursorSize(size: 'normal' | 'large'): void {
    this.state.cursorSize = size;
    document.body.classList.toggle(`${CLASS_PREFIX}cursor-large`, size === 'large');
    this.saveState();
  }

  // ── Reset ──

  resetAll(): void {
    this.state = { ...DEFAULT_STATE };
    document.documentElement.style.fontSize = '';
    document.body.style.lineHeight = '';
    document.body.style.fontFamily = '';
    document.body.style.letterSpacing = '';
    document.body.style.wordSpacing = '';
    document.documentElement.style.setProperty('--inclusive-transition-speed', '');

    const classesToRemove = Array.from(document.body.classList)
      .filter(cls => cls.startsWith(CLASS_PREFIX));
    classesToRemove.forEach(cls => document.body.classList.remove(cls));

    this.removeReadingGuide();
    document.removeEventListener('mousemove', this.handleMouseMove);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // ── Apply All (on init) ──

  applyAll(): void {
    if (typeof document === 'undefined') return;

    this.setFontSize(this.state.fontSize);
    this.setLineHeight(this.state.lineHeight);
    this.setContrast(this.state.contrast);

    if (this.state.linkHighlight) this.toggleLinkHighlight(true);
    if (this.state.grayscale) this.toggleGrayscale(true);
    if (this.state.dyslexiaFont) this.toggleDyslexiaFont(true);
    if (this.state.reducedMotion) this.toggleReducedMotion(true);
    if (this.state.readerMode) this.toggleReaderMode(true);
    if (this.state.readingGuide) this.toggleReadingGuide(true);
    if (this.state.cursorSize === 'large') this.setCursorSize('large');
  }

  // ── Inject Required CSS ──

  static injectStyles(): void {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;

    const styles = `
      .${CLASS_PREFIX}contrast-high { filter: contrast(1.5); }
      .${CLASS_PREFIX}contrast-inverse { filter: invert(1) hue-rotate(180deg); }
      .${CLASS_PREFIX}grayscale { filter: grayscale(1); }
      .${CLASS_PREFIX}link-highlight a {
        background: yellow !important; color: black !important;
        padding: 2px 4px !important; border-radius: 2px !important;
      }
      .${CLASS_PREFIX}cursor-large * {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="8" fill="black"/></svg>'), auto !important;
      }
      .${CLASS_PREFIX}reader-mode {
        max-width: 800px; margin: 0 auto; padding: 2rem;
      }
      .${CLASS_PREFIX}reduce-motion *, .${CLASS_PREFIX}reduce-motion *::before, .${CLASS_PREFIX}reduce-motion *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }
}

// ════════════════════════════════════════
// Singleton
// ════════════════════════════════════════

let engineInstance: InclusiveAccessibilityEngine | null = null;

/** Get the global INCLUSIVE accessibility engine instance */
export function getAccessibilityEngine(): InclusiveAccessibilityEngine {
  if (!engineInstance) {
    engineInstance = new InclusiveAccessibilityEngine();
    InclusiveAccessibilityEngine.injectStyles();
  }
  return engineInstance;
}
