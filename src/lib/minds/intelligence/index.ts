/**
 * Minds Intelligence Layer v1
 * Layered, gated production architecture.
 * 
 * ACTIVE (Phase 1 Public):
 *   - Scoped Research URLs
 *   - Tool Chain Composition
 *   - Domain-Specific Prompt Scaffolding
 *   - Failure Recovery Playbooks
 *   - Session Context Windowing
 *   - Confidence Signaling
 * 
 * GATED (Internal Only / Disabled):
 *   - Memory Consolidation Cycles
 *   - Output Quality Scoring Engine
 *   - Adaptive Tone Calibration Engine
 *   - Domain Vocabulary Registry
 *   - Proficiency-Gated Capabilities
 * 
 * NOT BUILT (Excluded):
 *   - Cross-Mind Knowledge Transfer
 *   - Autonomous Contradiction Resolution
 */

// ─── Feature Flag Matrix ───
export {
  FEATURE_FLAG_MATRIX,
  isFeatureActive,
  isFeatureAvailable,
  isActivatable,
  overrideFeatureStatus,
  getEffectiveStatus,
  getFeatureFlagSummary,
  getActiveFeatureCount,
  getGatedFeatureCount,
  type FeatureGateStatus,
  type FeatureFlagEntry,
} from './featureFlags';

// ─── Phase 1: ACTIVE ───

export {
  getResearchScope,
  isUrlAllowed,
  addAllowedDomain,
  getAllScopes,
  type ResearchScope,
} from './scopedResearch';

export {
  executeChain,
  registerChain,
  getChain,
  getChainsForMind,
  getActiveExecutionCount,
  type ToolStep,
  type ToolChainDefinition,
  type ToolChainExecution,
} from './toolChain';

export {
  getPromptScaffold,
  buildSystemPrompt,
  hasScaffold,
  getScaffoldedMinds,
  type PromptScaffold,
} from './promptScaffolding';

export {
  classifyFailure,
  getPlaybook,
  executeRecovery,
  type FailureCategory,
  type RecoveryAction,
  type RecoveryPlaybook,
  type RecoveryResult,
} from './failureRecovery';

export {
  getWindow,
  addEntry,
  getPrioritizedContext,
  buildContextString,
  pinEntry,
  getWindowStats,
  clearWindow,
  getActiveWindowCount,
  cleanupStaleWindows,
  type ContextEntry,
  type ContextWindow,
} from './contextWindowing';

export {
  calculateConfidence,
  quickConfidence,
  type ConfidenceLevel,
  type ConfidenceSignal,
  type ScoringInputs,
} from './confidenceSignaling';

// ─── Gated: INTERNAL_ONLY ───

export {
  runConsolidation,
  shouldConsolidate,
  type ConsolidationResult,
  type MemoryFragment,
} from './consolidation';

export {
  scoreOutput,
  passesQualityGate,
  getSuggestions,
  type QualityScore,
  type QualityContext,
} from './qualityScoring';

export {
  getToneProfile,
  setManualTone,
  clearManualTone,
  getToneDirective,
  recordToneSignal,
  getAvailableTones,
  setAutoCalibrate,
  type TonePreset,
  type ToneProfile,
  type ToneDirective,
} from './adaptiveTone';

export {
  getVocabulary,
  lookupTerm,
  learnTerm,
  getVocabularySize,
  getTopTerms,
  type VocabularyEntry,
  type VocabularyRegistry,
} from './vocabularyRegistry';

export {
  scoreToProficiency,
  getProfile,
  canAccessCapability,
  recordTaskOutcome,
  getCapabilitiesForMind,
  getAllGatedCapabilities,
  type ProficiencyTier,
  type GatedCapability,
  type ProficiencyProfile,
} from './proficiencyGating';

// ─── Version Snapshot ───

export {
  initVersionLine,
  createSnapshot,
  bumpInternalVersion,
  promoteToPublic,
  getVersionLine,
  getCurrentPublicVersion,
  getSnapshots,
  validateSnapshot,
  getReleaseHistory,
  type MindSnapshot,
  type VersionLine,
} from './versionSnapshot';
