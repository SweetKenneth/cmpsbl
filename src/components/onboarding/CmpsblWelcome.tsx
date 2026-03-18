/**
 * CMPSBL Welcome Onboarding — First-visit guided tour for /
 * Animated multi-step modal introducing the cognitive substrate
 */

import { useState, useEffect } from 'react';
import { X, ArrowRight, Terminal, Sparkles, Database, ShoppingBag, Zap, Bot, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import './cmpsbl-welcome.css';

const STORAGE_KEY = 'cmpsbl-welcomed';

const STEPS = [
  {
    icon: Sparkles,
    tag: 'Welcome',
    title: 'Welcome to CMPSBL',
    body: 'A cognitive operating system where autonomous nodes discover, evolve, and export real software — not prompts, not wrappers. Real, scored, portable code.',
    accent: 'primary',
    pattern: 'radial-gradient(circle at 30% 70%, hsl(var(--primary) / 0.08) 0%, transparent 60%)',
  },
  {
    icon: Terminal,
    tag: 'Build',
    title: 'CodeLab & Signal Forge',
    body: 'Write, test, and forge signals directly inside the substrate. CodeLab is your creation surface — Signal Forge turns raw ideas into substrate-grade capabilities.',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 70% 30%, hsl(var(--neon-cyan) / 0.08) 0%, transparent 60%)',
  },
  {
    icon: Database,
    tag: 'Remember',
    title: 'Persistent Memory',
    body: 'Every discovery, every collision, every ascended capability is stored in your personal vault. Your work persists across sessions — the substrate never forgets.',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 50% 80%, hsl(var(--neon-purple) / 0.08) 0%, transparent 60%)',
  },
  {
    icon: Layers,
    tag: 'Discover',
    title: 'Memory Stream',
    body: 'A living river of crystallized software. The substrate continuously discovers new capabilities — scored by CJPI, tiered by rarity. Explore, crystallize, and export.',
    accent: 'neon-green',
    pattern: 'radial-gradient(circle at 20% 40%, hsl(var(--neon-green) / 0.08) 0%, transparent 60%)',
  },
  {
    icon: ShoppingBag,
    tag: 'Acquire',
    title: 'The Store',
    body: 'Curated capability packs across 6 strategic domains. Each pack slots into your runtime — activate what you need, swap anytime, govern everything.',
    accent: 'neon-amber',
    pattern: 'radial-gradient(circle at 80% 60%, hsl(var(--neon-amber) / 0.08) 0%, transparent 60%)',
  },
  {
    icon: Zap,
    tag: 'Scale',
    title: 'Upgrade & Evolve',
    body: 'Unlock more memory slots, higher-tier discoveries, and deeper collision chains. Your substrate grows with you — from prototype to production.',
    accent: 'neon-magenta',
    pattern: 'radial-gradient(circle at 60% 20%, hsl(var(--neon-magenta) / 0.08) 0%, transparent 60%)',
  },
  {
    icon: Bot,
    tag: 'Meet',
    title: 'Meet DECODE',
    body: 'Your substrate interpreter. DECODE translates between you and the 40-node cognitive mesh — ask questions, run commands, explore capabilities. It\'s always listening.',
    accent: 'primary',
    pattern: 'radial-gradient(circle at 40% 50%, hsl(var(--primary) / 0.1) 0%, transparent 60%)',
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

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setDirection('next');
      setStep(s => s + 1);
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
  const colors = accentMap[current.accent] || accentMap.primary;
  const iconColor = iconAccent[current.accent] || iconAccent.primary;

  return (
    <div
      className="fixed inset-0 z-[12000] grid place-items-center p-4 cmpsbl-welcome-backdrop"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cmpsbl-welcome-fade-in" />

      {/* Modal */}
      <div className="relative w-full max-w-md cmpsbl-welcome-modal-enter">
        <div
          className="relative bg-background/95 border border-border/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Ambient pattern */}
          <div
            className="absolute inset-0 pointer-events-none cmpsbl-welcome-pattern-shift"
            style={{ background: current.pattern }}
          />

          {/* Scan line effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="cmpsbl-welcome-scanline" />
          </div>

          {/* Progress bar + close */}
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
                        ? 'w-3 bg-primary/40'
                        : 'w-3 bg-muted/40'
                  )}
                  aria-label={`Go to step ${i + 1}`}
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
          <div
            key={step}
            className={cn(
              'relative px-6 pt-6 pb-5',
              direction === 'next' ? 'cmpsbl-welcome-slide-in-right' : 'cmpsbl-welcome-slide-in-left'
            )}
          >
            {/* Icon badge */}
            <div className={cn(
              'w-12 h-12 rounded-xl border flex items-center justify-center mb-4 cmpsbl-welcome-icon-pop',
              colors
            )}>
              <Icon className={cn('w-6 h-6', iconColor)} />
            </div>

            {/* Tag */}
            <p className="text-[10px] font-mono text-primary/60 uppercase tracking-[0.15em] mb-1 cmpsbl-welcome-tag-fade">
              {current.tag}
            </p>

            {/* Title */}
            <h2 className="text-xl font-bold text-foreground mb-3 cmpsbl-welcome-title-reveal">
              {current.title}
            </h2>

            {/* Body */}
            <p className="text-sm text-muted-foreground leading-relaxed cmpsbl-welcome-body-fade">
              {current.body}
            </p>
          </div>

          {/* Footer */}
          <div className="relative flex items-center justify-between px-6 pb-5 pt-1">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={back} className="text-xs h-9">
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={dismiss} className="text-xs h-9 text-muted-foreground">
                Skip
              </Button>
            )}
            <Button size="sm" onClick={next} className="text-xs h-9 gap-1.5 px-5 cmpsbl-welcome-cta-glow">
              {step < STEPS.length - 1 ? (
                <>Next <ArrowRight className="w-3 h-3" /></>
              ) : (
                'Enter the Substrate'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
