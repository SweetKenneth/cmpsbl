/**
 * User Onboarding Flow — Memory Stream themed
 * Explains crystallized memories, free-tier value, and upgrade path
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Brain, Zap, Terminal, X, ArrowRight, ChevronLeft,
  Gem, Rocket, Shield, Layers, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ONBOARDING_KEY = 'cmpsbl_onboarded';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  detail?: string;
  link: string;
  linkLabel: string;
  gradient: string;
  accentColor: string;
  accentBg: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: <Sparkles className="h-7 w-7" />,
    title: 'Welcome to the Memory Stream',
    description: 'The substrate discovers and scores software memories continuously. Crystallize them into your vault, choose what to keep, and deploy real production-grade software.',
    detail: 'Every crystallization reveals a memory. You decide: Keep it or Discard it.',
    link: '/foundry',
    linkLabel: 'Open Memory Stream',
    gradient: 'from-sky-500/20 via-indigo-500/10 to-transparent',
    accentColor: 'text-sky-400',
    accentBg: 'bg-sky-500/10',
  },
  {
    icon: <Gem className="h-7 w-7" />,
    title: 'Rarity & Discovery',
    description: 'Every memory is scored 68–100 and assigned a rarity tier. Rare discoveries (Relic, Mythic, Apex) appear occasionally — Mythic memories trigger special vault prompts so you never lose them.',
    detail: 'Mint (68–79) · Prime (80–89) · Relic (90–93) · Mythic (94–99) · Apex (100)',
    link: '/foundry',
    linkLabel: 'Start Crystallizing',
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    accentColor: 'text-violet-400',
    accentBg: 'bg-violet-500/10',
  },
  {
    icon: <Crown className="h-7 w-7" />,
    title: 'Builder Tier — Free Forever',
    description: 'You get 3 daily pulls, 5 vault slots, 3 artifact slots, persistent memory, and full module telemetry — all at $0. Every tier can discover Relic and Mythic-grade software.',
    detail: '3 pulls/day · 5 vault capacity · 3 artifact slots · No export',
    link: '/workspace',
    linkLabel: 'Open Workspace',
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
  },
  {
    icon: <Brain className="h-7 w-7" />,
    title: 'Your Vault Stores Discoveries',
    description: 'Memories you choose to keep go into your vault. Vault capacity depends on your tier — from 5 (Builder) to unlimited (Architect). Remove old memories to free space anytime.',
    detail: 'Builder: 5 · Studio: 25 · Creator: 75 · Architect: Unlimited',
    link: '/foundry',
    linkLabel: 'Explore Vault',
    gradient: 'from-purple-500/20 via-fuchsia-500/10 to-transparent',
    accentColor: 'text-purple-400',
    accentBg: 'bg-purple-500/10',
  },
  {
    icon: <Terminal className="h-7 w-7" />,
    title: 'Build & Command',
    description: 'The Builder Workspace gives you in-browser SDK access with pre-installed templates. Creator and Architect tiers can equip discovered memories directly into custom runtime slots.',
    detail: 'Studio ($29) · Creator ($49) · Architect ($79) — depth, not feature walls.',
    link: '/workspace',
    linkLabel: 'Open Terminal',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    accentColor: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
  },
  {
    icon: <Rocket className="h-7 w-7" />,
    title: 'Upgrade When You\'re Ready',
    description: 'Paid tiers unlock more daily pulls, larger vaults, artifact export, custom pipeline slots, and priority NEXUS routing. The substrate runs the same for everyone — tiers govern capacity, not capability.',
    link: '/upgrade',
    linkLabel: 'View Plans',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    accentColor: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
  },
];

export function useOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    const suppressOnFoundry = path.startsWith('/foundry') || path.startsWith('/memory-stream');
    if (suppressOnFoundry) return;

    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
  };

  return { show, dismiss };
}

interface OnboardingOverlayProps {
  onDismiss: () => void;
}

export function OnboardingOverlay({ onDismiss }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-card border border-border/60 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Gradient header with Memory Stream aesthetic */}
          <div className={`relative h-32 sm:h-36 bg-gradient-to-br ${current.gradient} overflow-hidden`}>
            {/* Flowing stream lines */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                  style={{ top: `${20 + i * 15}%`, width: '120%', left: '-10%' }}
                  animate={{ x: ['-10%', '10%', '-10%'] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                />
              ))}
            </div>

            {/* Header label */}
            <div className="absolute top-3 left-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/60">
                Memory Stream
              </span>
            </div>
            
            {/* Close button */}
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/40 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 20 }}
                transition={{ type: 'spring', damping: 15 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10"
              >
                <div className={`p-4 rounded-2xl bg-card border border-border shadow-lg ${current.accentColor}`}>
                  {current.icon}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="px-6 pt-12 pb-4">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-1.5 mb-5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  aria-label={`Step ${i + 1}`}
                >
                  <motion.div
                    className={`h-1.5 rounded-full transition-colors ${
                      i === step ? `${current.accentBg} w-8` : 'bg-muted-foreground/15 w-1.5 hover:bg-muted-foreground/30'
                    }`}
                    layout
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <h3 className="text-xl font-bold text-foreground mb-2">{current.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3 max-w-sm mx-auto">
                  {current.description}
                </p>

                {current.detail && (
                  <p className="text-xs font-mono text-primary/70 leading-relaxed mb-4 max-w-sm mx-auto px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                    {current.detail}
                  </p>
                )}

                <Link to={current.link} onClick={onDismiss}>
                  <Button variant="outline" size="sm" className="gap-1.5 border-border/60 hover:border-primary/40 transition-colors">
                    {current.linkLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-6 pb-5 pt-2">
            <div className="flex justify-between items-center">
              <button
                onClick={onDismiss}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-1"
              >
                Skip
              </button>
              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)} className="gap-1 text-xs h-8">
                    <ChevronLeft className="w-3 h-3" />
                    Back
                  </Button>
                )}
                {!isLast ? (
                  <Button size="sm" onClick={() => setStep(s => s + 1)} className="text-xs h-8">
                    Next
                  </Button>
                ) : (
                  <Button size="sm" onClick={onDismiss} className="gap-1.5 text-xs h-8">
                    Start Building <Sparkles className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
