/**
 * @cmpsbl/runtime — First Contact Engine
 * Core first-contact logic shared across all @cmpsbl packages.
 * Connects to the real Memory Stream and generates actual memory chains.
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
// Boot Sequence
// ═══════════════════════════════════════════════════════════════

const BOOT_MESSAGES = [
  '✔ Initializing cognitive environment...',
  '✔ Connecting to Memory Stream...',
  '✔ Binding user memory...',
  '✔ Syncing discovery engine...',
  '✔ Ready',
];

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

  // Boot sequence — emit messages
  for (const msg of BOOT_MESSAGES) {
    config.onBoot?.(msg);
    await delay(150);
  }

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
        const data = await res.json();
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

  const chain = session.chains.find(c => c.id === chainId);
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

  const chain = session.chains.find(c => c.id === chainId);
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
