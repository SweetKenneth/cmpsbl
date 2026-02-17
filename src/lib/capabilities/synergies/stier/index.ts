/**
 * S-Tier Synergy Pipelines
 * v10.5.4 ARCHITECT — 32 Premium Cross-Module Pipelines
 * 
 * The highest-value pipelines for enterprise buyers
 * Stripe config now in depot/stripe-stier.ts
 */

export { STIER_SYNERGY_DEFINITIONS } from './definitions';

export {
  // Intelligence × Control
  executeStrategicForesightEngine,
  executeDecisionConfidenceGovernor,
  executeExplainableIntelligenceCompiler,
  
  // Autonomy × Operations
  executeAutonomousOpsSteward,
  executeAutonomyBudgetManager,
  executeAutonomyRollbackAuthority,
  
  // Security × Trust
  executeIntelligenceContainmentEngine,
  executeEmergentThreatAnticipator,
  executeBehavioralTrustScoring,
  
  // Cost × Performance
  executeAutonomousCostArbitrageEngine,
  executeValueWeightedReasoningRouter,
  executeWasteDetectionIntelligence,
  
  // Product × UX
  executeIntentDriftTracker,
  executeAdaptiveProductBrain,
  executeFrictionAutoRemovalEngine,
  
  // Platform × Scale
  executeCrossPipelineArbitrationEngine,
  executeCapabilityImpactForecaster,
  executeSelfScalingIntelligenceFabric,
  
  // Compliance × Legitimacy
  executeRegulatoryModeSwitcher,
  executeAuditGradeDecisionLedger,
  executePolicyAwareIntelligenceGate,
  
  // Meta / Crown-Class
  executeIntelligenceGovernanceKernel,
  
  // Registration
  registerSTierExecutors,
} from './executors';

// Re-export Stripe config from depot
export {
  STIER_STRIPE_CONFIG,
  getSTierStripeConfig,
  hasSTierStripeConfig,
  getAllSTierStripeConfigs,
  isSelfImprovementCapability,
} from '../../depot/stripe-stier';
