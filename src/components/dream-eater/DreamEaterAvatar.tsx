import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type DreamEaterMood = 'peaceful' | 'neutral' | 'agitated' | 'nightmare' | 'dreaming' | 'feeding';

interface DreamEaterAvatarProps {
  mood: DreamEaterMood;
  isFeeding?: boolean;
  mutationLevel?: number;
}

export const DreamEaterAvatar = ({ mood, isFeeding = false, mutationLevel = 0 }: DreamEaterAvatarProps) => {
  const [eyeGlow, setEyeGlow] = useState(false);

  useEffect(() => {
    if (isFeeding) {
      const interval = setInterval(() => setEyeGlow(prev => !prev), 200);
      return () => clearInterval(interval);
    }
  }, [isFeeding]);

  const getMoodColors = () => {
    switch (mood) {
      case 'peaceful':
        return {
          body: 'from-neon-green/80 to-neon-cyan/60',
          glow: 'shadow-neon-green/50',
          eyes: 'bg-neon-green',
          aura: 'bg-neon-green/20',
        };
      case 'agitated':
        return {
          body: 'from-neon-amber/80 to-neon-amber/60',
          glow: 'shadow-neon-amber/50',
          eyes: 'bg-neon-amber',
          aura: 'bg-neon-amber/20',
        };
      case 'nightmare':
        return {
          body: 'from-destructive/90 to-neon-purple/70',
          glow: 'shadow-destructive/60',
          eyes: 'bg-destructive',
          aura: 'bg-destructive/30',
        };
      case 'dreaming':
        return {
          body: 'from-neon-purple/80 to-primary/60',
          glow: 'shadow-neon-purple/50',
          eyes: 'bg-neon-purple',
          aura: 'bg-neon-purple/20',
        };
      case 'feeding':
        return {
          body: 'from-neon-cyan/80 to-neon-blue/60',
          glow: 'shadow-neon-cyan/60',
          eyes: 'bg-neon-cyan',
          aura: 'bg-neon-cyan/30',
        };
      default:
        return {
          body: 'from-gray-900/80 to-slate-800/60',
          glow: 'shadow-gray-500/30',
          eyes: 'bg-gray-400',
          aura: 'bg-gray-500/10',
        };
    }
  };

  const colors = getMoodColors();
  const effectiveMood = isFeeding ? 'feeding' : mood;
  const feedingColors = isFeeding ? getMoodColors() : colors;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer aura */}
      <div 
        className={cn(
          "absolute w-80 h-80 rounded-full blur-3xl transition-all duration-1000",
          colors.aura,
          isFeeding && "animate-pulse scale-110"
        )}
      />
      
      {/* Secondary aura ring */}
      <div 
        className={cn(
          "absolute w-64 h-64 rounded-full border-2 border-primary/20 transition-all duration-500",
          isFeeding && "animate-spin-slow border-neon-cyan/40"
        )}
      />

      {/* Main body */}
      <div 
        className={cn(
          "relative w-48 h-48 rounded-full bg-gradient-to-br transition-all duration-500",
          feedingColors.body,
          "shadow-2xl",
          feedingColors.glow,
          isFeeding && "animate-pulse scale-105"
        )}
      >
        {/* Face container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Eyes */}
          <div className="flex gap-8 mb-4">
            <div 
              className={cn(
                "w-6 h-6 rounded-full transition-all duration-200",
                feedingColors.eyes,
                eyeGlow && "scale-125 shadow-lg",
                isFeeding ? "animate-bounce" : "animate-pulse"
              )}
            />
            <div 
              className={cn(
                "w-6 h-6 rounded-full transition-all duration-200",
                feedingColors.eyes,
                eyeGlow && "scale-125 shadow-lg",
                isFeeding ? "animate-bounce" : "animate-pulse"
              )}
              style={{ animationDelay: '0.1s' }}
            />
          </div>

          {/* Mouth - changes based on mood */}
          <div 
            className={cn(
              "transition-all duration-300",
              mood === 'peaceful' && "w-12 h-6 border-b-4 border-neon-green rounded-b-full",
              mood === 'agitated' && "w-8 h-4 border-2 border-neon-amber rounded-sm",
              mood === 'nightmare' && "w-16 h-8 border-t-4 border-destructive rounded-t-full",
              mood === 'neutral' && "w-10 h-1 bg-gray-400 rounded-full",
              mood === 'dreaming' && "w-6 h-6 border-2 border-neon-purple rounded-full",
              isFeeding && "w-12 h-12 border-4 border-neon-cyan rounded-full animate-ping"
            )}
          />
        </div>

        {/* Mutation indicators */}
        {mutationLevel > 0 && (
          <div className="absolute -top-2 -right-2 flex gap-1">
            {Array.from({ length: Math.min(mutationLevel, 5) }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-neon-purple animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}

        {/* Floating particles when feeding */}
        {isFeeding && (
          <>
            <div className="absolute -top-8 left-1/2 w-2 h-2 bg-neon-cyan rounded-full animate-float" />
            <div className="absolute -top-12 left-1/3 w-1.5 h-1.5 bg-neon-blue rounded-full animate-float" style={{ animationDelay: '0.3s' }} />
            <div className="absolute -top-6 right-1/3 w-2 h-2 bg-neon-purple rounded-full animate-float" style={{ animationDelay: '0.6s' }} />
          </>
        )}
      </div>

      {/* Status indicator */}
      <div className="absolute -bottom-8 flex items-center gap-2">
        <div 
          className={cn(
            "w-3 h-3 rounded-full",
            mood === 'peaceful' && "bg-neon-green",
            mood === 'neutral' && "bg-gray-400",
            mood === 'agitated' && "bg-neon-amber",
            mood === 'nightmare' && "bg-destructive",
            mood === 'dreaming' && "bg-neon-purple",
            isFeeding && "bg-neon-cyan animate-ping"
          )}
        />
        <span className="text-sm text-muted-foreground capitalize">
          {isFeeding ? 'Consuming...' : effectiveMood}
        </span>
      </div>
    </div>
  );
};
