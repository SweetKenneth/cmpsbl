/**
 * CyberThemeWrapper — Applies the CMPSBL CYBER™ dark theme globally
 * when the app is loaded on security.cmpsbl.com.
 * 
 * Adds the `cyber-theme` CSS class to <html> which overrides all
 * design tokens (--background, --primary, --accent, etc.) to the
 * obsidian/red/cyan cybersecurity palette.
 * 
 * © CMPSBL® — All rights reserved.
 */

import { useEffect } from 'react';
import { getVerticalSubdomain } from '@/config/domains';

/**
 * Hook that manages the cyber theme class on the document root.
 * Call once at app level — it handles cleanup on unmount.
 */
export function useCyberTheme(): boolean {
  const isCyber = getVerticalSubdomain() === 'security';

  useEffect(() => {
    if (!isCyber) return;

    const root = document.documentElement;
    root.classList.add('cyber-theme');

    // Force dark color scheme for the entire document
    root.style.colorScheme = 'dark';

    return () => {
      root.classList.remove('cyber-theme');
      root.style.colorScheme = '';
    };
  }, [isCyber]);

  return isCyber;
}

/**
 * Component wrapper — renders children with the cyber theme applied.
 * Also injects the animated scan line overlay.
 */
export function CyberThemeWrapper({ children }: { children: React.ReactNode }) {
  const isCyber = useCyberTheme();

  return (
    <>
      {isCyber && <div className="cyber-scanline" aria-hidden="true" />}
      {children}
    </>
  );
}
