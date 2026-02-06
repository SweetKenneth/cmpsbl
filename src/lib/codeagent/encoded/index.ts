/**
 * Encoded Guardrails — Module Exports
 * v2.1.0 — Lov-baseline implementation agent with enhanced safety guardrails
 */

// Policy
export {
  ENCODED_POLICY,
  DEFAULT_ENCODED_CONFIG,
  type ChangeClass,
  type RiskBand,
  type ExecutionMode,
  type PrimaryModel,
  type EncodedConfig,
  getRiskBand,
  isProtectedPath,
  getApprovalRequirements,
  hasDangerousPatterns,
  validateEdgeFunction,
} from './policy';

// Configuration
export {
  getEncodedConfig,
  updateEncodedConfig,
  resetEncodedConfig,
  isSebaIntegrationEnabled,
  isDryRunMode,
  getExecutionModeLabel,
  getPrimaryModelLabel,
} from './config';

// Anchor detection
export {
  sha256,
  quickHash,
  extractAnchors,
  compareAnchors,
  detectNarrative,
  extractImports,
  type FileAnchors,
} from './anchor';

// Guard enforcement
export {
  runEncodedGuard,
  wouldBlock,
  summarizeGuardResult,
  computeDiffStats,
  classifyChange,
  type GuardResult,
  type DiffStats,
} from './guard';
