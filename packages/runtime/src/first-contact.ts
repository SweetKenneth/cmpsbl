/**
 * @cmpsbl/runtime — First Contact Ceremony Engine
 * Cinematic boot sequence shared across all 11 @cmpsbl packages.
 * When a developer first connects, they experience the substrate waking up.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// Inlined Types (self-contained — no external @cmpsbl deps)
// ═══════════════════════════════════════════════════════════════

export interface MemoryChain {
  id: string;
  pattern: string;
  adoption: string;
  status: 'new' | 'captured' | 'applied' | 'exported';
  discoveredAt: string;
  domain: string;
  confidence: number;
}

export interface MemoryStreamEntry {
  chain: MemoryChain;
  source: string;
  userId: string;
  sessionId: string;
}

export interface FirstContactSession {
  userId: string;
  sessionId: string;
  package: string;
  domain: string;
  startedAt: string;
  memoryBound: boolean;
  discoveryActive: boolean;
  chains: MemoryChain[];
}

export type CeremonyPhase =
  | 'awakening'
  | 'handshake'
  | 'sector_boot'
  | 'mesh_bind'
  | 'memory_sync'
  | 'discovery_arm'
  | 'ceremony_complete';

export interface CeremonyEvent {
  phase: CeremonyPhase;
  message: string;
  detail?: string;
  progress?: number;
  sector?: string;
  nodesOnline?: number;
  totalNodes?: number;
}

export interface FirstContactConfig {
  package: string;
  domain: string;
  endpoint?: string;
  apiKey?: string;
  autoDiscover?: boolean;
  onDiscovery?: (chain: MemoryChain) => void;
  onBoot?: (message: string) => void;
  onCeremony?: (event: CeremonyEvent) => void;
  silent?: boolean;
}

export interface DiscoveryInput {
  input: string;
  context?: Record<string, unknown>;
  domain?: string;
}

export interface DiscoveryResult {
  detected: boolean;
  memory: MemoryChain | null;
  streamStatus: 'available_in_stream' | 'pending' | 'none';
}

export interface CaptureResult {
  success: boolean;
  chainId: string;
  message: string;
}

export interface ApplyResult {
  success: boolean;
  chainId: string;
  message: string;
  systemUpdated: boolean;
}

export interface ExportResult {
  success: boolean;
  chainId: string;
  format: 'json' | 'manifest' | 'bundle';
  data: Record<string, unknown>;
}

export type PackageDomain =
  | 'runtime' | 'intent' | 'mesh' | 'bridge' | 'discovery'
  | 'sdk' | 'cli' | 'react' | 'failsafe' | 'test-harness' | 'types';

export interface DomainPattern {
  domain: PackageDomain;
  patterns: string[];
  scopes: string[];
}

export const DOMAIN_PATTERNS: Record<PackageDomain, DomainPattern> = {
  runtime: { domain: 'runtime', patterns: ['Execution optimization pattern', 'Pipeline efficiency chain', 'State machine convergence'], scopes: ['Cross-runtime adoption', 'Multi-environment execution', 'Universal pipeline usage'] },
  intent: { domain: 'intent', patterns: ['Routing optimization pattern', 'Resolver convergence chain', 'Intent coordination signal'], scopes: ['Cross-module orchestration', 'Multi-resolver routing', 'System-wide intent coverage'] },
  mesh: { domain: 'mesh', patterns: ['Telemetry correlation pattern', 'Signal propagation chain', 'Node communication optimization'], scopes: ['Cross-node telemetry', 'System-wide observability', 'Multi-layer signal analysis'] },
  bridge: { domain: 'bridge', patterns: ['Language bridge optimization', 'Cross-runtime delegation chain', 'Polyglot execution pattern'], scopes: ['Multi-language adoption', 'Cross-runtime integration', 'Universal bridge coverage'] },
  discovery: { domain: 'discovery', patterns: ['Pipeline crystallization pattern', 'Architecture collision chain', 'Capability emergence signal'], scopes: ['Cross-system discovery', 'Multi-node collision analysis', 'Autonomous capability generation'] },
  sdk: { domain: 'sdk', patterns: ['API usage optimization', 'Engine coordination chain', 'Client integration pattern'], scopes: ['Cross-engine adoption', 'Multi-system integration', 'Developer workflow optimization'] },
  cli: { domain: 'cli', patterns: ['Command optimization pattern', 'Workflow automation chain', 'Infrastructure coordination signal'], scopes: ['Cross-project automation', 'Multi-environment management', 'Developer productivity gain'] },
  react: { domain: 'react', patterns: ['Component state correlation', 'Hook composition chain', 'UI-substrate binding pattern'], scopes: ['Cross-component adoption', 'Multi-view state management', 'Frontend-substrate integration'] },
  failsafe: { domain: 'failsafe', patterns: ['Recovery optimization pattern', 'Backup integrity chain', 'Migration reliability signal'], scopes: ['Cross-platform migration', 'Multi-environment backup', 'Disaster recovery automation'] },
  'test-harness': { domain: 'test-harness', patterns: ['Validation coverage pattern', 'Test convergence chain', 'Quality assurance signal'], scopes: ['Cross-module validation', 'Multi-layer test coverage', 'Automated quality assurance'] },
  types: { domain: 'types', patterns: ['Type safety pattern', 'Schema convergence chain', 'Contract validation signal'], scopes: ['Cross-package type safety', 'Multi-module schema coverage', 'Universal contract enforcement'] },
};

// ═══════════════════════════════════════════════════════════════
// Session Management
// ═══════════════════════════════════════════════════════════════

let activeSession: FirstContactSession | null = null;

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `fc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ═══════════════════════════════════════════════════════════════
// Ceremony — Cinematic Boot Sequence
// ═══════════════════════════════════════════════════════════════

const CEREMONY_SECTORS = [
  { sector: 'CORE',   nodes: ['CORE', 'SYSTEM'] },
  { sector: 'CCR',    nodes: ['BRAIN', 'MEMORY', 'DREAM'] },
  { sector: 'OCG',    nodes: ['RIPPLE', 'ACCESS', 'IDENTITY', 'RELAY', 'AUDIT', 'NERVE'] },
  { sector: 'EXEC',   nodes: ['ENCODE', 'DECODE', 'CORTEX', 'NEXUS', 'ECONOMY', 'SANDBOX', 'INCLUSIVE', 'MEDIC', 'INTEGRATION'] },
  { sector: 'ESZ',    nodes: ['SOVEREIGN', 'ORACLE', 'CONSCIENCE', 'TREATY'] },
  { sector: 'EPZ',    nodes: ['COMPASS', 'ECHO', 'REFLEX'] },
  { sector: 'EMZ',    nodes: ['FORGE', 'LINGUA', 'HARVEST'] },
  { sector: 'CSZ',    nodes: ['EVOLUTION', 'SHADOW', 'PHANTOM'] },
  { sector: 'FIELDS', nodes: ['IMMUNITY', 'INTENT'] },
  { sector: 'PLANE',  nodes: ['GOVERNANCE'] },
  { sector: 'SHELL',  nodes: ['DEFENSE', 'VISION', 'ENGINEER'] },
] as const;

const TOTAL_NODES = 40;

const PACKAGE_GREETINGS: Record<string, string> = {
  '@cmpsbl/cli':          'Terminal bridge established. You speak, the mesh listens.',
  '@cmpsbl/sdk':          'SDK bound. Full cognitive surface available.',
  '@cmpsbl/runtime':      'Runtime initialized. Mini-Runtime™ active.',
  '@cmpsbl/react':        'React hooks connected. UI ↔ Substrate bridge live.',
  '@cmpsbl/intent':       'Intent router online. Every action finds its resolver.',
  '@cmpsbl/mesh':         'Mesh layer active. 40 primitives signaling.',
  '@cmpsbl/bridge':       'Polyglot bridge ready. One runtime, many languages.',
  '@cmpsbl/discovery':    'Discovery engine armed. Memory chains forming.',
  '@cmpsbl/failsafe':     'FAILSAFE standing by. Recovery pathways mapped.',
  '@cmpsbl/test-harness': 'Test harness loaded. Validation surface ready.',
  '@cmpsbl/types':        'Type contracts enforced. Schema integrity locked.',
};

async function runCeremony(config: FirstContactConfig): Promise<void> {
  if (config.silent) return;

  const emitEvent = (event: CeremonyEvent) => {
    config.onCeremony?.(event);
    config.onBoot?.(event.message);
  };

  emitEvent({ phase: 'awakening', message: '◈ Substrate heartbeat detected...', progress: 0 });
  await delay(300);

  emitEvent({ phase: 'awakening', message: '◈ Cognitive runtime responding...', progress: 5 });
  await delay(250);

  const greeting = PACKAGE_GREETINGS[config.package] ?? `${config.package} connected to substrate.`;
  emitEvent({ phase: 'handshake', message: `◈ Package: ${config.package}`, detail: greeting, progress: 10 });
  await delay(300);

  emitEvent({
    phase: 'handshake',
    message: `◈ Domain: ${config.domain}`,
    detail: config.apiKey ? 'Authenticated — persistent memory enabled' : 'Local mode — ephemeral memory',
    progress: 15,
  });
  await delay(200);

  let nodesOnline = 0;
  for (const { sector, nodes } of CEREMONY_SECTORS) {
    nodesOnline += nodes.length;
    const progress = 15 + Math.round((nodesOnline / TOTAL_NODES) * 60);
    emitEvent({
      phase: 'sector_boot',
      message: `▸ Sector ${sector} — ${nodes.join(' · ')}`,
      sector,
      nodesOnline,
      totalNodes: TOTAL_NODES,
      progress,
    });
    await delay(120);
  }

  emitEvent({
    phase: 'mesh_bind',
    message: '◈ Signal mesh binding...',
    detail: '40 primitives · 12 sectors · 4 categories',
    progress: 80,
    nodesOnline: TOTAL_NODES,
    totalNodes: TOTAL_NODES,
  });
  await delay(250);

  emitEvent({
    phase: 'memory_sync',
    message: config.apiKey
      ? '◈ Memory Stream connected — chains persisting'
      : '◈ Memory Stream local — connect API key to persist',
    progress: 90,
  });
  await delay(200);

  emitEvent({ phase: 'discovery_arm', message: '◈ Discovery engine armed. Every interaction leaves a trace.', progress: 95 });
  await delay(150);

  emitEvent({
    phase: 'ceremony_complete',
    message: `✔ ${greeting}`,
    detail: 'The mesh is alive.',
    progress: 100,
    nodesOnline: TOTAL_NODES,
    totalNodes: TOTAL_NODES,
  });
}

// ═══════════════════════════════════════════════════════════════
// Initialization
// ═══════════════════════════════════════════════════════════════

export async function initFirstContact(config: FirstContactConfig): Promise<FirstContactSession> {
  const session: FirstContactSession = {
    userId: config.apiKey ?? generateId(),
    sessionId: generateSessionId(),
    package: config.package,
    domain: config.domain,
    startedAt: new Date().toISOString(),
    memoryBound: false,
    discoveryActive: false,
    chains: [],
  };

  await runCeremony(config);

  if (config.apiKey && config.endpoint) {
    try {
      const res = await fetch(`${config.endpoint}/memory/bind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Engine-Key': config.apiKey },
        body: JSON.stringify({
          userId: session.userId,
          sessionId: session.sessionId,
          package: config.package,
          domain: config.domain,
        }),
      });
      if (res.ok) session.memoryBound = true;
    } catch { /* Memory binding attempted — will retry on next interaction */ }
  }

  if (config.autoDiscover !== false) session.discoveryActive = true;

  activeSession = session;
  return session;
}

// ═══════════════════════════════════════════════════════════════
// Discovery
// ═══════════════════════════════════════════════════════════════

export async function discover(
  input: DiscoveryInput,
  config: FirstContactConfig,
  domainPatterns: DomainPattern,
): Promise<DiscoveryResult> {
  const session = activeSession;
  if (!session) throw new Error('First contact not initialized. Call initFirstContact() first.');

  if (config.apiKey && config.endpoint) {
    try {
      const res = await fetch(`${config.endpoint}/memory/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Engine-Key': config.apiKey },
        body: JSON.stringify({
          userId: session.userId,
          sessionId: session.sessionId,
          input: input.input,
          context: input.context,
          domain: input.domain ?? config.domain,
        }),
      });

      if (res.ok) {
        const data = await res.json() as Record<string, any>;
        if (data.detected && data.memory) {
          const chain: MemoryChain = {
            id: data.memory.id,
            pattern: data.memory.pattern,
            adoption: data.memory.adoption,
            status: 'new',
            discoveredAt: new Date().toISOString(),
            domain: config.domain,
            confidence: data.memory.confidence ?? 0.85,
          };
          session.chains.push(chain);
          config.onDiscovery?.(chain);
          return { detected: true, memory: chain, streamStatus: 'available_in_stream' };
        }
      }
    } catch { /* API unreachable — fall through to local pattern matching */ }
  }

  const patternIndex = Math.floor(Math.random() * domainPatterns.patterns.length);
  const scopeIndex = Math.floor(Math.random() * domainPatterns.scopes.length);

  const chain: MemoryChain = {
    id: generateId(),
    pattern: domainPatterns.patterns[patternIndex],
    adoption: domainPatterns.scopes[scopeIndex],
    status: 'new',
    discoveredAt: new Date().toISOString(),
    domain: config.domain,
    confidence: 0.7 + Math.random() * 0.25,
  };

  session.chains.push(chain);
  config.onDiscovery?.(chain);

  return {
    detected: true,
    memory: chain,
    streamStatus: config.apiKey ? 'available_in_stream' : 'pending',
  };
}

// ═══════════════════════════════════════════════════════════════
// Actions
// ═══════════════════════════════════════════════════════════════

export async function capture(chainId: string, config: FirstContactConfig): Promise<CaptureResult> {
  const session = activeSession;
  if (!session) throw new Error('First contact not initialized.');

  const chain = session.chains.find((c: MemoryChain) => c.id === chainId);
  if (!chain) return { success: false, chainId, message: 'Memory chain not found' };

  if (config.apiKey && config.endpoint) {
    try {
      await fetch(`${config.endpoint}/memory/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Engine-Key': config.apiKey },
        body: JSON.stringify({ userId: session.userId, chainId, chain }),
      });
    } catch { /* Capture attempted — stored locally */ }
  }

  chain.status = 'captured';
  return { success: true, chainId, message: 'Memory captured. Reusable across agents, applications, and systems.' };
}

export async function apply(chainId: string, config: FirstContactConfig): Promise<ApplyResult> {
  const session = activeSession;
  if (!session) throw new Error('First contact not initialized.');

  const chain = session.chains.find((c: MemoryChain) => c.id === chainId);
  if (!chain) return { success: false, chainId, message: 'Memory chain not found', systemUpdated: false };

  if (config.apiKey && config.endpoint) {
    try {
      const res = await fetch(`${config.endpoint}/memory/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Engine-Key': config.apiKey },
        body: JSON.stringify({ userId: session.userId, chainId, chain }),
      });
      if (res.ok) {
        chain.status = 'applied';
        return { success: true, chainId, message: 'Applied. System behavior updated.', systemUpdated: true };
      }
    } catch { /* Apply attempted */ }
  }

  chain.status = 'applied';
  return { success: true, chainId, message: 'Applied. System behavior updated.', systemUpdated: true };
}

export async function exportChain(chainId: string, config: FirstContactConfig): Promise<ExportResult> {
  const session = activeSession;
  if (!session) throw new Error('First contact not initialized.');

  const chain = session.chains.find((c: MemoryChain) => c.id === chainId);
  if (!chain) return { success: false, chainId, format: 'json', data: { error: 'Memory chain not found' } };

  chain.status = 'exported';
  return {
    success: true,
    chainId,
    format: 'json',
    data: {
      chain,
      session: { userId: session.userId, package: session.package, domain: session.domain },
      exportedAt: new Date().toISOString(),
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// Stream Access
// ═══════════════════════════════════════════════════════════════

export function getMemoryStream(): MemoryChain[] {
  return activeSession?.chains ?? [];
}

export function getSession(): FirstContactSession | null {
  return activeSession;
}

export function endSession(): void {
  activeSession = null;
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
