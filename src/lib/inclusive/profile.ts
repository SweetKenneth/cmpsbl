/**
 * INCLUSIVE Profile Engine
 * User preference and capability profiling for adaptive experiences
 */

import type { InclusiveProfile } from './types';

/**
 * Detect user preferences from browser APIs
 */
export function detectUserPreferences(): InclusiveProfile['user_preferences'] {
  if (typeof window === 'undefined') {
    return {};
  }

  const preferences: InclusiveProfile['user_preferences'] = {};

  // Detect reduced motion preference
  if (window.matchMedia) {
    preferences.reduced_motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    preferences.high_contrast = window.matchMedia('(prefers-contrast: more)').matches;
  }

  // Detect font scale (approximate)
  const testEl = document.createElement('span');
  testEl.style.fontSize = '16px';
  testEl.style.position = 'absolute';
  testEl.style.visibility = 'hidden';
  testEl.textContent = 'M';
  document.body.appendChild(testEl);
  const computedSize = parseFloat(window.getComputedStyle(testEl).fontSize);
  document.body.removeChild(testEl);
  preferences.font_scale = computedSize / 16;

  return preferences;
}

/**
 * Detect device capabilities
 */
export function detectDeviceCapabilities(): InclusiveProfile['device_capabilities'] {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    has_touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    has_keyboard: true, // Assume keyboard available
    has_pointer: window.matchMedia?.('(pointer: fine)').matches ?? true,
  };
}

/**
 * Build complete user profile
 */
export function buildProfile(context: string): InclusiveProfile {
  return {
    context,
    user_preferences: detectUserPreferences(),
    device_capabilities: detectDeviceCapabilities(),
  };
}

/**
 * Generate adaptive CSS recommendations based on profile
 */
export function generateAdaptiveStyles(profile: InclusiveProfile): string {
  const styles: string[] = [];

  if (profile.user_preferences?.reduced_motion) {
    styles.push(`
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        transition-duration: 0.001ms !important;
      }
    `);
  }

  if (profile.user_preferences?.high_contrast) {
    styles.push(`
      :root {
        --contrast-multiplier: 1.5;
      }
    `);
  }

  const fontScale = profile.user_preferences?.font_scale || 1;
  if (fontScale > 1.1) {
    styles.push(`
      :root {
        --font-scale: ${fontScale};
      }
    `);
  }

  if (profile.device_capabilities?.has_touch && !profile.device_capabilities?.has_pointer) {
    styles.push(`
      :root {
        --touch-target-size: 44px;
      }
      button, a, input, select {
        min-height: var(--touch-target-size);
        min-width: var(--touch-target-size);
      }
    `);
  }

  return styles.join('\n');
}
