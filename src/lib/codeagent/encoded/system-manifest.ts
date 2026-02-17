/**
 * ENCODE System Manifest — Architecture Awareness Registry
 * v10.5.4 ARCHITECT — Gives ENCODE a canonical map of the living system
 *
 * This manifest solves ENCODE's "blind agent" problem: without it, ENCODE
 * has no idea that a footer exists, where BRAIN lives, or that it is itself
 * part of a 21-module substrate. With it, ENCODE can locate, understand, and
 * safely modify any part of the system.
 *
 * Usage:
 *   import { systemManifest, resolveComponent, resolveModule } from './system-manifest';
 *   const footer = resolveComponent('footer');
 *   // → { id: 'footer', filePath: 'src/components/layout/Footer.tsx', ... }
 */

// ─── Module Registry ─────────────────────────────────────────────────────────

export interface ModuleEntry {
  id: string;
  name: string;
  layer: 'cognitive' | 'orchestration' | 'infrastructure' | 'operational' | 'governance' | 'evolution';
  description: string;
  corePath: string;
  hookPath?: string;
  dashboardPath?: string;
  /** Modules this module depends on */
  dependencies: string[];
  /** Modules that depend on this module */
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

export const SYSTEM_MODULES: Record<string, ModuleEntry> = {
  core: {
    id: 'core',
    name: 'CORE',
    layer: 'cognitive',
    description: 'Central substrate orchestration and engine bus routing.',
    corePath: 'src/lib/substrate/index.ts',
    hookPath: 'src/lib/substrate/hooks.ts',
    dashboardPath: 'src/pages/SubstrateDashboard.tsx',
    dependencies: [],
    dependents: ['brain', 'decode', 'defense', 'nexus', 'vision', 'dream', 'ripple', 'access', 'system', 'modernizer', 'integration', 'inclusive', 'cortex', 'encode', 'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox'],
  },
  brain: {
    id: 'brain',
    name: 'BRAIN',
    layer: 'cognitive',
    description: 'Adaptive learning core with 6 engines: Learning, Imagination, Reasoning, Governance Guard, Telemetry, State. Manages memory tiers, heuristics, and reinforcement loops.',
    corePath: 'src/lib/substrate/engines/',
    hookPath: 'src/lib/substrate/hooks.ts',
    dashboardPath: 'src/pages/SubstrateDashboard.tsx',
    dependencies: ['core', 'memory'],
    dependents: ['decode', 'encode', 'modernizer', 'dream'],
  },
  decode: {
    id: 'decode',
    name: 'DECODE',
    layer: 'cognitive',
    description: 'Intent router and system voice. Parses human ambiguity into structured task packets for ENCODE. Features entity recognition for all 21 modules.',
    corePath: 'src/lib/substrate/decode/',
    hookPath: 'src/hooks/substrate/useDecode.ts',
    dashboardPath: 'src/pages/SubstrateOS.tsx',
    dependencies: ['core', 'brain'],
    dependents: ['encode'],
  },
  encode: {
    id: 'encode',
    name: 'ENCODE',
    layer: 'orchestration',
    description: 'Code generation and transformation engine. Accepts structured task packets from DECODE, generates code, scores confidence, and previews changes. THIS IS YOU — the hands that touch, polish, and modify the substrate.',
    corePath: 'src/lib/substrate/encode-module/',
    hookPath: 'src/hooks/substrate/useEncode.ts',
    dashboardPath: 'src/pages/SubstrateOS.tsx',
    dependencies: ['core', 'decode', 'brain', 'sandbox'],
    dependents: ['modernizer'],
  },
  defense: {
    id: 'defense',
    name: 'DEFENSE',
    layer: 'operational',
    description: 'AI-powered security: bot detection, rate limiting, threat analysis, stealth mode.',
    corePath: 'src/lib/defense/',
    dependencies: ['core', 'brain'],
    dependents: ['access'],
  },
  nexus: {
    id: 'nexus',
    name: 'NEXUS',
    layer: 'orchestration',
    description: 'Multi-provider AI gateway. Intelligently routes requests across AI providers based on task requirements, cost, and availability.',
    corePath: 'src/lib/nexus/',
    dependencies: ['core'],
    dependents: ['decode', 'encode', 'dream'],
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
  dream: {
    id: 'dream',
    name: 'DREAM',
    layer: 'cognitive',
    description: 'Dream Pool system for off-cycle creative synthesis, pattern fusion, and insight generation.',
    corePath: 'src/lib/substrate/imagination-engine.ts',
    dependencies: ['core', 'brain', 'nexus'],
    dependents: [],
  },
  ripple: {
    id: 'ripple',
    name: 'RIPPLE',
    layer: 'orchestration',
    description: 'Network integration layer for webhooks, external API orchestration, and event propagation.',
    corePath: 'src/lib/ripple/',
    dependencies: ['core'],
    dependents: ['relay'],
  },
  access: {
    id: 'access',
    name: 'ACCESS',
    layer: 'operational',
    description: 'Identity, billing, API key management, and developer portal.',
    corePath: 'src/lib/access/',
    dependencies: ['core', 'defense'],
    dependents: ['identity'],
  },
  system: {
    id: 'system',
    name: 'SYSTEM',
    layer: 'operational',
    description: 'System-level operations: health checks, diagnostics, configuration, and boot gates.',
    corePath: 'src/lib/substrate/boot-gates/',
    dependencies: ['core'],
    dependents: [],
  },
  modernizer: {
    id: 'modernizer',
    name: 'MODERNIZER',
    layer: 'evolution',
    description: 'The Executor/Omega Observer. Manages upgrade plans, file-level diffs, and shadow-to-production deployment. Handles the safe "how" of code-level execution.',
    corePath: 'src/lib/substrate/evolution-cycle.ts',
    hookPath: 'src/hooks/substrate/useModernizer.ts',
    dashboardPath: 'src/pages/Modernizer.tsx',
    dependencies: ['core', 'encode', 'brain'],
    dependents: [],
  },
  integration: {
    id: 'integration',
    name: 'INTEGRATION',
    layer: 'operational',
    description: 'External service connections, OAuth flows, and third-party API management.',
    corePath: 'src/lib/integrations/',
    dependencies: ['core'],
    dependents: [],
  },
  inclusive: {
    id: 'inclusive',
    name: 'INCLUSIVE',
    layer: 'governance',
    description: 'Accessibility scanning, WCAG compliance, and inclusive design enforcement.',
    corePath: 'src/lib/inclusive/',
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
    dependencies: ['core', 'brain'],
    dependents: ['encode'],
  },
  memory: {
    id: 'memory',
    name: 'MEMORY',
    layer: 'infrastructure',
    description: 'Vector/RAG orchestration, semantic recall, and persistent memory lifecycle.',
    corePath: 'src/lib/substrate/memory-module/',
    hookPath: 'src/hooks/substrate/useMemoryModule.ts',
    dependencies: ['core'],
    dependents: ['brain', 'encode'],
  },
  relay: {
    id: 'relay',
    name: 'RELAY',
    layer: 'infrastructure',
    description: 'Centralized outbound webhooks and side-effect delivery. Manages event propagation to external systems.',
    corePath: 'src/lib/substrate/relay-module/',
    hookPath: 'src/hooks/substrate/useRelayModule.ts',
    dependencies: ['core', 'ripple'],
    dependents: [],
  },
  audit: {
    id: 'audit',
    name: 'AUDIT',
    layer: 'infrastructure',
    description: 'Immutable, cryptographically-chained compliance logging. Every action is recorded with tamper-proof provenance.',
    corePath: 'src/lib/substrate/audit-module/',
    hookPath: 'src/hooks/substrate/useAuditModule.ts',
    dependencies: ['core'],
    dependents: [],
  },
  identity: {
    id: 'identity',
    name: 'IDENTITY',
    layer: 'infrastructure',
    description: 'Universal human/agent actor attribution. Hardware-bound identity continuity.',
    corePath: 'src/lib/substrate/identity-module/',
    hookPath: 'src/hooks/substrate/useIdentityModule.ts',
    dependencies: ['core', 'access'],
    dependents: ['decode'],
  },
  economy: {
    id: 'economy',
    name: 'ECONOMY',
    layer: 'infrastructure',
    description: 'Real-time cost attribution, budgeting, and marketplace signaling across all module operations.',
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
    dependents: ['encode', 'modernizer'],
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
    description: 'Compact substrate health indicator showing active module count.',
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
  { path: '/os', component: 'SubstrateOS', description: 'CMPSBL World Engine with DECODE + ENCODE tabs', auth: 'public' },
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
    'Cannot self-apply evolution proposals — SEBA/Modernizer handle governance.',
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

/**
 * Find a module by ID or name (case-insensitive).
 */
export function resolveModule(query: string): ModuleEntry | undefined {
  const q = query.toLowerCase().trim();
  return SYSTEM_MODULES[q] ??
    Object.values(SYSTEM_MODULES).find(m =>
      m.name.toLowerCase() === q || m.id === q
    );
}

/**
 * Find a component by ID, name, or fuzzy keyword match.
 */
export function resolveComponent(query: string): ComponentEntry | undefined {
  const q = query.toLowerCase().trim();
  // Exact match
  if (SYSTEM_COMPONENTS[q]) return SYSTEM_COMPONENTS[q];
  // Name match
  const byName = Object.values(SYSTEM_COMPONENTS).find(c =>
    c.name.toLowerCase() === q || c.id === q
  );
  if (byName) return byName;
  // Fuzzy: check if query appears in name, id, or description
  return Object.values(SYSTEM_COMPONENTS).find(c =>
    c.name.toLowerCase().includes(q) ||
    c.id.includes(q) ||
    c.description.toLowerCase().includes(q)
  );
}

/**
 * Find which module owns a given file path.
 */
export function resolveModuleByPath(filePath: string): ModuleEntry | undefined {
  return Object.values(SYSTEM_MODULES).find(m =>
    filePath.startsWith(m.corePath) ||
    (m.hookPath && filePath.startsWith(m.hookPath)) ||
    (m.dashboardPath && filePath === m.dashboardPath)
  );
}

/**
 * Get all modules in a given layer.
 */
export function getModulesByLayer(layer: ModuleEntry['layer']): ModuleEntry[] {
  return Object.values(SYSTEM_MODULES).filter(m => m.layer === layer);
}

/**
 * Get the full dependency chain for a module.
 */
export function getDependencyChain(moduleId: string, visited = new Set<string>()): string[] {
  if (visited.has(moduleId)) return [];
  visited.add(moduleId);
  const mod = SYSTEM_MODULES[moduleId];
  if (!mod) return [moduleId];
  const deps = mod.dependencies.flatMap(d => getDependencyChain(d, visited));
  return [...deps, moduleId];
}

/**
 * Summary for ENCODE to understand the system at a glance.
 */
export function getSystemSummary(): string {
  const moduleCount = Object.keys(SYSTEM_MODULES).length;
  const layers = [...new Set(Object.values(SYSTEM_MODULES).map(m => m.layer))];
  const componentCount = Object.keys(SYSTEM_COMPONENTS).length;
  return `CMPSBL Substrate: ${moduleCount} modules across ${layers.length} layers (${layers.join(', ')}), ${componentCount} registered UI components. ENCODE is Module #${Object.keys(SYSTEM_MODULES).indexOf('encode') + 1}.`;
}
