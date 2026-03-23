/**
 * NERVE Ultimate — Signal Correlation Engine
 * Reconstructs causal signal chains: request → response → side-effect.
 * Links related signals by idempotency key, temporal proximity, and type patterns.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CorrelatedSignal {
  signalId: string;
  from: string;
  to: string;
  type: string;
  timestamp: number;
  role: 'initiator' | 'response' | 'side_effect' | 'cascade';
}

export interface SignalChain {
  chainId: string;
  initiator: CorrelatedSignal;
  signals: CorrelatedSignal[];
  chainLength: number;
  durationMs: number;
  complete: boolean;
  createdAt: number;
}

export interface CorrelationRule {
  id: string;
  pattern: {
    initiatorType: string;
    responseTypes: string[];
    sideEffectTypes?: string[];
  };
  maxChainDurationMs: number;
}

interface PendingSignal {
  signalId: string;
  from: string;
  to: string;
  type: string;
  timestamp: number;
  idempotencyKey?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CHAIN_WINDOW_MS = 10_000;
const MAX_CHAINS = 1_000;
const MAX_PENDING = 2_000;

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const chains = new Map<string, SignalChain>();
const pendingSignals: PendingSignal[] = [];
const rules: CorrelationRule[] = [];
let chainCounter = 0;

// ═══════════════════════════════════════════════════════════════
// DEFAULT RULES
// ═══════════════════════════════════════════════════════════════

const DEFAULT_RULES: CorrelationRule[] = [
  {
    id: 'request-response',
    pattern: { initiatorType: 'request', responseTypes: ['response', 'ack'] },
    maxChainDurationMs: 5_000,
  },
  {
    id: 'health-cascade',
    pattern: {
      initiatorType: 'NODE_OFFLINE',
      responseTypes: ['circuit_open', 'failover'],
      sideEffectTypes: ['rebalance', 'NODE_ONLINE'],
    },
    maxChainDurationMs: 30_000,
  },
  {
    id: 'config-propagation',
    pattern: {
      initiatorType: 'config_change',
      responseTypes: ['config_ack'],
      sideEffectTypes: ['restart', 'reconfigure'],
    },
    maxChainDurationMs: 15_000,
  },
];

// Initialize with defaults
rules.push(...DEFAULT_RULES);

// ═══════════════════════════════════════════════════════════════
// CORE API
// ═══════════════════════════════════════════════════════════════

/** Ingest a signal for correlation analysis */
export function ingestSignal(
  signalId: string,
  from: string,
  to: string,
  type: string,
  idempotencyKey?: string,
): SignalChain | null {
  const now = Date.now();
  const signal: PendingSignal = { signalId, from, to, type, timestamp: now, idempotencyKey };

  // Try to attach to existing chain via idempotency key
  if (idempotencyKey) {
    for (const chain of chains.values()) {
      if (!chain.complete) {
        const hasKey = chain.signals.some(s => {
          const pending = pendingSignals.find(p => p.signalId === s.signalId);
          return pending?.idempotencyKey === idempotencyKey;
        });
        if (hasKey) {
          return attachToChain(chain, signal, 'response');
        }
      }
    }
  }

  // Try to match against correlation rules
  for (const rule of rules) {
    // Check if this is a response to an existing chain
    for (const chain of chains.values()) {
      if (chain.complete) continue;
      if ((now - chain.createdAt) > rule.maxChainDurationMs) continue;

      if (chain.initiator.type === rule.pattern.initiatorType) {
        if (rule.pattern.responseTypes.includes(type)) {
          return attachToChain(chain, signal, 'response');
        }
        if (rule.pattern.sideEffectTypes?.includes(type)) {
          return attachToChain(chain, signal, 'side_effect');
        }
      }
    }

    // Check if this is a new chain initiator
    if (type === rule.pattern.initiatorType) {
      return createChain(signal);
    }
  }

  // Track as pending for future correlation
  pendingSignals.push(signal);
  if (pendingSignals.length > MAX_PENDING) {
    pendingSignals.splice(0, pendingSignals.length - MAX_PENDING);
  }

  return null;
}

function createChain(signal: PendingSignal): SignalChain {
  const correlated: CorrelatedSignal = {
    signalId: signal.signalId,
    from: signal.from,
    to: signal.to,
    type: signal.type,
    timestamp: signal.timestamp,
    role: 'initiator',
  };

  const chain: SignalChain = {
    chainId: `chain-${++chainCounter}-${Date.now()}`,
    initiator: correlated,
    signals: [correlated],
    chainLength: 1,
    durationMs: 0,
    complete: false,
    createdAt: signal.timestamp,
  };

  chains.set(chain.chainId, chain);

  // Enforce max chains
  if (chains.size > MAX_CHAINS) {
    const oldest = Array.from(chains.keys())[0];
    chains.delete(oldest);
  }

  return chain;
}

function attachToChain(
  chain: SignalChain,
  signal: PendingSignal,
  role: CorrelatedSignal['role'],
): SignalChain {
  const correlated: CorrelatedSignal = {
    signalId: signal.signalId,
    from: signal.from,
    to: signal.to,
    type: signal.type,
    timestamp: signal.timestamp,
    role,
  };

  chain.signals.push(correlated);
  chain.chainLength = chain.signals.length;
  chain.durationMs = signal.timestamp - chain.createdAt;

  return chain;
}

/** Mark a chain as complete */
export function completeChain(chainId: string): boolean {
  const chain = chains.get(chainId);
  if (!chain) return false;
  chain.complete = true;
  return true;
}

/** Get a specific chain */
export function getChain(chainId: string): SignalChain | null {
  return chains.get(chainId) ?? null;
}

/** Get all active (incomplete) chains */
export function getActiveChains(): SignalChain[] {
  return Array.from(chains.values()).filter(c => !c.complete);
}

/** Get all chains for a signal source */
export function getChainsForNode(nodeId: string): SignalChain[] {
  return Array.from(chains.values()).filter(c =>
    c.signals.some(s => s.from === nodeId || s.to === nodeId)
  );
}

/** Register a custom correlation rule */
export function addCorrelationRule(rule: CorrelationRule): void {
  rules.push(rule);
}

/** Get correlation statistics */
export function getCorrelationStats(): {
  totalChains: number;
  activeChains: number;
  completedChains: number;
  avgChainLength: number;
  ruleCount: number;
} {
  const all = Array.from(chains.values());
  const active = all.filter(c => !c.complete);
  const avgLen = all.length > 0
    ? all.reduce((sum, c) => sum + c.chainLength, 0) / all.length
    : 0;

  return {
    totalChains: all.length,
    activeChains: active.length,
    completedChains: all.length - active.length,
    avgChainLength: Math.round(avgLen * 10) / 10,
    ruleCount: rules.length,
  };
}
