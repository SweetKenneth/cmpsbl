/**
 * Defense Module Exports
 * v7.0.0 — Security, Rate Limiting, and Circuit Breakers
 */

// Core threat detection and risk analysis
export {
  analyzeRequest,
  logDefenseEvent,
  getDefenseStats,
  getRecentEvents,
  getDefenseRules,
  type DefenseEvent,
  type RiskAnalysis,
} from './core';

// Rate limiting
export {
  checkRateLimit,
  getConsolidatedLimits,
  calculateAdaptiveThreshold,
  recordRequest,
  getRateLimitAnalytics,
  type RateLimitConfig,
  type RateLimitStatus,
  type AdaptiveThreshold,
} from './rateLimiting';

// Circuit breakers
export {
  circuitBreaker,
  type CircuitState,
  type CircuitConfig,
  type CircuitStatus,
  type CircuitBreakersState,
} from './circuit-breaker';

// Learning from threats
export {
  generateLearningSummary,
  syncWithBrain,
  type LearningInsights,
} from './learning';
