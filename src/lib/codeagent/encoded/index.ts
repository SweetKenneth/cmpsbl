export * from './production-pipeline';

/**
 * Encoded Guardrails — Module Exports
 * Polished implementation agent with enhanced skills and communication
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

// Expert Patterns (v3.0.0)
export {
  EXPERT_PATTERNS,
  getPatternsByCategory,
  getPatternsByTier,
  getPatternById,
  searchPatterns,
  getPatternSummary,
  getRelevantPatterns,
  type ExpertPattern,
  type PatternCategory,
  type PatternTier,
} from './expert-patterns';

// Knowledge Transfer Pipeline (v3.0.0)
export {
  extractCodePatterns,
  transferToEncoded,
  ingestExpertPatterns,
  runTransferCycle,
  getAccelerationStrategies,
  DEFAULT_ACCELERATION_CONFIG,
  type LearnedPattern,
  type TransferResult,
  type TrainingAccelerationConfig,
} from './knowledge-transfer';

// Feedback Loop & Graduated Autonomy (v3.1.0)
export {
  recordOutcome,
  getMasteryScores,
  getOverallMastery,
  loadMasteryScores,
  getGraduatedThresholds,
  getMasterySummary,
  type PatternOutcome,
  type MasteryScore,
  type GraduatedThresholds,
} from './feedback-loop';

// System Manifest — Architecture Awareness (v9.3.0)
export {
  SYSTEM_MODULES,
  SYSTEM_COMPONENTS,
  SYSTEM_ROUTES,
  ENCODE_IDENTITY,
  resolveModule,
  resolveComponent,
  resolveModuleByPath,
  getModulesByLayer,
  getDependencyChain,
  getSystemSummary,
  type ModuleEntry,
  type ComponentEntry,
  type RouteEntry,
} from './system-manifest';

// Shadow Practice Engine (v3.2.0)
export {
  shadowPractice,
  type PracticeTask,
  type PracticeTaskType,
  type PracticeResult,
  type ShadowPracticeState,
} from './shadow-practice';

// Substrate Navigator — Codebase Navigation Intelligence
export {
  navigateIntent,
  resolveAlias,
  getAliasesForModule,
  detectConcerns,
  getConcernFiles,
  getModuleTables,
  whereIs,
  CONVENTIONS,
  type NavigationResult,
  type ConcernType,
} from './substrate-navigator';
