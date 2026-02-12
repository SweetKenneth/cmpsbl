/**
 * promptfluid® DECODE Module
 * v9.0.0 ARCHITECT Epoch — Interpreter Primitive with Personality Profiles
 * + Cryptographic Identity Context
 * 
 * Part of the 6-layer, 20-module Cognitive Architecture
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
