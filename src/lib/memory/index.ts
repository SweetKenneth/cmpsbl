/**
 * Persistent Memory — Internal Runtime Library
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
export { computeRPS, computeRPSBatch, DEFAULT_RPS_WEIGHTS, CREDIBILITY_WEIGHTS, type RpsWeights, type SourceCredibility } from './rps';
export { tierFromRPS, computeTierMove, computeTierMovesBatch, shouldHide, DEFAULT_TIER_THRESHOLDS, type MemoryTier, type TierThresholds, type TierMoveReceipt, type TierMoveReason, type TierMoveActor } from './tiering';
// Note: rps.ts MemoryEntry is re-exported as RpsMemoryEntry to avoid collision with client.ts MemoryEntry
export { type MemoryEntry as RpsMemoryEntry } from './rps';

// Contradiction detection
export { detectContradiction, applyContradictionPenalty, type ContradictionResult as LocalContradictionResult } from './contradiction';

// Receipts (DB-backed tier move audit trail)
export { recordReceipt, recordReceipts, getReceipts, getReceiptsForMemory, getReceiptStats, clearReceipts } from './receipts';

// Content deduplication & storage optimization
export { isDuplicate, clearDedupCache, contentHash, semanticFingerprint, normalizeContent, compactMetadata, compressForStorage, classifyImportance, shouldPreserveIndefinitely, type ImportanceLevel } from './content-dedup';

// Smart retention policy
export { runRetentionPolicy, type RetentionStats, type RetentionConfig } from './retention-policy';

// Emotional valence tagging
export { getValenceEngine, resetValenceEngine, type EmotionalValence, type EmotionTag, type ValenceStats } from './emotional-valence';

// Contextual retrieval augmentation
export { getContextualRetrieval, resetContextualRetrieval, type SituationalContext, type SituationMatch } from './contextual-retrieval';

// Memory interference detection
export { getInterferenceDetector, resetInterferenceDetector, type InterferenceEvent, type InterferenceReport, type MitigationSuggestion } from './interference-detection';

// Tiered compression codebook
export { getCompressionCodebook, resetCompressionCodebook, type CompressionResult, type CodebookStats } from './compression-codebook';

// Episodic memory timeline
export { getEpisodicTimeline, resetEpisodicTimeline, type Episode, type EpisodePhase, type EpisodeMemory } from './episodic-timeline';

// Forgetting curve calibration
export { getForgettingCurveEngine, resetForgettingCurve, type DomainCalibration, type CalibrationStats } from './forgetting-curve';

// Memory provenance chain
export { getProvenanceEngine, resetProvenanceEngine, type ProvenanceEvent, type ProvenanceEventType, type ProvenanceChain } from './provenance-chain';

// Cross-tier semantic index
export { getCrossTierIndex, resetCrossTierIndex, type CrossTierSearchResult, type CrossTierStats } from './cross-tier-index';

// Retrieval-induced strengthening
export { getRetrievalEngine, resetRetrievalEngine, type RetrievalEvent, type StrengthAdjustment, type RetrievalStats } from './retrieval-strengthening';

// Memory budget forecasting
export { getBudgetForecaster, resetBudgetForecaster, type TierCapacity, type BudgetForecast, type BudgetRecommendation } from './budget-forecasting';
