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

// Licensing Engine (Model 17)
export {
  calculateRoyaltySplit,
  validateSubmission,
  summarizeEarnings,
  isPayoutEligible,
  MIN_PAYOUT_THRESHOLD_CENTS,
  type LicensingSubmission,
  type RoyaltyRecord,
  type DeveloperEarnings,
} from './licensing-engine';

// Bounty Board (Model 16)
export {
  calculateBountyFees,
  validateBounty,
  scoreCandidateMatch,
  routeRejectedCandidate,
  getPriorityMultiplier,
  MIN_BOUNTY_CENTS,
  MAX_BOUNTY_DAYS,
  type Bounty,
  type BountyCandidate,
  type BountyStatus,
  type BountyPriority,
} from './bounty-board';

// Campaign Tracking
export {
  parseChannelFromUTM,
  getChannelLabel,
  getChannelBudget,
  calculateCPA,
  isCampaignSuccessful,
  TOTAL_CAMPAIGN_BUDGET_CENTS,
  type CampaignChannel,
  type CampaignEvent,
  type ChannelMetrics,
} from './campaign-tracking';

// Vault Editions (Model 23)
export {
  APEX_PRICE_CENTS,
  generateVaultSerial,
  isVaultEligible,
  formatVaultEdition,
  type VaultEdition,
} from './vault-editions';

// The Foundry (Model 24)
export {
  CYCLE_INTERVAL_MS,
  routeDiscovery,
  getNextCycleTime,
  getTimeUntilNextCycle,
  summarizeFoundry,
  type FoundryCycle,
  type FoundryCycleStatus,
  type FoundryStats,
} from './foundry-engine';

// Collision Engine (Model 4)
export {
  validateCollisionInputs,
  calculateCollisionStrength,
  type CollisionInput,
  type CollisionResult,
  type EmergentCapability,
} from './collision-engine';

// Marketplace (Model 9)
export {
  calculateMarketplaceFees,
  validateListing,
  type MarketplaceListing,
  type ListingStatus,
} from './marketplace';

// Incubator (Model 18)
export {
  INCUBATOR_SLA_MS,
  getTotalEstimatedHours,
  getEstimatedDelivery,
  getOverallProgress,
  isWithinSLA,
  type IncubatorProject,
  type IncubatorPhase,
} from './incubator';

// Auction House (Model 12)
export {
  getMinNextBid,
  validateBid,
  resolveAuction,
  isRareAuction,
  MIN_RESERVE_CENTS,
  AUCTION_DURATIONS,
  type Auction,
  type AuctionStatus,
  type Bid,
} from './auction-house';

// Specialty Substrates
export {
  getDomainConfig,
  getAllDomains,
  type SpecialtyDomain,
  type SpecialtySubstrate,
} from './specialty-substrates';

// Node Engine
export {
  validateCreationRequest,
  validateMergeRequest,
  type NodeCreationRequest,
  type NodeMergeRequest,
  type GeneratedNode,
} from './node-engine';

// Time Capsule (Model 6)
export {
  hasAppreciated,
  getAppreciationRate,
  getPendingEnhancements,
  getNotificationMessage,
  type TimeCapsule,
  type CapsuleEnhancement,
  type CapsuleNotification,
  type CapsuleNotificationType,
} from './time-capsule';
