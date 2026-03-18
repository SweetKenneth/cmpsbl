/**
 * Memory Stream Onboarding — First-visit explainer for /foundry
 * Introduces crystallization, tiers, vault, and discovery
 */

import { useState, useEffect } from 'react';
import { X, ArrowRight, Layers, Diamond, Search, Package, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import './cmpsbl-welcome.css';

const STORAGE_KEY = 'memory-stream-onboarded';

const STEPS = [
  {
    icon: Sparkles,
    tag: 'Discovery',
    title: 'The Memory Stream',
    body: 'A continuous substrate of evolving software systems. The Memory Stream crystallizes raw cognitive signals into real, scored, portable code you can use immediately.',
    accent: 'primary',
    pattern: 'radial-gradient(circle at 30% 70%, hsl(var(--primary) / 0.08) 0%, transparent 60%)',
  },
  {
    icon: Search,
    tag: 'Mine',
    title: 'Crystallize Memories',
    body: 'Hit the crystallize button to sample the stream. Each pull discovers new software — scored by CJPI, filtered by a quality floor of 68+. Every result is real, working code.',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 70% 30%, hsl(var(--neon-cyan) / 0.08) 0%, transparent 60%)',
  },
  {
    icon: Diamond,
    tag: 'Rarity',
    title: '6 Tiers of Discovery',
    body: 'Discoveries are classified from Raw to Apex. Higher tiers mean greater novelty, utility, and composability. Apex discoveries are exceptionally rare substrate-grade software.',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 50% 80%, hsl(var(--neon-purple) / 0.08) 0%, transparent 60%)',
  },
  {
    icon: Layers,
    tag: 'Vault',
    title: 'Your Personal Vault',
    body: 'Every crystallized memory is stored in your persistent vault. Browse, filter, export, and manage your discoveries across sessions — the substrate remembers everything.',
    accent: 'neon-green',
    pattern: 'radial-gradient(circle at 20% 40%, hsl(var(--neon-green) / 0.08) 0%, transparent 60%)',
  },
  {
    icon: Package,
    tag: 'Export',
    title: 'Export & Use',
    body: 'Download any discovery as a portable capability pack — source code, tests, documentation, and a Mini-Runtime™ engine. Use it anywhere, in any stack.',
    accent: 'neon-amber',
    pattern: 'radial-gradient(circle at 80% 60%, hsl(var(--neon-amber) / 0.08) 0%, transparent 60%)',
  },
];

const accentMap: Record<string, string> = {
  primary: 'text-primary bg-primary/10 border-primary/20',
  'neon-cyan': 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  'neon-purple': 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
  'neon-green': 'text-neon-green bg-neon-green/10 border-neon-green/20',
  'neon-amber': 'text-neon-amber bg-neon-amber/10 border-neon-amber/20',
};

const iconAccent: Record<string, string> = {
  primary: 'text-primary',
  'neon-cyan': 'text-neon-cyan',
  'neon-purple': 'text-neon-purple',
  'neon-green': 'text-neon-green',
  'neon-amber': 'text-neon-amber',
};

export function MemoryStreamOnboarding() {
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
    } else dismiss();
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
    <div className="fixed inset-0 z-[12000] grid place-items-center p-4 cmpsbl-welcome-backdrop" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cmpsbl-welcome-fade-in" />
      <div className="relative w-full max-w-md cmpsbl-welcome-modal-enter">
        <div className="relative bg-background/95 border border-border/30 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none cmpsbl-welcome-pattern-shift" style={{ background: current.pattern }} />
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="cmpsbl-welcome-scanline" />
          </div>

          <div className="relative flex items-center justify-between px-5 pt-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > step ? 'next' : 'prev'); setStep(i); }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500 cursor-pointer',
                    i === step ? 'w-7 bg-primary cmpsbl-welcome-dot-active'
                      : i < step ? 'w-3 bg-primary/40' : 'w-3 bg-muted/40'
                  )}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={dismiss} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors" aria-label="Skip">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div key={step} className={cn('relative px-6 pt-6 pb-5', direction === 'next' ? 'cmpsbl-welcome-slide-in-right' : 'cmpsbl-welcome-slide-in-left')}>
            <div className={cn('w-12 h-12 rounded-xl border flex items-center justify-center mb-4 cmpsbl-welcome-icon-pop', colors)}>
              <Icon className={cn('w-6 h-6', iconColor)} />
            </div>
            <p className="text-[10px] font-mono text-primary/60 uppercase tracking-[0.15em] mb-1 cmpsbl-welcome-tag-fade">{current.tag}</p>
            <h2 className="text-xl font-bold text-foreground mb-3 cmpsbl-welcome-title-reveal">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed cmpsbl-welcome-body-fade">{current.body}</p>
          </div>

          <div className="relative flex items-center justify-between px-6 pb-5 pt-1">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={back} className="text-xs h-9">Back</Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={dismiss} className="text-xs h-9 text-muted-foreground">Skip</Button>
            )}
            <Button size="sm" onClick={next} className="text-xs h-9 gap-1.5 px-5 cmpsbl-welcome-cta-glow">
              {step < STEPS.length - 1 ? (<>Next <ArrowRight className="w-3 h-3" /></>) : 'Start Crystallizing'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
