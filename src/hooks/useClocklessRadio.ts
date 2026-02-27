/**
 * useClocklessRadio — React hook for the Clockless Radio Engine
 * Manages engine lifecycle, DJ interjections with TTS audio, and reactive state
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { ClocklessRadioEngine, RadioDJ, type RadioTrack, type RadioState, type DJContent } from '@/lib/clockless-radio';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export interface ClocklessRadioState {
  isPlaying: boolean;
  state: RadioState;
  currentTrack: RadioTrack | null;
  volume: number;
  djContent: DJContent | null;
  isDJSpeaking: boolean;
}

/**
 * Fetches TTS audio from the radio-dj-tts edge function and decodes it
 * into an AudioBuffer for playback through the Web Audio API.
 */
async function fetchDJAudio(
  content: DJContent,
  audioCtx: AudioContext
): Promise<AudioBuffer | null> {
  try {
    console.log(`[RadioDJ] Fetching TTS for: "${content.text.slice(0, 50)}..."`);
    
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/radio-dj-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          text: content.text,
          contentType: content.type,
          caller: content.caller,
          callerVoice: content.callerVoice,
        }),
      }
    );

    if (!response.ok) {
      console.error('[RadioDJ] TTS fetch failed:', response.status);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log(`[RadioDJ] Got ${arrayBuffer.byteLength} bytes, decoding...`);
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    console.log(`[RadioDJ] Decoded DJ audio: ${audioBuffer.duration.toFixed(1)}s`);
    return audioBuffer;
  } catch (err) {
    console.error('[RadioDJ] Failed to fetch/decode TTS:', err);
    return null;
  }
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
  const djSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
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
            setTimeout(async () => {
              const engine = engineRef.current;
              if (!engine) return;

              // Show the DJ content text as a visual indicator too
              setRadioState(prev => ({ ...prev, djContent, isDJSpeaking: true }));

              // Duck the music
              engine.duckForDJ();

              // Fetch TTS audio
              const ctx = (engine as any).ctx as AudioContext | null;
              if (!ctx) {
                // No audio context — can't play DJ, restore
                engine.unduckFromDJ();
                setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
                return;
              }

              const audioBuffer = await fetchDJAudio(djContent, ctx);

              if (!audioBuffer) {
                // TTS failed — unduck after a brief pause
                setTimeout(() => {
                  engine.unduckFromDJ();
                  setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
                }, 2000);
                return;
              }

              // Play DJ audio through the engine's audio context
              const masterGain = (engine as any).masterGain as GainNode | null;
              if (!masterGain || !ctx) {
                engine.unduckFromDJ();
                setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
                return;
              }

              // Create a separate gain node for DJ voice at full volume
              const djGain = ctx.createGain();
              djGain.gain.value = 1.0;
              djGain.connect(ctx.destination); // direct to output, bypasses music duck

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(djGain);

              // When DJ audio ends, restore music
              source.onended = () => {
                engine.unduckFromDJ();
                setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
                try { djGain.disconnect(); } catch {}
                djSourceRef.current = null;
              };

              djSourceRef.current = source;
              source.start(0);
              console.log('[RadioDJ] 🎙️ DJ is speaking!');
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
    // Stop any playing DJ audio
    try { djSourceRef.current?.stop(); } catch {}
    djSourceRef.current = null;
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
      try { djSourceRef.current?.stop(); } catch {}
      djSourceRef.current = null;
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
