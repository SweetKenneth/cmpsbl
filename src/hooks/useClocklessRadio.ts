/**
 * useClocklessRadio — Shared Clockless Radio hook
 * Persists playback across route changes on the public site.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ClocklessRadioEngine,
  RadioDJ,
  RadioSFX,
  type RadioTrack,
  type RadioState,
  type DJContent,
  speakDJContent,
  cancelTTS,
  primeTTS,
} from '@/lib/clockless-radio';
import { useUserRole, type SubstrateRole } from '@/hooks/useUserRole';
import { getUserLimits } from '@/lib/substrate/product-limits';
import { toast } from 'sonner';

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
  sfxOnly: boolean;
}

interface RadioTimerData {
  windowStart: number;
  secondsUsed: number;
}

type RadioListener = (state: ClocklessRadioState) => void;

const STORAGE_KEY = 'cmpsbl_radio_timer';

const initialState: ClocklessRadioState = {
  isPlaying: false,
  state: 'stopped',
  currentTrack: null,
  volume: 0.7,
  djContent: null,
  isDJSpeaking: false,
  minutesRemaining: -1,
  totalMinutes: -1,
  limitReached: false,
  sfxOnly: false,
};

let sharedState: ClocklessRadioState = { ...initialState };
const listeners = new Set<RadioListener>();
let sharedEngine: ClocklessRadioEngine | null = null;
let sharedDJ: RadioDJ | null = null;
let sharedRole: SubstrateRole = 'free';
let timerInterval: ReturnType<typeof setInterval> | null = null;
let songsSinceStart = 0;
let hasWarnedOneMinute = false;
let activeDJToken = 0;
let djSafetyTimeout: ReturnType<typeof setTimeout> | null = null;

function emitState(): void {
  listeners.forEach((listener) => listener(sharedState));
}

function updateSharedState(
  next:
    | Partial<ClocklessRadioState>
    | ((prev: ClocklessRadioState) => ClocklessRadioState)
): void {
  sharedState =
    typeof next === 'function'
      ? next(sharedState)
      : { ...sharedState, ...next };
  emitState();
}

function getTimerData(): RadioTimerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as RadioTimerData;
      if (Date.now() - data.windowStart > 24 * 60 * 60 * 1000) {
        return { windowStart: Date.now(), secondsUsed: 0 };
      }
      return data;
    }
  } catch {
    // noop
  }

  return { windowStart: Date.now(), secondsUsed: 0 };
}

function saveTimerData(data: RadioTimerData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getTimerSnapshot(role: SubstrateRole = sharedRole): Pick<ClocklessRadioState, 'minutesRemaining' | 'totalMinutes' | 'limitReached'> {
  if (role === 'governor') {
    return { minutesRemaining: -1, totalMinutes: -1, limitReached: false };
  }

  const totalMinutes = getUserLimits(role).radioMinutesPerDay;
  if (totalMinutes < 0) {
    return { minutesRemaining: -1, totalMinutes: -1, limitReached: false };
  }

  const timerData = getTimerData();
  const totalSeconds = totalMinutes * 60;
  const limitReached = timerData.secondsUsed >= totalSeconds;
  const minutesRemaining = Math.max(0, totalMinutes - Math.floor(timerData.secondsUsed / 60));

  return {
    minutesRemaining,
    totalMinutes,
    limitReached,
  };
}

function syncTimerState(): void {
  updateSharedState((prev) => ({
    ...prev,
    ...getTimerSnapshot(),
  }));
}

function stopSharedTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function tickTimer(): boolean {
  if (sharedRole === 'governor') {
    syncTimerState();
    return true;
  }

  const totalMinutes = getUserLimits(sharedRole).radioMinutesPerDay;
  const totalSeconds = totalMinutes * 60;
  const timerData = getTimerData();
  timerData.secondsUsed += 1;
  saveTimerData(timerData);

  const remainingSeconds = totalSeconds - timerData.secondsUsed;

  if (remainingSeconds === 60 && !hasWarnedOneMinute) {
    hasWarnedOneMinute = true;
    toast.warning('Clockless Radio', {
      description: `1 minute remaining on your ${totalMinutes}-minute daily radio limit.`,
      duration: 8000,
    });
  }

  syncTimerState();

  if (remainingSeconds <= 0) {
    toast.error('Radio limit reached', {
      description: `You've used your ${totalMinutes} minutes of radio for today.`,
      duration: 10000,
    });
    return false;
  }

  return true;
}

function startSharedTimer(): void {
  stopSharedTimer();
  timerInterval = setInterval(() => {
    const ok = tickTimer();
    if (!ok) {
      stopSharedRadio();
    }
  }, 1000);
}

function finishDJSegment(): void {
  if (djSafetyTimeout) {
    clearTimeout(djSafetyTimeout);
    djSafetyTimeout = null;
  }

  if (sharedEngine && sharedState.isDJSpeaking) {
    sharedEngine.unduckFromDJ();
  }

  updateSharedState((prev) => ({
    ...prev,
    djContent: null,
    isDJSpeaking: false,
  }));
}

function startDJSegment(content: DJContent): void {
  if (!sharedEngine) return;

  const djToken = ++activeDJToken;

  updateSharedState((prev) => ({
    ...prev,
    djContent: content,
    isDJSpeaking: true,
  }));

  sharedEngine.duckForDJ();

  djSafetyTimeout = setTimeout(() => {
    if (djToken !== activeDJToken) return;
    finishDJSegment();
  }, content.duration + 6000);

  // Play intro SFX through AudioContext (routes to Bluetooth) BEFORE voice
  const sfx = sharedEngine.sfx;
  const sfxType = RadioSFX.sfxForDJ(content.type);
  const sfxPromise = sfx ? sfx.play(sfxType) : Promise.resolve();

  sfxPromise.then(() => {
    if (djToken !== activeDJToken) return;

    // SFX-only mode: skip TTS voice entirely (text still shows visually)
    if (sharedEngine?.isSFXOnly) {
      // Hold the text visible for the estimated duration then dismiss
      setTimeout(() => {
        if (djToken !== activeDJToken) return;
        finishDJSegment();
      }, content.duration);
      return;
    }

    // Normal mode: speak through SpeechSynthesis
    void speakDJContent(content)
      .catch(() => {
        // Text stays visible even if TTS fails.
      })
      .finally(() => {
        if (djToken !== activeDJToken) return;
        finishDJSegment();
      });
  });
}

function getSharedEngine(): ClocklessRadioEngine {
  if (!sharedEngine) {
    sharedDJ = new RadioDJ();
    sharedEngine = new ClocklessRadioEngine({
      onTrackChange: (track) => {
        updateSharedState((prev) => ({ ...prev, currentTrack: track }));
        songsSinceStart += 1;

        const djContent = sharedDJ?.onTrackChange();
        if (djContent) {
          window.setTimeout(() => {
            startDJSegment(djContent);
          }, 1500);
        }
      },
      onStateChange: (state) => {
        updateSharedState((prev) => ({
          ...prev,
          state,
          isPlaying: state !== 'stopped',
        }));
      },
      onDJStart: () => {},
      onDJEnd: () => {},
    });

    sharedEngine.setVolume(sharedState.volume);
  }

  return sharedEngine;
}

async function playSharedRadio(): Promise<void> {
  const timerSnapshot = getTimerSnapshot();
  if (timerSnapshot.limitReached) {
    toast.error('Radio limit reached', {
      description: `You've used your ${timerSnapshot.totalMinutes} minutes of radio for today.`,
      duration: 10000,
    });
    syncTimerState();
    return;
  }

  await primeTTS();
  const engine = getSharedEngine();
  await engine.play();
  startSharedTimer();
  syncTimerState();
}

function stopSharedRadio(): void {
  activeDJToken += 1;
  finishDJSegment();
  cancelTTS();
  stopSharedTimer();
  sharedEngine?.stop();
}

function skipSharedRadio(): void {
  sharedEngine?.skip();
}

function setSharedVolume(volume: number): void {
  const nextVolume = Math.max(0, Math.min(1, volume));
  sharedEngine?.setVolume(nextVolume);
  updateSharedState((prev) => ({ ...prev, volume: nextVolume }));
}

export function useClocklessRadio() {
  const { role } = useUserRole();
  const [radioState, setRadioState] = useState<ClocklessRadioState>(() => ({
    ...sharedState,
    ...getTimerSnapshot(role),
  }));

  useEffect(() => {
    listeners.add(setRadioState);
    setRadioState({ ...sharedState, ...getTimerSnapshot(role) });

    return () => {
      listeners.delete(setRadioState);
    };
  }, [role]);

  useEffect(() => {
    sharedRole = role;
    syncTimerState();
  }, [role]);

  const play = useCallback(async () => {
    await playSharedRadio();
  }, []);

  const stop = useCallback(() => {
    stopSharedRadio();
  }, []);

  const skip = useCallback(() => {
    skipSharedRadio();
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSharedVolume(volume);
  }, []);

  const toggle = useCallback(async () => {
    if (sharedState.isPlaying) {
      stopSharedRadio();
      return;
    }

    await playSharedRadio();
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
