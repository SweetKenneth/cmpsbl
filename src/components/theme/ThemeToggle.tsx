/**
 * ThemeToggle — Manual dark/light mode toggle.
 * Persists preference to localStorage.
 */

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Init from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') setIsDark(false);
    else if (saved === 'dark') setIsDark(true);
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) setIsDark(false);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsDark(!isDark)}
      className={className}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
