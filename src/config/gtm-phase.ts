/**
 * GTM Phase Configuration
 * Controls what's visible based on current go-to-market phase
 * 
 * Phase 1 — "The Proof" (CURRENT): Standalone products only
 * Phase 2 — "Platform Whisper": Marketplace + tiered subscriptions
 * Phase 3 — "Ecosystem Flywheel": Evolution API + Crown Jewel licensing
 * Phase 4 — "The OS": Full ecosystem governance
 */

export type GTMPhase = 1 | 2 | 3 | 4;

// ═══════════════════════════════════════════════════════════
// CURRENT PHASE — Change this single value to unlock features
// ═══════════════════════════════════════════════════════════
export const CURRENT_PHASE: GTMPhase = 4;

// ═══════════════════════════════════════════════════════════
// Phase-gated route definitions
// ═══════════════════════════════════════════════════════════
export interface GatedRoute {
  path: string;
  unlocksAt: GTMPhase;
  label: string;
  teaser: string;
  waitlist?: boolean; // Show waitlist signup vs just "coming soon"
}

export const GATED_ROUTES: GatedRoute[] = [
  // Phase 2 — Platform Whisper
  { path: '/licensing', unlocksAt: 2, label: 'Infrastructure Licensing', teaser: 'Download and deploy the CMPSBL Substrate within your own infrastructure. Self-hosted SDK access coming soon.', waitlist: true },
  { path: '/substrate/licensing/success', unlocksAt: 2, label: 'Licensing Success', teaser: 'Licensing checkout confirmation.', waitlist: false },
  { path: '/marketplace', unlocksAt: 2, label: 'Artifact Marketplace', teaser: 'Browse, purchase, and deploy capabilities, templates, and synergy memory chains.', waitlist: true },
  { path: '/store', unlocksAt: 2, label: 'Composable Artifacts Store', teaser: 'A curated marketplace of substrate-powered building blocks.', waitlist: true },
  { path: '/capabilities', unlocksAt: 2, label: 'Capability Depot', teaser: 'Atomic, stateless building blocks for any workflow.', waitlist: true },
  { path: '/synergies', unlocksAt: 2, label: 'Synergy Memory Chains', teaser: '300+ cross-module orchestration memory chains.', waitlist: true },
  { path: '/artifacts', unlocksAt: 2, label: 'Artifacts', teaser: 'Downloadable substrate artifacts and templates.', waitlist: true },
  { path: '/engines', unlocksAt: 2, label: 'Engine Marketplace', teaser: 'Production-grade orchestration engines with governance and SLA guarantees.', waitlist: true },
  
  
  // Phase 3 — Ecosystem Flywheel
  // Evolution Mesh retired — bundled into substrate tiers
  { path: '/intent-mesh', unlocksAt: 3, label: 'Intent Mesh', teaser: 'Autonomous inter-module communication layer.', waitlist: false },
  { path: '/lab', unlocksAt: 3, label: 'Experimentation Lab', teaser: 'Test and iterate on substrate configurations.', waitlist: false },
  { path: '/clockless-world-engine', unlocksAt: 3, label: 'Clockless World Engine', teaser: 'Temporal reasoning and world-state modeling.', waitlist: false },
  
  // Phase 4 — The OS
  { path: '/system-feed', unlocksAt: 4, label: 'System Intelligence Feed', teaser: 'Real-time substrate intelligence and activity stream.', waitlist: false },
  { path: '/system-integrity', unlocksAt: 4, label: 'System Integrity', teaser: 'Deep system health and integrity monitoring.', waitlist: false },
];

/**
 * Check if a route is available in the current phase
 */
export function isRouteAvailable(path: string): boolean {
  const gated = GATED_ROUTES.find(r => r.path === path);
  if (!gated) return true; // Not gated = always available
  return CURRENT_PHASE >= gated.unlocksAt;
}

/**
 * Get gate info for a route (if gated)
 */
export function getGateInfo(path: string): GatedRoute | null {
  const gated = GATED_ROUTES.find(r => r.path === path);
  if (!gated) return null;
  if (CURRENT_PHASE >= gated.unlocksAt) return null; // Unlocked
  return gated;
}

/**
 * Routes that are LIVE in Phase 1 (standalone products + proof)
 */
export const PHASE_1_LIVE_ROUTES = [
  '/',
  '/about',
  '/auth',
  '/blog',
  '/changelog',
  '/codelab',
  '/composable-cognitives',
  '/composable-cognitives/success',
  '/composable-cognitives/download',
  '/contact',
  '/decode',
  '/demo',
  '/developers',
  '/devtools',
  '/documentation',
  '/explore',
  '/foundations',
  '/gaming',
  '/insights',
  '/investors',
  '/library',
  // '/licensing', — GATED: moved to Phase 2 (LNCHBL distribution)
  '/llms-txt',
  '/humans-txt',
  '/modules',
  '/namespace',
  '/persistent-memory',
  '/pricing',
  '/privacy',
  '/projects',
  '/proof',
  '/proof',
  '/publication',
  '/register',
  '/roadmap',
  '/showcase',
  '/solutions',
  
  '/status',
  '/substrate',
  '/support',
  '/terms',
  '/use-cases',
  '/os', // Dashboard for authenticated users
  '/academy',
  '/ai-operating-system',
  '/products/encode',
  '/feed-dream-eater',
  '/dream-eater/archaeology',
  '/dream-eater/artifacts',
  '/forge/catalog',
  '/intelligence',
  '/docs/substrate/capabilities',
  '/docs/persistent-memory',
  '/checkout/redirect',
];

/**
 * Password for accessing gated routes (admin/beta override)
 */
export const PHASE_GATE_PASSWORD = 'cmpsbl-internal-2026';
