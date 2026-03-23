/**
 * SOVEREIGN Ultimate v9.0.0 — "Crown Prime"
 * 
 * Unified export for all 10 ultimate sovereignty systems.
 * Data sovereignty, jurisdictional compliance, and regulatory intelligence.
 */

// 1. Jurisdictional Intelligence Engine
export {
  registerJurisdictionNode,
  getJurisdictionNode,
  getJurisdictionChildren,
  getJurisdictionAncestors,
  detectJurisdictionConflict,
  resolveConflict,
  assessAdequacy,
  getAllJurisdictions,
  getUnresolvedConflicts,
  getAdequacyAssessment,
  getJurisdictionIntelligenceHealth,
  type JurisdictionNode,
  type JurisdictionConflict,
  type AdequacyAssessment,
} from './jurisdictionalIntelligence';

// 2. Cross-Border Transfer Arbiter
export {
  assessTransfer,
  getTransferLog,
  getBlockedTransfers,
  getSCCTemplates,
  getTransferHealth,
  type TransferChannel,
  type TransferRequest,
  type TransferImpactAssessment,
  type SCCTemplate,
} from './crossBorderArbiter';

// 3. Consent Lifecycle Manager
export {
  requestConsent,
  transitionConsent,
  withdrawConsentCascade,
  expireStaleConsents,
  getConsentEntry,
  getConsentsBySubject,
  getActiveConsents,
  getConsentReceiptChain,
  getConsentHealth,
  type ConsentState,
  type ConsentEntry,
  type ConsentReceipt,
} from './consentLifecycleManager';

// 4. Data Classification Automator
export {
  autoClassify,
  addClassificationPattern,
  getClassificationLog,
  getPatterns,
  getClassificationHealth,
  type ClassificationLevel,
  type ClassificationResult,
  type ClassificationPattern,
} from './dataClassificationAutomator';

// 5. Retention Policy Engine
export {
  addRetentionRule,
  applyLegalHold,
  releaseLegalHold,
  processExpiredRules,
  getRetentionRules,
  getActiveRetentionRules,
  getLegalHolds,
  getRetentionConflicts,
  getFrameworkMinimums,
  getRetentionHealth,
  type RetentionStatus,
  type RetentionRule,
  type RetentionConflict,
} from './retentionPolicyEngine';

// 6. Privacy Impact Assessment Engine
export {
  registerProcessingActivity,
  assessPrivacyImpact,
  applyMitigation,
  getProcessingActivities,
  getAssessments as getPIAAssessments,
  getHighRiskAssessments,
  getPIAHealth,
  type PIARiskLevel,
  type ProcessingActivity,
  type PrivacyImpactAssessment,
  type PIAMitigation,
} from './privacyImpactEngine';

// 7. Breach Response Orchestrator
export {
  reportBreach,
  advanceBreachPhase,
  completeRemediationStep,
  getIncidents,
  getOpenIncidents,
  getApproachingDeadlines,
  getBreachHealth,
  type BreachSeverity,
  type BreachPhase,
  type BreachIncident,
} from './breachResponseOrchestrator';

// 8. Sovereignty Audit Chain
export {
  appendSovereigntyAudit,
  verifyChainIntegrity,
  getSovereigntyChain,
  getChainLength,
  getRecentEntries as getRecentAuditEntries,
  getEntriesByType,
  getChainHealth,
  type SovereigntyDecisionType,
  type SovereigntyAuditEntry,
  type ChainVerification,
} from './sovereigntyAuditChain';

// 9. Regulatory Genome Mapper (Enhanced)
export {
  satisfyRequirement,
  runGapAnalysis,
  getFrameworkGenomes,
  getFrameworkGenome,
  getCrossFrameworkOverlaps,
  getGenomeHealth,
  type FrameworkGenome,
  type FrameworkRequirement,
  type GapAnalysisResult,
  type CrossFrameworkOverlap,
} from './regulatoryGenomeMapper';

// 10. Sovereignty Telemetry Nexus
export {
  computeSovereigntyHealth,
  getSovereigntyHealthHistory,
  getLatestSovereigntyHealth,
  type SovereigntyHealthReport,
  type SovereigntyAlert,
} from './sovereigntyTelemetryNexus';
