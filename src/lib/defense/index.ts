/**
 * DEFENSE Module Exports
 * Security, Rate Limiting, Circuit Breakers, and Secret Redaction
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

// Secret redaction
export {
  redactSecrets,
  redactHeaders,
  redactUrl,
  redactError,
  mightContainSecrets,
} from './redact';

// Learning from threats
export {
  generateLearningSummary,
  syncWithBrain,
  type LearningInsights,
} from './learning';

// Threat intelligence
export * from './threatIntelligence';

// Incident response
export * from './incidentResponse';
 
 // Behavioral analysis
 export * from './behavioralAnalysis';

// Site guard (bot detection)
export * from './site-guard';

// Anomaly detection
export {
  type AnomalySignal,
  type AnomalyDetectorConfig,
  type DetectionResult,
  type AnomalySeverity as SignalSeverity,
  detectRateSpike,
  detectTemporalAnomaly,
  detectBehavioralAnomaly,
  analyzeForAnomalies,
  getActiveSignals,
  updateBaseline,
  updateAnomalyConfig,
  clearSignals,
  getAnomalyStats,
} from './anomalyDetector';

// DEFENSE Hardening v2.0.0 — 25 enterprise upgrades
export * from './defense-hardening';

// DEFENSE Hardening v3.0.0 "Citadel" — 30 breach-prevention upgrades
export * from './defense-hardening-v3';

// DEFENSE Hardening v4.0.0 "Bastion" — 25 T4 anomaly-focused upgrades
export * from './defense-hardening-v4';

// DEFENSE Guardrail Layer — prevents auto-locking and runaway escalation
export * from './guardrail';
