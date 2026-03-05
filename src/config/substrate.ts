/**
 * Substrate Configuration — Central Runtime Constants
 * 
 * Configurable values that govern substrate behavior.
 * Environment variables override defaults where applicable.
 */

/**
 * Pipeline fingerprint epoch.
 * Used as a versioning salt in structural fingerprint computation.
 * Changing this value invalidates ALL existing fingerprints.
 * Rotation path: SPARTA → ATHENA → TITAN
 */
export const PIPELINE_FINGERPRINT_EPOCH =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PIPELINE_FINGERPRINT_EPOCH) || 'SPARTA';

/**
 * Quality floor for public mining.
 * Discoveries below this CJPI are excluded from mine results.
 */
export const QUALITY_FLOOR = 1;

/**
 * Legacy capability placeholder for discoveries without recorded capabilities.
 * Used when converting module_chain → pipeline_steps for pre-v13.3 discoveries.
 */
export const LEGACY_CAPABILITY_PLACEHOLDER = 'unknown';
