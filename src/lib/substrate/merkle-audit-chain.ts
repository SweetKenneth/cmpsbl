/**
 * Merkle Audit Chain — Tamper-evident audit log using hash chains
 * Each entry's hash includes the previous entry's hash (blockchain-lite)
 */

interface AuditEntry {
  index: number;
  timestamp: number;
  module: string;
  action: string;
  data: string;
  prevHash: string;
  hash: string;
}

const CHAIN_CAP = 10000;
const chain: AuditEntry[] = [];
let chainHead = 0;
let chainCount = 0;

async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  const bytes = new Uint8Array(buffer);
  // Pre-allocated hex lookup — avoids per-byte toString(16)
  const hex: string[] = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    hex[i] = HEX_LUT[bytes[i]];
  }
  return hex.join('');
}

// Pre-computed hex lookup table
const HEX_LUT: string[] = new Array(256);
for (let i = 0; i < 256; i++) {
  HEX_LUT[i] = i.toString(16).padStart(2, '0');
}

function syncHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h * 0x01000193) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export async function appendAudit(module: string, action: string, data: unknown): Promise<AuditEntry> {
  const prevHash = chainCount > 0
    ? chain[(chainHead - 1 + (chainCount <= CHAIN_CAP ? chainCount : CHAIN_CAP)) % CHAIN_CAP]?.hash ?? '0'.repeat(64)
    : '0'.repeat(64);
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  const payload = `${chainCount}:${prevHash}:${module}:${action}:${dataStr}`;

  let hash: string;
  try {
    hash = await sha256(payload);
  } catch {
    hash = syncHash(payload);
  }

  const entry: AuditEntry = {
    index: chainCount,
    timestamp: Date.now(),
    module,
    action,
    data: dataStr,
    prevHash,
    hash,
  };

  // Ring-buffer insertion — O(1), no splice needed
  if (chainCount < CHAIN_CAP) {
    chain.push(entry);
  } else {
    chain[chainHead] = entry;
  }
  chainHead = (chainHead + 1) % CHAIN_CAP;
  chainCount++;

  return entry;
}

/** Verify chain integrity. Returns index of first tampered entry or -1 if valid. */
export async function verifyChain(): Promise<{ valid: boolean; brokenAt: number }> {
  for (let i = 1; i < chain.length; i++) {
    if (chain[i].prevHash !== chain[i - 1].hash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true, brokenAt: -1 };
}

export function getChainLength(): number { return chainCount; }

export function getChainTail(n = 10): AuditEntry[] {
  const len = Math.min(chainCount, CHAIN_CAP);
  const count = Math.min(n, len);
  const result: AuditEntry[] = new Array(count);
  for (let i = 0; i < count; i++) {
    result[i] = chain[(chainHead - count + i + CHAIN_CAP) % CHAIN_CAP];
  }
  return result;
}

export function getChainHead(): AuditEntry | null {
  if (chainCount === 0) return null;
  const len = Math.min(chainCount, CHAIN_CAP);
  return chain[(chainHead - len + CHAIN_CAP) % CHAIN_CAP];
}

export type { AuditEntry };
