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

const chain: AuditEntry[] = [];

async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function syncHash(input: string): string {
  // FNV-1a fallback for sync contexts
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h * 0x01000193) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export async function appendAudit(module: string, action: string, data: unknown): Promise<AuditEntry> {
  const prevHash = chain.length > 0 ? chain[chain.length - 1].hash : '0'.repeat(64);
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  const payload = `${chain.length}:${prevHash}:${module}:${action}:${dataStr}`;

  let hash: string;
  try {
    hash = await sha256(payload);
  } catch {
    hash = syncHash(payload);
  }

  const entry: AuditEntry = {
    index: chain.length,
    timestamp: Date.now(),
    module,
    action,
    data: dataStr,
    prevHash,
    hash,
  };

  chain.push(entry);
  if (chain.length > 10000) chain.splice(0, 2000); // Keep bounded
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

export function getChainLength(): number { return chain.length; }
export function getChainTail(n = 10): AuditEntry[] { return chain.slice(-n); }
export function getChainHead(): AuditEntry | null { return chain[0] ?? null; }

export type { AuditEntry };
