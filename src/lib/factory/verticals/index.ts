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
import type { VerticalSubstrateConfig } from '../vertical-substrate';
import type { SpecialtyDomain } from '../specialty-substrates';

/** All registered vertical substrates */
const VERTICAL_REGISTRY = new Map<string, () => VerticalSubstrateConfig>([
  ['cyber-v1', getCyberSecuritySubstrate],
  ['robo-v1', getRoboticsSubstrate],
]);

/** Domain to vertical ID mapping */
const DOMAIN_VERTICAL_MAP = new Map<SpecialtyDomain, string>([
  ['security', 'cyber-v1'],
  ['robotics', 'robo-v1'],
]);

/**
 * Get a vertical substrate by its ID
 */
export function getVerticalSubstrate(verticalId: string): VerticalSubstrateConfig | null {
  const factory = VERTICAL_REGISTRY.get(verticalId);
  return factory ? factory() : null;
}

/**
 * Get vertical substrate by domain
 */
export function getVerticalByDomain(domain: SpecialtyDomain): VerticalSubstrateConfig | null {
  const verticalId = DOMAIN_VERTICAL_MAP.get(domain);
  return verticalId ? getVerticalSubstrate(verticalId) : null;
}

/**
 * Get all registered vertical IDs
 */
export function getRegisteredVerticals(): string[] {
  return Array.from(VERTICAL_REGISTRY.keys());
}

/**
 * Get all vertical substrate configs (for portal page)
 */
export function getAllVerticalConfigs(): VerticalSubstrateConfig[] {
  return Array.from(VERTICAL_REGISTRY.values()).map(factory => factory());
}

/**
 * Resolve a subdomain to its vertical substrate config
 */
export function resolveSubdomainVertical(hostname: string): VerticalSubstrateConfig | null {
  for (const [, factory] of VERTICAL_REGISTRY) {
    const config = factory();
    if (hostname === `${config.subdomain}.cmpsbl.com` || hostname === `www.${config.subdomain}.cmpsbl.com`) {
      return config;
    }
  }
  return null;
}
