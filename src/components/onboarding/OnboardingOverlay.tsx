/**
 * User Onboarding Flow — Memory Stream themed
 * Premium animated onboarding with morphing buttons, particles, and staggered reveals
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
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

/* ── Floating Particle ─────────────────────────────────── */
function FloatingParticle({ delay, color }: { delay: number; color: string }) {
  const x = Math.random() * 100;
  const size = 2 + Math.random() * 3;
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ 
        left: `${x}%`, 
        bottom: '-4px',
        width: size, 
        height: size, 
        background: color,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ 
        y: -120 - Math.random() * 40,
        opacity: [0, 0.8, 0.6, 0],
        x: [0, (Math.random() - 0.5) * 30],
      }}
      transition={{ 
        duration: 2.5 + Math.random() * 1.5, 
        delay, 
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

/* ── Pulsing Glow Ring ─────────────────────────────────── */
function GlowRing({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{ 
        border: `1px solid ${color}`,
        opacity: 0,
      }}
      animate={{ 
        scale: [1, 1.15, 1.3],
        opacity: [0.4, 0.15, 0],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

/* ── Morphing Next Button ──────────────────────────────── */
function MorphButton({ 
  onClick, 
  isNext, 
  isLast, 
  accentBg 
}: { 
  onClick: () => void; 
  isNext: boolean; 
  isLast: boolean;
  accentBg: string;
}) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    // The button "dissolves" then triggers the action
    setTimeout(() => {
      onClick();
      setIsPressed(false);
    }, 300);
  };

  if (isLast) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
      >
        <Button 
          size="sm" 
          onClick={handleClick} 
          className="gap-1.5 text-xs h-8 relative overflow-hidden group"
        >
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <span className="relative z-10 flex items-center gap-1.5">
            Start Building 
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-3 h-3" />
            </motion.span>
          </span>
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isPressed ? (
        <motion.div
          key="button"
          initial={{ scale: 0.9, opacity: 0, filter: 'blur(4px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={{ 
            scale: 0.3, 
            opacity: 0, 
            filter: 'blur(8px)',
            y: -10,
            rotate: 5,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <Button 
            size="sm" 
            onClick={handleClick} 
            className="text-xs h-8 relative overflow-hidden group active:scale-[0.92] transition-transform"
          >
            <span className="relative z-10">Next</span>
            <motion.div
              className="absolute right-2 z-10"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="w-3 h-3" />
            </motion.div>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="burst"
          className={`w-8 h-8 rounded-full ${accentBg}`}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  );
}

/* ── Stagger Children Helper ───────────────────────────── */
const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: { 
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, damping: 20, stiffness: 200 },
  },
};

/* ── Main Overlay ──────────────────────────────────────── */
interface OnboardingOverlayProps {
  onDismiss: () => void;
}

export function OnboardingOverlay({ onDismiss }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      onDismiss();
    } else {
      setDirection(1);
      setStep(s => s + 1);
    }
  }, [isLast, onDismiss]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep(s => s - 1);
  }, []);

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

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 60, opacity: 0, filter: 'blur(6px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (dir: number) => ({ x: dir * -60, opacity: 0, filter: 'blur(6px)' }),
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        {/* Ambient background particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/20"
              style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.4, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260, delay: 0.1 }}
          className="relative bg-card border border-border/60 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Gradient header */}
          <div className={`relative h-32 sm:h-36 bg-gradient-to-br ${current.gradient} overflow-hidden`}>
            {/* Animated stream lines */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                  style={{ top: `${20 + i * 15}%`, width: '120%', left: '-10%' }}
                  animate={{ x: ['-10%', '10%', '-10%'] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                />
              ))}
            </div>

            {/* Floating particles in header */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <FloatingParticle key={`${step}-${i}`} delay={i * 0.4} color={current.particleColor} />
              ))}
            </div>

            {/* Header label with typewriter feel */}
            <div className="absolute top-3 left-4">
              <motion.span 
                className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/60"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Memory Stream
              </motion.span>
            </div>

            {/* Step counter */}
            <div className="absolute top-3 right-12">
              <motion.span
                key={step}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-mono text-muted-foreground/40 tabular-nums"
              >
                {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
              </motion.span>
            </div>
            
            {/* Close button */}
            <motion.button
              onClick={onDismiss}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/40 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors"
              aria-label="Close"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <X className="h-4 w-4" />
            </motion.button>

            {/* Icon badge with glow */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ scale: 0, rotate: -30, y: 20 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                exit={{ scale: 0, rotate: 30, y: -20 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10"
              >
                <div className="relative">
                  <GlowRing color={current.particleColor} />
                  <motion.div 
                    className={`p-4 rounded-2xl bg-card border border-border shadow-lg ${current.accentColor}`}
                    animate={{ 
                      boxShadow: [
                        `0 0 0px ${current.particleColor}40`,
                        `0 0 20px ${current.particleColor}30`,
                        `0 0 0px ${current.particleColor}40`,
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {current.icon}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content area */}
          <div className="px-6 pt-12 pb-4">
            {/* Progress dots — morphing width */}
            <div className="flex items-center justify-center gap-1.5 mb-5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > step ? 1 : -1);
                    setStep(i);
                  }}
                  aria-label={`Step ${i + 1}`}
                  className="relative"
                >
                  <motion.div
                    className="h-1.5 rounded-full"
                    animate={{
                      width: i === step ? 32 : 6,
                      backgroundColor: i === step 
                        ? current.particleColor
                        : i < step 
                          ? 'hsl(var(--primary) / 0.3)' 
                          : 'hsl(var(--muted-foreground) / 0.15)',
                    }}
                    whileHover={{ 
                      scale: i !== step ? 1.5 : 1,
                      backgroundColor: i !== step ? 'hsl(var(--muted-foreground) / 0.3)' : undefined,
                    }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                  {/* Completed checkmark flash */}
                  {i < step && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={false}
                    >
                      <div className="w-1 h-1 rounded-full bg-primary/40" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            {/* Animated content with direction-aware slides */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <motion.div
                  className="text-center"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.h3 
                    variants={staggerItem}
                    className="text-xl font-bold text-foreground mb-2"
                  >
                    {current.title}
                  </motion.h3>
                  
                  <motion.p 
                    variants={staggerItem}
                    className="text-sm text-muted-foreground leading-relaxed mb-3 max-w-sm mx-auto"
                  >
                    {current.description}
                  </motion.p>

                  {current.detail && (
                    <motion.div 
                      variants={staggerItem}
                      className="mb-4"
                    >
                      <motion.p 
                        className="text-xs font-mono text-primary/70 leading-relaxed max-w-sm mx-auto px-3 py-2 rounded-lg bg-primary/5 border border-primary/10"
                        whileHover={{ 
                          borderColor: 'hsl(var(--primary) / 0.3)',
                          backgroundColor: 'hsl(var(--primary) / 0.08)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {current.detail}
                      </motion.p>
                    </motion.div>
                  )}

                  <motion.div variants={staggerItem}>
                    <Link to={current.link} onClick={onDismiss}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5 border-border/60 hover:border-primary/40 transition-all hover:shadow-[0_0_15px_hsl(var(--primary)/0.15)] active:scale-[0.97]"
                      >
                        {current.linkLabel}
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </motion.span>
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation footer */}
          <div className="px-6 pb-5 pt-2">
            <div className="flex justify-between items-center">
              {/* Skip — fades out on last step */}
              <motion.button
                onClick={onDismiss}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-1"
                animate={{ 
                  opacity: isLast ? 0 : 0.7,
                  scale: isLast ? 0.8 : 1,
                  filter: isLast ? 'blur(4px)' : 'blur(0px)',
                }}
                disabled={isLast}
                transition={{ duration: 0.3 }}
                whileHover={!isLast ? { opacity: 1, x: -2 } : undefined}
              >
                Skip
              </motion.button>

              <div className="flex items-center gap-2">
                {/* Back button — slides in from left */}
                <AnimatePresence>
                  {step > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: 'auto' }}
                      exit={{ opacity: 0, x: 20, width: 0 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={goBack} 
                        className="gap-1 text-xs h-8 active:scale-[0.95] transition-transform"
                      >
                        <motion.span
                          animate={{ x: [0, -2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </motion.span>
                        Back
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Next / Finish — the magic disappearing button */}
                <MorphButton 
                  onClick={goNext} 
                  isNext={!isLast} 
                  isLast={isLast}
                  accentBg={current.accentBg}
                />
              </div>
            </div>
          </div>

          {/* Bottom progress bar — fills across all steps */}
          <div className="h-0.5 bg-muted/30">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/60 to-primary"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
