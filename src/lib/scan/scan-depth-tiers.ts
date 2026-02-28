/**
 * Scan Depth Tiers — user-facing scan depth configuration
 * Item #17: Quick / Deep / Forensic scan tiers
 */

export type ScanDepth = 'quick' | 'deep' | 'forensic';

export interface ScanDepthConfig {
  id: ScanDepth;
  label: string;
  description: string;
  maxProbes: number;
  timeout: number;
  includesPhases: string[];
  tier: 'free' | 'pro' | 'enterprise';
  estimatedDuration: string;
}

export const SCAN_DEPTHS: ScanDepthConfig[] = [
  {
    id: 'quick',
    label: 'Quick Scan',
    description: 'Surface-level checks: accessibility, SEO basics, security headers.',
    maxProbes: 15,
    timeout: 30_000,
    includesPhases: ['headers', 'meta', 'a11y-basic'],
    tier: 'free',
    estimatedDuration: '~10 seconds',
  },
  {
    id: 'deep',
    label: 'Deep Scan',
    description: 'Full analysis: DOM inspection, performance scoring, dependency audit, content quality.',
    maxProbes: 50,
    timeout: 120_000,
    includesPhases: ['headers', 'meta', 'a11y-full', 'performance', 'seo-advanced', 'dependencies', 'content'],
    tier: 'pro',
    estimatedDuration: '~45 seconds',
  },
  {
    id: 'forensic',
    label: 'Forensic Scan',
    description: 'Enterprise-grade: full stack trace, auth-flow analysis, data-flow mapping, technical debt quantification.',
    maxProbes: 150,
    timeout: 300_000,
    includesPhases: ['headers', 'meta', 'a11y-full', 'performance', 'seo-advanced', 'dependencies', 'content', 'auth-flow', 'data-flow', 'tech-debt', 'supply-chain'],
    tier: 'enterprise',
    estimatedDuration: '~3 minutes',
  },
];

export function getScanDepthConfig(depth: ScanDepth): ScanDepthConfig {
  return SCAN_DEPTHS.find(d => d.id === depth) ?? SCAN_DEPTHS[0];
}

/**
 * Check if a user tier has access to a scan depth.
 */
export function canAccessDepth(userTier: string, depth: ScanDepth): boolean {
  const depthConfig = getScanDepthConfig(depth);
  const tierOrder = { free: 0, pro: 1, enterprise: 2 };
  const userLevel = tierOrder[userTier as keyof typeof tierOrder] ?? 0;
  const requiredLevel = tierOrder[depthConfig.tier] ?? 0;
  return userLevel >= requiredLevel;
}
