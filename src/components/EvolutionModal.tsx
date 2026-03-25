/**
 * Evolution Modal
 * Bio-substrate organism loader + video player experience
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EvolutionModal({ isOpen, onClose }: EvolutionModalProps) {
  const [phase, setPhase] = useState<'loading' | 'playing' | 'ended'>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('loading');
      setLoadingProgress(0);
    }
  }, [isOpen]);

  // 4.5 second loading animation
  useEffect(() => {
    if (!isOpen || phase !== 'loading') return;

    const duration = 4500;
    const interval = 50;
    const increment = (100 / duration) * interval;
    
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    const completeTimer = setTimeout(() => {
      setPhase('playing');
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(completeTimer);
    };
  }, [isOpen, phase]);

  // Auto-play video when entering playing phase
  useEffect(() => {
    if (phase === 'playing' && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Handle autoplay blocked - user will need to interact
      });
    }
  }, [phase]);

  const handleVideoEnd = useCallback(() => {
    setPhase('ended');
  }, []);

  const handleReplay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setPhase('playing');
    }
  }, []);

  if (!isOpen) return null;

  const content = (
    <>
      {/* Close button - only visible when not loading */}
      {phase !== 'loading' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 text-white/60 hover:text-white hover:bg-muted/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </Button>
      )}

      <div
        className={cn(
          "relative w-full",
          // Use dynamic viewport height to prevent iOS Safari 100vh issues.
          isMobile
            ? "max-h-[85dvh] overflow-y-auto"
            : "max-h-[90dvh] overflow-y-auto",
        )}
      >
        <div className={cn("w-full p-4 sm:p-8", isMobile && "pb-[calc(1rem+env(safe-area-inset-bottom))]")}
        >
          {/* Loading Phase - Bio-substrate Organism */}
          {phase === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 w-full max-w-sm mx-auto">
              {/* Organism container - scaled for mobile */}
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80">
                {/* Outer pulsing ring */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-neon-magenta/30 animate-ping"
                  style={{ animationDuration: '2s' }}
                />

                {/* Core organism */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-neon-magenta/20 via-neon-cyan/20 to-neon-purple/20 backdrop-blur-sm animate-pulse">
                  {/* Inner membrane */}
                  <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-neon-cyan/30 via-neon-magenta/40 to-neon-purple/30 overflow-hidden">
                    {/* Organelle particles */}
                    <div className="absolute inset-0">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                            animation: `organism-float ${2 + Math.random() * 2}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: 0.6 + Math.random() * 0.4,
                          }}
                        />
                      ))}
                    </div>

                    {/* Nucleus */}
                    <div
                      className="absolute inset-[30%] rounded-full bg-gradient-to-br from-neon-magenta/60 via-neon-purple/50 to-neon-cyan/60 animate-spin"
                      style={{ animationDuration: '8s' }}
                    >
                      <div className="absolute inset-2 rounded-full bg-gradient-to-tl from-white/10 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>

                {/* Floating tendrils */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`tendril-${i}`}
                    className="absolute w-1 h-12 sm:h-16 md:h-20 bg-gradient-to-b from-neon-magenta/60 to-transparent rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformOrigin: 'center top',
                      transform: `rotate(${i * 60}deg) translateY(-100%)`,
                      animation: `tendril-wave ${3 + i * 0.5}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>

              {/* Loading text */}
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="text-base sm:text-lg md:text-xl font-light tracking-[0.3em] text-white/80 uppercase">
                  Evolution
                </div>

                {/* Progress bar */}
                <div className="w-40 sm:w-48 md:w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple transition-all duration-100 ease-linear"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>

                {/* Progress text */}
                <div className="text-xs sm:text-sm font-mono text-white/40">
                  Synthesizing... {Math.round(loadingProgress)}%
                </div>
              </div>
            </div>
          )}

          {/* Video Phase */}
          {(phase === 'playing' || phase === 'ended') && (
            <div className="relative w-full max-w-5xl mx-auto">
              {/* Hero text above video */}
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-4xl font-light tracking-wider text-white">
                  What will you build?
                </h2>
              </div>

              <div
                className={cn(
                  "relative",
                  // Keep video smaller on mobile so it never pushes out of frame.
                  isMobile ? "mx-auto w-full max-w-[min(520px,100%)]" : "w-full",
                )}
              >
                <div className="relative aspect-video">
                  <video
                    ref={videoRef}
                    src="/videos/evolution.mp4"
                    className="w-full h-full object-contain rounded-lg"
                    playsInline
                    onEnded={handleVideoEnd}
                    controls={phase === 'playing'}
                  />

                  {/* End state overlay */}
                  {phase === 'ended' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 sm:gap-6 bg-black/60 backdrop-blur-sm rounded-lg p-4">
                      <h3 className="text-lg sm:text-2xl md:text-3xl font-light tracking-wider text-white text-center">
                        Evolution Complete
                      </h3>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <Button
                          onClick={handleReplay}
                          variant="outline"
                          className="gap-2 border-border/40 bg-muted/50 text-white hover:bg-muted/70 hover:text-white"
                        >
                          <RefreshCcw className="w-4 h-4" />
                          Replay
                        </Button>
                        <Button
                          onClick={onClose}
                          className="gap-2 bg-gradient-to-r from-neon-magenta to-neon-purple text-white hover:from-neon-magenta hover:to-neon-purple"
                        >
                          <X className="w-4 h-4" />
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const handleOpenChange = (open: boolean) => {
    if (!open && phase === 'ended') onClose();
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent
          className="z-[100000] bg-black/95 border-border/30"
          onPointerDownOutside={(e) => {
            if (phase !== 'ended') e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (phase !== 'ended') e.preventDefault();
          }}
        >
          <div className="relative px-2">
            {content}
          </div>
        </DrawerContent>

        {/* Keyframe animations */}
        <style>{`
          @keyframes organism-float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(10px, -10px) scale(1.1);
            }
            50% {
              transform: translate(-5px, 5px) scale(0.9);
            }
            75% {
              transform: translate(-10px, -5px) scale(1.05);
            }
          }

          @keyframes tendril-wave {
            0%, 100% {
              opacity: 0.6;
              transform: rotate(var(--base-rotation)) translateY(-100%) scaleY(1);
            }
            50% {
              opacity: 0.9;
              transform: rotate(calc(var(--base-rotation) + 5deg)) translateY(-110%) scaleY(1.1);
            }
          }
        `}</style>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="z-[100000] bg-black/95 border-border/30 p-0 overflow-hidden max-w-5xl"
        onPointerDownOutside={(e) => {
          if (phase !== 'ended') e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (phase !== 'ended') e.preventDefault();
        }}
      >
        <div className="relative">
          {content}
        </div>

        {/* Keyframe animations */}
        <style>{`
          @keyframes organism-float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(10px, -10px) scale(1.1);
            }
            50% {
              transform: translate(-5px, 5px) scale(0.9);
            }
            75% {
              transform: translate(-10px, -5px) scale(1.05);
            }
          }

          @keyframes tendril-wave {
            0%, 100% {
              opacity: 0.6;
              transform: rotate(var(--base-rotation)) translateY(-100%) scaleY(1);
            }
            50% {
              opacity: 0.9;
              transform: rotate(calc(var(--base-rotation) + 5deg)) translateY(-110%) scaleY(1.1);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
