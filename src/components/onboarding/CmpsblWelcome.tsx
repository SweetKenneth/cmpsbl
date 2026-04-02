/**
 * CMPSBL Welcome Onboarding — First-visit guided tour for /
 * Animated multi-step modal introducing the platform
 * Uniform "Next" button bottom-right on every card
 */

import { useState, useEffect } from 'react';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ChevronRight, Zap, Terminal, Database, LayoutDashboard, Route, Package, Brain, Shield, Moon } from 'lucide-react';
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
  footer?: string;
  /** Inline CTA (embedded in card body, not footer) */
  inlineCta?: { text: string; href: string };
  /** Second inline CTA */
  secondaryInlineCta?: { text: string; href: string };
  /** Bullet list */
  bullets?: string[];
  /** Dual entry descriptions */
  entries?: { icon: React.ElementType; label: string; desc: string }[];
}

const STEPS: OnboardingStep[] = [
  {
    icon: Brain,
    tag: 'Memory',
    title: 'CMPSBL Remembers',
    body: 'CMPSBL maintains a persistent memory layer where activity is retained and built upon over time.\n\nMemory can be applied to agents, language models, and applications, allowing behavior to carry forward between interactions. Systems can retain context, reuse what has already been learned, and operate with continuity instead of starting over.',
    footer: 'Nothing resets.',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 30% 70%, hsl(var(--neon-cyan) / 0.12) 0%, transparent 50%)',
  },
  {
    icon: Database,
    tag: 'Discovery',
    title: 'Memories Are Exportable',
    body: 'CMPSBL is a cognitive environment that searches for memory chains autonomously. As they are discovered, chains are stored in the Memory Stream for users to capture, reuse, or resell.',
    footer: 'Crystallize memories daily. Licensed, exportable, and valuable.',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 70% 30%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Moon,
    tag: 'Evolution',
    title: 'Self-Improving Infrastructure',
    body: "CMPSBL enters dream states during off-peak hours, reasoning through the day's interactions to refine and optimize its capabilities.\n\nThis same behavior can be applied to agents, models, and applications, allowing what you build to improve over time without manual updates.",
    footer: 'FAILSAFE provides backup and restore. Install it from The Store.',
    accent: 'neon-magenta',
    pattern: 'radial-gradient(circle at 50% 80%, hsl(var(--neon-magenta) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Shield,
    tag: 'Governance',
    title: 'Complete Control',
    body: 'CMPSBL has built-in guardrails that give you direct control over your agents and language models. These can be used to guide behavior, validate outputs, and keep systems operating the way you intend.',
    footer: 'You decide how it runs.',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 80% 60%, hsl(var(--neon-cyan) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Zap,
    tag: 'Get started',
    title: 'Create a Free Account',
    body: "Upgradable plans unlock new capabilities, expand Memory Stream access, and open deeper parts of the system.\n\nEverything you build can retain context, improve through real usage, and behave the way you intend. The system is already running — you can explore it at any time.",
    footer: 'All users are first-class. No credit card required.',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 40% 50%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
    inlineCta: { text: 'Explore the Substrate', href: '/explore' },
    secondaryInlineCta: { text: 'Start Building — Free', href: '/auth' },
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
        <div className="relative bg-background/95 border border-border/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
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
          <div className="absolute top-0 inset-x-0 h-[2px] bg-[hsl(var(--neon-cyan)/0.4)]" />

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
                      ? 'w-7 bg-[hsl(var(--neon-cyan))] cmpsbl-welcome-dot-active'
                      : i < step
                        ? 'w-3 bg-[hsl(var(--neon-cyan)/0.5)]'
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
              'relative px-6 pt-3 pb-5 flex-1',
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
            {current.body.split('\n\n').map((paragraph, i) => (
              <p key={i} className={cn("text-[13px] text-muted-foreground leading-relaxed cmpsbl-welcome-body-fade", i > 0 && "mt-2.5")}>
                {paragraph}
              </p>
            ))}

            {/* Footer quote */}
            {current.footer && (
              <p className="mt-3 text-[11px] font-mono text-muted-foreground/60 cmpsbl-welcome-body-fade">
                {current.footer}
              </p>
            )}

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

            {/* Inline CTAs embedded in card body */}
            {(current.inlineCta || current.secondaryInlineCta) && (
              <div className="mt-4 flex flex-wrap gap-2 cmpsbl-welcome-body-fade">
                {current.inlineCta && (
                  <button
                    onClick={() => { dismiss(); navigate(current.inlineCta!.href); }}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors',
                      colors,
                      'hover:opacity-80'
                    )}
                  >
                    {current.inlineCta.text}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {current.secondaryInlineCta && (
                  <button
                    onClick={() => { dismiss(); navigate(current.secondaryInlineCta!.href); }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {current.secondaryInlineCta.text}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer — uniform Next button bottom-right on every card */}
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

            <Button
              size="sm"
              onClick={next}
              className="text-xs h-9 gap-1.5 px-5 cmpsbl-welcome-cta-glow"
            >
              {isLastStep ? 'Explore the Substrate' : 'Next →'}
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
