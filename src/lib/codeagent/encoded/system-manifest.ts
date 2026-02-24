/**
 * ENCODE System Manifest — Architecture Awareness Registry
 * SPARTA Epoch v11.1.0 — Zone Architecture
 *
 * Architecture:
 *   CORE (standalone kernel)
 *   → CCR (Layer 0) — 4 Zones: SYSTEM Zone + BRAIN Zone + MEMORY Zone + DREAM Zone
 *   → CCL (Layer 1) — 5 Zones: RIPPLE Zone + ACCESS Zone + IDENTITY Zone + RELAY Zone + AUDIT Zone
 *   → 8 Modules: VISION, SANDBOX, DECODE, CORTEX, ECONOMY, NEXUS, ENCODE, INCLUSIVE
 *   → 5 Meshes: DEFENSE, IMMUNITY, EVOLUTION, INTENT, GOVERNANCE
 *   → INTEGRATION (standalone)
 *   = 15 public entities + 9 surgically hot-swappable zones
 *
 * MODERNIZER absorbed by EVOLUTION mesh.
 * AUDIT Zone belongs to CCL.
 */

// ─── Module Registry ─────────────────────────────────────────────────────────

export interface ModuleEntry {
  id: string;
  name: string;
  layer: 'kernel' | 'cognitive' | 'orchestration' | 'infrastructure' | 'operational' | 'mesh' | 'standalone';
  description: string;
  corePath: string;
  hookPath?: string;
  dashboardPath?: string;
  dependencies: string[];
  dependents: string[];
}

export interface ComponentEntry {
  id: string;
  name: string;
  filePath: string;
  type: 'page' | 'layout' | 'widget' | 'ui' | 'provider' | 'feature';
  description: string;
  /** Which module owns this component */
  module?: string;
  /** CSS/style tokens this component uses */
  designTokens?: string[];
  /** Whether this component is a singleton (only one instance in the app) */
  singleton?: boolean;
}

export interface RouteEntry {
  path: string;
  component: string;
  description: string;
  auth: 'public' | 'protected' | 'admin';
}

// ─── The Manifest ────────────────────────────────────────────────────────────

/**
 * 15-Entity Architecture
 *
 * CORE (1) — standalone kernel
 * Modules (8): DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE
 * Meshes (5): DEFENSE, IMMUNITY, EVOLUTION, INTENT, GOVERNANCE
 * INTEGRATION (1) — standalone
 *
 * Hidden layers:
 *   CCR (Layer 0) facades: system, brain, memory, dream
 *   CCL (Layer 1) facades: ripple, access, identity, relay, audit
 *   Absorbed: modernizer → EVOLUTION mesh
 */
export const SYSTEM_MODULES: Record<string, ModuleEntry> = {
  // ─── Kernel ────────────────────────────────────────────────────────────────
  core: {
    id: 'core',
    name: 'CORE',
    layer: 'kernel',
    description: 'Standalone kernel. Boot sequencing, circuit breakers, configuration, job scheduling, module registry.',
    corePath: 'src/lib/core/',
    hookPath: 'src/hooks/substrate/useCore.ts',
    dependencies: [],
    dependents: ['decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive', 'defense', 'immunity', 'evolution', 'intent', 'governance', 'integration'],
  },

  // ─── 8 Public Modules ──────────────────────────────────────────────────────
  decode: {
    id: 'decode',
    name: 'DECODE',
    layer: 'cognitive',
    description: 'Intent router and system voice. Parses human ambiguity into structured task packets for ENCODE.',
    corePath: 'src/lib/substrate/decode/',
    hookPath: 'src/hooks/substrate/useDecode.ts',
    dashboardPath: 'src/pages/SubstrateOS.tsx',
    dependencies: ['core'],
    dependents: ['encode'],
  },
  encode: {
    id: 'encode',
    name: 'ENCODE',
    layer: 'orchestration',
    description: 'Code generation and transformation engine. Accepts structured task packets from DECODE.',
    corePath: 'src/lib/substrate/encode-module/',
    hookPath: 'src/hooks/substrate/useEncode.ts',
    dashboardPath: 'src/pages/SubstrateOS.tsx',
    dependencies: ['core', 'decode', 'sandbox'],
    dependents: [],
  },
  vision: {
    id: 'vision',
    name: 'VISION',
    layer: 'operational',
    description: 'Unified analytics dashboard with real-time metrics, telemetry, and observability.',
    corePath: 'src/lib/substrate/telemetry-engine.ts',
    dependencies: ['core'],
    dependents: [],
  },
  cortex: {
    id: 'cortex',
    name: 'CORTEX',
    layer: 'orchestration',
    description: 'Pipeline orchestrator. Manages multi-stage cognitive workflows and engine composition.',
    corePath: 'src/lib/substrate/orchestrator-engine.ts',
    hookPath: 'src/hooks/substrate/useCortex.ts',
    dependencies: ['core'],
    dependents: ['encode'],
  },
  nexus: {
    id: 'nexus',
    name: 'NEXUS',
    layer: 'orchestration',
    description: 'Multi-provider AI gateway. Intelligently routes requests across AI providers.',
    corePath: 'src/lib/nexus/',
    dependencies: ['core'],
    dependents: ['decode', 'encode'],
  },
  economy: {
    id: 'economy',
    name: 'ECONOMY',
    layer: 'infrastructure',
    description: 'Real-time cost attribution, budgeting, and marketplace signaling.',
    corePath: 'src/lib/substrate/economy-module/',
    hookPath: 'src/hooks/substrate/useEconomyModule.ts',
    dependencies: ['core'],
    dependents: [],
  },
  sandbox: {
    id: 'sandbox',
    name: 'SANDBOX',
    layer: 'infrastructure',
    description: 'Isolated execution environments for safe code execution, speculative runs, and evolution testing.',
    corePath: 'src/lib/substrate/sandbox-module/',
    hookPath: 'src/hooks/substrate/useSandboxModule.ts',
    dependencies: ['core'],
    dependents: ['encode', 'evolution'],
  },
  inclusive: {
    id: 'inclusive',
    name: 'INCLUSIVE',
    layer: 'operational',
    description: 'Accessibility scanning, WCAG compliance, and inclusive design enforcement.',
    corePath: 'src/lib/inclusive/',
    dependencies: ['core'],
    dependents: [],
  },

  // ─── 5 Meshes ──────────────────────────────────────────────────────────────
  defense: {
    id: 'defense',
    name: 'DEFENSE',
    layer: 'mesh',
    description: 'AI-powered security mesh: bot detection, rate limiting, threat analysis, stealth mode.',
    corePath: 'src/lib/defense/',
    dependencies: ['core'],
    dependents: ['immunity'],
  },
  immunity: {
    id: 'immunity',
    name: 'IMMUNITY',
    layer: 'mesh',
    description: 'Adaptive resilience mesh. Executor shadow training, gap classification, self-healing patterns.',
    corePath: 'src/lib/substrate/modernizer-shadow-resolver/',
    dependencies: ['core', 'defense'],
    dependents: [],
  },
  evolution: {
    id: 'evolution',
    name: 'EVOLUTION',
    layer: 'mesh',
    description: 'Self-improvement mesh. Mutation proposals, shadow A/B testing, canary deployment, promotion gates. Absorbs MODERNIZER.',
    corePath: 'src/lib/evolution-mesh/',
    hookPath: 'src/hooks/substrate/useModernizer.ts',
    dashboardPath: 'src/pages/Modernizer.tsx',
    dependencies: ['core', 'sandbox'],
    dependents: [],
  },
  intent: {
    id: 'intent',
    name: 'INTENT',
    layer: 'mesh',
    description: 'Intent resolution mesh. Cross-module intent routing, goal decomposition, task orchestration.',
    corePath: 'src/lib/substrate/intent-mesh/',
    dependencies: ['core'],
    dependents: [],
  },
  governance: {
    id: 'governance',
    name: 'GOVERNANCE',
    layer: 'mesh',
    description: 'Ethical constraints, veto authority, epistemic discipline, signal arbitration, coherence enforcement.',
    corePath: 'src/lib/substrate/governance/',
    dependencies: ['core'],
    dependents: [],
  },

  // ─── Standalone ────────────────────────────────────────────────────────────
  integration: {
    id: 'integration',
    name: 'INTEGRATION',
    layer: 'standalone',
    description: 'External service connections, OAuth flows, and third-party API management.',
    corePath: 'src/lib/integrations/',
    dependencies: ['core'],
    dependents: [],
  },
};

// ─── Key UI Components ───────────────────────────────────────────────────────

export const SYSTEM_COMPONENTS: Record<string, ComponentEntry> = {
  header: {
    id: 'header',
    name: 'Header',
    filePath: 'src/components/Header.tsx',
    type: 'layout',
    description: 'Top navigation bar with search, home, substrate overview, and user controls.',
    singleton: true,
  },
  footer: {
    id: 'footer',
    name: 'Footer',
    filePath: 'src/components/Footer.tsx',
    type: 'layout',
    description: 'Site-wide footer with links, branding, and legal notices.',
    singleton: true,
  },
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar',
    filePath: 'src/components/sidebar/Sidebar.tsx',
    type: 'layout',
    description: 'Dashboard sidebar navigation with module links and status indicators.',
    singleton: true,
  },
  substrate_status: {
    id: 'substrate_status',
    name: 'SubstrateStatus',
    filePath: 'src/components/substrate/SubstrateStatus.tsx',
    type: 'widget',
    description: 'Compact substrate health indicator showing active entity count.',
    module: 'core',
  },
  substrate_provider: {
    id: 'substrate_provider',
    name: 'SubstrateProvider',
    filePath: 'src/components/substrate/SubstrateProvider.tsx',
    type: 'provider',
    description: 'React context provider wrapping app with substrate state and auto-init.',
    module: 'core',
    singleton: true,
  },
  decode_float: {
    id: 'decode_float',
    name: 'DecodeFloat',
    filePath: 'src/components/decode/DecodeFloat.tsx',
    type: 'widget',
    description: 'Floating DECODE orb for system-wide intent input.',
    module: 'decode',
    singleton: true,
  },
  toast_renderer: {
    id: 'toast_renderer',
    name: 'SmartToastRenderer',
    filePath: 'src/components/toast/SmartToastRenderer.tsx',
    type: 'ui',
    description: 'Intelligent toast notification system with priority and stacking.',
    singleton: true,
  },
};

// ─── Key Routes ──────────────────────────────────────────────────────────────

export const SYSTEM_ROUTES: RouteEntry[] = [
  { path: '/', component: 'Explore', description: 'Homepage / landing', auth: 'public' },
  { path: '/substrate', component: 'SubstrateDashboard', description: 'Main substrate dashboard', auth: 'public' },
  { path: '/os', component: 'SubstrateOS', description: 'CMPSBL Substrate with DECODE + ENCODE tabs', auth: 'public' },
  { path: '/demo', component: 'SubstrateDemo', description: 'Interactive substrate demos', auth: 'public' },
  { path: '/proof', component: 'ProofMode', description: 'Proof-of-capability demonstrations', auth: 'public' },
  { path: '/showcase', component: 'STierDemos', description: 'S-Tier investor showcase — live proof-of-capability', auth: 'public' },
  { path: '/decode', component: 'Decode', description: 'DECODE intent interface', auth: 'public' },
  { path: '/blog', component: 'Blog', description: 'Blog and publications', auth: 'public' },
  { path: '/auth', component: 'Auth', description: 'Authentication', auth: 'public' },
];

// ─── ENCODE Self-Awareness ───────────────────────────────────────────────────

export const ENCODE_IDENTITY = {
  name: 'ENCODE',
  role: 'Implementation executor — the hands that touch, polish, and modify the substrate.',
  moduleId: 'encode',
  constraints: [
    'Must read files before writing — never assume file contents.',
    'Must preserve exports, handlers, and entrypoints (File Anchors).',
    'Destructive changes (>15% file change or anchor removal) require human approval.',
    'Cannot self-apply evolution proposals — EVOLUTION mesh handles governance.',
    'Accepts task packets ONLY from DECODE — no direct interaction.',
  ],
  capabilities: [
    'Code generation across 6 target surfaces: code, UI, docs, database, edge functions, tests.',
    'Confidence scoring (0-1) for generated output.',
    'Diff preview before application.',
    'CLM self-improvement cycles.',
  ],
  systemAwareness: 'Use resolveModule() and resolveComponent() to locate any part of the system before modifying it. NEVER create a new component if one already exists.',
};

// ─── Resolution Functions ────────────────────────────────────────────────────

export function resolveModule(query: string): ModuleEntry | undefined {
  const q = query.toLowerCase().trim();
  return SYSTEM_MODULES[q] ??
    Object.values(SYSTEM_MODULES).find(m =>
      m.name.toLowerCase() === q || m.id === q
    );
}

export function resolveComponent(query: string): ComponentEntry | undefined {
  const q = query.toLowerCase().trim();
  if (SYSTEM_COMPONENTS[q]) return SYSTEM_COMPONENTS[q];
  const byName = Object.values(SYSTEM_COMPONENTS).find(c =>
    c.name.toLowerCase() === q || c.id === q
  );
  if (byName) return byName;
  return Object.values(SYSTEM_COMPONENTS).find(c =>
    c.name.toLowerCase().includes(q) ||
    c.id.includes(q) ||
    c.description.toLowerCase().includes(q)
  );
}

export function resolveModuleByPath(filePath: string): ModuleEntry | undefined {
  return Object.values(SYSTEM_MODULES).find(m =>
    filePath.startsWith(m.corePath) ||
    (m.hookPath && filePath.startsWith(m.hookPath)) ||
    (m.dashboardPath && filePath === m.dashboardPath)
  );
}

export function getModulesByLayer(layer: ModuleEntry['layer']): ModuleEntry[] {
  return Object.values(SYSTEM_MODULES).filter(m => m.layer === layer);
}

export function getDependencyChain(moduleId: string, visited = new Set<string>()): string[] {
  if (visited.has(moduleId)) return [];
  visited.add(moduleId);
  const mod = SYSTEM_MODULES[moduleId];
  if (!mod) return [moduleId];
  const deps = mod.dependencies.flatMap(d => getDependencyChain(d, visited));
  return [...deps, moduleId];
}

export function getSystemSummary(): string {
  const moduleCount = Object.keys(SYSTEM_MODULES).length;
  const layers = [...new Set(Object.values(SYSTEM_MODULES).map(m => m.layer))];
  const componentCount = Object.keys(SYSTEM_COMPONENTS).length;
  return `CMPSBL Substrate: ${moduleCount} public entities (CORE + 8 Modules + 5 Meshes + INTEGRATION) + CCR Layer 0 + CCL Layer 1 across ${layers.length} layers (${layers.join(', ')}), ${componentCount} registered UI components. CCR absorbs SYSTEM+BRAIN+MEMORY+DREAM. CCL absorbs RIPPLE+ACCESS+IDENTITY+RELAY+AUDIT. MODERNIZER absorbed by EVOLUTION mesh.`;
}
