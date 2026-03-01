/**
 * ExitIntentCapture — Behavioral triggers for lead capture.
 * Shows LeadCaptureCTA on exit-intent (desktop) or scroll-depth (mobile).
 */

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Mail } from 'lucide-react';
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
          initial={{ scale: 0.92, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 24 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative max-w-md w-full rounded-2xl bg-card border border-border/60 shadow-2xl p-6 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Single close button */}
          <button
            onClick={() => setShow(false)}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Use minimal variant to avoid the duplicate dismiss X */}
          <div className="mb-4">
            <div className="flex items-start gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">Join the substrate community</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Product updates, engineering insights, early access.</p>
              </div>
            </div>
          </div>
          <LeadCaptureCTA context="general" variant="minimal" />
          <p className="text-[10px] text-muted-foreground mt-3 text-center">No spam. Unsubscribe anytime.</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
