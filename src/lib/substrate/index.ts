/**
 * Substrate Core Exports
 * v6.1.0 — Unified Cognitive Architecture
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

// Re-export substrate client from lib
export { substrate, type SubstrateModule, type SubstrateRequest, type SubstrateResponse } from '../substrate';
