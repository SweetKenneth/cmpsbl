/**
 * Mana — Silent Software Symbiosis Engine
 * U.S. Patent App. No. 64/031,637
 * 
 * The substrate's Layer 2 deployment and defense runtime.
 * Wraps host software at function boundaries without source modification.
 * All operations governed by Lex — the layer's conscience.
 * 
 * Phase 0: Engine core + single-package attachment
 * Phase 1: Runtime loader + multi-package composition + manifest consumer
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
  enableTrace,
  disableTrace,
  getTrace,
  inspectFunction,
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

// Config — declarative deployment configuration (Phase 1)
export {
  generateExampleConfig,
} from './config';

// Manifest consumer — Ascension → Mana auto-deploy bridge (Phase 1)
export {
  manifestToConfig,
  mergeManifests,
  serializeConfig,
  parseConfig,
  summarizeDeployment,
} from './manifest-consumer';

// Types — all 92 capabilities unified with Ascension
export type {
  AttachmentState,
  LexVerdict,
  LexEvalContext,
  ManaCapability,
  AnyFn,
  DenySemantic,
  CapabilityContract,
  AttachmentPoint,
  LexRule,
  ManaProof,
  ManaTelemetryEvent,
  ManaManifest,
  ManaConfig,
  AscensionFinding,
  ManaAttachmentEntry,
} from './types';

export { WrapperPhase, CAPABILITY_PHASE } from './types';

// Config types (Phase 1)
export type {
  ManaLoaderConfig,
  ManaTargetConfig,
  ManaAttachmentDirective,
} from './config';

// Manifest consumer types (Phase 1)
export type {
  AscensionManifest,
  DeploymentSummary,
} from './manifest-consumer';
