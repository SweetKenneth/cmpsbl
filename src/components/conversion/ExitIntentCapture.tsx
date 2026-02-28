/**
 * ExitIntentCapture — Behavioral triggers for lead capture.
 * Shows LeadCaptureCTA on exit-intent (desktop) or scroll-depth (mobile).
 */

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { LeadCaptureCTA } from './LeadCaptureCTA';

const SHOWN_KEY = 'cmpsbl_exit_intent_shown';
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h

export function ExitIntentCapture() {
  const [show, setShow] = useState(false);

  const wasRecentlyShown = useCallback(() => {
    try {
      const ts = localStorage.getItem(SHOWN_KEY);
      if (!ts) return false;
      return Date.now() - Number(ts) < COOLDOWN_MS;
    } catch { return false; }
  }, []);

  const markShown = useCallback(() => {
    try { localStorage.setItem(SHOWN_KEY, String(Date.now())); } catch {}
  }, []);

  useEffect(() => {
    if (wasRecentlyShown()) return;

    // Desktop: exit intent (mouse leaves viewport top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !show) {
        setShow(true);
        markShown();
      }
    };

    // Mobile: 70% scroll depth
    const handleScroll = () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent > 0.7 && !show) {
        setShow(true);
        markShown();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [show, wasRecentlyShown, markShown]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] bg-background/60 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={() => setShow(false)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShow(false)}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <LeadCaptureCTA context="general" variant="inline" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
