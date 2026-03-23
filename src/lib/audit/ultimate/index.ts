/**
 * AUDIT — v9.0.0 "Sentinel" Ultimate Modules
 * 
 * Tamper Evidence · Compliance Rules · Forensic Search · Actor Profiling
 * Retention Management · Cross-Chain Attestation · Anomaly Detection
 * Governance Reporting · Receipt Correlation · Audit Telemetry
 * 
 * @module audit/ultimate
 * @version 9.0.0
 * @codename Sentinel
 */

// ── Tamper Evidence Analyzer ───────────────────────────────────────────────
export { analyzeForTampering } from './tamperEvidenceAnalyzer';
export type { TamperIndicatorType, TamperIndicator, TamperAnalysis } from './tamperEvidenceAnalyzer';

// ── Compliance Rule Engine ─────────────────────────────────────────────────
export {
  initComplianceRules,
  addRule,
  evaluateCompliance,
  getRules,
  resetRules,
} from './complianceRuleEngine';
export type { RuleOperator, ComplianceRule, ComplianceViolation, ComplianceReport } from './complianceRuleEngine';

// ── Forensic Search ────────────────────────────────────────────────────────
export { forensicSearch } from './forensicSearch';
export type { ForensicSearchQuery, ForensicSearchResult, ForensicSearchResponse } from './forensicSearch';

// ── Actor Behavior Profiler ────────────────────────────────────────────────
export {
  profileActor,
  profileAllActors,
  updateBaseline,
  getBaseline,
  resetProfiles,
} from './actorBehaviorProfiler';
export type { ActorProfile, BehaviorBaseline } from './actorBehaviorProfiler';

// ── Retention & Archival Manager ───────────────────────────────────────────
export {
  setRetentionPolicy,
  getRetentionPolicy,
  ingestReceipt,
  runRetentionCycle,
  queryTier,
  getRetentionStats,
  resetRetention,
} from './retentionArchivalManager';
export type { RetentionTier, RetentionPolicy, TieredReceipt, RetentionStats } from './retentionArchivalManager';

// ── Cross-Chain Attestation Engine ─────────────────────────────────────────
export {
  generateAttestation,
  verifyAttestation,
} from './crossChainAttestationEngine';
export type { Attestation } from './crossChainAttestationEngine';

// ── Anomaly Detection Scanner ──────────────────────────────────────────────
export { scanForAnomalies } from './anomalyDetectionScanner';
export type { AnomalyType, AuditAnomaly, AnomalyScanResult } from './anomalyDetectionScanner';

// ── Governance Report Generator ────────────────────────────────────────────
export {
  generateGovernanceReport,
  getReportHistory,
  resetReports,
} from './governanceReportGenerator';
export type { GovernanceReport } from './governanceReportGenerator';

// ── Receipt Correlation Engine ─────────────────────────────────────────────
export {
  addCorrelationRule,
  correlateReceipts,
  getCorrelationRules,
  resetCorrelationRules,
} from './receiptCorrelationEngine';
export type { CorrelationRule, CorrelatedSequence, CorrelationAnalysis } from './receiptCorrelationEngine';

// ── Audit Telemetry Nexus ──────────────────────────────────────────────────
export {
  emitAuditTelemetry,
  subscribeAuditTelemetry,
  auditTelemetrySnapshot,
  getRecentAuditTelemetry,
  resetAuditTelemetry,
} from './auditTelemetryNexus';
export type { AuditTelemetryEventType, AuditTelemetryEvent, AuditTelemetrySnapshot } from './auditTelemetryNexus';
