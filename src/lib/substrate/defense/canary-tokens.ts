/**
 * DEFENSE — Canary Token System v1.0.0
 * Data-level decoys that trigger alerts on unauthorized use.
 *
 * Types:
 *  - Decoy API keys (fake credentials)
 *  - Canary database records
 *  - Honey credentials (fake passwords)
 *  - Trap URLs (link canaries)
 *  - DNS canaries
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type CanaryType = 'api_key' | 'credential' | 'url' | 'dns' | 'database_record' | 'file' | 'email';

export interface CanaryToken {
  readonly id: string;
  readonly type: CanaryType;
  readonly value: string;             // The decoy value (redacted for display)
  readonly valueHash: number;         // FNV-1a hash for matching
  readonly description: string;
  readonly createdAt: number;
  readonly triggeredCount: number;
  readonly lastTriggered: number | null;
  readonly active: boolean;
  readonly metadata: Record<string, string>;
}

export interface CanaryTriggerEvent {
  readonly tokenId: string;
  readonly type: CanaryType;
  readonly triggerContext: string;     // Where it was used
  readonly actorId: string | null;
  readonly timestamp: number;
  readonly severity: 'critical' | 'high';
  readonly description: string;
}

export interface CanarySystemStats {
  readonly totalTokens: number;
  readonly activeTokens: number;
  readonly totalTriggers: number;
  readonly tokensByType: Record<CanaryType, number>;
  readonly lastTrigger: number | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_TOKENS = 200;
const MAX_TRIGGERS = 500;

const canaryTokens = new Map<string, CanaryToken & { triggeredCount: number; lastTriggered: number | null }>();
const triggerLog: CanaryTriggerEvent[] = [];
const triggerListeners = new Set<(event: CanaryTriggerEvent) => void>();
let tokenSeq = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// HASHING
// ═══════════════════════════════════════════════════════════════════════════════

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

const PREFIXES: Record<CanaryType, string> = {
  api_key: 'sk_live_CANARY_',
  credential: 'admin:',
  url: 'https://canary.internal/',
  dns: 'canary.',
  database_record: 'CANARY_RECORD_',
  file: '/var/secrets/.canary_',
  email: 'canary-trap-',
};

function generateCanaryValue(type: CanaryType): string {
  const rand = Math.random().toString(36).slice(2, 14);
  const prefix = PREFIXES[type] || 'CANARY_';
  return `${prefix}${rand}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Plant a new canary token.
 */
export function plantCanary(
  type: CanaryType,
  description: string,
  customValue?: string,
  metadata: Record<string, string> = {},
): CanaryToken {
  const value = customValue || generateCanaryValue(type);
  const id = `CANARY-${(++tokenSeq).toString(36).padStart(4, '0')}`;

  const token: CanaryToken & { triggeredCount: number; lastTriggered: number | null } = {
    id,
    type,
    value: value.slice(0, 6) + '••••••' + value.slice(-4),  // Partially redacted
    valueHash: fnv1a(value),
    description,
    createdAt: Date.now(),
    triggeredCount: 0,
    lastTriggered: null,
    active: true,
    metadata,
  };

  canaryTokens.set(id, token);

  // Also index by hash for fast scanning
  hashIndex.set(token.valueHash, id);

  // Evict if over cap
  if (canaryTokens.size > MAX_TOKENS) {
    const oldest = canaryTokens.keys().next().value;
    if (oldest) {
      const old = canaryTokens.get(oldest);
      if (old) hashIndex.delete(old.valueHash);
      canaryTokens.delete(oldest);
    }
  }

  return token;
}

/** Hash → token ID index */
const hashIndex = new Map<number, string>();

/**
 * Scan an input string for canary token usage.
 * Returns triggered canaries.
 */
export function scanForCanaries(
  input: string,
  actorId: string | null = null,
  context = 'unknown',
): readonly CanaryTriggerEvent[] {
  const triggered: CanaryTriggerEvent[] = [];
  if (!input || input.length < 6) return triggered;

  // Compute rolling hashes across the input
  // For efficiency, check substrings of common canary lengths
  const inputHash = fnv1a(input);

  for (const [id, token] of canaryTokens) {
    if (!token.active) continue;

    // Quick hash check: check if the full input or common substrings match
    if (inputHash === token.valueHash || input.includes(PREFIXES[token.type])) {
      // Deep scan: check all windows
      const found = scanWindow(input, token.valueHash);
      if (found) {
        token.triggeredCount++;
        token.lastTriggered = Date.now();

        const event: CanaryTriggerEvent = Object.freeze({
          tokenId: id,
          type: token.type,
          triggerContext: context.slice(0, 100),
          actorId,
          timestamp: Date.now(),
          severity: token.type === 'api_key' || token.type === 'credential' ? 'critical' : 'high',
          description: `Canary token triggered: ${token.description}`,
        });

        triggered.push(event);
        triggerLog.push(event);

        // Notify listeners
        for (const listener of triggerListeners) {
          try { listener(event); } catch { /* swallow */ }
        }
      }
    }
  }

  // Trim trigger log
  if (triggerLog.length > MAX_TRIGGERS) {
    triggerLog.splice(0, triggerLog.length - MAX_TRIGGERS);
  }

  return Object.freeze(triggered);
}

/**
 * Scan input using sliding hash window.
 */
function scanWindow(input: string, targetHash: number): boolean {
  // Check various window sizes (10-50 chars)
  for (let windowSize = 10; windowSize <= Math.min(50, input.length); windowSize += 5) {
    for (let i = 0; i <= input.length - windowSize; i += 3) {
      if (fnv1a(input.slice(i, i + windowSize)) === targetHash) return true;
    }
  }
  return false;
}

/**
 * Subscribe to canary trigger events.
 */
export function onCanaryTrigger(listener: (event: CanaryTriggerEvent) => void): () => void {
  triggerListeners.add(listener);
  return () => { triggerListeners.delete(listener); };
}

/**
 * Deactivate a canary token.
 */
export function deactivateCanary(tokenId: string): boolean {
  const token = canaryTokens.get(tokenId);
  if (!token) return false;
  // Replace with inactive version
  canaryTokens.set(tokenId, { ...token, active: false });
  return true;
}

/**
 * Get all planted canary tokens (redacted values).
 */
export function getCanaryTokens(): readonly CanaryToken[] {
  return Object.freeze(Array.from(canaryTokens.values()));
}

/**
 * Get recent trigger events.
 */
export function getCanaryTriggers(limit = 20): readonly CanaryTriggerEvent[] {
  const start = Math.max(0, triggerLog.length - limit);
  return Object.freeze(triggerLog.slice(start).reverse());
}

/**
 * Get canary system stats.
 */
export function getCanaryStats(): CanarySystemStats {
  const byType: Record<string, number> = {};
  let active = 0;
  for (const t of canaryTokens.values()) {
    byType[t.type] = (byType[t.type] || 0) + 1;
    if (t.active) active++;
  }

  return {
    totalTokens: canaryTokens.size,
    activeTokens: active,
    totalTriggers: triggerLog.length,
    tokensByType: byType as Record<CanaryType, number>,
    lastTrigger: triggerLog.length > 0 ? triggerLog[triggerLog.length - 1].timestamp : null,
  };
}

/**
 * Plant default canary set for bootstrap.
 */
export function plantDefaultCanaries(): readonly CanaryToken[] {
  const defaults: Array<{ type: CanaryType; desc: string }> = [
    { type: 'api_key', desc: 'Decoy API key in env' },
    { type: 'api_key', desc: 'Decoy Stripe key' },
    { type: 'credential', desc: 'Decoy admin credential' },
    { type: 'credential', desc: 'Decoy database password' },
    { type: 'url', desc: 'Internal canary endpoint' },
    { type: 'dns', desc: 'DNS exfiltration canary' },
    { type: 'database_record', desc: 'Canary user record' },
    { type: 'file', desc: 'Decoy secrets file' },
    { type: 'email', desc: 'Canary email address' },
    { type: 'api_key', desc: 'Decoy AWS key' },
  ];

  return defaults.map(d => plantCanary(d.type, d.desc));
}
