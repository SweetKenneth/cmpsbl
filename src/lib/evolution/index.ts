/**
 * EVOLUTION Module — v9.0.0 "Phoenix"
 * The substrate's governed mutation engine.
 * 
 * Manages the full lifecycle of system mutations:
 * proposal → gates → shadow → apply → verify → promote
 * 
 * All mutations are rate-governed, evidence-backed, hash-chained,
 * and proficiency-gated.
 */

// ── Foundation (existing) ──
export { computeConfidence, type ConfidenceInputs, type ConfidenceResult } from './confidence';
export { validateEvidenceBundle, computeNoveltyScore, type EvidenceBundle, type TestEvidence, type DiffStats, type TelemetryDelta, type SecurityScanResult } from './evidence';
export { evaluatePromotion, type PromotionDecision } from './promotionRules';

// ── v9.0.0 "Phoenix" — Ultimate Form ──

// 1. Proposal Lifecycle Engine
export {
  createProposal, advanceStep, rollbackStep,
  getProposal, getActiveProposals, getAllProposals, getStepOrder,
  clearProposalState,
  type ProposalStep, type ProposalStatus, type MutationProposal, type StepRecord,
} from './proposalLifecycle';

// 2. SEBA Gate Pipeline
export {
  runPipeline, getGateOrder, getPipelineResults, getPassRate,
  clearPipelineState,
  type GateId, type GateResult, type PipelineResult, type GateInputs,
} from './sebaGatePipeline';

// 3. DAG Dependency Sequencer
export {
  sequenceMutations, detectModuleConflicts, computeCriticalPath,
  type MutationNode, type SequenceResult,
} from './dagSequencer';

// 4. Blast Radius Projector
export {
  projectBlastRadius, getReports as getBlastRadiusReports,
  getReportForProposal, clearBlastRadiusState,
  type BlastRadiusInput, type BlastRadiusReport,
} from './blastRadiusProjector';

// 5. Shadow Execution Engine
export {
  executeShadow, getShadowResults, getShadowResultForProposal,
  clearShadowState,
  type ShadowInput, type ShadowResult, type ShadowDiff,
} from './shadowExecution';

// 6. Mutation Velocity Governor
export {
  setGovernanceMode as setEvolutionGovernanceMode,
  requestMutation, getVelocityState, getUtilization as getVelocityUtilization,
  clearVelocityState,
  type VelocityState, type VelocityDecision,
} from './velocityGovernor';

// 7. Rollback Ledger
export {
  appendMutation, rollback as rollbackMutation,
  rollbackToSequence, verifyIntegrity as verifyLedgerIntegrity,
  getLedger, getEntry as getLedgerEntry,
  getAppliedCount, getRolledBackCount, clearLedgerState,
  type RollbackEntry, type LedgerIntegrity,
} from './rollbackLedger';

// 8. Diligence Probe Runner
export {
  registerProbe, setProbeConfig, runProbes,
  getProbeConfigs, getRunResults as getProbeRunResults,
  getProbePassRate, resetProbeConfigs, clearProbeState,
  type ProbeId, type ProbeConfig, type ProbeResult, type ProbeRunResult, type ProbeContext,
} from './diligenceProbes';

// 9. Evolution Telemetry Collector
export {
  emitEvolution, subscribeEvolution, computeMetrics as computeEvolutionMetrics,
  getEvolutionEvents, getEventsByType as getEvolutionEventsByType,
  clearEvolutionTelemetry,
  type EvolutionEventType, type EvolutionTelemetryEvent, type EvolutionMetrics,
} from './evolutionTelemetry';

// 10. Curriculum Advancement Tracker
export {
  recordAttempt, checkAdvancement,
  getProficiency, getAllProficiencies,
  getUnlockedClasses, getLockedClasses, getRiskForClass,
  clearCurriculumState,
  type MutationClass, type ProficiencyTier, type ProficiencyRecord, type AdvancementResult,
} from './curriculumTracker';
