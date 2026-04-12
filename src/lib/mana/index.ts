/**
 * Mana — Silent Software Symbiosis Engine
 * U.S. Patent App. No. 64/031,637
 * 
 * The substrate's Layer 2 deployment and defense runtime.
 * Wraps host software at function boundaries without source modification.
 * All operations governed by Lex — the layer's conscience.
 * 
 * © CMPSBL® — All rights reserved.
 */

// Engine core
export {
  configure,
  getState,
  getLayerDepth,
  scan,
  attach,
  detach,
  generateProof,
  getManifest,
  getTelemetry,
  getTelemetrySummary,
  reset,
} from './engine';

// Findings bridge — Ascension ↔ Mana convergence
export {
  detectFunctionBoundaries,
  buildAttachmentPlan,
  serializeAttachmentPlan,
} from './findings-bridge';

// Lex governor
export {
  registerRule,
  evaluate,
  revokeRule,
  getRules,
  resetLex,
  ruleCount,
} from './lex';

// Types — all 92 capabilities unified with Ascension
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
  AscensionFinding,
  ManaAttachmentEntry,
} from './types';
