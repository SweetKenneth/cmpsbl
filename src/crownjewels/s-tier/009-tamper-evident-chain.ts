/**
 * S-Tier Crown Jewel #9 — AUDIT Tamper-Evident Chain
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 9 | CJPI: 95 | Version: 1.0.0
 * Module: AUDIT | Type: Architecture
 * Signature: 2b3f5918
 * Generated: 2026-03-01T00:00:00.000Z
 */

interface AuditEntry { index: number; actor: string; action: string; resource: string; payload?: Record<string, unknown>; timestamp: number; payloadHash: string; previousHash: string; entryHash: string; }
interface VerificationResult { valid: boolean; totalEntries: number; brokenAtIndex?: number; error?: string; }

export function createAuditChain() {
  const chain: AuditEntry[] = [];

  function hash(input: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  }

  function hashEntry(actor: string, action: string, resource: string, payload: string, timestamp: number, previousHash: string): string {
    return hash(`${previousHash}|${actor}|${action}|${resource}|${payload}|${timestamp}`);
  }

  function append(params: { actor: string; action: string; resource: string; payload?: Record<string, unknown> }): AuditEntry {
    const timestamp = Date.now();
    const payloadStr = params.payload ? JSON.stringify(params.payload) : '';
    const payloadHash = hash(payloadStr);
    const previousHash = chain.length > 0 ? chain[chain.length - 1].entryHash : '00000000';
    const entryHash = hashEntry(params.actor, params.action, params.resource, payloadStr, timestamp, previousHash);
    const entry: AuditEntry = { index: chain.length, actor: params.actor, action: params.action, resource: params.resource, payload: params.payload, timestamp, payloadHash, previousHash, entryHash };
    chain.push(entry);
    return entry;
  }

  function verify(): VerificationResult {
    if (chain.length === 0) return { valid: true, totalEntries: 0 };
    for (let i = 0; i < chain.length; i++) {
      const entry = chain[i];
      const expectedPrev = i === 0 ? '00000000' : chain[i - 1].entryHash;
      if (entry.previousHash !== expectedPrev) return { valid: false, totalEntries: chain.length, brokenAtIndex: i, error: `Previous hash mismatch at ${i}` };
      const payloadStr = entry.payload ? JSON.stringify(entry.payload) : '';
      const computed = hashEntry(entry.actor, entry.action, entry.resource, payloadStr, entry.timestamp, entry.previousHash);
      if (entry.entryHash !== computed) return { valid: false, totalEntries: chain.length, brokenAtIndex: i, error: `Entry hash mismatch at ${i}` };
    }
    return { valid: true, totalEntries: chain.length };
  }

  function query(params?: { actor?: string; action?: string; since?: number; limit?: number }): AuditEntry[] {
    let results = [...chain];
    if (params?.actor) results = results.filter(e => e.actor === params.actor);
    if (params?.action) results = results.filter(e => e.action === params.action);
    if (params?.since) results = results.filter(e => e.timestamp >= params.since!);
    if (params?.limit) results = results.slice(-params.limit);
    return results;
  }

  function getMerkleRoot(): string {
    if (chain.length === 0) return '00000000';
    let level = chain.map(e => e.entryHash);
    while (level.length > 1) { const next: string[] = []; for (let i = 0; i < level.length; i += 2) { next.push(hash(level[i] + (level[i + 1] ?? level[i]))); } level = next; }
    return level[0];
  }

  return { append, verify, query, getMerkleRoot, exportChain: () => [...chain], get length() { return chain.length; }, get lastEntry() { return chain.at(-1); } };
}
