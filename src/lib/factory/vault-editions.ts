/**
 * CMPSBL® Vault Editions (Model 23)
 * 
 * APEX-tier discoveries — perfect 100 CJPI scores.
 * $1,952 each. Serial-numbered. When they're gone, they're gone forever.
 * 
 * The 1952 reference: Grace Hopper's A-0 System — the first compiler.
 */

export interface VaultEdition {
  id: string;
  discoveryId: string;
  title: string;
  description: string;
  cjpiScore: 100;
  serialNumber: string;
  fingerprint: string;
  primitiveChain: string[];
  discoveredAt: string;
  status: 'available' | 'reserved' | 'sold';
  purchasedBy?: string;
  purchasedAt?: string;
  priceCents: number;
}

/** Fixed Apex price — $1,952.00 */
export const APEX_PRICE_CENTS = 195200;

/** Vault edition serial prefix */
const SERIAL_PREFIX = 'APEX';

/**
 * Generate a vault serial number
 * Format: APEX-YYYYMMDD-XXXX
 */
export function generateVaultSerial(discoveryDate: Date, sequence: number): string {
  const y = discoveryDate.getFullYear();
  const m = String(discoveryDate.getMonth() + 1).padStart(2, '0');
  const d = String(discoveryDate.getDate()).padStart(2, '0');
  const seq = String(sequence).padStart(4, '0');
  return `${SERIAL_PREFIX}-${y}${m}${d}-${seq}`;
}

/**
 * Validate that a discovery qualifies for the Vault
 * Only perfect 100 CJPI scores are eligible
 */
export function isVaultEligible(cjpiScore: number): boolean {
  return cjpiScore === 100;
}

/**
 * Format vault edition for display
 */
export function formatVaultEdition(edition: VaultEdition): {
  priceDisplay: string;
  serialDisplay: string;
  statusLabel: string;
  statusAccent: string;
} {
  const statusMap: Record<VaultEdition['status'], { label: string; accent: string }> = {
    available: { label: 'Available', accent: 'text-emerald-400' },
    reserved: { label: 'Reserved', accent: 'text-amber-400' },
    sold: { label: 'Sold — Retired Forever', accent: 'text-muted-foreground' },
  };

  const { label, accent } = statusMap[edition.status];

  return {
    priceDisplay: '$1,952',
    serialDisplay: edition.serialNumber,
    statusLabel: label,
    statusAccent: accent,
  };
}
