/**
 * Product Limits — Tier depth caps (Phase 1)
 * 
 * These govern HOW DEEP subsystems operate per tier, NOT which modules run.
 * The unified runtime stays on for everyone. Depth limits create natural
 * upgrade pressure without disabling capabilities.
 */
import type { ProductTier } from '@/lib/quarry/types';

export type MemoryDepthLevel = 'standard' | 'expanded' | 'expanded_plus' | 'dedicated';
export type RoutingPriority = 'low' | 'normal' | 'high' | 'highest';

export interface ProductLimits {
  /** Max isolated memory namespaces a user can create */
  maxMemoryNamespaces: number;
  /** Memory subsystem depth level */
  memoryDepth: MemoryDepthLevel;
  /** Whether background optimization cycles (dreaming) are enabled */
  allowBackgroundOptimization: boolean;
  /** Whether cron/event-driven automation scheduling is available */
  allowAutomationScheduling: boolean;
  /** NEXUS routing priority level */
  nexusRoutingPriority: RoutingPriority;
  /** Access to safe-evolution controls */
  safeEvolutionAccess: boolean;
  /** Ability to export execution traces / audit events */
  exportTraceAccess: boolean;
  /** Max crystallized assets usable */
  crystallizedAssetCap: number;
  /** Radio listening limit in minutes per 24 hours. -1 = unlimited */
  radioMinutesPerDay: number;

  // ═══ Proprietary Evolution Lifecycle Limits ═══
  /** Max code uploads per day in the Evolution Lifecycle */
  evolutionUploadsPerDay: number;
  /** Max capability exports per day (0 = cannot export) */
  evolutionExportsPerDay: number;
  /** Whether HDL/hardware targets (Verilog, VHDL, SystemC, etc.) are available */
  evolutionHdlAccess: boolean;
}

export const PRODUCT_LIMITS: Record<ProductTier, ProductLimits> = {
  builder: {
    maxMemoryNamespaces: 1,
    memoryDepth: 'standard',
    allowBackgroundOptimization: false,
    allowAutomationScheduling: false,
    nexusRoutingPriority: 'low',
    safeEvolutionAccess: false,
    exportTraceAccess: false,
    crystallizedAssetCap: 12,
    radioMinutesPerDay: 5,
    evolutionUploadsPerDay: 3,
    evolutionExportsPerDay: 0,
    evolutionHdlAccess: false,
  },
  operator: {
    maxMemoryNamespaces: 3,
    memoryDepth: 'expanded',
    allowBackgroundOptimization: true,
    allowAutomationScheduling: true,
    nexusRoutingPriority: 'normal',
    safeEvolutionAccess: false,
    exportTraceAccess: false,
    crystallizedAssetCap: 30,
    radioMinutesPerDay: 30,
    evolutionUploadsPerDay: 6,
    evolutionExportsPerDay: 2,
    evolutionHdlAccess: false,
  },
  studio: {
    maxMemoryNamespaces: 6,
    memoryDepth: 'expanded_plus',
    allowBackgroundOptimization: true,
    allowAutomationScheduling: true,
    nexusRoutingPriority: 'high',
    safeEvolutionAccess: false,
    exportTraceAccess: true,
    crystallizedAssetCap: 45,
    radioMinutesPerDay: 45,
    evolutionUploadsPerDay: 9,
    evolutionExportsPerDay: 3,
    evolutionHdlAccess: true,
  },
  architect: {
    maxMemoryNamespaces: 12,
    memoryDepth: 'dedicated',
    allowBackgroundOptimization: true,
    allowAutomationScheduling: true,
    nexusRoutingPriority: 'highest',
    safeEvolutionAccess: true,
    exportTraceAccess: true,
    crystallizedAssetCap: 60,
    radioMinutesPerDay: 60,
    evolutionUploadsPerDay: 12,
    evolutionExportsPerDay: 4,
    evolutionHdlAccess: true,
  },
};

/**
 * getUserLimits — Resolve product limits for a given tier string.
 * Safe to call with any subscription tier string; falls back to builder.
 */
export function getUserLimits(subscriptionTier?: string): ProductLimits {
  const tier = resolveToProductTier(subscriptionTier);
  return PRODUCT_LIMITS[tier];
}

/**
 * resolveToProductTier — Map subscription tier strings to ProductTier.
 * Mirrors the logic in useArtifactSlots but lives outside React.
 */
export function resolveToProductTier(subscriptionTier?: string): ProductTier {
  if (!subscriptionTier) return 'builder';
  if (subscriptionTier === 'enterprise') return 'architect';
  if (['architect', 'pro'].includes(subscriptionTier)) return 'architect';
  if (['creator'].includes(subscriptionTier)) return 'creator';
  if (['studio', 'operator'].includes(subscriptionTier)) return 'studio';
  if (['starter', 'builder', 'free'].includes(subscriptionTier)) return 'builder';
  return 'builder';
}

/**
 * Check if a specific depth feature is available for a tier.
 */
export function isDepthFeatureAvailable(
  feature: keyof Pick<ProductLimits, 'allowBackgroundOptimization' | 'allowAutomationScheduling' | 'safeEvolutionAccess' | 'exportTraceAccess'>,
  subscriptionTier?: string
): boolean {
  return getUserLimits(subscriptionTier)[feature];
}
