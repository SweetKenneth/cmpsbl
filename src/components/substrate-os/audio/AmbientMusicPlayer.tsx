/**
 * AmbientMusicPlayer - Lo-fi/Hip-hop ambient music for the dashboard
 * Toggleable with smooth fade in/out
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Music, Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import composableDreamin from '@/assets/audio/Composable_Dreamin.mp3';
import composableDreamin2 from '@/assets/audio/Composable_Dreamin_2.mp3';
import clockless from '@/assets/audio/Clockless.mp3';
import clockless4 from '@/assets/audio/Clockless-4.mp3';
import clockless5 from '@/assets/audio/Clockless-5.mp3';
import composable2 from '@/assets/audio/Composable-2.mp3';
import composable3 from '@/assets/audio/Composable-3.mp3';
import composableCompounding2 from '@/assets/audio/Composable_Compounding-2.mp3';
import composableCompounding3 from '@/assets/audio/Composable_Compounding-3.mp3';

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
  {
    id: 'clockless',
    name: 'Clockless',
    description: 'Cognitive Reality anthem',
    url: clockless,
  },
  {
    id: 'clockless-4',
    name: 'Clockless IV',
    description: 'Deep clockless immersion',
    url: clockless4,
  },
  {
    id: 'clockless-5',
    name: 'Clockless V',
    description: 'Evolved clockless resonance',
    url: clockless5,
  },
  {
    id: 'composable-2',
    name: 'Composable II',
    description: 'Composable continuation',
    url: composable2,
  },
  {
    id: 'composable-3',
    name: 'Composable III',
    description: 'Third composable movement',
    url: composable3,
  },
  {
    id: 'composable-compounding-2',
    name: 'Composable Compounding II',
    description: 'Compounding resonance',
    url: composableCompounding2,
  },
  {
    id: 'composable-compounding-3',
    name: 'Composable Compounding III',
    description: 'Deep compounding synthesis',
    url: composableCompounding3,
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
  
  // Pick a random track index that isn't the current one
  const pickRandomNext = useCallback((currentIdx: number) => {
    if (AMBIENT_TRACKS.length <= 1) return 0;
    let next: number;
    do {
      next = Math.floor(Math.random() * AMBIENT_TRACKS.length);
    } while (next === currentIdx);
    return next;
  }, []);

  // Initialize audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = false;
      audioRef.current.volume = settings.volume;
    }

    const audio = audioRef.current;
    const handleEnded = () => {
      const nextIdx = pickRandomNext(settings.trackIndex);
      updateSettings({ trackIndex: nextIdx });
    };
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [settings.trackIndex, pickRandomNext, updateSettings]);
  
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
    const nextIdx = pickRandomNext(settings.trackIndex);
    updateSettings({ trackIndex: nextIdx });
  };

  // Media Session API — shows "Clockless" in Dynamic Island / lock screen
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    
    const track = AMBIENT_TRACKS[settings.trackIndex];
    if (!track) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: 'Clockless',
      album: 'Cognitive Reality',
    });

    navigator.mediaSession.setActionHandler('play', () => {
      updateSettings({ enabled: true });
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      updateSettings({ enabled: false });
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      const nextIdx = pickRandomNext(settings.trackIndex);
      updateSettings({ trackIndex: nextIdx });
    });
  }, [settings.trackIndex, settings.enabled, pickRandomNext, updateSettings]);
  
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
      {createPortal(
        <AnimatePresence>
          {isExpanded && (
            <>
              {/* Click-away backdrop */}
              <div className="fixed inset-0 z-[9998]" onClick={() => setIsExpanded(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={cn(
                  "fixed z-[10000]",
                  // Mobile: center in viewport
                  "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                  // Desktop: top-right below header
                  "sm:left-auto sm:top-12 sm:right-4 sm:translate-x-0 sm:translate-y-0",
                  "w-72 max-w-[calc(100vw-2rem)] p-4 rounded-xl",
                  "bg-card backdrop-blur-xl border border-border/50",
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
                
                {/* Track List */}
                <div className="space-y-1 mb-4 max-h-[320px] overflow-y-auto pr-1">
                  {AMBIENT_TRACKS.map((track, idx) => (
                    <button
                      key={track.id}
                      onClick={() => updateSettings({ trackIndex: idx })}
                      className={cn(
                        "w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all",
                        idx === settings.trackIndex
                          ? "bg-fuchsia-500/15 border border-fuchsia-500/30"
                          : "hover:bg-muted/40 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                        idx === settings.trackIndex ? "bg-fuchsia-500/20" : "bg-muted/30"
                      )}>
                        {idx === settings.trackIndex && settings.enabled ? (
                          <Pause className="w-3 h-3 text-fuchsia-400" />
                        ) : (
                          <Play className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-xs font-medium truncate", idx === settings.trackIndex && "text-fuchsia-400")}>{track.name}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{track.description}</p>
                      </div>
                    </button>
                  ))}
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
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
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
