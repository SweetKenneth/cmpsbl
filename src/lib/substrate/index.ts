/**
 * Substrate Core Exports
 * v6.2.0 — Unified Cognitive Architecture (Phase 2: Intelligence Compression)
 */

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

// Re-export substrate client from lib
export { substrate, type SubstrateModule, type SubstrateRequest, type SubstrateResponse } from '../substrate';
