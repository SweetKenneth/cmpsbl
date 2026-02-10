/**
 * AmbientMusicPlayer - Lo-fi/Hip-hop ambient music for the dashboard
 * Toggleable with smooth fade in/out
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Music, Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import composableDreamin from '@/assets/audio/Composable_Dreamin.mp3';
import composableDreamin2 from '@/assets/audio/Composable_Dreamin_2.mp3';

// ============================================================================
// AMBIENT TRACKS
// ============================================================================
const AMBIENT_TRACKS = [
  {
    id: 'composable-dreamin',
    name: 'Composable Dreamin',
    description: 'Original substrate vibes',
    url: composableDreamin,
  },
  {
    id: 'composable-dreamin-2',
    name: 'Composable Dreamin 2',
    description: 'Extended substrate flow',
    url: composableDreamin2,
  },
];

// ============================================================================
// STORAGE KEY
// ============================================================================
const STORAGE_KEY = 'substrate_ambient_settings';

interface AmbientSettings {
  enabled: boolean;
  volume: number;
  trackIndex: number;
}

const DEFAULT_SETTINGS: AmbientSettings = {
  enabled: false,
  volume: 0.3,
  trackIndex: 0,
};

// ============================================================================
// AMBIENT MUSIC PLAYER COMPONENT
// ============================================================================
export function AmbientMusicPlayer({ className }: { className?: string }) {
  const [settings, setSettings] = useState<AmbientSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentTrack = AMBIENT_TRACKS[settings.trackIndex];
  
  // Save settings
  const updateSettings = useCallback((updates: Partial<AmbientSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  
  // Initialize audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = settings.volume;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Handle track changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    audio.src = currentTrack.url;
    audio.volume = settings.volume;
    
    if (settings.enabled) {
      setIsLoading(true);
      audio.play()
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    }
  }, [settings.trackIndex]);
  
  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (settings.enabled) {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => setIsLoading(false))
        .catch(() => {
          setIsLoading(false);
          updateSettings({ enabled: false });
        });
    } else {
      audioRef.current.pause();
    }
  }, [settings.enabled]);
  
  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume;
    }
  }, [settings.volume]);
  
  const togglePlay = () => {
    updateSettings({ enabled: !settings.enabled });
  };
  
  const nextTrack = () => {
    const nextIndex = (settings.trackIndex + 1) % AMBIENT_TRACKS.length;
    updateSettings({ trackIndex: nextIndex });
  };
  
  return (
    <div className={cn("relative", className)}>
      {/* Main toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "h-8 w-8 sm:h-9 sm:w-9 relative shrink-0",
          settings.enabled && "text-primary"
        )}
        title="Ambient Music"
      >
        <Music className={cn(
          "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform",
          settings.enabled && "animate-pulse"
        )} />
        {settings.enabled && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-ping" />
        )}
      </Button>
      
      {/* Expanded panel - positioned in viewport on mobile */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={cn(
              "fixed z-[10000]",
              // Mobile: center in viewport
              "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              // Desktop: position below button via JS
              "sm:left-auto sm:top-auto sm:right-4 sm:translate-x-0 sm:translate-y-0",
              "w-72 max-w-[calc(100vw-2rem)] p-4 rounded-xl",
              "bg-card/95 backdrop-blur-xl border border-border/50",
              "shadow-xl shadow-black/20"
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                "bg-gradient-to-br from-fuchsia-500/20 to-purple-600/20",
                "border border-fuchsia-500/30"
              )}>
                <Music className="w-5 h-5 text-fuchsia-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Ambient Audio</h4>
                <p className="text-[10px] text-muted-foreground">Operator relaxation mode</p>
              </div>
            </div>
            
            {/* Current Track */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{currentTrack.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {currentTrack.description}
                </span>
              </div>
              
              {/* Visualizer bars */}
              <div className="flex items-end justify-center gap-0.5 h-6">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1 bg-gradient-to-t from-fuchsia-500 to-purple-400 rounded-full transition-all",
                      settings.enabled ? "opacity-100" : "opacity-30"
                    )}
                    style={{
                      height: settings.enabled ? `${Math.random() * 100}%` : '20%',
                      animation: settings.enabled ? `visualizer 0.3s ease infinite` : 'none',
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlay}
                disabled={isLoading}
                className="h-10 w-10 rounded-full"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : settings.enabled ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTrack}
                className="h-8 w-8"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Volume */}
            <div className="flex items-center gap-3">
              <VolumeX className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[settings.volume * 100]}
                max={100}
                step={1}
                onValueChange={([v]) => updateSettings({ volume: v / 100 })}
                className="flex-1"
              />
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// CSS for visualizer
// ============================================================================
export const ambientMusicStyles = `
@keyframes visualizer {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}
`;
