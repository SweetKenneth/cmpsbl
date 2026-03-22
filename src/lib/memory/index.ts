/**
 * @cmpsbl/memory - Persistent Memory SDK
 * 
 * Add persistent memory to any agent or React app.
 * Full cognitive stack: Vector search, spaced repetition, contradiction detection,
 * causal graphs, user fingerprinting, RAG pipeline, and audit provenance.
 */

// FIX #6: Export ALL memory modules — previously missing contradiction, receipts, rps, tiering

export { withPersistentMemory, type MemoryConfig, type MemoryContext } from './withPersistentMemory';
export { usePersistentAgent, type PersistentAgentResult } from './usePersistentAgent';
export { MemoryClient, type RecallResult, type MemoryEntry, type MemoryMetaState, type ContradictionResult, type MemoryProvenance, type UserFingerprint } from './client';
export { LocalTierCache, getNodeCache, getAllNodeCacheStats, maintainAllCaches, type LocalCacheEntry, type LocalTierCacheConfig, type CacheStats } from './local-tier-cache';


// Tiering & RPS
export { computeRPS, DEFAULT_RPS_WEIGHTS, CREDIBILITY_WEIGHTS, type RpsWeights, type SourceCredibility } from './rps';
export { tierFromRPS, computeTierMove, shouldHide, DEFAULT_TIER_THRESHOLDS, type MemoryTier, type TierThresholds, type TierMoveReceipt, type TierMoveReason, type TierMoveActor } from './tiering';
// Note: rps.ts MemoryEntry is re-exported as RpsMemoryEntry to avoid collision with client.ts MemoryEntry
export { type MemoryEntry as RpsMemoryEntry } from './rps';

// Contradiction detection
export { detectContradiction, applyContradictionPenalty, type ContradictionResult as LocalContradictionResult } from './contradiction';

// Receipts (DB-backed tier move audit trail)
export { recordReceipt, recordReceipts, getReceipts, getReceiptsForMemory, getReceiptStats, clearReceipts } from './receipts';
