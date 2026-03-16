/**
 * User Onboarding Flow — Memory Stream themed
 * Pure CSS animations for zero-bundle-cost first paint
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Brain, Zap, Terminal, X, ArrowRight, ChevronLeft,
  Gem, Rocket, Shield, Layers, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ONBOARDING_KEY = 'cmpsbl_onboarded_v2';

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
  particleColor: string;
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
    particleColor: 'hsl(var(--neon-cyan))',
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
    particleColor: 'hsl(var(--neon-purple))',
  },
  {
    icon: <Crown className="h-7 w-7" />,
    title: 'Builder Tier — Free Forever',
    description: 'You get 3 daily pulls, 5 vault slots, 3 capability slots, persistent memory, and full node telemetry — all at $0. Every tier can discover Relic and Mythic-grade software.',
    detail: '3 pulls/day · 5 vault capacity · 3 capability slots · No export',
    link: '/workspace',
    linkLabel: 'Open Workspace',
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    particleColor: 'hsl(var(--neon-green))',
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
    particleColor: 'hsl(var(--neon-magenta))',
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
    particleColor: 'hsl(var(--neon-amber))',
  },
  {
    icon: <Rocket className="h-7 w-7" />,
    title: 'Upgrade When You\'re Ready',
    description: 'Paid tiers unlock more daily pulls, larger vaults, capability export, custom memory slots, and priority NEXUS routing. The substrate runs the same for everyone — tiers govern capacity, not capability.',
    link: '/upgrade',
    linkLabel: 'View Plans',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    accentColor: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
    particleColor: 'hsl(var(--neon-magenta))',
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

/* ── Main Overlay ──────────────────────────────────────── */
interface OnboardingOverlayProps {
  onDismiss: () => void;
}

export function OnboardingOverlay({ onDismiss }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);
  const [slideClass, setSlideClass] = useState('ob-slide-in-right');
  const [visible, setVisible] = useState(false);
  const [burstActive, setBurstActive] = useState(false);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Fade in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const animateStep = useCallback((newStep: number) => {
    const dir = newStep > step ? 'right' : 'left';
    setSlideClass(dir === 'right' ? 'ob-slide-out-left' : 'ob-slide-out-right');
    setTimeout(() => {
      setStep(newStep);
      setSlideClass(dir === 'right' ? 'ob-slide-in-right' : 'ob-slide-in-left');
    }, 200);
  }, [step]);

  const goNext = useCallback(() => {
    if (isLast) {
      onDismiss();
    } else {
      setBurstActive(true);
      setTimeout(() => setBurstActive(false), 400);
      animateStep(step + 1);
    }
  }, [isLast, onDismiss, animateStep, step]);

  const goBack = useCallback(() => {
    animateStep(step - 1);
  }, [animateStep, step]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
      else if (e.key === 'ArrowLeft' && step > 0) goBack();
      else if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goBack, step, onDismiss]);

  const progressWidth = `${((step + 1) / STEPS.length) * 100}%`;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Ambient background particles — pure CSS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/20 ob-float-particle"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`relative bg-card border border-border/60 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-300 ${visible ? 'ob-card-enter' : 'ob-card-pre'}`}
      >
        {/* Gradient header */}
        <div className={`relative h-32 sm:h-36 bg-gradient-to-br ${current.gradient} overflow-hidden`}>
          {/* Animated stream lines — CSS only */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent ob-stream-line"
                style={{
                  top: `${20 + i * 15}%`,
                  width: '120%',
                  left: '-10%',
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${4 + i}s`,
                }}
              />
            ))}
          </div>

          {/* Floating particles in header — CSS only */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => {
              const x = Math.random() * 100;
              const size = 2 + Math.random() * 3;
              return (
                <div
                  key={`${step}-${i}`}
                  className="absolute rounded-full pointer-events-none ob-header-particle"
                  style={{
                    left: `${x}%`,
                    bottom: '-4px',
                    width: size,
                    height: size,
                    background: current.particleColor,
                    boxShadow: `0 0 ${size * 2}px ${current.particleColor}`,
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: `${2.5 + Math.random() * 1.5}s`,
                  }}
                />
              );
            })}
          </div>

          {/* Header label */}
          <div className="absolute top-3 left-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/60 ob-fade-in-delay">
              Memory Stream
            </span>
          </div>

          {/* Step counter */}
          <div className="absolute top-3 right-12">
            <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums ob-fade-in-delay">
              {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
            </span>
          </div>
          
          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/40 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background/60 transition-all hover:scale-110 hover:rotate-90 active:scale-90"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon badge with glow */}
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10 ${slideClass}`}>
            <div className="relative">
              {/* Glow ring — CSS animation */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none ob-glow-ring"
                style={{ border: `1px solid ${current.particleColor}` }}
              />
              <div 
                className={`p-4 rounded-2xl bg-card border border-border shadow-lg ${current.accentColor} ob-icon-glow`}
                style={{ '--glow-color': current.particleColor } as React.CSSProperties}
              >
                {current.icon}
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="px-6 pt-12 pb-4">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => animateStep(i)}
                aria-label={`Step ${i + 1}`}
                className="relative"
              >
                <div
                  className="h-1.5 rounded-full transition-all duration-300 hover:scale-150"
                  style={{
                    width: i === step ? 32 : 6,
                    backgroundColor: i === step 
                      ? current.particleColor
                      : i < step 
                        ? 'hsl(var(--primary) / 0.3)' 
                        : 'hsl(var(--muted-foreground) / 0.15)',
                  }}
                />
                {i < step && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Animated content — CSS slide transitions */}
          <div className={`${slideClass}`}>
            <div className="text-center ob-stagger-children">
              <h3 className="text-xl font-bold text-foreground mb-2 ob-stagger-item">
                {current.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed mb-3 max-w-sm mx-auto ob-stagger-item">
                {current.description}
              </p>

              {current.detail && (
                <div className="mb-4 ob-stagger-item">
                  <p className="text-xs font-mono text-primary/70 leading-relaxed max-w-sm mx-auto px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 hover:border-primary/30 hover:bg-primary/[0.08] transition-colors duration-200">
                    {current.detail}
                  </p>
                </div>
              )}

              <div className="ob-stagger-item">
                <Link to={current.link} onClick={onDismiss}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 border-border/60 hover:border-primary/40 transition-all hover:shadow-[0_0_15px_hsl(var(--primary)/0.15)] active:scale-[0.97]"
                  >
                    {current.linkLabel}
                    <span className="ob-bounce-x">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation footer */}
        <div className="px-6 pb-5 pt-2">
          <div className="flex justify-between items-center">
            {/* Skip */}
            <button
              onClick={onDismiss}
              className={`text-xs text-muted-foreground hover:text-foreground transition-all px-1 py-1 ${isLast ? 'opacity-0 scale-75 blur-sm pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
              disabled={isLast}
            >
              Skip
            </button>

            <div className="flex items-center gap-2">
              {/* Back button */}
              {step > 0 && (
                <div className="ob-fade-in">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={goBack} 
                    className="gap-1 text-xs h-8 active:scale-[0.95] transition-transform"
                  >
                    <span className="ob-bounce-x-reverse">
                      <ChevronLeft className="w-3 h-3" />
                    </span>
                    Back
                  </Button>
                </div>
              )}

              {/* Next / Finish button */}
              {isLast ? (
                <div className="ob-scale-in">
                  <Button 
                    size="sm" 
                    onClick={goNext} 
                    className="gap-1.5 text-xs h-8 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 ob-shimmer" />
                    <span className="relative z-10 flex items-center gap-1.5">
                      Start Building 
                      <span className="ob-wiggle">
                        <Sparkles className="w-3 h-3" />
                      </span>
                    </span>
                  </Button>
                </div>
              ) : (
                <div className={burstActive ? 'ob-burst' : 'ob-fade-in'}>
                  {burstActive ? (
                    <div className={`w-8 h-8 rounded-full ${current.accentBg} ob-burst-circle`} />
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={goNext} 
                      className="gap-1.5 text-xs h-8 relative overflow-hidden group active:scale-[0.92] transition-transform"
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        Next
                        <span className="ob-bounce-x">
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom progress bar */}
        <div className="h-0.5 bg-muted/30">
          <div
            className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500 ease-out"
            style={{ width: progressWidth }}
          />
        </div>
      </div>
    </div>
  );
}
