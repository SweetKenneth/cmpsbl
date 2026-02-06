/**
 * Encoded Guardrails — Module Exports
 * v2.2.0 — Polished implementation agent with enhanced skills and communication
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

// Skills (v2.2.0)
export {
  ENCODED_SKILLS,
  getSkillsByCategory,
  getOverallProficiency,
  getSkillsSummary,
  formatSkill,
  getRelevantSkills,
  type Skill,
  type SkillCategory,
} from './skills';

// Communication (v2.2.0)
export {
  formatStatus,
  formatKV,
  formatHeader,
  formatFooter,
  formatProgressBar,
  formatVerification,
  formatGeneration,
  formatAgentStatus,
  formatHelp,
  createResponse,
  type StatusLevel,
  type VerificationDisplay,
  type GenerationDisplay,
  type AgentStatusDisplay,
  type EncodedResponse,
} from './communication';
