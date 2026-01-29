/**
 * Evolution Modal
 * Bio-substrate organism loader + video player experience
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EvolutionModal({ isOpen, onClose }: EvolutionModalProps) {
  const [phase, setPhase] = useState<'loading' | 'playing' | 'ended'>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        onClick={phase === 'ended' ? onClose : undefined}
      />
      
      {/* Content */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
        {/* Close button - only visible when not loading */}
        {phase !== 'loading' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 md:top-8 md:right-8 z-10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </Button>
        )}

        {/* Loading Phase - Bio-substrate Organism */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-8">
            {/* Organism container */}
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              {/* Outer pulsing ring */}
              <div 
                className="absolute inset-0 rounded-full border-2 border-fuchsia-500/30 animate-ping"
                style={{ animationDuration: '2s' }}
              />
              
              {/* Core organism */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-fuchsia-600/20 via-cyan-500/20 to-purple-600/20 backdrop-blur-sm animate-pulse">
                {/* Inner membrane */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-cyan-400/30 via-fuchsia-500/40 to-purple-500/30 overflow-hidden">
                  {/* Organelle particles */}
                  <div className="absolute inset-0">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
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
                  <div className="absolute inset-[30%] rounded-full bg-gradient-to-br from-fuchsia-500/60 via-purple-600/50 to-cyan-400/60 animate-spin" style={{ animationDuration: '8s' }}>
                    <div className="absolute inset-2 rounded-full bg-gradient-to-tl from-white/10 via-transparent to-transparent" />
                  </div>
                </div>
              </div>

              {/* Floating tendrils */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`tendril-${i}`}
                  className="absolute w-1 h-16 md:h-20 bg-gradient-to-b from-fuchsia-500/60 to-transparent rounded-full"
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
            <div className="flex flex-col items-center gap-3">
              <div className="text-lg md:text-xl font-light tracking-[0.3em] text-white/80 uppercase">
                Evolution
              </div>
              
              {/* Progress bar */}
              <div className="w-48 md:w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 transition-all duration-100 ease-linear"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              
              {/* Progress text */}
              <div className="text-sm font-mono text-white/40">
                Synthesizing... {Math.round(loadingProgress)}%
              </div>
            </div>
          </div>
        )}

        {/* Video Phase */}
        {(phase === 'playing' || phase === 'ended') && (
          <div className="relative w-full max-w-5xl aspect-video">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/60 backdrop-blur-sm rounded-lg">
                <h2 className="text-2xl md:text-3xl font-light tracking-wider text-white">
                  Evolution Complete
                </h2>
                <div className="flex gap-4">
                  <Button
                    onClick={handleReplay}
                    variant="outline"
                    className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Replay
                  </Button>
                  <Button
                    onClick={onClose}
                    className="gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:from-fuchsia-500 hover:to-purple-500"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
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
    </div>
  );
}
