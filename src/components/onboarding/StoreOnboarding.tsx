/**
 * Store Onboarding — First-visit explainer for /store
 * Introduces agents, engines, tiers, and the collector experience
 */

import { useState, useEffect } from 'react';
import { X, ArrowRight, ShoppingBag, Users, Cpu, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import './cmpsbl-welcome.css';

const STORAGE_KEY = 'store-onboarded';

const STEPS = [
  {
    icon: ShoppingBag,
    tag: 'Welcome',
    title: 'The Collector Store',
    body: 'Your hub for acquiring Runtime Agents and Composable Engines. 10 products across 5 tiers on a single pricing ladder — from free to Apex.',
    accent: 'primary',
    pattern: 'radial-gradient(circle at 30% 70%, hsl(var(--primary) / 0.12) 0%, transparent 50%)',
  },
  {
    icon: Users,
    tag: 'Agents',
    title: 'Runtime Agents',
    body: 'Sealed, self-improving AI that you own. From PRIMITIVE to RAPTOR — each agent comes with 4-tier memory, always-on learning, and a unique personality layer.',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 70% 30%, hsl(var(--neon-cyan) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Cpu,
    tag: 'Engines',
    title: 'Composable Engines',
    body: 'BEACON, AUTOMATON, CORTEX, NEXUS, ARCHITECT — specialized systems that slot into your runtime. Mix and match to build exactly the stack you need.',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 50% 80%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Layers,
    tag: 'Tiers',
    title: '5-Tier Pricing Ladder',
    body: 'Free → Starter → Pro → Elite → Apex. Every tier unlocks more power. FAILSAFE is free for authenticated users. No hidden costs, no surprises.',
    accent: 'neon-amber',
    pattern: 'radial-gradient(circle at 80% 60%, hsl(var(--neon-amber) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Sparkles,
    tag: 'Collect',
    title: 'Flip, Zoom, Collect',
    body: 'Each product is a collector card — flip to see full specs, zoom for detail. Manage your memories and plans all from one place. Start collecting.',
    accent: 'neon-green',
    pattern: 'radial-gradient(circle at 40% 50%, hsl(var(--neon-green) / 0.1) 0%, transparent 50%)',
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

export function StoreOnboarding() {
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

  const dismiss = () => { setOpen(false); localStorage.setItem(STORAGE_KEY, 'true'); };
  const next = () => { if (step < STEPS.length - 1) { setDirection('next'); setStep(s => s + 1); } else dismiss(); };
  const back = () => { if (step > 0) { setDirection('prev'); setStep(s => s - 1); } };

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const colors = accentMap[current.accent] || accentMap.primary;
  const iconColor = iconAccent[current.accent] || iconAccent.primary;

  return (
    <div className="fixed inset-0 z-[12000] grid place-items-center p-4 cmpsbl-welcome-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm cmpsbl-welcome-fade-in" />
      <div className="relative w-full max-w-md cmpsbl-welcome-modal-enter">
        <div className="relative bg-background/95 border border-border/30 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none cmpsbl-welcome-pattern-shift" style={{ background: current.pattern }} />
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"><div className="cmpsbl-welcome-scanline" /></div>
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-neon-amber/40 to-transparent" />

          <div className="relative flex items-center justify-between px-5 pt-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50">THE STORE</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums">{String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}</span>
              <button onClick={dismiss} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors" aria-label="Skip"><X className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="relative flex gap-1.5 px-5 pt-3">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => { setDirection(i > step ? 'next' : 'prev'); setStep(i); }}
                className={cn('h-1.5 rounded-full transition-all duration-500 cursor-pointer', i === step ? 'w-7 bg-primary cmpsbl-welcome-dot-active' : i < step ? 'w-3 bg-primary/50' : 'w-3 bg-muted-foreground/20')}
                aria-label={`Step ${i + 1}: ${STEPS[i].title}`} />
            ))}
          </div>

          <div key={step} className={cn('relative px-6 pt-5 pb-5', direction === 'next' ? 'cmpsbl-welcome-slide-in-right' : 'cmpsbl-welcome-slide-in-left')}>
            <div className={cn('w-12 h-12 rounded-xl border flex items-center justify-center mb-4 cmpsbl-welcome-icon-pop', colors)}><Icon className={cn('w-6 h-6', iconColor)} /></div>
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-1.5 cmpsbl-welcome-tag-fade text-muted-foreground/60">{current.tag}</p>
            <h2 className="text-lg font-bold text-foreground mb-2.5 tracking-tight cmpsbl-welcome-title-reveal">{current.title}</h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed cmpsbl-welcome-body-fade">{current.body}</p>
          </div>

          <div className="relative flex items-center justify-between px-6 pb-5 pt-1 border-t border-border/10">
            {step > 0 ? (<Button variant="ghost" size="sm" onClick={back} className="text-xs h-9">Back</Button>) : (<Button variant="ghost" size="sm" onClick={dismiss} className="text-xs h-9 text-muted-foreground">Skip tour</Button>)}
            <Button size="sm" onClick={next} className="text-xs h-9 gap-1.5 px-5 cmpsbl-welcome-cta-glow">
              {step < STEPS.length - 1 ? (<>Next <ArrowRight className="w-3.5 h-3.5" /></>) : 'Start Collecting →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
