/**
 * CMPSBL® Vertical Theme Injection
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Applies a VerticalTheme to the document's CSS custom properties
 * so the entire UI adapts to the vertical's brand at runtime.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalTheme } from './vertical-substrate';

/**
 * Inject a vertical's theme into the document root as CSS custom properties.
 * Called once when a vertical subdomain is detected.
 *
 * Maps to the design system tokens in index.css:
 * --primary, --accent, etc. are overridden with the vertical's hue.
 */
export function injectVerticalTheme(theme: VerticalTheme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const hue = theme.primaryHue;

  // Primary channel — overrides --primary HSL
  root.style.setProperty('--primary', `${hue} 70% 50%`);
  root.style.setProperty('--primary-foreground', `${hue} 10% 98%`);

  // Accent — slightly shifted for visual depth
  root.style.setProperty('--accent', `${hue} 30% 92%`);
  root.style.setProperty('--accent-foreground', `${hue} 80% 20%`);

  // Ring
  root.style.setProperty('--ring', `${hue} 70% 50%`);

  // Sidebar accent
  root.style.setProperty('--sidebar-primary', `${hue} 70% 50%`);
  root.style.setProperty('--sidebar-primary-foreground', `${hue} 10% 98%`);
  root.style.setProperty('--sidebar-accent', `${hue} 30% 92%`);
  root.style.setProperty('--sidebar-accent-foreground', `${hue} 80% 20%`);

  // Mark that a vertical theme is active (for conditional styling)
  root.setAttribute('data-vertical-theme', String(hue));
}

/**
 * Remove vertical theme overrides, restoring the default design system.
 */
export function clearVerticalTheme(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const props = [
    '--primary', '--primary-foreground',
    '--accent', '--accent-foreground',
    '--ring',
    '--sidebar-primary', '--sidebar-primary-foreground',
    '--sidebar-accent', '--sidebar-accent-foreground',
  ];

  for (const prop of props) {
    root.style.removeProperty(prop);
  }

  root.removeAttribute('data-vertical-theme');
}
