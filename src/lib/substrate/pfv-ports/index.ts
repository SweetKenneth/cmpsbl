/**
 * PFV Ports — Index
 * 10 high-value features ported from PromptFluid-Vision
 */

// 1. Context Classifier → DECODE, MEMORY, BRAIN
export { classifyContext, extractGoalRef, extractCausalLinks as classifierCausalLinks } from './context-classifier';
export type { ContextType, ClassificationResult } from './context-classifier';

// 2. Memory Compression with Code Preservation → MEMORY, DREAM
export { compressMemories, findDuplicateMemories, mergeDuplicates } from './memory-compression';
export type { CompressionResult } from './memory-compression';

// 3. Causal Link Extraction & Reasoning → BRAIN, ORACLE, GOVERNANCE
export { extractCausalLinks, buildCausalChain, getDownstreamEffects, detectCircularDependencies, scoreImpact } from './causal-reasoning';
export type { CausalChain } from './causal-reasoning';

// 4. Adaptive Quota Manager → NEXUS, ECONOMY
export { getQuotaFromHeaders, dynamicThrottle, categorizeCall, enforceDailyBudget, getQuotaStatusForCategory, shouldUseFallback, getFallbackProvider } from './adaptive-quota-manager';
export type { QueryCategory, QuotaStatus } from './adaptive-quota-manager';

// 5. Batched Learning Collector → CLM, BRAIN, ANALYTICS
export { BatchedLearningCollector } from './batched-learning-collector';
export type { LearningEvent } from './batched-learning-collector';

// 6. Learning Pattern Analyzer → CLM, BRAIN, EVOLUTION
export { LearningPatternAnalyzer } from './learning-pattern-analyzer';
export type { LearningPattern } from './learning-pattern-analyzer';

// 7. Defense Learning Feedback Loop → DEFENSE, IMMUNITY
export { generateDefenseLearningSummary, syncDefenseWithBrain } from './defense-learning-loop';
export type { DefenseLearningInsights } from './defense-learning-loop';

// 8. Research Spine → CLM, ORACLE, BRAIN
export { submitResearchQuery, executeResearch, getPendingQueries, getHighConfidenceInsights, routeInsightsToModules, getResearchStats } from './research-spine';
export type { ResearchQuery, ResearchInsight } from './research-spine';

// 9. Cost-Aware Model Selector → NEXUS, ECONOMY
export { getCheapestModel, calculateCost, assessComplexity, shouldBatchTasks, logModelFeedback, getModelStats, MODEL_COSTS } from './cost-aware-model-selector';
export type { ModelCost } from './cost-aware-model-selector';

// 10. Realtime Telemetry → VISION, NERVE
export { useRealtimeTelemetry } from './realtime-telemetry';
export type { TelemetryLog, TelemetryStatus } from './realtime-telemetry';
