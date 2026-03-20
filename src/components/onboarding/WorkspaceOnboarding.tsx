/**
 * Workspace Onboarding — First-visit explainer for /workspace
 * Introduces SDK templates, the tiered terminal, and builder tools
 */

import { useState, useEffect } from 'react';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';
import { X, ArrowRight, Terminal, Code, Layers, Command, Rocket, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import './cmpsbl-welcome.css';

const STORAGE_KEY = 'workspace-onboarded';

interface OnboardingStep {
  icon: React.ElementType;
  tag: string;
  title: string;
  body: string;
  accent: string;
  pattern: string;
  nextSteps?: string[];
}

const STEPS: OnboardingStep[] = [
  {
    icon: Terminal,
    tag: 'Build',
    title: 'Builder Workspace',
    body: 'Your development environment inside the substrate. SDK templates, a tiered terminal, and direct access to 40 cognitive nodes — all in one place.',
    accent: 'primary',
    pattern: 'radial-gradient(circle at 30% 70%, hsl(var(--primary) / 0.12) 0%, transparent 50%)',
  },
  {
    icon: Code,
    tag: 'SDK',
    title: 'Starter Templates',
    body: 'Memory Agent, DECODE Bot, DEFENSE Scanner, NEXUS Router — pick a template and start coding. Every template includes working, runnable code.',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 70% 30%, hsl(var(--neon-cyan) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Command,
    tag: 'Terminal',
    title: 'Tiered Terminal',
    body: '66 system commands across 5 tiers. Builder tier (free) gives you 12 core commands — status, memory recall, crystallization, SDK init. Higher tiers unlock full system control.',
    accent: 'neon-green',
    pattern: 'radial-gradient(circle at 50% 80%, hsl(var(--neon-green) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Layers,
    tag: 'State',
    title: 'Persistent State',
    body: 'Your workspace remembers everything — code history, terminal sessions, active projects. Pick up where you left off on any device.',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 20% 40%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Rocket,
    tag: 'Your next step',
    title: 'Start Building',
    body: 'The workspace is ready. Here\'s what to do:',
    accent: 'neon-amber',
    pattern: 'radial-gradient(circle at 80% 60%, hsl(var(--neon-amber) / 0.1) 0%, transparent 50%)',
    nextSteps: [
      'Pick an SDK template to scaffold your first project',
      'Open the terminal and run "status" to see your nodes',
      'Try "memory.store" to save your first persistent memory',
    ],
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

export function WorkspaceOnboarding() {
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
  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[12000] grid place-items-center p-4 cmpsbl-welcome-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm cmpsbl-welcome-fade-in" />
      <div className="relative w-full max-w-md cmpsbl-welcome-modal-enter">
        <div className="relative bg-background/95 border border-border/30 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 pointer-events-none cmpsbl-welcome-pattern-shift" style={{ background: current.pattern }} />
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"><div className="cmpsbl-welcome-scanline" /></div>
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

          <div className="relative flex items-center justify-between px-5 pt-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50">WORKSPACE</span>
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

            {isLastStep && current.nextSteps && (
              <div className="mt-3 space-y-1.5 cmpsbl-welcome-body-fade">
                {current.nextSteps.map((ns) => (
                  <div key={ns} className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground/80 leading-relaxed">{ns}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-between px-6 pb-5 pt-1 border-t border-border/10">
            {step > 0 ? (<Button variant="ghost" size="sm" onClick={back} className="text-xs h-9">Back</Button>) : (<Button variant="ghost" size="sm" onClick={dismiss} className="text-xs h-9 text-muted-foreground">Skip tour</Button>)}
            <Button size="sm" onClick={next} className="text-xs h-9 gap-1.5 px-5 cmpsbl-welcome-cta-glow">
              {isLastStep ? 'Open Workspace →' : (<>Next <ArrowRight className="w-3.5 h-3.5" /></>)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
