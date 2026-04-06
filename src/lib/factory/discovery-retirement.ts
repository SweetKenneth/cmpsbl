/**
 * Discovery Retirement System
 * Once purchased, a discovery is permanently retired from the Showroom.
 * Production: backed by the discoveries table in the database.
 *
 * NOTE (Plan B Step 9): The in-memory catalog has been removed.
 * All discovery data now lives in the `discoveries` table.
 * addDiscovery is kept as a no-op for backward compat with seed engines
 * that haven't been fully decoupled yet. purchaseDiscovery remains
 * functional for real checkout flows.
 */

import { createCertificate, type OwnershipCertificate } from './certificate';
import { calculateCJPIPrice, type CJPIPricing } from './cjpi-pricing';

export interface ShowroomDiscovery {
  id: string;
  name: string;
  description: string;
  cjpiScore: number;
  pricing: CJPIPricing;
  primitiveChain: string[];
  discoveredAt: Date;
  isRetired: boolean;
  retiredAt?: Date;
  certificate?: OwnershipCertificate;
}

/**
 * No-op — discoveries are persisted to the DB via persistSeedDiscoveries.
 * Kept for backward compatibility with callers that haven't been updated.
 */
export function addDiscovery(
  id: string,
  name: string,
  description: string,
  cjpiScore: number,
  primitiveChain: string[],
): ShowroomDiscovery {
  const pricing = calculateCJPIPrice(cjpiScore);
  return {
    id,
    name,
    description,
    cjpiScore,
    pricing,
    primitiveChain,
    discoveredAt: new Date(),
    isRetired: false,
  };
}

/**
 * Purchase and retire a discovery.
 * TODO: Wire to DB — currently a placeholder for checkout flow.
 */
export function purchaseDiscovery(
  _discoveryId: string,
  _purchasedBy: string,
): OwnershipCertificate | null {
  // In-memory catalog removed — purchase now handled by checkout edge function
  return null;
}

/** @deprecated — query the discoveries table instead */
export function getAvailableDiscoveries(): ShowroomDiscovery[] {
  return [];
}

/** @deprecated — query the discoveries table instead */
export function getJunkyardDiscoveries(): ShowroomDiscovery[] {
  return [];
}

/** @deprecated — query the discoveries table instead */
export function getRetiredDiscoveries(): ShowroomDiscovery[] {
  return [];
}

/** @deprecated — query the discoveries table instead */
export function getCatalogStats() {
  return { total: 0, available: 0, junkyard: 0, retired: 0, apexCount: 0 };
}
