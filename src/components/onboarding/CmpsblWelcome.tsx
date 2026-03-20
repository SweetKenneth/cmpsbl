/**
 * CMPSBL Welcome Onboarding — First-visit guided tour for /
 * Animated multi-step modal introducing the cognitive substrate
 */

import { useState, useEffect } from 'react';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Sparkles, Terminal, Database, ShoppingBag, Zap, Bot, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import './cmpsbl-welcome.css';

const STORAGE_KEY = 'cmpsbl-welcomed';

interface OnboardingStep {
  icon: React.ElementType;
  tag: string;
  title: string;
  body: string;
  accent: string;
  pattern: string;
  /** Rendered on the final step only — actionable next steps */
  nextSteps?: { text: string; href: string }[];
}

const STEPS: OnboardingStep[] = [
  {
    icon: Sparkles,
    tag: 'Welcome',
    title: 'Welcome to CMPSBL',
    body: 'An AI operating system built from 40 autonomous nodes. It discovers, scores, and exports real software — not prompts or wrappers. Everything runs on one composable substrate.',
    accent: 'primary',
    pattern: 'radial-gradient(circle at 30% 70%, hsl(var(--primary) / 0.12) 0%, transparent 50%)',
  },
  {
    icon: Terminal,
    tag: 'Build',
    title: 'CodeLab & Signal Forge',
    body: 'Write code, test resolvers, and forge signals in-browser. Describe what you want — Signal Forge analyzes it against the full node topology and generates a scored blueprint.',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 70% 30%, hsl(var(--neon-cyan) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Database,
    tag: 'Remember',
    title: 'Persistent Memory',
    body: 'Every discovery is stored in your vault with 4-tier temperature management (hot → warm → cool → cold). Your work persists across sessions — the substrate never forgets.',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 50% 80%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: ShoppingBag,
    tag: 'Acquire',
    title: 'The Store',
    body: '10 products on a single pricing ladder. Runtime Agents execute autonomously. Composable Engines power the infrastructure. Browse plans, memories, and collector cards.',
    accent: 'neon-amber',
    pattern: 'radial-gradient(circle at 80% 60%, hsl(var(--neon-amber) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Bot,
    tag: 'Your next step',
    title: 'Start Exploring',
    body: 'You\'re ready. The free Builder tier gives you 3 memory slots, full runtime access, and no credit card required. Here\'s where to go:',
    accent: 'neon-green',
    pattern: 'radial-gradient(circle at 40% 50%, hsl(var(--neon-green) / 0.1) 0%, transparent 50%)',
    nextSteps: [
      { text: 'Read the documentation', href: '/documentation' },
      { text: 'Try the Memory Stream live', href: '/foundry' },
      { text: 'Browse the Store', href: '/store' },
    ],
  },
];

const accentMap: Record<string, string> = {
  primary: 'text-primary bg-primary/10 border-primary/20',
  'neon-cyan': 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  'neon-purple': 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
  'neon-green': 'text-neon-green bg-neon-green/10 border-neon-green/20',
  'neon-amber': 'text-neon-amber bg-neon-amber/10 border-neon-amber/20',
  'neon-magenta': 'text-neon-magenta bg-neon-magenta/10 border-neon-magenta/20',
};

const iconAccent: Record<string, string> = {
  primary: 'text-primary',
  'neon-cyan': 'text-neon-cyan',
  'neon-purple': 'text-neon-purple',
  'neon-green': 'text-neon-green',
  'neon-amber': 'text-neon-amber',
  'neon-magenta': 'text-neon-magenta',
};

export function CmpsblWelcome() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const navigate = useNavigate();
  const { trackOpened, trackStep, trackCompleted, trackSkipped } = useOnboardingTracking('welcome');

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) { setOpen(true); trackOpened(); }
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const dismiss = () => {
    if (step < STEPS.length - 1) {
      trackSkipped(step, STEPS.length);
    } else {
      trackCompleted(STEPS.length);
    }
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setDirection('next');
      setStep(s => {
        const ns = s + 1;
        trackStep(ns, STEPS[ns]?.tag);
        return ns;
      });
    } else {
      dismiss();
    }
  };

  const back = () => {
    if (step > 0) {
      setDirection('prev');
      setStep(s => s - 1);
    }
  };

  const handleNextStepClick = (href: string) => {
    dismiss();
    navigate(href);
  };

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const colors = accentMap[current.accent] || accentMap.primary;
  const iconColor = iconAccent[current.accent] || iconAccent.primary;
  const isLastStep = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[12000] grid place-items-center p-4 cmpsbl-welcome-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm cmpsbl-welcome-fade-in" />

      <div className="relative w-full max-w-md cmpsbl-welcome-modal-enter">
        <div className="relative bg-background/95 border border-border/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none cmpsbl-welcome-pattern-shift"
            style={{ background: current.pattern }}
          />

          {/* Scan line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="cmpsbl-welcome-scanline" />
          </div>

          {/* Top edge accent */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Progress + close */}
          <div className="relative flex items-center justify-between px-5 pt-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > step ? 'next' : 'prev'); setStep(i); }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500 cursor-pointer',
                    i === step
                      ? 'w-7 bg-primary cmpsbl-welcome-dot-active'
                      : i < step
                        ? 'w-3 bg-primary/50'
                        : 'w-3 bg-muted-foreground/20'
                  )}
                  aria-label={`Step ${i + 1}: ${STEPS[i].title}`}
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

          {/* Step counter */}
          <div className="relative px-5 pt-3">
            <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Content */}
          <div
            key={step}
            className={cn(
              'relative px-6 pt-3 pb-5',
              direction === 'next' ? 'cmpsbl-welcome-slide-in-right' : 'cmpsbl-welcome-slide-in-left'
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-xl border flex items-center justify-center mb-4 cmpsbl-welcome-icon-pop',
              colors
            )}>
              <Icon className={cn('w-6 h-6', iconColor)} />
            </div>

            <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-1.5 cmpsbl-welcome-tag-fade text-muted-foreground/60">
              {current.tag}
            </p>
            <h2 className="text-lg font-bold text-foreground mb-2.5 tracking-tight cmpsbl-welcome-title-reveal">
              {current.title}
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed cmpsbl-welcome-body-fade">
              {current.body}
            </p>

            {/* Actionable next steps on final slide */}
            {isLastStep && current.nextSteps && (
              <div className="mt-4 space-y-2 cmpsbl-welcome-body-fade">
                {current.nextSteps.map((ns) => (
                  <button
                    key={ns.href}
                    onClick={() => handleNextStepClick(ns.href)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/20 hover:border-primary/30 transition-all text-left group"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{ns.text}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary ml-auto shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="relative flex items-center justify-between px-6 pb-5 pt-1 border-t border-border/10">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={back} className="text-xs h-9 gap-1">
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={dismiss} className="text-xs h-9 text-muted-foreground">
                Skip tour
              </Button>
            )}
            <Button size="sm" onClick={next} className="text-xs h-9 gap-1.5 px-5 cmpsbl-welcome-cta-glow">
              {isLastStep ? (
                'Got it — let\'s go →'
              ) : (
                <>Next <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
