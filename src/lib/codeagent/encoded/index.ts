/**
 * Encoded Guardrails — Module Exports
 * v1.0.0 — Lov-baseline implementation agent with safety guardrails
 */

// Policy
export {
  ENCODED_POLICY,
  type ChangeClass,
  type RiskBand,
  getRiskBand,
  isProtectedPath,
  getApprovalRequirements,
} from './policy';

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
