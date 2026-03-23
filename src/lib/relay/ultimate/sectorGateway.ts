/**
 * RELAY Ultimate — Sector Gateway
 * Enforces sector-boundary crossing rules.
 * Messages sanitized before cross-sector delivery. Per-boundary policy enforcement.
 */

export type SectorId = 'CORE' | 'SYSTEM' | 'CCR' | 'OCG' | 'EXEC' | 'ESZ' | 'EPZ' | 'EMZ' | 'CSZ' | 'FIELDS' | 'PLANE' | 'SHELL';

export interface BoundaryPolicy {
  id: string;
  sourceSector: SectorId;
  targetSector: SectorId;
  allowed: boolean;
  sanitizeFields: string[];
  requiresCompliance: boolean;
  maxPayloadBytes: number;
  createdAt: number;
}

export interface GatewayCheckResult {
  allowed: boolean;
  reason: string;
  sanitizedFields: string[];
  originalSize: number;
  sanitizedSize: number;
  policyId: string | null;
  checkedAt: number;
}

export interface GatewayStats {
  totalChecks: number;
  allowedChecks: number;
  blockedChecks: number;
  sanitizedFieldsTotal: number;
  policiesActive: number;
}

const MAX_POLICIES = 200;
const MAX_CHECKS = 1000;

const policies = new Map<string, BoundaryPolicy>();
const checks: GatewayCheckResult[] = [];

// Default sensitive fields stripped on cross-sector
const DEFAULT_SANITIZE = ['_secret', '_token', '_key', '_password', '_credential', '_private'];

function boundaryKey(source: SectorId, target: SectorId): string { return `${source}→${target}`; }

export function registerPolicy(
  sourceSector: SectorId, targetSector: SectorId,
  options?: { allowed?: boolean; sanitizeFields?: string[]; requiresCompliance?: boolean; maxPayloadBytes?: number }
): BoundaryPolicy {
  const policy: BoundaryPolicy = {
    id: `pol-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sourceSector, targetSector,
    allowed: options?.allowed ?? true,
    sanitizeFields: options?.sanitizeFields ?? DEFAULT_SANITIZE,
    requiresCompliance: options?.requiresCompliance ?? (sourceSector === 'CSZ' || targetSector === 'OCG'),
    maxPayloadBytes: options?.maxPayloadBytes ?? 102400,
    createdAt: Date.now(),
  };
  if (policies.size >= MAX_POLICIES) {
    const oldest = [...policies.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
    if (oldest) policies.delete(oldest[0]);
  }
  policies.set(boundaryKey(sourceSector, targetSector), policy);
  return policy;
}

export function checkBoundary(
  sourceSector: SectorId, targetSector: SectorId, payload: Record<string, unknown>
): { result: GatewayCheckResult; sanitizedPayload: Record<string, unknown> } {
  const key = boundaryKey(sourceSector, targetSector);
  const policy = policies.get(key);

  const serialized = JSON.stringify(payload);
  const originalSize = serialized.length;

  // Same sector = always allowed, no sanitization
  if (sourceSector === targetSector) {
    const result: GatewayCheckResult = {
      allowed: true, reason: 'Same sector — no boundary crossing',
      sanitizedFields: [], originalSize, sanitizedSize: originalSize,
      policyId: null, checkedAt: Date.now(),
    };
    if (checks.length >= MAX_CHECKS) checks.shift();
    checks.push(result);
    return { result, sanitizedPayload: payload };
  }

  // No policy = use defaults
  const sanitizeFields = policy?.sanitizeFields ?? DEFAULT_SANITIZE;
  const allowed = policy?.allowed ?? true;
  const maxPayload = policy?.maxPayloadBytes ?? 102400;

  if (!allowed) {
    const result: GatewayCheckResult = {
      allowed: false, reason: `Policy blocks ${sourceSector}→${targetSector}`,
      sanitizedFields: [], originalSize, sanitizedSize: 0,
      policyId: policy?.id ?? null, checkedAt: Date.now(),
    };
    if (checks.length >= MAX_CHECKS) checks.shift();
    checks.push(result);
    return { result, sanitizedPayload: {} };
  }

  if (originalSize > maxPayload) {
    const result: GatewayCheckResult = {
      allowed: false, reason: `Payload ${originalSize}B exceeds ${maxPayload}B limit`,
      sanitizedFields: [], originalSize, sanitizedSize: 0,
      policyId: policy?.id ?? null, checkedAt: Date.now(),
    };
    if (checks.length >= MAX_CHECKS) checks.shift();
    checks.push(result);
    return { result, sanitizedPayload: {} };
  }

  // Sanitize
  const sanitized = { ...payload };
  const removed: string[] = [];
  for (const key of Object.keys(sanitized)) {
    if (sanitizeFields.some(f => key.toLowerCase().includes(f.replace('_', '')))) {
      delete sanitized[key];
      removed.push(key);
    }
  }

  const sanitizedSize = JSON.stringify(sanitized).length;
  const result: GatewayCheckResult = {
    allowed: true,
    reason: removed.length > 0 ? `Allowed with ${removed.length} fields sanitized` : 'Allowed — clean payload',
    sanitizedFields: removed, originalSize, sanitizedSize,
    policyId: policy?.id ?? null, checkedAt: Date.now(),
  };
  if (checks.length >= MAX_CHECKS) checks.shift();
  checks.push(result);
  return { result, sanitizedPayload: sanitized };
}

export function getGatewayStats(): GatewayStats {
  return {
    totalChecks: checks.length,
    allowedChecks: checks.filter(c => c.allowed).length,
    blockedChecks: checks.filter(c => !c.allowed).length,
    sanitizedFieldsTotal: checks.reduce((s, c) => s + c.sanitizedFields.length, 0),
    policiesActive: policies.size,
  };
}

export function resetGatewayState(): void { policies.clear(); checks.length = 0; }
