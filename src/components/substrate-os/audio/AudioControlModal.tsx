/**
 * AudioControlModal - Combined audio controls modal for mobile
 * Contains both ambient music player and sound effects settings in tabs
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Music, Volume2, VolumeX, Play, Pause, SkipForward, Settings2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundSettings } from '@/components/agency/features/SoundEffects';
import composableDreamin from '@/assets/audio/Composable_Dreamin.mp3';
import composableDreamin2 from '@/assets/audio/Composable_Dreamin_2.mp3';
import clockless from '@/assets/audio/Clockless.mp3';

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

interface AudioControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioControlModal({ isOpen, onClose }: AudioControlModalProps) {
  const { settings: soundSettings, toggleEnabled, updateSettings: updateSoundSettings } = useSoundSettings();
  
  // Ambient music state
  const [ambientSettings, setAmbientSettings] = useState<AmbientSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentTrack = AMBIENT_TRACKS[ambientSettings.trackIndex];
  
  // Save ambient settings
  const updateAmbientSettings = useCallback((updates: Partial<AmbientSettings>) => {
    setAmbientSettings(prev => {
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
      audioRef.current.volume = ambientSettings.volume;
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
    audio.volume = ambientSettings.volume;
    
    if (ambientSettings.enabled) {
      setIsLoading(true);
      audio.play()
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    }
  }, [ambientSettings.trackIndex, currentTrack.url]);
  
  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (ambientSettings.enabled) {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => setIsLoading(false))
        .catch(() => {
          setIsLoading(false);
          updateAmbientSettings({ enabled: false });
        });
    } else {
      audioRef.current.pause();
    }
  }, [ambientSettings.enabled, updateAmbientSettings]);
  
  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = ambientSettings.volume;
    }
  }, [ambientSettings.volume]);
  
  const togglePlay = () => {
    updateAmbientSettings({ enabled: !ambientSettings.enabled });
  };
  
  const nextTrack = () => {
    const nextIndex = (ambientSettings.trackIndex + 1) % AMBIENT_TRACKS.length;
    updateAmbientSettings({ trackIndex: nextIndex });
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />
          
          {/* Modal wrapper: fullscreen flex centers content and respects safe areas */}
          <div
            className={cn(
              "fixed inset-0 z-[9999]",
              "flex items-center justify-center",
              // Base padding + iOS safe-area padding so content is never under browser UI
              "p-4",
              "[padding-top:calc(1rem+env(safe-area-inset-top))]",
              "[padding-bottom:calc(1rem+env(safe-area-inset-bottom))]",
              "[padding-left:calc(1rem+env(safe-area-inset-left))]",
              "[padding-right:calc(1rem+env(safe-area-inset-right))]"
            )}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Modal container - centered via parent flex */}
              <div className="w-full max-w-sm">
                <div
                  className={cn(
                    "w-full",
                    // Fit inside padded wrapper; never exceed viewport
                    "max-h-[calc(100dvh-2rem)]",
                    "rounded-2xl overflow-hidden",
                    "bg-card border border-border/50",
                    "shadow-2xl shadow-foreground/20"
                  )}
                >
            <div className="flex max-h-full flex-col">
              {/* Header with close button (always visible) */}
              <div className="flex items-center justify-between p-4 border-b border-border/30 shrink-0">
                <h3 className="text-base font-semibold">Audio Controls</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Scrollable content */}
              <div className="min-h-0 flex-1 overflow-auto">
                <Tabs defaultValue="music" className="w-full">
              <TabsList className="w-full grid grid-cols-2 p-1 mx-4 my-3" style={{ width: 'calc(100% - 2rem)' }}>
                <TabsTrigger value="music" className="gap-1.5">
                  <Music className="w-3.5 h-3.5" />
                  Music
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1.5">
                  <Settings2 className="w-3.5 h-3.5" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              {/* Music Tab */}
              <TabsContent value="music" className="p-4 pt-0 space-y-4">
                {/* Current Track */}
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      "bg-gradient-to-br from-fuchsia-500/20 to-purple-600/20",
                      "border border-fuchsia-500/30"
                    )}>
                      <Music className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{currentTrack.name}</p>
                      <p className="text-[10px] text-muted-foreground">{currentTrack.description}</p>
                    </div>
                  </div>
                  
                  {/* Visualizer bars */}
                  <div className="flex items-end justify-center gap-0.5 h-8">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 bg-gradient-to-t from-fuchsia-500 to-purple-400 rounded-full transition-all",
                          ambientSettings.enabled ? "opacity-100" : "opacity-30"
                        )}
                        style={{
                          height: ambientSettings.enabled ? `${Math.random() * 100}%` : '20%',
                          animation: ambientSettings.enabled ? `visualizer 0.3s ease infinite` : 'none',
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlay}
                    disabled={isLoading}
                    className="h-12 w-12 rounded-full"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : ambientSettings.enabled ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextTrack}
                    className="h-10 w-10"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Volume */}
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Slider
                    value={[ambientSettings.volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={([v]) => updateAmbientSettings({ volume: v / 100 })}
                    className="flex-1"
                  />
                  <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </TabsContent>
              
              {/* Settings Tab */}
              <TabsContent value="settings" className="p-4 pt-0 space-y-3">
                {/* Master Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Sound Effects</span>
                  <Button
                    variant={soundSettings.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={toggleEnabled}
                    className="h-7 text-xs px-3"
                  >
                    {soundSettings.enabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                
                {/* Category Toggles */}
                <div className="space-y-1">
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 cursor-pointer">
                    <span className="text-sm">Task Sounds</span>
                    <input
                      type="checkbox"
                      checked={soundSettings.taskSounds}
                      onChange={(e) => updateSoundSettings({ taskSounds: e.target.checked })}
                      className="w-4 h-4 rounded border-border accent-primary"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 cursor-pointer">
                    <span className="text-sm">Message Sounds</span>
                    <input
                      type="checkbox"
                      checked={soundSettings.messageSounds}
                      onChange={(e) => updateSoundSettings({ messageSounds: e.target.checked })}
                      className="w-4 h-4 rounded border-border accent-primary"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 cursor-pointer">
                    <span className="text-sm">Achievement Sounds</span>
                    <input
                      type="checkbox"
                      checked={soundSettings.achievementSounds}
                      onChange={(e) => updateSoundSettings({ achievementSounds: e.target.checked })}
                      className="w-4 h-4 rounded border-border accent-primary"
                    />
                  </label>
                </div>
                
                {/* Status */}
                <div className="pt-2 border-t border-border/30">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      soundSettings.enabled 
                        ? "border-emerald-500/50 text-emerald-400"
                        : "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {soundSettings.enabled ? 'AUDIO ACTIVE' : 'AUDIO MUTED'}
                  </Badge>
                </div>
              </TabsContent>
                </Tabs>
              </div>
            </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
