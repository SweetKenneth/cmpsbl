/**
 * CMPSBL® Specialty Substrates
 * 
 * Curated substrate configurations for specific verticals.
 * Built from patterns learned through Ascension interactions.
 */

export type SpecialtyDomain = 'fintech' | 'healthcare' | 'legal' | 'security' | 'gaming' | 'education';

export interface SpecialtySubstrate {
  id: string;
  domain: SpecialtyDomain;
  name: string;
  description: string;
  primitiveSet: string[];
  discoveryCount: number;
  avgCjpiScore: number;
  createdAt: string;
  status: 'curating' | 'available' | 'beta';
}

const DOMAIN_CONFIG: Record<SpecialtyDomain, { label: string; description: string }> = {
  fintech: { label: 'Financial Services', description: 'Compliance, fraud detection, transaction governance' },
  healthcare: { label: 'Healthcare & Life Sciences', description: 'HIPAA compliance, patient data sovereignty, clinical workflows' },
  legal: { label: 'Legal & Regulatory', description: 'Contract analysis, jurisdiction mapping, regulatory compliance' },
  security: { label: 'Cybersecurity', description: 'Threat detection, zero-trust architecture, incident response' },
  gaming: { label: 'Gaming & Interactive', description: 'Real-time state management, anti-cheat governance, player data' },
  education: { label: 'Education & Research', description: 'Learning path optimization, research integrity, data ethics' },
};

/**
 * Get display configuration for a specialty domain
 */
export function getDomainConfig(domain: SpecialtyDomain): { label: string; description: string } {
  return DOMAIN_CONFIG[domain];
}

/**
 * Get all available specialty domains
 */
export function getAllDomains(): SpecialtyDomain[] {
  return Object.keys(DOMAIN_CONFIG) as SpecialtyDomain[];
}
