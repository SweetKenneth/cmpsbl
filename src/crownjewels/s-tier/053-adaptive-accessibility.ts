/**
 * S-Tier 053 — Adaptive Accessibility Engine
 * CJPI: 93 | Node: INCLUSIVE | ID: S-INC01
 *
 * Runtime accessibility profiling and adaptive UI adjustments.
 * Detects user preferences and applies WCAG-compliant overrides.
 */

export interface AccessibilityProfile {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface AccessibilityOverride {
  property: string;
  value: string;
  reason: string;
}

export function detectProfile(): AccessibilityProfile {
  if (typeof window === 'undefined') {
    return { reduceMotion: false, highContrast: false, largeText: false, screenReader: false, colorBlindMode: 'none' };
  }
  return {
    reduceMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    highContrast: window.matchMedia?.('(prefers-contrast: more)').matches ?? false,
    largeText: (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) > 18,
    screenReader: false, // Cannot reliably detect
    colorBlindMode: 'none',
  };
}

export function generateOverrides(profile: AccessibilityProfile): AccessibilityOverride[] {
  const overrides: AccessibilityOverride[] = [];

  if (profile.reduceMotion) {
    overrides.push({ property: '--animation-duration', value: '0ms', reason: 'prefers-reduced-motion' });
    overrides.push({ property: '--transition-duration', value: '0ms', reason: 'prefers-reduced-motion' });
  }

  if (profile.highContrast) {
    overrides.push({ property: '--border-width', value: '2px', reason: 'high-contrast mode' });
    overrides.push({ property: '--focus-ring-width', value: '3px', reason: 'high-contrast mode' });
  }

  if (profile.largeText) {
    overrides.push({ property: '--base-font-size', value: '18px', reason: 'large-text preference' });
  }

  return overrides;
}

export function applyOverrides(overrides: AccessibilityOverride[]): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const o of overrides) {
    root.style.setProperty(o.property, o.value);
  }
}
