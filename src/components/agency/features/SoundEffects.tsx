/**
 * SoundEffects — Optional audio cues for task completion and alerts
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { secureGet, secureSet } from '@/lib/system/secureStorage';

// ============================================================================
// TYPES
// ============================================================================
export type SoundType = 
  | 'task_complete' 
  | 'task_start' 
  | 'task_error' 
  | 'notification' 
  | 'message_sent'
  | 'message_received'
  | 'level_up'
  | 'achievement';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  notes?: number[];
}

// ============================================================================
// SOUND CONFIGURATIONS
// ============================================================================
const SOUNDS: Record<SoundType, SoundConfig> = {
  task_complete: {
    frequency: 880,
    duration: 0.15,
    type: 'sine',
    volume: 0.3,
    notes: [523.25, 659.25, 783.99], // C5, E5, G5 - upward arpeggio
  },
  task_start: {
    frequency: 440,
    duration: 0.1,
    type: 'sine',
    volume: 0.2,
    notes: [440],
  },
  task_error: {
    frequency: 200,
    duration: 0.2,
    type: 'sawtooth',
    volume: 0.2,
    notes: [293.66, 261.63], // D4, C4 - descending
  },
  notification: {
    frequency: 660,
    duration: 0.08,
    type: 'sine',
    volume: 0.25,
    notes: [659.25, 783.99], // E5, G5
  },
  message_sent: {
    frequency: 520,
    duration: 0.05,
    type: 'sine',
    volume: 0.15,
    notes: [523.25],
  },
  message_received: {
    frequency: 660,
    duration: 0.08,
    type: 'sine',
    volume: 0.2,
    notes: [659.25, 783.99],
  },
  level_up: {
    frequency: 440,
    duration: 0.15,
    type: 'sine',
    volume: 0.35,
    notes: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6
  },
  achievement: {
    frequency: 880,
    duration: 0.2,
    type: 'sine',
    volume: 0.3,
    notes: [783.99, 987.77, 1174.66, 1318.51], // G5, B5, D6, E6
  },
};

// ============================================================================
// AUDIO CONTEXT SINGLETON
// ============================================================================
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// ============================================================================
// PLAY SOUND FUNCTION
// ============================================================================
function playSound(config: SoundConfig) {
  try {
    const ctx = getAudioContext();
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const notes = config.notes || [config.frequency];
    const noteDelay = config.duration * 0.8;
    
    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = config.type;
      oscillator.frequency.value = freq;
      
      const startTime = ctx.currentTime + (index * noteDelay);
      const endTime = startTime + config.duration;
      
      // Envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(config.volume, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
      
      oscillator.start(startTime);
      oscillator.stop(endTime + 0.01);
    });
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

// ============================================================================
// USE SOUND HOOK
// ============================================================================
interface UseSoundOptions {
  enabled?: boolean;
  volume?: number;
}

export function useSound(options: UseSoundOptions = {}) {
  const { enabled = true, volume = 1 } = options;
  const volumeRef = useRef(volume);
  
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  
  const play = useCallback((type: SoundType) => {
    if (!enabled) return;
    
    const config = SOUNDS[type];
    if (!config) return;
    
    playSound({
      ...config,
      volume: config.volume * volumeRef.current,
    });
  }, [enabled]);
  
  return { play };
}

// ============================================================================
// SOUND SETTINGS HOOK
// ============================================================================
interface SoundSettings {
  enabled: boolean;
  volume: number;
  taskSounds: boolean;
  messageSounds: boolean;
  achievementSounds: boolean;
}

const DEFAULT_SETTINGS: SoundSettings = {
  enabled: false, // Disabled by default
  volume: 0.5,
  taskSounds: true,
  messageSounds: true,
  achievementSounds: true,
};

const STORAGE_KEY = 'agency_sound_settings';

export function useSoundSettings() {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    
    try {
      const stored = secureGet<SoundSettings>(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  
  const updateSettings = useCallback((updates: Partial<SoundSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      secureSet(STORAGE_KEY, next);
      return next;
    });
  }, []);
  
  const toggleEnabled = useCallback(() => {
    updateSettings({ enabled: !settings.enabled });
  }, [settings.enabled, updateSettings]);
  
  return {
    settings,
    updateSettings,
    toggleEnabled,
  };
}

// ============================================================================
// SOUND CONTEXT PROVIDER
// ============================================================================
export function useSoundEffects() {
  const { settings, toggleEnabled } = useSoundSettings();
  const { play: playRaw } = useSound({ 
    enabled: settings.enabled, 
    volume: settings.volume 
  });
  
  const play = useCallback((type: SoundType) => {
    // Check category settings
    if (type.startsWith('task_') && !settings.taskSounds) return;
    if (type.startsWith('message_') && !settings.messageSounds) return;
    if ((type === 'level_up' || type === 'achievement') && !settings.achievementSounds) return;
    
    playRaw(type);
  }, [playRaw, settings]);
  
  return { 
    play, 
    enabled: settings.enabled, 
    toggle: toggleEnabled 
  };
}

// ============================================================================
// SOUND TOGGLE COMPONENT
// ============================================================================
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SoundToggleProps {
  className?: string;
}

export function SoundToggle({ className }: SoundToggleProps) {
  const { settings, toggleEnabled } = useSoundSettings();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleEnabled}
      className={cn('h-8 w-8', className)}
      title={settings.enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {settings.enabled ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  );
}
