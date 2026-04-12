/**
 * VerticalThemeWrapper — Unified theme dispatcher for ALL vertical substrates.
 * Detects the subdomain and applies the correct CSS class to <html>.
 *
 * Supported verticals:
 *   security → cyber-theme (dark, obsidian/red/cyan)
 *   robotics → robotics-theme (dark, titanium/electric-blue)
 *   gaming   → gaming-theme (dark, purple/neon-green)
 *   education → education-theme (light, teal/warm-gold)
 *   health   → health-theme (light, green/blue-white)
 *   legal    → legal-theme (light, navy/gold)
 *
 * © CMPSBL® — All rights reserved.
 */

import { useEffect, useMemo } from 'react';
import { getVerticalSubdomain } from '@/config/domains';

interface VerticalConfig {
  className: string;
  colorScheme: 'dark' | 'light';
  scanlineClass?: string;
}

const VERTICAL_THEMES: Record<string, VerticalConfig> = {
  security:  { className: 'cyber-theme',     colorScheme: 'dark',  scanlineClass: 'cyber-scanline' },
  robotics:  { className: 'robotics-theme',  colorScheme: 'dark',  scanlineClass: 'robotics-scanline' },
  gaming:    { className: 'gaming-theme',    colorScheme: 'dark',  scanlineClass: 'gaming-scanline' },
  education: { className: 'education-theme', colorScheme: 'light' },
  health:    { className: 'health-theme',    colorScheme: 'light' },
  legal:     { className: 'legal-theme',     colorScheme: 'light' },
};

export function useVerticalTheme(): { vertical: string | null; config: VerticalConfig | null } {
  const vertical = useMemo(() => getVerticalSubdomain(), []);
  const config = vertical ? VERTICAL_THEMES[vertical] ?? null : null;

  useEffect(() => {
    if (!config) return;

    const root = document.documentElement;
    root.classList.add(config.className);
    root.style.colorScheme = config.colorScheme;

    return () => {
      root.classList.remove(config.className);
      root.style.colorScheme = '';
    };
  }, [config]);

  return { vertical, config };
}

export function VerticalThemeWrapper({ children }: { children: React.ReactNode }) {
  const { config } = useVerticalTheme();

  return (
    <>
      {config?.scanlineClass && (
        <div className={config.scanlineClass} aria-hidden="true" />
      )}
      {children}
    </>
  );
}
