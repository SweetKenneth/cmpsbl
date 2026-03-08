/**
 * CMPSBL® useDecodePersonality Hook
 * v10.5.4 ARCHITECT — React hook for DECODE personality profiles
 */

import { useState, useCallback, useMemo } from 'react';
import {
  personalityEngine,
  type PersonalityProfile,
  type PersonalityConfig,
  type PersonalityState,
  type PersonalityDetectionResult,
  type DecodeInterpretation,
} from './personality-engine';

export interface UseDecodePersonalityReturn {
  /** Current personality state */
  state: PersonalityState;
  
  /** Current active profile configuration */
  activeProfile: PersonalityConfig;
  
  /** List all available profiles */
  profiles: PersonalityConfig[];
  
  /** Set a specific personality profile */
  setProfile: (profile: PersonalityProfile) => void;
  
  /** Enable auto-detection mode */
  enableAuto: () => void;
  
  /** Lock current profile (prevents auto-switching) */
  lock: () => void;
  
  /** Unlock profile (allows auto-switching) */
  unlock: () => void;
  
  /** Reset to neutral profile */
  reset: () => void;
  
  /** Detect personality from text */
  detect: (input: string) => PersonalityDetectionResult;
  
  /** Interpret input with personality adjustments */
  interpret: (input: string) => DecodeInterpretation;
  
  /** Whether auto-detection is enabled */
  isAutoDetect: boolean;
  
  /** Whether profile is locked */
  isLocked: boolean;
}

/**
 * React hook for managing DECODE personality profiles
 */
export function useDecodePersonality(): UseDecodePersonalityReturn {
  const [state, setState] = useState<PersonalityState>(() => personalityEngine.getState());

  const refreshState = useCallback(() => {
    setState(personalityEngine.getState());
  }, []);

  const setProfile = useCallback((profile: PersonalityProfile) => {
    // set() is async (syncs to server) — fire-and-forget is intentional but refresh state after local update
    personalityEngine.set(profile).then(refreshState).catch(() => refreshState());
  }, [refreshState]);

  const enableAuto = useCallback(() => {
    personalityEngine.enableAuto();
    refreshState();
  }, [refreshState]);

  const lock = useCallback(() => {
    personalityEngine.lock();
    refreshState();
  }, [refreshState]);

  const unlock = useCallback(() => {
    personalityEngine.unlock();
    refreshState();
  }, [refreshState]);

  const reset = useCallback(() => {
    personalityEngine.reset();
    refreshState();
  }, [refreshState]);

  const detect = useCallback((input: string): PersonalityDetectionResult => {
    const result = personalityEngine.detect(input);
    refreshState();
    return result;
  }, [refreshState]);

  const interpret = useCallback((input: string): DecodeInterpretation => {
    const result = personalityEngine.interpret(input);
    refreshState();
    return result;
  }, [refreshState]);

  const { profile: activeProfile } = useMemo(() => personalityEngine.get(), [state]);
  const profiles = useMemo(() => personalityEngine.list(), []);

  return {
    state,
    activeProfile,
    profiles,
    setProfile,
    enableAuto,
    lock,
    unlock,
    reset,
    detect,
    interpret,
    isAutoDetect: state.autoDetect,
    isLocked: state.locked,
  };
}

export default useDecodePersonality;
