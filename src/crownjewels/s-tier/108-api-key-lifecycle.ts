/**
 * S-Tier 108 — API Key Lifecycle Manager
 * ID: S-132 | CJPI: 89 | Module: ACCESS
 * 
 * Full lifecycle management for API keys including rotation, revocation, and auditing.
 */

export interface APIKey {
  id: string;
  prefix: string;
  hash: string;
  name: string;
  ownerId: string;
  scopes: string[];
  status: 'active' | 'expired' | 'revoked' | 'rotating';
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  rotationSchedule?: number; // days
  previousKeyId?: string;
}

export interface KeyAuditEntry {
  keyId: string;
  action: 'created' | 'used' | 'rotated' | 'revoked' | 'expired';
  timestamp: string;
  metadata: Record<string, unknown>;
}

export class APIKeyLifecycleManager {
  private keys: Map<string, APIKey> = new Map();
  private auditLog: KeyAuditEntry[] = [];

  create(opts: { name: string; ownerId: string; scopes: string[]; expiresInDays?: number; rotationDays?: number }): APIKey {
    const id = crypto.randomUUID();
    const prefix = `sk_${id.slice(0, 8)}`;
    const key: APIKey = {
      id,
      prefix,
      hash: `hash_${id}`, // In production, use proper hashing
      name: opts.name,
      ownerId: opts.ownerId,
      scopes: opts.scopes,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: opts.expiresInDays
        ? new Date(Date.now() + opts.expiresInDays * 86400000).toISOString()
        : null,
      lastUsedAt: null,
      rotationSchedule: opts.rotationDays,
    };

    this.keys.set(id, key);
    this.audit(id, 'created', { scopes: opts.scopes });
    return key;
  }

  validate(keyId: string): { valid: boolean; reason?: string } {
    const key = this.keys.get(keyId);
    if (!key) return { valid: false, reason: 'Key not found' };
    if (key.status !== 'active') return { valid: false, reason: `Key is ${key.status}` };
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      key.status = 'expired';
      this.audit(keyId, 'expired', {});
      return { valid: false, reason: 'Key expired' };
    }
    key.lastUsedAt = new Date().toISOString();
    this.audit(keyId, 'used', {});
    return { valid: true };
  }

  rotate(keyId: string): APIKey | null {
    const oldKey = this.keys.get(keyId);
    if (!oldKey) return null;

    oldKey.status = 'rotating';
    const newKey = this.create({
      name: oldKey.name,
      ownerId: oldKey.ownerId,
      scopes: oldKey.scopes,
      expiresInDays: oldKey.expiresAt
        ? Math.ceil((new Date(oldKey.expiresAt).getTime() - Date.now()) / 86400000)
        : undefined,
      rotationDays: oldKey.rotationSchedule,
    });

    newKey.previousKeyId = oldKey.id;
    this.revoke(keyId);
    this.audit(newKey.id, 'rotated', { previousKeyId: keyId });
    return newKey;
  }

  revoke(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (!key) return false;
    key.status = 'revoked';
    this.audit(keyId, 'revoked', {});
    return true;
  }

  list(ownerId: string): APIKey[] {
    return [...this.keys.values()].filter(k => k.ownerId === ownerId);
  }

  getAuditLog(keyId?: string): KeyAuditEntry[] {
    return keyId ? this.auditLog.filter(e => e.keyId === keyId) : [...this.auditLog];
  }

  private audit(keyId: string, action: KeyAuditEntry['action'], metadata: Record<string, unknown>): void {
    this.auditLog.push({ keyId, action, timestamp: new Date().toISOString(), metadata });
  }
}
