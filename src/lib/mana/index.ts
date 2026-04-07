/**
 * Mana Engine — Unified API
 * U.S. Patent App. No. 64/031,637
 * Silent Symbiotic Software Attachment System
 * 
 * The substrate's Layer 2 attachment runtime.
 * Wraps host software at function boundaries without source modification.
 * All operations governed by Lex — the layer's conscience.
 * 
 * © CMPSBL® — All rights reserved.
 */

// Engine core
export {
  configure,
  getState,
  scan,
  attach,
  detach,
  generateProof,
  getManifest,
  getTelemetry,
  getTelemetrySummary,
  reset,
} from './engine';

// Lex governor
export {
  registerRule,
  evaluate,
  revokeRule,
  getRules,
  resetLex,
  ruleCount,
} from './lex';

// Types
export type {
  AttachmentState,
  LexVerdict,
  ManaCapability,
  AttachmentPoint,
  LexRule,
  ManaProof,
  ManaTelemetryEvent,
  ManaManifest,
  ManaConfig,
} from './types';
