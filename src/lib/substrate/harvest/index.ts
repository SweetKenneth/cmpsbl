/**
 * HARVEST — Barrel Export
 * Re-exports core module + CLM + Hardening + Discovery Primitives
 */
export * from '../harvest-module';
export { runHarvestCLM, type HarvestCLMDiagnostic, type HarvestCLMReport } from './clm';
export {
  HARVEST_LIMITS,
  validateSourceInput,
  validatePipelineInput,
  type HarvestValidationResult,
} from './hardening';
export {
  // Adaptive Source Discovery
  rankSources,
  filterStaleSources,
  topNSources,
  type DiscoverableSource,
  type SourceRanking,
  // Freshness Arbitrage
  FreshnessArbitrageEngine,
  type FreshnessTarget,
  // Provenance Chain
  ProvenanceChainVerifier,
  type ProvenanceStep,
  // Data Harvest Orchestrator
  DataHarvestOrchestrator,
  // Cross-Lingual Intelligence
  detectLanguage,
  type LanguageDetection,
  // Recursive Capability Discoverer
  RecursiveCapabilityDiscoverer,
  type DiscoveredCapability,
  type DiscoveryCycle,
  // Facade accessors
  getHarvestOrchestrator,
  getFreshnessEngine,
  getProvenanceVerifier,
  getCapabilityDiscoverer,
  getHarvestDiscoveryReport,
  type HarvestDiscoveryReport,
} from './discovery';
