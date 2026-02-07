/**
 * Capabilities Depot — Pricing Normalization
 * Unified pricing rules for public marketplace
 * v1.0.0
 * 
 * RULES:
 * - Price floor: $19
 * - Price ceiling: $299
 * - Off-menu items: Recursive, Autonomous, Self-Improving, etc.
 */

// === Off-Menu Keywords ===
// ONLY capabilities that involve recursive code compilation / self-modifying code
// These are the "Crown Jewels" — software that writes its own code
export const OFF_MENU_KEYWORDS = [
  // Recursive self-improvement (code that generates/modifies/compiles itself)
  'recursive-self-optimization-core',
  'recursive-architecture-refactorer',
  'recursive-cognitive-bootstrapping',

  // S-tier self-improvement (still off-menu)
  'stier-intelligence-governance-kernel',
  'stier-self-scaling-intelligence-fabric',

  // Generic self-modifying signals
  'self-compiling',
  'self-modifying-code',
] as const;

// === Price Configuration ===
export const PRICE_CONFIG = {
  currency: 'USD',
  min: 19,
  max: 299,
  billing: 'one_time',
} as const;

// === Normalized Price Tiers ===
export const NORMALIZED_PRICE_TIERS = [19, 49, 99, 149, 199, 299] as const;
export type NormalizedPrice = typeof NORMALIZED_PRICE_TIERS[number];

/**
 * Normalize price to standardized tier
 * Based on PATCH pricing-stripe-unification-v1 rules
 */
export function normalizePrice(price: number): NormalizedPrice {
  if (price <= 19) return 19;
  if (price <= 79) return 19;
  if (price <= 149) return 49;
  if (price <= 249) return 99;
  if (price <= 399) return 149;
  if (price <= 699) return 199;
  return 299;
}

/**
 * Check if capability name contains off-menu keywords
 */
export function isOffMenuCapability(nameOrId: string): boolean {
  const lowerName = nameOrId.toLowerCase();
  return OFF_MENU_KEYWORDS.some(keyword => lowerName.includes(keyword));
}

/**
 * Get pricing label for display
 */
export function getPricingLabel(price: number | null, isOffMenu: boolean): string {
  if (isOffMenu || price === null) {
    return 'Licensed on request';
  }
  return `$${price}`;
}

/**
 * Check if checkout is enabled for capability
 * Items priced over $299 in Stripe are off-menu
 */
export function isCheckoutEnabled(capabilityId: string, price: number | null, isConfigOffMenu?: boolean): boolean {
  if (price === null) return false;
  if (isOffMenuCapability(capabilityId)) return false;
  if (isConfigOffMenu) return false;
  // Items priced over $299 must be purchased via license request
  if (price > PRICE_CONFIG.max) return false;
  return price >= PRICE_CONFIG.min;
}

/**
 * Normalized pricing config for a capability
 */
export interface NormalizedPricingInfo {
  price: number | null;
  normalizedPrice: NormalizedPrice | null;
  checkoutEnabled: boolean;
  pricingLabel: string;
  isOffMenu: boolean;
  isBounded: boolean;
}

/**
 * Get normalized pricing info for capability
 */
export function getNormalizedPricingInfo(
  capabilityId: string, 
  originalPrice: number
): NormalizedPricingInfo {
  const isOffMenu = isOffMenuCapability(capabilityId);
  
  if (isOffMenu) {
    return {
      price: null,
      normalizedPrice: null,
      checkoutEnabled: false,
      pricingLabel: 'Licensed on request',
      isOffMenu: true,
      isBounded: false,
    };
  }

  const normalizedPrice = normalizePrice(originalPrice);
  
  return {
    price: normalizedPrice,
    normalizedPrice,
    checkoutEnabled: true,
    pricingLabel: `$${normalizedPrice}`,
    isOffMenu: false,
    isBounded: true,
  };
}

// === Store Footer Copy ===
export const STORE_FOOTER_TEXT = `
Public artifacts are priced for individual builders and small teams.
All items are bounded, reversible, and locally executed.
Enterprise, autonomous, and system-wide capabilities are licensed separately.
`.trim();

// === License Request Email ===
export const LICENSE_REQUEST_EMAIL = 'Dev@CMPSBL.com';

/**
 * Get license request subject line
 */
export function getLicenseRequestSubject(capabilityName: string): string {
  return `License Inquiry: ${capabilityName}`;
}

/**
 * Get license request mailto link
 */
export function getLicenseRequestMailto(capabilityId: string, capabilityName: string): string {
  const subject = encodeURIComponent(getLicenseRequestSubject(capabilityName));
  const body = encodeURIComponent(
    `I'm interested in licensing the following capability:\n\n` +
    `Capability: ${capabilityName}\n` +
    `ID: ${capabilityId}\n\n` +
    `Please provide information about enterprise licensing options.`
  );
  return `mailto:${LICENSE_REQUEST_EMAIL}?subject=${subject}&body=${body}`;
}
