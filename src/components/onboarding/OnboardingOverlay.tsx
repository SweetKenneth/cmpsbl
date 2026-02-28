/**
 * User Onboarding Flow — first-run guided experience
 * Item #23: Highlight key features to reduce bounce rate
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scan, Brain, FlaskConical, Package, Terminal, X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ONBOARDING_KEY = 'cmpsbl_onboarded';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkLabel: string;
  gradient: string;
  accentColor: string;
  particles: string[];
}

const STEPS: OnboardingStep[] = [
  {
    icon: <Scan className="h-7 w-7" />,
    title: 'Evolution Scanner',
    description: 'A 4-phase cognitive scanner that audits edge functions, database integrity, module health, and AI capabilities — then builds an actionable plan.',
    link: '/scan',
    linkLabel: 'Explore Scanner',
    gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    accentColor: 'text-cyan-400',
    particles: ['◆', '◇', '◈'],
  },
  {
    icon: <Brain className="h-7 w-7" />,
    title: 'Persistent Memory',
    description: 'Give your AI agent permanent memory with hot/warm/cold tiering, contradiction detection, and SM-2 spaced repetition. Free tier available.',
    link: '/persistent-memory',
    linkLabel: 'Explore Memory',
    gradient: 'from-violet-500/20 via-violet-500/5 to-transparent',
    accentColor: 'text-violet-400',
    particles: ['◉', '○', '●'],
  },
  {
    icon: <FlaskConical className="h-7 w-7" />,
    title: 'Experimentation Lab',
    description: 'Test substrate modules in a live sandbox environment. Isolated execution with real-time telemetry.',
    link: '/lab',
    linkLabel: 'Open Lab',
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    accentColor: 'text-emerald-400',
    particles: ['▲', '△', '▽'],
  },
  {
    icon: <Package className="h-7 w-7" />,
    title: 'Artifact Packs',
    description: 'Activate modular capability packs across 6 strategic domains. Each pack uses 1 slot — swap anytime.',
    link: '/os',
    linkLabel: 'Choose Packs',
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    accentColor: 'text-amber-400',
    particles: ['■', '□', '◫'],
  },
  {
    icon: <Terminal className="h-7 w-7" />,
    title: 'DECODE Terminal',
    description: 'Natural language interface to the cognitive substrate. Scan, evolve, query, and control — all from one prompt.',
    link: '/decode',
    linkLabel: 'Try DECODE',
    gradient: 'from-rose-500/20 via-rose-500/5 to-transparent',
    accentColor: 'text-rose-400',
    particles: ['⟐', '⟡', '⟢'],
  },
];

export function useOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
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

/** Floating particle effect */
function FloatingParticles({ symbols, color }: { symbols: string[]; color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {symbols.map((sym, i) => (
        <motion.span
          key={i}
          className={`absolute text-lg opacity-20 ${color} select-none`}
          initial={{
            x: `${20 + i * 30}%`,
            y: '110%',
            rotate: 0,
          }}
          animate={{
            y: '-10%',
            rotate: 360,
            opacity: [0, 0.2, 0.15, 0],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'linear',
          }}
        >
          {sym}
        </motion.span>
      ))}
    </div>
  );
}

export function OnboardingOverlay({ onDismiss }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/85 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-card border border-border/60 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Gradient header area */}
          <div className={`relative h-32 sm:h-36 bg-gradient-to-br ${current.gradient} overflow-hidden`}>
            <FloatingParticles symbols={current.particles} color={current.accentColor} />
            
            {/* Close button */}
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/40 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 30 }}
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
          <div className="px-6 pt-10 pb-5">
            {/* Step counter + sparkle */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-3 h-3 text-primary/50" />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {step + 1} / {STEPS.length}
              </span>
              <Sparkles className="w-3 h-3 text-primary/50" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-center"
              >
                <h3 className="text-xl font-bold text-foreground mb-2">{current.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-sm mx-auto">
                  {current.description}
                </p>

                <Link to={current.link} onClick={onDismiss}>
                  <Button variant="outline" size="sm" className={`gap-1.5 border-border/60 hover:border-primary/40 transition-colors`}>
                    {current.linkLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots + navigation */}
          <div className="px-6 pb-5">
            {/* Dots */}
            <div className="flex justify-center gap-2 mb-4">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className="group relative"
                >
                  <motion.div
                    className={`h-2 rounded-full transition-colors ${
                      i === step ? 'bg-primary w-6' : 'bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40'
                    }`}
                    layout
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={onDismiss}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)}>
                    Back
                  </Button>
                )}
                {step < STEPS.length - 1 ? (
                  <Button size="sm" onClick={() => setStep(s => s + 1)}>
                    Next
                  </Button>
                ) : (
                  <Button size="sm" onClick={onDismiss} className="gap-1.5">
                    Get Started <Sparkles className="w-3 h-3" />
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