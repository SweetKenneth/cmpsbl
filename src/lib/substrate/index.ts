/**
 * Substrate Core Exports
 * v6.5.0 — Unified Cognitive Architecture (Phase 4B: Telemetry + State)
 */

// Engine Bus - Canonical Routing Layer (v6.4.0)
export {
  engineBus,
  EngineBusClient,
  type EngineName,
  type DispatchOptions,
  type DispatchResult,
  type DispatchStage,
  type DispatchErrorCode,
  type ChainContext,
  type BusState,
  type ExecutionEvent,
} from './engine-bus';

// Telemetry Engine - Canonical Observability Layer (v6.5.0)
export {
  telemetryEngine,
  TelemetryEngineClient,
  type TelemetryEventType,
  type TelemetrySeverity,
  type TelemetryEvent,
  type TelemetryState,
  type TelemetryQuery,
} from './telemetry-engine';

// State Engine - Canonical State Contract Layer (v6.5.0)
export {
  stateEngine,
  StateEngineClient,
  type StateSchemaName,
  type StateField,
  type StateSchema,
  type StateValidationResult,
  type StateEngineState,
} from './state-engine';

// Evolution Cycle - Unified Modernizer Engine (v6.5.0)
export {
  evolutionCycle,
  EvolutionCycleClient,
  type EvolutionPhase,
  type EvolutionPlan,
  type EvolutionState,
  type EvolutionCycleResult,
  type ScanResult,
  type ProposalItem,
  type VerificationResult,
  type GovernanceSignal,
} from './evolution-cycle';

// Memory Core - Unified Memory Lifecycle
export { 
  memoryCore, 
  MemoryCoreClient,
  type MemoryEntry,
  type MemoryQuery,
  type MemoryTier,
  type MemoryState,
  type MemoryType,
  type MemoryStateSchema,
  type LifecycleStage,
  type LifecycleResult,
} from './memory-core';

// Learning Engine - Unified Learning Lifecycle (train + optimize + reinforce)
export {
  learningEngine,
  LearningEngineClient,
  type LearningStage,
  type LearningState,
  type LearningInput,
  type FeedbackSignal,
  type LearningResult,
} from './learning-engine';

// Imagination Engine - Unified Imagination Lifecycle (dream + synthesize + pattern_fusion)
export {
  imaginationEngine,
  ImaginationEngineClient,
  type ImaginationStage,
  type ImaginationState,
  type LatentContent,
  type SynthesisOutput,
  type ImaginationResult,
} from './imagination-engine';

// Reasoning Engine - Unified Higher-Order Reasoning (causal + systems_reason + hypothesis_test)
export {
  reasoningEngine,
  ReasoningEngineClient,
  type ReasoningStage,
  type ReasoningState,
  type ReasoningInput,
  type ReasoningResult,
  type CausalLink,
  type Hypothesis,
} from './reasoning-engine';

// Governance Guard - Unified Ethical & Coherence Constraints (ethical + coherence_check)
export {
  governanceGuard,
  GovernanceGuardClient,
  type GovernanceStage,
  type GovernanceState,
  type GovernanceInput,
  type GovernanceResult,
  type GovernanceSignal as GovernanceGuardSignal,
  type CoherenceResult,
  type EthicalResult,
} from './governance-guard';

// Re-export substrate client from lib
export { substrate, type SubstrateModule, type SubstrateRequest, type SubstrateResponse } from '../substrate';
