/**
 * Capabilities Depot — Main Export
 * Downloadable, licensed capability artifacts (no support, no hosting)
 * v1.1.0 — With Stripe Integration
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

// === Constants ===
export const DEPOT_VERSION = '1.1.0';
export const DEPOT_NAME = 'Capabilities Depot';

// === Legal Disclaimer ===
export const LEGAL_DISCLAIMER = `
CAPABILITIES DEPOT — TERMS OF USE

All capabilities available through the Capabilities Depot are provided as downloadable 
artifacts only. By purchasing and downloading any capability, you acknowledge and agree:

1. NO SUPPORT: Capabilities are sold AS-IS with no technical support, maintenance, or 
   bug fixes guaranteed. The "UNSUPPORTED" designation applies to all items.

2. NO WARRANTY: There is no warranty of any kind, express or implied, including but 
   not limited to warranties of merchantability or fitness for a particular purpose.

3. NO HOSTING: Capabilities are not hosted, executed, or managed by the seller. All 
   execution responsibility lies with the licensee.

4. NO UPTIME GUARANTEE: There are no SLAs, uptime commitments, or availability 
   guarantees associated with any capability.

5. LOCAL EXECUTION ONLY: All capabilities are designed for local execution within 
   your own infrastructure. No data is processed or stored by the seller.

6. LICENSE REQUIRED: A valid license is required to download capabilities. Licenses 
   are validated at download time only.

7. NO REFUNDS: Due to the nature of digital downloads, all sales are final.

For questions, contact: PromptFluid@gmail.com
`;
