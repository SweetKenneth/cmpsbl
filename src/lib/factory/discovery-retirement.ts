/**
 * Discovery Retirement System
 * Once purchased, a discovery is permanently retired from the Showroom.
 * In-memory for now; production: backed by Supabase.
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

/** In-memory catalog (production: DB-backed) */
const catalog = new Map<string, ShowroomDiscovery>();

/**
 * Add a discovery to the Showroom.
 */
export function addDiscovery(
  id: string,
  name: string,
  description: string,
  cjpiScore: number,
  primitiveChain: string[],
): ShowroomDiscovery {
  const pricing = calculateCJPIPrice(cjpiScore);
  const discovery: ShowroomDiscovery = {
    id,
    name,
    description,
    cjpiScore,
    pricing,
    primitiveChain,
    discoveredAt: new Date(),
    isRetired: false,
  };
  catalog.set(id, discovery);
  return discovery;
}

/**
 * Purchase and retire a discovery.
 * Returns the ownership certificate.
 */
export function purchaseDiscovery(
  discoveryId: string,
  purchasedBy: string,
): OwnershipCertificate | null {
  const discovery = catalog.get(discoveryId);
  if (!discovery || discovery.isRetired) return null;

  // Create certificate
  const cert = createCertificate(
    discovery.id,
    discovery.name,
    purchasedBy,
    discovery.cjpiScore,
    discovery.pricing.tier,
    discovery.primitiveChain,
  );

  // Permanently retire
  discovery.isRetired = true;
  discovery.retiredAt = new Date();
  discovery.certificate = cert;

  return cert;
}

/**
 * Get all available (non-retired) Showroom discoveries.
 */
export function getAvailableDiscoveries(): ShowroomDiscovery[] {
  return Array.from(catalog.values()).filter(d => !d.isRetired && !d.pricing.isFree);
}

/**
 * Get all Junkyard discoveries (Raw tier, free).
 */
export function getJunkyardDiscoveries(): ShowroomDiscovery[] {
  return Array.from(catalog.values()).filter(d => d.pricing.isFree);
}

/**
 * Get all retired discoveries (purchased).
 */
export function getRetiredDiscoveries(): ShowroomDiscovery[] {
  return Array.from(catalog.values()).filter(d => d.isRetired);
}

/**
 * Get catalog stats.
 */
export function getCatalogStats() {
  const all = Array.from(catalog.values());
  return {
    total: all.length,
    available: all.filter(d => !d.isRetired && !d.pricing.isFree).length,
    junkyard: all.filter(d => d.pricing.isFree).length,
    retired: all.filter(d => d.isRetired).length,
    apexCount: all.filter(d => d.pricing.isApex && !d.isRetired).length,
  };
}
