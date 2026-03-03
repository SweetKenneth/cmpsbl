/**
 * INCLUSIVE — Contrast Engine
 * @origin(ptchbl) — Migrated from PTCHBL contrast-utils.ts + contrast-validator.ts
 * 
 * Full WCAG 2.2 color contrast calculation, validation, and accessible color suggestions.
 */

// ════════════════════════════════════════
// Color Primitives
// ════════════════════════════════════════

/** Convert RGB to relative luminance (WCAG formula) */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Calculate contrast ratio between two RGB colors */
export function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ════════════════════════════════════════
// Color Parsing
// ════════════════════════════════════════

/** Parse hex color to RGB tuple */
export function hexToRgb(hex: string): [number, number, number] | null {
  // Support 3-char hex
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

/** Parse rgb/rgba string to RGB tuple */
export function parseRgb(rgbString: string): [number, number, number] | null {
  const match = rgbString.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
}

/** Parse HSL to RGB */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/** Named color lookup table */
const NAMED_COLORS: Record<string, [number, number, number]> = {
  white: [255, 255, 255], black: [0, 0, 0], red: [255, 0, 0],
  green: [0, 128, 0], blue: [0, 0, 255], yellow: [255, 255, 0],
  cyan: [0, 255, 255], magenta: [255, 0, 255], gray: [128, 128, 128],
  grey: [128, 128, 128], silver: [192, 192, 192], maroon: [128, 0, 0],
  olive: [128, 128, 0], navy: [0, 0, 128], purple: [128, 0, 128],
  teal: [0, 128, 128], orange: [255, 165, 0], transparent: [0, 0, 0],
};

/** Parse any CSS color format to RGB tuple */
export function parseColor(color: string): [number, number, number] | null {
  const c = color.trim().toLowerCase();

  if (c in NAMED_COLORS) return NAMED_COLORS[c];
  if (c.startsWith('#')) return hexToRgb(c);
  if (c.startsWith('rgb')) return parseRgb(c);
  if (c.startsWith('hsl')) {
    const match = c.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/i);
    if (match) return hslToRgb(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
  }

  return null;
}

// ════════════════════════════════════════
// WCAG Compliance Check
// ════════════════════════════════════════

/** Check if contrast ratio meets WCAG level */
export function meetsWCAG(
  ratio: number,
  level: 'AA' | 'AAA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  if (level === 'AA') {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
  return size === 'large' ? ratio >= 4.5 : ratio >= 7;
}

/** Comprehensive contrast check result */
export interface ContrastCheckResult {
  ratio: number;
  meetsAA_normal: boolean;
  meetsAA_large: boolean;
  meetsAAA_normal: boolean;
  meetsAAA_large: boolean;
  grade: 'AAA' | 'AA' | 'AA-large' | 'fail';
}

/** Full contrast check between two colors */
export function checkContrast(
  foreground: string,
  background: string
): ContrastCheckResult | null {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;

  const ratio = getContrastRatio(fg, bg);

  return {
    ratio: Math.round(ratio * 100) / 100,
    meetsAA_normal: ratio >= 4.5,
    meetsAA_large: ratio >= 3,
    meetsAAA_normal: ratio >= 7,
    meetsAAA_large: ratio >= 4.5,
    grade: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA-large' : 'fail',
  };
}

// ════════════════════════════════════════
// Accessible Color Suggestion
// ════════════════════════════════════════

export interface ColorSuggestion {
  foreground: string;
  background: string;
  ratio: number;
  adjustment: string;
}

/** Suggest accessible color alternatives when contrast fails */
export function suggestAccessibleColor(
  foreground: string,
  background: string,
  targetLevel: 'AA' | 'AAA' = 'AA'
): ColorSuggestion | null {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;

  const currentRatio = getContrastRatio(fg, bg);
  const targetRatio = targetLevel === 'AAA' ? 7 : 4.5;

  if (currentRatio >= targetRatio) {
    return { foreground, background, ratio: currentRatio, adjustment: 'none needed' };
  }

  const bgLuminance = getLuminance(bg[0], bg[1], bg[2]);

  if (bgLuminance > 0.5) {
    // Light background → darken foreground
    const darkFg = darkenToContrast(fg, bg, targetRatio);
    return {
      foreground: rgbToHex(darkFg),
      background,
      ratio: getContrastRatio(darkFg, bg),
      adjustment: 'darkened foreground',
    };
  } else {
    // Dark background → lighten foreground
    const lightFg = lightenToContrast(fg, bg, targetRatio);
    return {
      foreground: rgbToHex(lightFg),
      background,
      ratio: getContrastRatio(lightFg, bg),
      adjustment: 'lightened foreground',
    };
  }
}

/** Darken a color until it meets the target contrast ratio */
function darkenToContrast(
  fg: [number, number, number],
  bg: [number, number, number],
  targetRatio: number
): [number, number, number] {
  let [r, g, b] = fg;
  for (let i = 0; i < 255; i++) {
    r = Math.max(0, r - 1);
    g = Math.max(0, g - 1);
    b = Math.max(0, b - 1);
    if (getContrastRatio([r, g, b], bg) >= targetRatio) break;
  }
  return [r, g, b];
}

/** Lighten a color until it meets the target contrast ratio */
function lightenToContrast(
  fg: [number, number, number],
  bg: [number, number, number],
  targetRatio: number
): [number, number, number] {
  let [r, g, b] = fg;
  for (let i = 0; i < 255; i++) {
    r = Math.min(255, r + 1);
    g = Math.min(255, g + 1);
    b = Math.min(255, b + 1);
    if (getContrastRatio([r, g, b], bg) >= targetRatio) break;
  }
  return [r, g, b];
}

/** Convert RGB tuple to hex string */
export function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
}

// ════════════════════════════════════════
// Inline Style Contrast Validator
// ════════════════════════════════════════

export interface ContrastIssue {
  type: 'insufficient_contrast' | 'insufficient_contrast_aaa';
  element: string;
  wcagCriterion: string;
  severity: 'critical' | 'high' | 'medium';
  ratio: number;
  required: number;
  foreground: string;
  background: string;
  suggestion: ColorSuggestion | null;
  autoFixable: boolean;
}

/** Scan HTML for inline-style contrast violations */
export function scanContrastIssues(html: string, level: 'AA' | 'AAA' = 'AA'): ContrastIssue[] {
  const issues: ContrastIssue[] = [];

  const elementRegex = /<(p|h[1-6]|a|span|li|td|th|label|button|div)[^>]*style=["']([^"']*)["'][^>]*>([^<]*)<\/\1>/gi;
  let match;

  while ((match = elementRegex.exec(html)) !== null) {
    const [fullElement, , styleAttr, textContent] = match;
    if (!styleAttr || !textContent.trim()) continue;

    const styles = parseInlineStyles(styleAttr);
    const bgColor = styles['background-color'] || styles['backgroundColor'] || styles['background'];
    const textColor = styles['color'];

    if (!bgColor || !textColor) continue;

    const fg = parseColor(textColor);
    const bg = parseColor(bgColor);
    if (!fg || !bg) continue;

    const ratio = getContrastRatio(fg, bg);
    const fontSize = parseFloat(styles['font-size'] || styles['fontSize'] || '16');
    const fontWeight = styles['font-weight'] || styles['fontWeight'] || '400';
    const isBold = fontWeight === 'bold' || parseInt(fontWeight) >= 700;
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);

    const minRatioAA = isLargeText ? 3 : 4.5;
    const minRatioAAA = isLargeText ? 4.5 : 7;

    if (ratio < minRatioAA) {
      issues.push({
        type: 'insufficient_contrast',
        element: fullElement.substring(0, 120),
        wcagCriterion: '1.4.3',
        severity: 'critical',
        ratio: Math.round(ratio * 100) / 100,
        required: minRatioAA,
        foreground: textColor,
        background: bgColor,
        suggestion: suggestAccessibleColor(textColor, bgColor, 'AA'),
        autoFixable: true,
      });
    } else if (level === 'AAA' && ratio < minRatioAAA) {
      issues.push({
        type: 'insufficient_contrast_aaa',
        element: fullElement.substring(0, 120),
        wcagCriterion: '1.4.6',
        severity: 'medium',
        ratio: Math.round(ratio * 100) / 100,
        required: minRatioAAA,
        foreground: textColor,
        background: bgColor,
        suggestion: suggestAccessibleColor(textColor, bgColor, 'AAA'),
        autoFixable: true,
      });
    }
  }

  return issues;
}

/** Parse inline CSS styles to key-value map */
function parseInlineStyles(styleAttr: string): Record<string, string> {
  const styles: Record<string, string> = {};
  for (const decl of styleAttr.split(';')) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = decl.substring(0, colonIdx).trim();
    const val = decl.substring(colonIdx + 1).trim();
    if (prop && val) styles[prop] = val;
  }
  return styles;
}
