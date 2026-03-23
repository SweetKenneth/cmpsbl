/**
 * INCLUSIVE Ultimate — System 3: Contrast Intelligence Engine
 * 
 * Full luminance math — relative luminance, contrast ratio analysis,
 * and automatic palette suggestion within design system tokens.
 * 
 * @module inclusive/ultimate/contrastIntelligence
 */

// ── Types ────────────────────────────────────────────────────────

export interface RGBColor { r: number; g: number; b: number; }
export interface HSLColor { h: number; s: number; l: number; }

export interface ContrastPair {
  foreground: string;
  background: string;
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  meetsAALarge: boolean;
  meetsAAALarge: boolean;
}

export interface PaletteSuggestion {
  original: string;
  suggested: string;
  targetRatio: number;
  achievedRatio: number;
  direction: 'darken' | 'lighten';
  adjustment: number;
}

export interface ContrastAudit {
  id: string;
  pairs: ContrastPair[];
  passCount: number;
  failCount: number;
  suggestions: PaletteSuggestion[];
  auditedAt: string;
}

// ── State ────────────────────────────────────────────────────────

const auditHistory: ContrastAudit[] = [];
const MAX_HISTORY = 100;

// ── Luminance Math ───────────────────────────────────────────────

function hexToRgb(hex: string): RGBColor {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(hsl: HSLColor): string {
  const s = hsl.s / 100, l = hsl.l / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hsl.h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (hsl.h < 60) { r = c; g = x; }
  else if (hsl.h < 120) { r = x; g = c; }
  else if (hsl.h < 180) { g = c; b = x; }
  else if (hsl.h < 240) { g = x; b = c; }
  else if (hsl.h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Calculate relative luminance per WCAG 2.x spec */
export function relativeLuminance(rgb: RGBColor): number {
  const srgb = [rgb.r, rgb.g, rgb.b].map(v => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/** Calculate contrast ratio between two colors */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(hexToRgb(fg));
  const l2 = relativeLuminance(hexToRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

/** Evaluate a color pair against all WCAG contrast thresholds */
export function evaluateContrast(fg: string, bg: string): ContrastPair {
  const ratio = contrastRatio(fg, bg);
  return {
    foreground: fg,
    background: bg,
    ratio,
    meetsAA: ratio >= 4.5,
    meetsAAA: ratio >= 7,
    meetsAALarge: ratio >= 3,
    meetsAAALarge: ratio >= 4.5,
  };
}

/** Suggest a color adjustment to meet a target contrast ratio */
export function suggestFix(
  color: string,
  against: string,
  targetRatio: number = 4.5,
): PaletteSuggestion {
  const currentRatio = contrastRatio(color, against);
  if (currentRatio >= targetRatio) {
    return { original: color, suggested: color, targetRatio, achievedRatio: currentRatio, direction: 'darken', adjustment: 0 };
  }

  const hsl = rgbToHsl(hexToRgb(color));
  const againstLum = relativeLuminance(hexToRgb(against));
  const colorLum = relativeLuminance(hexToRgb(color));
  const direction: 'darken' | 'lighten' = colorLum > againstLum ? 'darken' : 'lighten';

  // Binary search for the right lightness
  let lo = direction === 'darken' ? 0 : hsl.l;
  let hi = direction === 'darken' ? hsl.l : 100;
  let bestL = hsl.l;
  let bestRatio = currentRatio;

  for (let i = 0; i < 20; i++) {
    const mid = Math.round((lo + hi) / 2);
    const candidate = hslToHex({ ...hsl, l: mid });
    const ratio = contrastRatio(candidate, against);

    if (ratio >= targetRatio) {
      bestL = mid;
      bestRatio = ratio;
      if (direction === 'darken') lo = mid + 1;
      else hi = mid - 1;
    } else {
      if (direction === 'darken') hi = mid - 1;
      else lo = mid + 1;
    }
  }

  return {
    original: color,
    suggested: hslToHex({ ...hsl, l: bestL }),
    targetRatio,
    achievedRatio: bestRatio,
    direction,
    adjustment: Math.abs(hsl.l - bestL),
  };
}

/** Audit multiple color pairs */
export function auditPalette(pairs: Array<{ fg: string; bg: string }>): ContrastAudit {
  const evaluated = pairs.map(p => evaluateContrast(p.fg, p.bg));
  const failing = evaluated.filter(p => !p.meetsAA);

  const suggestions = failing.map(p => suggestFix(p.foreground, p.background));

  const audit: ContrastAudit = {
    id: crypto.randomUUID(),
    pairs: evaluated,
    passCount: evaluated.filter(p => p.meetsAA).length,
    failCount: failing.length,
    suggestions,
    auditedAt: new Date().toISOString(),
  };

  auditHistory.push(audit);
  if (auditHistory.length > MAX_HISTORY) auditHistory.splice(0, auditHistory.length - MAX_HISTORY);

  return audit;
}

/** Get contrast engine health */
export function getContrastHealth() {
  return {
    totalAudits: auditHistory.length,
    totalPairsEvaluated: auditHistory.reduce((s, a) => s + a.pairs.length, 0),
    avgPassRate: auditHistory.length > 0
      ? Math.round((auditHistory.reduce((s, a) => s + (a.passCount / (a.passCount + a.failCount || 1)), 0) / auditHistory.length) * 100)
      : 100,
  };
}

/** Reset */
export function resetContrastEngine(): void {
  auditHistory.length = 0;
}
