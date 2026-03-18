/**
 * Ascension Onboarding Modal — First-visit explainer
 * Shows once per user, stored in localStorage
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Zap, Diamond, Package, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'ascension-onboarded';

const STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to Ascension',
    subtitle: 'Software Evolution Engine',
    body: 'Ascension takes your code and collides it against a living 40-node cognitive substrate. New capabilities emerge from interaction — things your code couldn\'t do alone.',
    color: 'primary',
  },
  {
    icon: Upload,
    title: '1. Ingest',
    subtitle: 'Upload your code',
    body: 'Drop source files in any language. Your code becomes Node #41 — a first-class participant in the substrate matrix with its own capability surface.',
    color: 'neon-cyan',
  },
  {
    icon: Zap,
    title: '2. Ascension',
    subtitle: 'Collision cycles',
    body: 'Node #41 collides against all 40 substrate nodes in chains 2-8 nodes deep. Each collision tests for emergent capabilities scored by CJPI.',
    color: 'neon-purple',
  },
  {
    icon: Diamond,
    title: '3. Crystallize',
    subtitle: 'Lock discoveries',
    body: 'Review your discoveries, then crystallize them — locking successful interaction chains into deterministic, repeatable memories.',
    color: 'neon-magenta',
  },
  {
    icon: Package,
    title: '4. Export',
    subtitle: 'Ascended Memories',
    body: 'Export crystallized capabilities as portable packs: source code in your original language, tests, documentation, and a Mini-Runtime™ engine.',
    color: 'neon-amber',
  },
];

export function AscensionOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div
      className="fixed inset-0 z-[12000] grid place-items-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-background/95 border border-border/30 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Progress dots */}
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-primary' : i < step ? 'w-3 bg-primary/40' : 'w-3 bg-muted/40'
                }`}
              />
            ))}
          </div>
          <button
            onClick={dismiss}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-6 pt-6 pb-5"
          >
            <div className={`w-12 h-12 rounded-xl bg-${current.color}/10 border border-${current.color}/20 flex items-center justify-center mb-4`}>
              <Icon className={`w-6 h-6 text-${current.color}`} />
            </div>

            <p className="text-[10px] font-mono text-primary/60 uppercase tracking-[0.15em] mb-1">
              {current.subtitle}
            </p>
            <h2 className="text-xl font-bold text-foreground mb-3">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5 pt-1">
          {step > 0 ? (
            <Button variant="ghost" size="sm" onClick={back} className="text-xs h-9">
              Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={dismiss} className="text-xs h-9 text-muted-foreground">
              Skip
            </Button>
          )}

          <Button size="sm" onClick={next} className="text-xs h-9 gap-1.5 px-5">
            {step < STEPS.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-3 h-3" />
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
