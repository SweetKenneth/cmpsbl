/**
 * promptfluid® DECODE Module
 * v7.1.0 — Interpreter Primitive with Personality Profiles
 */

export {
  personalityEngine,
  PersonalityEngineClient,
  PERSONALITY_PROFILES,
  type PersonalityProfile,
  type PersonalityConfig,
  type PersonalityState,
  type PersonalityDetectionResult,
  type DecodeInterpretation,
} from './personality-engine';

export {
  useDecodePersonality,
  type UseDecodePersonalityReturn,
} from './useDecodePersonality';
