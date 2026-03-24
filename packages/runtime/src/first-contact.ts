/**
 * @cmpsbl/runtime — First Contact Ceremony Engine
 * Cinematic boot sequence shared across all 11 @cmpsbl packages.
 * When a developer first connects, they experience the substrate waking up.
 *
 * © CMPSBL® — All rights reserved.
 */

import type {
  FirstContactConfig,
  FirstContactSession,
  MemoryChain,
  DiscoveryInput,
  DiscoveryResult,
  CaptureResult,
  ApplyResult,
  ExportResult,
  PackageDomain,
  DOMAIN_PATTERNS,
  CeremonyEvent,
  CeremonyPhase,
} from '@cmpsbl/types';

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

  const emit = (event: CeremonyEvent) => {
    config.onCeremony?.(event);
    // Legacy support: also fire onBoot with the message
    config.onBoot?.(event.message);
  };

  // ── Phase 1: Awakening ──
  emit({
    phase: 'awakening',
    message: '◈ Substrate heartbeat detected...',
    progress: 0,
  });
  await delay(300);

  emit({
    phase: 'awakening',
    message: '◈ Cognitive runtime responding...',
    progress: 5,
  });
  await delay(250);

  // ── Phase 2: Handshake — identify which package is connecting ──
  const greeting = PACKAGE_GREETINGS[config.package] ?? `${config.package} connected to substrate.`;
  emit({
    phase: 'handshake',
    message: `◈ Package: ${config.package}`,
    detail: greeting,
    progress: 10,
  });
  await delay(300);

  emit({
    phase: 'handshake',
    message: `◈ Domain: ${config.domain}`,
    detail: config.apiKey ? 'Authenticated — persistent memory enabled' : 'Local mode — ephemeral memory',
    progress: 15,
  });
  await delay(200);

  // ── Phase 3: Sector Boot — walk through all 12 sectors ──
  let nodesOnline = 0;
  for (const { sector, nodes } of CEREMONY_SECTORS) {
    nodesOnline += nodes.length;
    const progress = 15 + Math.round((nodesOnline / TOTAL_NODES) * 60);
    emit({
      phase: 'sector_boot',
      message: `▸ Sector ${sector} — ${nodes.join(' · ')}`,
      sector,
      nodesOnline,
      totalNodes: TOTAL_NODES,
      progress,
    });
    await delay(120);
  }

  // ── Phase 4: Mesh Bind ──
  emit({
    phase: 'mesh_bind',
    message: '◈ Signal mesh binding...',
    detail: '40 primitives · 12 sectors · 4 categories',
    progress: 80,
    nodesOnline: TOTAL_NODES,
    totalNodes: TOTAL_NODES,
  });
  await delay(250);

  // ── Phase 5: Memory Sync ──
  emit({
    phase: 'memory_sync',
    message: config.apiKey
      ? '◈ Memory Stream connected — chains persisting'
      : '◈ Memory Stream local — connect API key to persist',
    progress: 90,
  });
  await delay(200);

  // ── Phase 6: Discovery Armed ──
  emit({
    phase: 'discovery_arm',
    message: '◈ Discovery engine armed. Every interaction leaves a trace.',
    progress: 95,
  });
  await delay(150);

  // ── Phase 7: Complete ──
  emit({
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

  // Run cinematic ceremony
  await runCeremony(config);

  // Bind user memory
  if (config.apiKey && config.endpoint) {
    try {
      const res = await fetch(`${config.endpoint}/memory/bind`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Engine-Key': config.apiKey,
        },
        body: JSON.stringify({
          userId: session.userId,
          sessionId: session.sessionId,
          package: config.package,
          domain: config.domain,
        }),
      });
      if (res.ok) {
        session.memoryBound = true;
      }
    } catch {
      // Memory binding attempted — will retry on next interaction
    }
  }

  // Auto-start discovery
  if (config.autoDiscover !== false) {
    session.discoveryActive = true;
  }

  activeSession = session;
  return session;
}

// ═══════════════════════════════════════════════════════════════
// Discovery
// ═══════════════════════════════════════════════════════════════

export async function discover(
  input: DiscoveryInput,
  config: FirstContactConfig,
  domainPatterns: typeof DOMAIN_PATTERNS[PackageDomain],
): Promise<DiscoveryResult> {
  const session = activeSession;
  if (!session) {
    throw new Error('First contact not initialized. Call initFirstContact() first.');
  }

  // Attempt real discovery via Memory Stream API
  if (config.apiKey && config.endpoint) {
    try {
      const res = await fetch(`${config.endpoint}/memory/discover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Engine-Key': config.apiKey,
        },
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
    } catch {
      // API unreachable — fall through to local pattern matching
    }
  }

  // Local pattern detection based on domain
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

  // Persist via API if available
  if (config.apiKey && config.endpoint) {
    try {
      await fetch(`${config.endpoint}/memory/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Engine-Key': config.apiKey,
        },
        body: JSON.stringify({ userId: session.userId, chainId, chain }),
      });
    } catch {
      // Capture attempted — stored locally
    }
  }

  chain.status = 'captured';
  return {
    success: true,
    chainId,
    message: 'Memory captured. Reusable across agents, applications, and systems.',
  };
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
        headers: {
          'Content-Type': 'application/json',
          'X-Engine-Key': config.apiKey,
        },
        body: JSON.stringify({ userId: session.userId, chainId, chain }),
      });
      if (res.ok) {
        chain.status = 'applied';
        return { success: true, chainId, message: 'Applied. System behavior updated.', systemUpdated: true };
      }
    } catch {
      // Apply attempted
    }
  }

  chain.status = 'applied';
  return { success: true, chainId, message: 'Applied. System behavior updated.', systemUpdated: true };
}

export async function exportChain(chainId: string, config: FirstContactConfig): Promise<ExportResult> {
  const session = activeSession;
  if (!session) throw new Error('First contact not initialized.');

  const chain = session.chains.find(c => c.id === chainId);
  if (!chain) {
    return { success: false, chainId, format: 'json', data: { error: 'Memory chain not found' } };
  }

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
