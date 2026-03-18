/**
 * Memory Stream Onboarding — First-visit explainer for /foundry
 * Introduces crystallization, vault, rarity tiers, and the discovery loop
 */

import { useState, useEffect } from 'react';
import { Sparkles, Gem, Brain, Zap, Terminal, Rocket, X, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import './cmpsbl-welcome.css';

const STORAGE_KEY = 'memory-stream-onboarded';

const STEPS = [
  {
    icon: <Sparkles className="w-7 h-7" />,
    tag: 'MEMORY STREAM',
    title: 'Welcome to the Memory Stream',
    body: 'The substrate discovers and scores software memories continuously. Crystallize them into your vault, choose what to keep, and deploy real production-grade software.',
    detail: 'Every crystallization reveals a memory. You decide: Keep it or Discard it.',
  },
  {
    icon: <Gem className="w-7 h-7" />,
    tag: 'RARITY',
    title: 'Rarity & Discovery',
    body: 'Every memory is scored 68–100 and assigned a rarity tier. Rare discoveries (Relic, Mythic, Apex) appear occasionally — Mythic memories trigger special vault prompts so you never lose them.',
    detail: 'Mint (68–79) · Prime (80–89) · Relic (90–93) · Mythic (94–99) · Apex (100)',
  },
  {
    icon: <Brain className="w-7 h-7" />,
    tag: 'VAULT',
    title: 'Your Vault Stores Discoveries',
    body: 'Memories you choose to keep go into your vault. Vault capacity depends on your tier — from 5 (Builder) to unlimited (Architect). Remove old memories to free space anytime.',
    detail: 'Builder: 5 · Studio: 25 · Creator: 75 · Architect: Unlimited',
  },
  {
    icon: <Zap className="w-7 h-7" />,
    tag: 'CAPABILITY',
    title: 'Capability Packs',
    body: 'Activate memory packs across 6 strategic domains. Each pack uses exactly one slot. Your plan controls how many slots you have — not which packs you can see.',
    detail: '24 packs · 6 domains · Swap anytime',
  },
  {
    icon: <Terminal className="w-7 h-7" />,
    tag: 'BUILD',
    title: 'Build & Command',
    body: 'The Builder Workspace gives you in-browser SDK access with pre-installed templates. Creator and Architect tiers can equip discovered memories directly into custom runtime slots.',
    detail: 'Studio ($29) · Creator ($49) · Architect ($79)',
  },
  {
    icon: <Rocket className="w-7 h-7" />,
    tag: 'UPGRADE',
    title: 'Upgrade When You\'re Ready',
    body: 'Paid tiers unlock more daily pulls, larger vaults, capability export, custom memory slots, and priority NEXUS routing. The substrate runs the same for everyone — tiers govern capacity, not capability.',
  },
];

export function MemoryStreamOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    const welcomeDone = localStorage.getItem('cmpsbl-welcomed');
    if (!seen && welcomeDone) setOpen(true);
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

  return (
    <div className="cmpsbl-welcome-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm">
      <div className="cmpsbl-welcome-modal-enter relative bg-card border border-border/60 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Scanline */}
        <div className="cmpsbl-welcome-scanline" />

        {/* Header with ambient gradient */}
        <div className="relative px-6 pt-5 pb-10 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent overflow-hidden">
          <div className="cmpsbl-welcome-pattern-shift absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary/15"
                style={{
                  left: `${15 + i * 14}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>

          {/* Step counter + close */}
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/60">
              {current.tag}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums">
                {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
              </span>
              <button
                onClick={dismiss}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Centered icon */}
          <div className="flex justify-center mt-4">
            <div className="cmpsbl-welcome-icon-pop p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              {current.icon}
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 -mt-4 mb-2 relative z-10">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > step ? 'next' : 'prev'); setStep(i); }}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === step ? 'w-7 bg-primary cmpsbl-welcome-dot-active' : i < step ? 'w-1.5 bg-primary/30' : 'w-1.5 bg-muted-foreground/15',
              )}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div
          key={step}
          className={cn('px-6 pt-4 pb-2 text-center', direction === 'next' ? 'cmpsbl-welcome-slide-in-right' : 'cmpsbl-welcome-slide-in-left')}
        >
          <h3 className="cmpsbl-welcome-title-reveal text-xl font-bold text-foreground mb-2">
            {current.title}
          </h3>
          <p className="cmpsbl-welcome-body-fade text-sm text-muted-foreground leading-relaxed mb-3 max-w-sm mx-auto">
            {current.body}
          </p>
          {current.detail && (
            <p className="cmpsbl-welcome-body-fade text-xs font-mono text-primary/70 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 max-w-sm mx-auto mb-1">
              {current.detail}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 pb-5 pt-3 flex justify-between items-center">
          <button
            onClick={dismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={back} className="gap-1 text-xs h-8">
                <ChevronLeft className="w-3 h-3" /> Back
              </Button>
            )}
            <Button size="sm" onClick={next} className="cmpsbl-welcome-cta-glow gap-1.5 text-xs h-8">
              {step === STEPS.length - 1 ? 'Start Crystallizing' : 'Next'}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-muted/30">
          <div
            className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
