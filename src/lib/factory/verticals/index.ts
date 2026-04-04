/**
 * CMPSBL® Vertical Substrates — Registry
 * 
 * Central registry for all vertical substrate configurations.
 * Each vertical is a full 40-primitive cognitive infrastructure instance
 * with hot-swapped engines and agents optimized for its domain.
 */

export {
  getCyberSecuritySubstrate,
  getCyberSecurityPrimitives,
  getCyberSecurityEngines,
  getCyberSecurityAgents,
  getAllCyberCapabilities,
  getCyberCrownJewels,
  getCyberPrimitiveCrownJewels,
  getCyberCrownJewelSummary,
  getCyberCrownJewelCount,
  getCyberCrownJewelCapabilities,
} from './cybersecurity';

export {
  getRoboticsSubstrate,
  getRoboticsPrimitives,
  getRoboticsEngines,
  getRoboticsAgents,
  getAllRoboticsCapabilities,
  getRoboticsCrownJewels,
  getRoboticsPrimitiveCrownJewels,
  getRoboticsCrownJewelSummary,
  getRoboticsCrownJewelCount,
  getRoboticsCrownJewelCapabilities,
} from './robotics';

export {
  getQuantumSubstrate,
  getQuantumPrimitives,
  getQuantumEngines,
  getQuantumAgents,
  getAllQuantumCapabilities,
  getQuantumCrownJewels,
  getQuantumCrownJewelCount,
  getQuantumCrownJewelCapabilities,
  getQuantumCrownJewelSummary,
} from './quantum';

export {
  getLLMSubstrate,
  getLLMPrimitives,
  getLLMEngines,
  getLLMAgents,
  getAllLLMCapabilities,
  getLLMCrownJewels,
  getLLMPrimitiveCrownJewels,
  getLLMCrownJewelSummary,
  getLLMCrownJewelCount,
  getLLMCrownJewelCapabilities,
} from './llm';

export {
  getAgencySubstrate,
  getAgencyPrimitives,
  getAgencyEngines,
  getAgencyAgents,
  getAllAgencyCapabilities,
  getAgencyCrownJewels,
  getAgencyPrimitiveCrownJewels,
  getAgencyCrownJewelSummary,
  getAgencyCrownJewelCount,
  getAgencyCrownJewelCapabilities,
} from './agency';

export {
  seedQuantumDiscoveries,
  getQuantumSeedResult,
  getQuantumSeedSummary,
  getQuantumVault,
  getQuantumVaultCount,
  getQuantumMemoryStreamPool,
  getQuantumMemoryStreamCount,
  resetQuantumSeed,
  type QuantumDiscovery,
  type QuantumSeedResult,
} from './quantum-seed';

export {
  seedAgencyDiscoveries,
  getAgencySeedResult,
  getAgencySeedSummary,
  getAgencyVault,
  getAgencyVaultCount,
  getAgencyMemoryStreamPool,
  getAgencyMemoryStreamCount,
  resetAgencySeed,
  type AgencyDiscovery,
  type AgencySeedResult,
} from './agency-seed';
export {
  getATierVault,
  getATierByVertical,
  getATierByPrimitive,
  getATierSummary,
  CYBER_ATIER_JEWELS,
  ROBOTICS_ATIER_JEWELS,
  QUANTUM_ATIER_JEWELS,
  LLM_ATIER_JEWELS,
  AGENCY_ATIER_JEWELS,
  type ATierEntry,
} from '../../../crownjewels/a-tier';

export {
  type VerticalPrimitive,
  type VerticalSubstrateConfig,
  type VerticalSubstrateStatus,
  type VerticalCLMConfig,
  type VerticalMemoryConfig,
  type VerticalAscensionConfig,
  type VerticalTheme,
  type PrimitiveRole,
  getSpinePrimitives,
  assembleVerticalPrimitives,
  calculateVerticalHealth,
  validateVerticalConfig,
} from '../vertical-substrate';

import { getCyberSecuritySubstrate } from './cybersecurity';
import { getRoboticsSubstrate } from './robotics';
import { getQuantumSubstrate } from './quantum';
import { getLLMSubstrate } from './llm';
import { getAgencySubstrate } from './agency';
import type { VerticalSubstrateConfig } from '../vertical-substrate';
import type { SpecialtyDomain } from '../specialty-substrates';
import { getDynamicVertical, getDynamicVerticalById, getAllDynamicVerticals, type VerticalPortalEntry } from '../vertical-factory-engine';

/** All registered vertical substrates (static) */
const VERTICAL_REGISTRY = new Map<string, () => VerticalSubstrateConfig>([
  ['cyber-v1', getCyberSecuritySubstrate],
  ['robo-v1', getRoboticsSubstrate],
  ['quantum-v1', getQuantumSubstrate],
  ['llm-v1', getLLMSubstrate],
  ['agency-v1', getAgencySubstrate],
]);

/** Domain to vertical ID mapping (static) */
const DOMAIN_VERTICAL_MAP = new Map<string, string>([
  ['security', 'cyber-v1'],
  ['robotics', 'robo-v1'],
  ['quantum', 'quantum-v1'],
  ['llm', 'llm-v1'],
  ['agency', 'agency-v1'],
]);

/**
 * Get a vertical substrate by its ID (checks static + dynamic)
 */
export function getVerticalSubstrate(verticalId: string): VerticalSubstrateConfig | null {
  const factory = VERTICAL_REGISTRY.get(verticalId);
  if (factory) return factory();
  const dynamic = getDynamicVerticalById(verticalId);
  return dynamic?.config ?? null;
}

/**
 * Get vertical substrate by domain (checks static + dynamic)
 */
export function getVerticalByDomain(domain: SpecialtyDomain): VerticalSubstrateConfig | null {
  const verticalId = DOMAIN_VERTICAL_MAP.get(domain);
  if (verticalId) return getVerticalSubstrate(verticalId);
  // Check dynamic verticals by domain
  const allDynamic = getAllDynamicVerticals();
  const match = allDynamic.find(rv => rv.config.domain === domain);
  return match?.config ?? null;
}

/**
 * Get all registered vertical IDs (static + dynamic)
 */
export function getRegisteredVerticals(): string[] {
  const staticIds = Array.from(VERTICAL_REGISTRY.keys());
  const dynamicIds = getAllDynamicVerticals().map(rv => rv.config.verticalId);
  return [...staticIds, ...dynamicIds];
}

/**
 * Get all vertical substrate configs (for portal page)
 */
export function getAllVerticalConfigs(): VerticalSubstrateConfig[] {
  const staticConfigs = Array.from(VERTICAL_REGISTRY.values()).map(factory => factory());
  const dynamicConfigs = getAllDynamicVerticals().map(rv => rv.config);
  return [...staticConfigs, ...dynamicConfigs];
}

/**
 * Resolve a subdomain to its vertical substrate config (static + dynamic)
 */
export function resolveSubdomainVertical(hostname: string): VerticalSubstrateConfig | null {
  // Check static verticals
  for (const [, factory] of VERTICAL_REGISTRY) {
    const config = factory();
    if (hostname === `${config.subdomain}.cmpsbl.com` || hostname === `www.${config.subdomain}.cmpsbl.com`) {
      return config;
    }
  }
  // Check dynamic verticals
  for (const rv of getAllDynamicVerticals()) {
    const config = rv.config;
    if (hostname === `${config.subdomain}.cmpsbl.com` || hostname === `www.${config.subdomain}.cmpsbl.com`) {
      return config;
    }
  }
  return null;
}
