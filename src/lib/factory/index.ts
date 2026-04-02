/**
 * Factory Module Index — Unified exports for the factory economy
 */

// Scan Team
export {
  runScanTeam,
  getPrimitiveCatalog,
  type ScanFinding,
  type ScanResult,
  type PrimitiveRecommendation,
} from './scan-team';

// Restoration Queue
export {
  MEMBERSHIP_TIERS,
  addToQueue,
  getQueuePosition,
  estimateWaitTime,
  getQueueStats,
  formatPrice,
  type MembershipTier,
  type QueueEntry,
  type TierConfig,
} from './restoration-queue';

// Restoration Documentation
export {
  generateRestorationReport,
  type RestorationReport,
  type PipelineStep,
  type CapabilityEntry,
  type VulnerabilityEntry,
  type ErrorCodeEntry,
  type TestingGuideEntry,
  type CJPICertificate,
  type PrimitiveManifestEntry,
} from './restoration-docs';

// CJPI Pricing
export {
  calculateCJPIPrice,
  getTierForScore,
  getTierPriceRange,
  CJPI_TIERS,
  type CJPIPricing,
  type CJPITier,
} from './cjpi-pricing';

// Certificate System
export {
  createCertificate,
  verifyCertificate,
  type OwnershipCertificate,
} from './certificate';

// Discovery Retirement
export {
  addDiscovery,
  purchaseDiscovery,
  getAvailableDiscoveries,
  getJunkyardDiscoveries,
  getRetiredDiscoveries,
  getCatalogStats,
  type ShowroomDiscovery,
} from './discovery-retirement';
