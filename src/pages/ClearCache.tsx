/**
 * ClearCache — Branded cache-clearing utility with cinematic feedback
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Trash2 } from 'lucide-react';

const STEPS = [
  'Purging local storage…',
  'Clearing service worker caches…',
  'Unregistering workers…',
  'Finalizing…',
];

export default function ClearCache() {
  const [phase, setPhase] = useState<'clearing' | 'done'>('clearing');
  const [step, setStep] = useState(0);
  const ran = useRef(false);
  const redirecting = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      // Step 0 — localStorage
      try { localStorage.clear(); } catch { /* unavailable */ }
      await delay(400);
      setStep(1);

      // Step 1 — caches
      try { sessionStorage.clear(); } catch { /* unavailable */ }
      try {
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map(name => caches.delete(name)));
        }
      } catch { /* unavailable */ }
      await delay(400);
      setStep(2);

      // Step 2 — service workers
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }
      } catch { /* unavailable */ }
      await delay(300);
      setStep(3);

      await delay(300);
      setPhase('done');

      if (!redirecting.current) {
        redirecting.current = true;
        setTimeout(() => { window.location.href = '/'; }, 1200);
      }
    })();
  }, []);

  // Fallback redirect
  useEffect(() => {
    const t = setTimeout(() => { window.location.href = '/'; }, 6000);
    return () => clearTimeout(t);
  }, []);

  const progress = phase === 'done' ? 100 : Math.round(((step + 1) / STEPS.length) * 90);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 50%)' }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center max-w-sm w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {phase === 'clearing' ? (
            <motion.div
              key="clearing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mx-auto mb-6 w-12 h-12 flex items-center justify-center"
              >
                <Trash2 className="w-8 h-8 text-primary" />
              </motion.div>

              <h1 className="text-xl font-bold text-foreground mb-2">Clearing Cache</h1>
              <p className="text-sm text-muted-foreground font-mono mb-6">
                {STEPS[step]}
              </p>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>

              {/* Step indicators */}
              <div className="flex justify-center gap-2">
                {STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i <= step ? 'bg-primary' : 'bg-muted/40'
                    }`}
                    animate={i === step ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                className="mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
              </motion.div>

              <h1 className="text-xl font-bold text-foreground mb-2">Cache Cleared</h1>
              <p className="text-sm text-muted-foreground">Redirecting to home…</p>

              {/* Completed bar */}
              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden mt-6">
                <div className="h-full rounded-full bg-primary w-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
