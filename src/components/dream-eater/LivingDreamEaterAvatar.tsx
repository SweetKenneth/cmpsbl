/**
 * Living Dream-Eater Avatar
 * 
 * Enhanced avatar with:
 * - Mutation-based visual changes
 * - Mood-driven animations
 * - Instability effects
 * - Milestone unlocks affecting appearance
 */

import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export type DreamEaterMood = 'calm' | 'curious' | 'agitated' | 'fractured' | 'dormant' | 'feral' | 'feeding' | 'dreaming';

interface LivingDreamEaterAvatarProps {
  mood: DreamEaterMood;
  mutationLevel: number;
  isFeeding?: boolean;
  instability?: number;
  nightmareIntensity?: number;
  reducedMotion?: boolean;
}

const MOOD_CONFIG: Record<DreamEaterMood, {
  body: string;
  glow: string;
  eyes: string;
  aura: string;
  pulseSpeed: number;
}> = {
  calm: {
    body: 'from-emerald-900/80 to-teal-800/60',
    glow: 'shadow-neon-green/50',
    eyes: 'bg-neon-green',
    aura: 'bg-neon-green/20',
    pulseSpeed: 4,
  },
  curious: {
    body: 'from-violet-900/80 to-indigo-800/60',
    glow: 'shadow-neon-purple/50',
    eyes: 'bg-neon-purple',
    aura: 'bg-neon-purple/20',
    pulseSpeed: 2.5,
  },
  agitated: {
    body: 'from-orange-900/80 to-amber-800/60',
    glow: 'shadow-neon-amber/50',
    eyes: 'bg-neon-amber',
    aura: 'bg-neon-amber/20',
    pulseSpeed: 1.5,
  },
  fractured: {
    body: 'from-red-950/90 to-purple-900/70',
    glow: 'shadow-destructive/60',
    eyes: 'bg-destructive',
    aura: 'bg-destructive/30',
    pulseSpeed: 0.8,
  },
  dormant: {
    body: 'from-gray-900/80 to-slate-800/60',
    glow: 'shadow-gray-500/30',
    eyes: 'bg-gray-500',
    aura: 'bg-gray-500/10',
    pulseSpeed: 6,
  },
  feral: {
    body: 'from-rose-950/95 to-red-900/80',
    glow: 'shadow-neon-magenta/70',
    eyes: 'bg-neon-magenta',
    aura: 'bg-neon-magenta/40',
    pulseSpeed: 0.4,
  },
  feeding: {
    body: 'from-cyan-900/80 to-blue-800/60',
    glow: 'shadow-neon-cyan/60',
    eyes: 'bg-neon-cyan',
    aura: 'bg-neon-cyan/30',
    pulseSpeed: 0.3,
  },
  dreaming: {
    body: 'from-indigo-900/80 to-purple-800/60',
    glow: 'shadow-primary/50',
    eyes: 'bg-primary',
    aura: 'bg-primary/25',
    pulseSpeed: 5,
  },
};

export const LivingDreamEaterAvatar = ({
  mood,
  mutationLevel,
  isFeeding = false,
  instability = 0,
  nightmareIntensity = 0,
  reducedMotion = false,
}: LivingDreamEaterAvatarProps) => {
  const [glitchFrame, setGlitchFrame] = useState(0);
  const [eyeBlink, setEyeBlink] = useState(false);

  const effectiveMood = isFeeding ? 'feeding' : mood;
  const config = MOOD_CONFIG[effectiveMood];

  // Mutation milestones affect visuals
  const hasFacialShift = mutationLevel >= 10;
  const hasEnvironment = mutationLevel >= 25;
  const hasDistortion = mutationLevel >= 50;
  const hasMemoryUnlock = mutationLevel >= 100;

  // Glitch effect for fractured/feral states
  useEffect(() => {
    if (reducedMotion) return;
    if (mood === 'fractured' || mood === 'feral' || instability > 0.5) {
      const interval = setInterval(() => {
        setGlitchFrame(prev => (prev + 1) % 3);
      }, 100 + Math.random() * 200);
      return () => clearInterval(interval);
    }
  }, [mood, instability, reducedMotion]);

  // Eye blink
  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  const shakeIntensity = useMemo(() => {
    if (nightmareIntensity > 0.8) return 4;
    if (nightmareIntensity > 0.5) return 2;
    if (mood === 'feral') return 3;
    if (mood === 'fractured') return 1.5;
    return 0;
  }, [nightmareIntensity, mood]);

  const glitchTransform = useMemo(() => {
    if (!hasDistortion || reducedMotion) return {};
    return {
      x: glitchFrame === 1 ? 2 : glitchFrame === 2 ? -2 : 0,
      skewX: glitchFrame === 1 ? 1 : 0,
    };
  }, [glitchFrame, hasDistortion, reducedMotion]);

  return (
    <motion.div 
      className="relative flex items-center justify-center"
      animate={shakeIntensity > 0 && !reducedMotion ? {
        x: [0, shakeIntensity, -shakeIntensity, 0],
        y: [0, shakeIntensity / 2, -shakeIntensity / 2, 0],
      } : {}}
      transition={{ duration: 0.1, repeat: shakeIntensity > 0 ? Infinity : 0 }}
    >
      {/* Environment layer (unlocked at level 25) */}
      {hasEnvironment && (
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${mood === 'feral' ? 'rgba(244,63,94,0.2)' : 'rgba(139,92,246,0.1)'} 0%, transparent 70%)`,
          }}
          animate={reducedMotion ? {} : { scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Outer aura */}
      <motion.div
        className={cn(
          "absolute w-80 h-80 rounded-full blur-3xl transition-all duration-1000",
          config.aura
        )}
        animate={reducedMotion ? {} : { 
          scale: isFeeding ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: config.pulseSpeed, repeat: Infinity }}
      />

      {/* State ring */}
      <motion.div
        className={cn(
          "absolute w-64 h-64 rounded-full border-2 transition-all duration-500",
          mood === 'feral' ? 'border-neon-magenta/60' :
          mood === 'fractured' ? 'border-destructive/40' :
          mood === 'curious' ? 'border-neon-purple/40' :
          'border-primary/20'
        )}
        animate={reducedMotion ? {} : { rotate: isFeeding ? 360 : 0 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Instability ring */}
      {instability > 0.3 && (
        <motion.div
          className="absolute w-72 h-72 rounded-full border border-dashed border-neon-magenta/40"
          animate={reducedMotion ? {} : { rotate: -360, scale: [1, 1.02, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Main body */}
      <motion.div
        className={cn(
          "relative w-48 h-48 rounded-full bg-gradient-to-br transition-all duration-500",
          config.body,
          "shadow-2xl",
          config.glow
        )}
        animate={reducedMotion ? {} : {
          ...glitchTransform,
          scale: isFeeding ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Face container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Eyes - geometry shifts at level 10 */}
          <div className={cn(
            "flex mb-4 transition-all duration-500",
            hasFacialShift ? 'gap-10' : 'gap-8'
          )}>
            <motion.div
              className={cn(
                "rounded-full transition-all duration-200",
                config.eyes,
                hasFacialShift ? 'w-5 h-7' : 'w-6 h-6',
                eyeBlink && 'scale-y-0'
              )}
              animate={reducedMotion ? {} : { opacity: isFeeding ? [1, 0.5, 1] : 1 }}
              transition={{ duration: 0.2, repeat: isFeeding ? Infinity : 0 }}
            />
            <motion.div
              className={cn(
                "rounded-full transition-all duration-200",
                config.eyes,
                hasFacialShift ? 'w-5 h-7' : 'w-6 h-6',
                eyeBlink && 'scale-y-0'
              )}
              animate={reducedMotion ? {} : { opacity: isFeeding ? [1, 0.5, 1] : 1 }}
              transition={{ duration: 0.2, repeat: isFeeding ? Infinity : 0, delay: 0.1 }}
            />
          </div>

          {/* Mouth - mood-based */}
          <motion.div
            className={cn(
              "transition-all duration-300",
              mood === 'calm' && "w-12 h-6 border-b-4 border-neon-green rounded-b-full",
              mood === 'curious' && "w-8 h-8 border-2 border-neon-purple rounded-full",
              mood === 'agitated' && "w-8 h-4 border-2 border-neon-amber",
              mood === 'fractured' && "w-12 h-3 bg-destructive/50 skew-x-6",
              mood === 'dormant' && "w-10 h-1 bg-gray-500 rounded-full",
              mood === 'feral' && "w-14 h-8 border-t-4 border-neon-magenta rounded-t-full",
              isFeeding && "w-12 h-12 border-4 border-neon-cyan rounded-full animate-ping"
            )}
          />
        </div>

        {/* Mutation indicators */}
        <AnimatePresence>
          {mutationLevel > 0 && (
            <div className="absolute -top-2 -right-2 flex gap-1">
              {Array.from({ length: Math.min(Math.floor(mutationLevel / 10), 10) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    i >= 8 ? 'bg-neon-magenta' : i >= 5 ? 'bg-neon-amber' : 'bg-neon-purple'
                  )}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Memory unlock indicator */}
        {hasMemoryUnlock && (
          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-mono text-neon-purple/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ◈ MEMORY UNLOCKED ◈
          </motion.div>
        )}

        {/* Floating particles when feeding */}
        <AnimatePresence>
          {isFeeding && !reducedMotion && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-neon-cyan rounded-full"
                  initial={{ 
                    x: 0, 
                    y: 100, 
                    opacity: 0,
                    left: `${30 + i * 10}%`,
                  }}
                  animate={{ 
                    y: -50, 
                    opacity: [0, 1, 0],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Status indicator */}
      <div className="absolute -bottom-10 flex items-center gap-2">
        <motion.div
          className={cn(
            "w-3 h-3 rounded-full",
            config.eyes
          )}
          animate={reducedMotion ? {} : { scale: [1, 1.2, 1] }}
          transition={{ duration: config.pulseSpeed, repeat: Infinity }}
        />
        <span className="text-sm text-muted-foreground font-mono capitalize">
          {isFeeding ? 'Consuming...' : effectiveMood}
        </span>
        {mutationLevel > 0 && (
          <span className="text-xs text-muted-foreground/60 font-mono">
            Lv.{mutationLevel}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default LivingDreamEaterAvatar;
