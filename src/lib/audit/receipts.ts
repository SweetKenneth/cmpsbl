/**
 * Typed Audit Receipt Schema — Standardized receipt format for Merkle chain
 */

export type ReceiptType =
  | 'module_invoke'
  | 'tier_move'
  | 'breaker_trip'
  | 'cascade_containment'
  | 'evolution_promotion'
  | 'config_change'
  | 'safe_mode_toggle'
  | 'scheduler_dispatch'
  | 'provider_route';

export interface AuditReceipt {
  id: string;
  type: ReceiptType;
  actor: string;               // user_id, 'system', 'governor'
  inputs_hash: string;
  outputs_hash: string;
  policy_version: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  prev_hash: string;           // link to previous receipt in chain
}

/** Compute a simple hash for receipt content */
async function hashContent(content: string): Promise<string> {
  const data = new TextEncoder().encode(content);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Create a typed receipt */
export async function createReceipt(
  type: ReceiptType,
  actor: string,
  inputs: unknown,
  outputs: unknown,
  prevHash: string,
  metadata?: Record<string, unknown>
): Promise<AuditReceipt> {
  const inputsHash = await hashContent(JSON.stringify(inputs));
  const outputsHash = await hashContent(JSON.stringify(outputs));

  return {
    id: crypto.randomUUID(),
    type,
    actor,
    inputs_hash: inputsHash,
    outputs_hash: outputsHash,
    policy_version: '2.0.0',
    timestamp: new Date().toISOString(),
    metadata: metadata ?? {},
    prev_hash: prevHash,
  };
}

/** Compute the hash of a receipt (for chaining) */
export async function hashReceipt(receipt: AuditReceipt): Promise<string> {
  const canonical = JSON.stringify({
    id: receipt.id,
    type: receipt.type,
    inputs_hash: receipt.inputs_hash,
    outputs_hash: receipt.outputs_hash,
    timestamp: receipt.timestamp,
    prev_hash: receipt.prev_hash,
  });
  return hashContent(canonical);
}
