/**
 * CMPSBL® DECODE Module
 * v10.5.4 ARCHITECT Epoch — Interpreter Primitive with Personality Profiles
 * + Cryptographic Identity Context
 * 
 * Part of the 6-layer, 21-module Cognitive Architecture
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

export {
  buildIdentityContext,
  getIdentityContext,
  clearIdentityContext,
  isReturningUser,
  type DecodeIdentityContext,
} from './identity-context';

export {
  CLOCKLESS_FULL_NAME,
  CLOCKLESS_SHORT,
  CLOCKLESS_CATEGORY,
  CLOCKLESS_SUBSTRATE,
  CLOCKLESS_TAGLINE,
  CLOCKLESS_DEFINITION,
  COGNITIVE_REALITY_DEFINITION,
  DECODE_SYSTEM_IDENTITY,
  ACCEPTABLE_TERMS,
  DEPRECATED_TERMS,
  TERM_REPLACEMENTS,
  ARCHITECTURE,
  sanitizeClocklessTerminology,
} from './clockless-identity';
