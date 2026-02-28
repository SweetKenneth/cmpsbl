/**
 * DesktopCommandPalette — Cmd+K powered search for desktop.
 * Reuses MobileCommandPalette logic, adds desktop-specific hint in nav.
 */

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { MobileCommandPalette } from './MobileCommandPalette';

export function DesktopCommandPalette() {
  const [open, setOpen] = useState(false);

  // Listen for Cmd+K on desktop
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/30 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
        aria-label="Search (⌘K)"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs">Search</span>
        <kbd className="ml-2 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border/50">⌘K</kbd>
      </button>
      <MobileCommandPalette open={open} onOpenChange={setOpen} />
    </>
  );
}
