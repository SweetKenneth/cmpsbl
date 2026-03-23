/**
 * NEXUS Module — Fleet Intelligence & AI Routing Engine
 * Ultimate Form v9.0.0 "Fleet Admiral"
 *
 * 10 Engines:
 *  1. Provider Health Ranker
 *  2. Adaptive Retry Engine
 *  3. Cost Ledger & Budget Controller
 *  4. Request Deduplication Layer
 *  5. Streaming Pipeline Hardening
 *  6. Multi-Model Consensus Engine
 *  7. Provider Capability Matrix
 *  8. Trace Correlation Engine
 *  9. Quota & Rate Limit Synchronizer
 * 10. Fleet Intelligence Dashboard Feed
 */

export const NEXUS_VERSION = '9.0.0';
export const NEXUS_CODENAME = 'Fleet Admiral';

export { recordProviderCall, getProviderHealth, rankProviders, getFleetHealth, resetProviderMetrics, type ProviderHealthMetrics } from './providerHealthRanker';
export { retryWithBackoff, getRetryBudgetRemaining, type RetryConfig, type RetryResult } from './adaptiveRetryEngine';
export { configureBudget, recordCost, getBudgetStatus, getCostBreakdown, clearLedger, type CostEntry, type BudgetStatus, type BudgetConfig } from './costLedger';
export { generateContentHash, deduplicatedCall, getDedupStats, resetDedupStats, type DedupStats } from './requestDedup';
export { createHardenedStream, type StreamConfig, type StreamChunk, type StreamHandle, type StreamSummary } from './streamingHardening';
export { runConsensus, type ConsensusConfig, type ConsensusResult, type VotingStrategy } from './consensusEngine';
export { getProviderProfile, registerProvider, findProvidersByCapability, findBestProvider, listAllProviders, type ProviderProfile, type ProviderCapability } from './capabilityMatrix';
export { startTrace, addSpan, completeSpan, completeTrace, getTrace, getRecentTraces, getActiveTraceCount, type TraceSpan, type TraceContext } from './traceCorrelation';
export { initProviderQuota, recordUsage, getQuotaStatus, getAvailableProviders, getAllQuotaStatuses, resetQuota, type ProviderQuota, type QuotaStatus } from './quotaSynchronizer';
export { emitFleetEvent, onFleetEvent, getRecentFleetEvents, buildFleetSnapshot, clearFleetBuffer, type FleetTelemetryEvent, type FleetEventType, type FleetSnapshot } from './fleetTelemetry';
