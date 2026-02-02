/**
 * Capabilities Depot — Main Export
 * Downloadable, licensed capability artifacts (no support, no hosting)
 * v1.3.0 — 86+ Capabilities with Full Stripe Checkout
 */

// === Types ===
export type {
  CapabilityArtifact,
  CapabilityCategory,
  ExecutorType,
  ArtifactFormat,
  GovernanceLevel,
  PricingTier,
  CapabilityLicense,
  CapabilityWithHistory,
  VersionHistoryEntry,
  DownloadRequest,
  DownloadResponse,
  CapabilityManifest,
  ValidationResult,
  CapabilityFilters,
} from './types';

// === Registry ===
export {
  CAPABILITY_REGISTRY,
  getAllCapabilities,
  getCapabilityById,
  getCapabilityBySlug,
  getCapabilitiesByCategory,
  filterCapabilities,
  getCategoryStats,
  getTotalCapabilityCount,
} from './registry';

// === Pricing ===
export {
  PRICING_TIERS,
  formatPrice,
  getTierFromPrice,
  getTierConfig,
  getPriceRangeDisplay,
  TIER_VALUE_PROPS,
  CAPABILITY_PRICE_IDS,
} from './pricing';

// === Licensing ===
export {
  validateLicense,
  processDownloadRequest,
  compareVersions,
  isUpdateAvailable,
  formatLicenseStatus,
  generateDisplayKey,
} from './license';

// === Packaging ===
export {
  ARTIFACT_STRUCTURE,
  validateManifest,
  validateChecksum,
  generateChecksum,
  validateArtifactStructure,
  createManifestTemplate,
} from './package';

// === Stripe ===
export {
  CAPABILITY_STRIPE_CONFIG,
  SYNERGY_STRIPE_CONFIG,
  getAllStripeConfigs,
  getStripeConfig,
  hasStripeConfig,
  type CapabilityStripeConfig,
} from './stripe-config';

export {
  EXPANSION_STRIPE_CONFIG,
  getExpansionStripeConfig,
  hasExpansionStripeConfig,
} from './stripe-expansion';

export {
  ULTRA_STRIPE_CONFIG,
  getUltraStripeConfig,
  hasUltraStripeConfig,
} from './stripe-ultra';

// === Constants ===
export const DEPOT_VERSION = '1.3.0';
export const DEPOT_NAME = 'Capabilities Depot';

// === Legal Disclaimer ===
export const LEGAL_DISCLAIMER = `
CAPABILITIES DEPOT — TERMS OF USE

All capabilities available through the Capabilities Depot are provided as downloadable 
artifacts only. By purchasing and downloading any capability, you acknowledge and agree:

1. LICENSED ARTIFACTS: A valid license is required to download capabilities. Licenses 
   are validated at download time.

2. LOCAL EXECUTION: All capabilities are designed for local execution within your own 
   infrastructure. No data is processed or stored by us.

3. SELF-HOSTED: Capabilities are not hosted, executed, or managed by us. All execution 
   responsibility lies with the licensee.

4. DIGITAL DOWNLOADS: Due to the nature of digital downloads, all sales are final.

5. SUPPORT AVAILABLE: For technical questions or integration help, visit our Support page.

For questions, contact: PromptFluid@gmail.com
`;
