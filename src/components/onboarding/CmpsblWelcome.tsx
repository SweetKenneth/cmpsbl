/**
 * CMPSBL Welcome Onboarding — First-visit guided tour for /
 * Animated multi-step modal introducing the platform
 */

import { useState, useEffect } from 'react';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Zap, Terminal, Database, LayoutDashboard, Route, Package } from 'lucide-react';
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
  cta: string;
  ctaHref?: string;
  /** Final step dual CTAs */
  secondaryCta?: { text: string; href: string };
  /** Bullet list for card 4 */
  bullets?: string[];
  /** Dual entry descriptions for card 5 */
  entries?: { icon: React.ElementType; label: string; desc: string }[];
}

const STEPS: OnboardingStep[] = [
  {
    icon: Zap,
    tag: 'What this is',
    title: 'Welcome to CMPSBL',
    body: 'Build and run real software with AI. Start locally with packages, or connect to unlock memory, runtime, and system-level coordination.',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 30% 70%, hsl(var(--neon-cyan) / 0.12) 0%, transparent 50%)',
    cta: 'Continue',
  },
  {
    icon: Terminal,
    tag: 'Build',
    title: 'Build with CodeLab',
    body: 'Write and test real components in your browser. Signal Forge generates structured starting points — you take it from there.',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 70% 30%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
    cta: 'Open CodeLab',
    ctaHref: '/codelab',
  },
  {
    icon: Database,
    tag: 'Remember',
    title: 'Persistent Memory',
    body: "Your system doesn't reset. Every build, test, and discovery is stored and evolves over time in your Memory Stream.",
    accent: 'neon-magenta',
    pattern: 'radial-gradient(circle at 50% 80%, hsl(var(--neon-magenta) / 0.1) 0%, transparent 50%)',
    cta: 'View Memory',
    ctaHref: '/foundry',
  },
  {
    icon: LayoutDashboard,
    tag: 'System + Store',
    title: 'Run & Expand Your System',
    body: 'Use the dashboard to run agents and monitor your system. Install new capabilities from the Store:',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 80% 60%, hsl(var(--neon-cyan) / 0.1) 0%, transparent 50%)',
    cta: 'Open Dashboard',
    ctaHref: '/workspace',
    bullets: ['Agents', 'Engines', 'Upgrades'],
  },
  {
    icon: Route,
    tag: 'Start your way',
    title: 'Start Your Way',
    body: 'You can use CMPSBL in two ways:',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 40% 50%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
    cta: 'Create Account',
    ctaHref: '/auth',
    secondaryCta: { text: 'View npm Packages', href: '/documentation' },
    entries: [
      { icon: Package, label: 'Install packages (npm)', desc: 'Use parts of the system in your own stack' },
      { icon: Zap, label: 'Create an account', desc: 'Unlock memory, runtime, and full system features' },
    ],
  },
];

const accentMap: Record<string, string> = {
  'neon-cyan': 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  'neon-purple': 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
  'neon-magenta': 'text-neon-magenta bg-neon-magenta/10 border-neon-magenta/20',
};

const iconAccent: Record<string, string> = {
  'neon-cyan': 'text-neon-cyan',
  'neon-purple': 'text-neon-purple',
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

  const handleCta = () => {
    const current = STEPS[step];
    if (current.ctaHref) {
      dismiss();
      navigate(current.ctaHref);
    } else {
      next();
    }
  };

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const colors = accentMap[current.accent] || accentMap['neon-cyan'];
  const iconColor = iconAccent[current.accent] || iconAccent['neon-cyan'];
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

            {/* Bullet list for card 4 */}
            {current.bullets && (
              <ul className="mt-3 space-y-1.5 cmpsbl-welcome-body-fade">
                {current.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-[13px] text-foreground/80">
                    <span className={cn('w-1.5 h-1.5 rounded-full', `bg-${current.accent}`)} />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* Dual entry paths for card 5 */}
            {current.entries && (
              <div className="mt-4 space-y-2.5 cmpsbl-welcome-body-fade">
                {current.entries.map((entry) => {
                  const EntryIcon = entry.icon;
                  return (
                    <div key={entry.label} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/20">
                      <EntryIcon className={cn('w-4 h-4 mt-0.5 shrink-0', iconColor)} />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{entry.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{entry.desc}</p>
                      </div>
                    </div>
                  );
                })}
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

            <div className="flex items-center gap-2">
              {isLastStep && current.secondaryCta && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { dismiss(); navigate(current.secondaryCta!.href); }}
                  className="text-xs h-9 gap-1.5"
                >
                  {current.secondaryCta.text}
                </Button>
              )}
              <Button size="sm" onClick={handleCta} className="text-xs h-9 gap-1.5 px-5 cmpsbl-welcome-cta-glow">
                {current.cta} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
