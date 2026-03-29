/**
 * useClocklessRadio — React hook for the Composable Radio Engine
 * Manages engine lifecycle, DJ interjections with TTS audio, tier-based time limits,
 * and daily broadcast integration
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { ClocklessRadioEngine, RadioDJ, type RadioTrack, type RadioState, type DJContent } from '@/lib/clockless-radio';
import { useRadioTimer } from '@/hooks/useRadioTimer';
import { supabase } from '@/integrations/supabase/client';

export interface ClocklessRadioState {
  isPlaying: boolean;
  state: RadioState;
  currentTrack: RadioTrack | null;
  volume: number;
  djContent: DJContent | null;
  isDJSpeaking: boolean;
  minutesRemaining: number;
  totalMinutes: number;
  limitReached: boolean;
}


export function useClocklessRadio() {
  const [radioState, setRadioState] = useState<ClocklessRadioState>({
    isPlaying: false,
    state: 'stopped',
    currentTrack: null,
    volume: 0.7,
    djContent: null,
    isDJSpeaking: false,
    minutesRemaining: -1,
    totalMinutes: -1,
    limitReached: false,
  });
  
  const engineRef = useRef<ClocklessRadioEngine | null>(null);
  const djRef = useRef<RadioDJ>(new RadioDJ());
  const djSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dailyBroadcastPlayedRef = useRef(false);
  const dailyBroadcastUrlRef = useRef<string | null>(null);
  const songCountRef = useRef(0);

  const radioTimer = useRadioTimer();

  // Fetch daily broadcast URL once on mount
  useEffect(() => {
    async function fetchDailyBroadcast() {
      const { data } = await (supabase as any)
        .from('radio_broadcasts')
        .select('audio_url, status')
        .eq('status', 'complete')
        .order('broadcast_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.audio_url) {
        dailyBroadcastUrlRef.current = data.audio_url;
        console.log('[Radio] Daily broadcast available for merge');
      }
    }
    fetchDailyBroadcast();
  }, []);

  // Sync timer state
  useEffect(() => {
    setRadioState(prev => ({
      ...prev,
      minutesRemaining: radioTimer.minutesRemaining,
      totalMinutes: radioTimer.totalMinutes,
      limitReached: radioTimer.limitReached,
    }));
  }, [radioTimer.minutesRemaining, radioTimer.totalMinutes, radioTimer.limitReached]);
  
  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new ClocklessRadioEngine({
        onTrackChange: (track) => {
          setRadioState(prev => ({ ...prev, currentTrack: track }));
          songCountRef.current++;

          // Maybe play daily broadcast instead of DJ (once per session, random timing)
          if (
            !dailyBroadcastPlayedRef.current &&
            dailyBroadcastUrlRef.current &&
            songCountRef.current >= 3 && // Not too early
            Math.random() < 0.3 // 30% chance per track change after song 3
          ) {
            dailyBroadcastPlayedRef.current = true;
            playDailyBroadcast();
            return;
          }
          
          // Standard DJ interjection
          const djContent = djRef.current.onTrackChange();
          if (djContent && engineRef.current) {
            setTimeout(async () => {
              const engine = engineRef.current;
              if (!engine) return;
              setRadioState(prev => ({ ...prev, djContent, isDJSpeaking: true }));
              engine.duckForDJ();
              const ctx = (engine as any).ctx as AudioContext | null;
              if (!ctx) {
                engine.unduckFromDJ();
                setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
                return;
              }
              const audioBuffer = await fetchDJAudio(djContent, ctx);
              if (!audioBuffer) {
                setTimeout(() => {
                  engine.unduckFromDJ();
                  setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
                }, 2000);
                return;
              }
              const masterGain = (engine as any).masterGain as GainNode | null;
              if (!masterGain || !ctx) {
                engine.unduckFromDJ();
                setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
                return;
              }
              const djGain = ctx.createGain();
              djGain.gain.value = 1.0;
              djGain.connect(ctx.destination);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(djGain);
              source.onended = () => {
                engine.unduckFromDJ();
                setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
                try { djGain.disconnect(); } catch {}
                djSourceRef.current = null;
              };
              djSourceRef.current = source;
              source.start(0);
              console.log('[RadioDJ] 🎙️ Rex Binary is speaking!');
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

  /** Play the daily broadcast as a mid-session segment */
  const playDailyBroadcast = useCallback(() => {
    const engine = engineRef.current;
    const url = dailyBroadcastUrlRef.current;
    if (!engine || !url) return;

    console.log('[Radio] 📻 Playing daily broadcast segment');
    setRadioState(prev => ({
      ...prev,
      djContent: { type: 'station_id', text: 'Daily substrate intelligence report incoming...', duration: 5000 },
      isDJSpeaking: true,
    }));

    engine.duckForDJ();

    const ctx = (engine as any).ctx as AudioContext | null;
    if (!ctx) {
      engine.unduckFromDJ();
      setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
      return;
    }

    // Load and play the daily broadcast audio
    fetch(url)
      .then(r => r.arrayBuffer())
      .then(buf => ctx.decodeAudioData(buf))
      .then(audioBuffer => {
        const djGain = ctx.createGain();
        djGain.gain.value = 1.0;
        djGain.connect(ctx.destination);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(djGain);

        source.onended = () => {
          engine.unduckFromDJ();
          setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
          try { djGain.disconnect(); } catch {}
        };

        source.start(0);
        console.log(`[Radio] Daily broadcast playing: ${audioBuffer.duration.toFixed(1)}s`);
      })
      .catch(err => {
        console.error('[Radio] Daily broadcast playback failed:', err);
        engine.unduckFromDJ();
        setRadioState(prev => ({ ...prev, djContent: null, isDJSpeaking: false }));
      });
  }, []);
  
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      const ok = radioTimer.tick();
      if (!ok) {
        // Limit reached — stop the radio
        stopRadio();
      }
    }, 1000);
  }, [radioTimer]);

  const stopRadio = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    try { djSourceRef.current?.stop(); } catch {}
    djSourceRef.current = null;
    engineRef.current?.stop();
  }, []);

  const play = useCallback(async () => {
    if (radioTimer.limitReached) {
      radioTimer.tick(); // Will show the toast
      return;
    }
    const engine = getEngine();
    await engine.play();
    startTimer();
  }, [getEngine, radioTimer, startTimer]);
  
  const stop = useCallback(() => {
    stopRadio();
  }, [stopRadio]);
  
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
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
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
