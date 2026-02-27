/**
 * @cmpsbl/memory - Persistent Memory SDK
 * 
 * Add persistent memory to any agent or React app in under an hour.
 * Now with: Vector search, spaced repetition, contradiction detection,
 * causal graphs, user fingerprinting, RAG pipeline, and audit provenance.
 */

export { withPersistentMemory, type MemoryConfig, type MemoryContext } from './withPersistentMemory';
export { usePersistentAgent, type PersistentAgentResult } from './usePersistentAgent';
export { MemoryClient, type RecallResult, type MemoryEntry, type MemoryMetaState, type ContradictionResult, type MemoryProvenance, type UserFingerprint } from './client';
