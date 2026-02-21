/**
 * useClocklessRadio — React hook for the Clockless Radio Engine
 * Manages engine lifecycle, DJ interjections, and reactive state
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { ClocklessRadioEngine, RadioDJ, type RadioTrack, type RadioState, type DJContent } from '@/lib/clockless-radio';

export interface ClocklessRadioState {
  isPlaying: boolean;
  state: RadioState;
  currentTrack: RadioTrack | null;
  volume: number;
  djContent: DJContent | null;
  isDJSpeaking: boolean;
}

export function useClocklessRadio() {
  const [radioState, setRadioState] = useState<ClocklessRadioState>({
    isPlaying: false,
    state: 'stopped',
    currentTrack: null,
    volume: 0.7,
    djContent: null,
    isDJSpeaking: false,
  });
  
  const engineRef = useRef<ClocklessRadioEngine | null>(null);
  const djRef = useRef<RadioDJ>(new RadioDJ());
  const djTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Initialize engine lazily
  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new ClocklessRadioEngine({
        onTrackChange: (track) => {
          setRadioState(prev => ({ ...prev, currentTrack: track }));
          
          // Check if DJ should interject
          const djContent = djRef.current.onTrackChange();
          if (djContent && engineRef.current) {
            // Small delay before DJ speaks
            setTimeout(() => {
              if (!engineRef.current) return;
              engineRef.current.duckForDJ();
              setRadioState(prev => ({ ...prev, djContent, isDJSpeaking: true }));
              
              // End DJ after content duration
              djTimeoutRef.current = setTimeout(() => {
                if (!engineRef.current) return;
                engineRef.current.unduckFromDJ();
                setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
              }, djContent.duration);
            }, 1500);
          }
        },
        onStateChange: (state) => {
          setRadioState(prev => ({ ...prev, state, isPlaying: state !== 'stopped' }));
        },
        onDJStart: () => {},
        onDJEnd: () => {},
      });
    }
    return engineRef.current;
  }, []);
  
  const play = useCallback(async () => {
    const engine = getEngine();
    await engine.play();
  }, [getEngine]);
  
  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);
  
  const skip = useCallback(() => {
    engineRef.current?.skip();
  }, []);
  
  const setVolume = useCallback((v: number) => {
    engineRef.current?.setVolume(v);
    setRadioState(prev => ({ ...prev, volume: v }));
  }, []);
  
  const toggle = useCallback(async () => {
    if (radioState.isPlaying) {
      stop();
    } else {
      await play();
    }
  }, [radioState.isPlaying, play, stop]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (djTimeoutRef.current) clearTimeout(djTimeoutRef.current);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);
  
  return {
    ...radioState,
    play,
    stop,
    skip,
    setVolume,
    toggle,
  };
}
