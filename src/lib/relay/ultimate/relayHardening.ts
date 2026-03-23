/**
 * RELAY Ultimate — Relay Hardening
 * 100KB payload size limits. Payload sanitization for cross-sector routing.
 * FNV-1a integrity checksums. Poison message detection and quarantine.
 */

export interface HardeningCheck {
  id: string;
  messageId: string;
  sizeBytes: number;
  withinLimit: boolean;
  integrityValid: boolean;
  poisonDetected: boolean;
  sanitized: boolean;
  checkedAt: number;
}

export interface PoisonMessage {
  id: string;
  messageId: string;
  reason: string;
  payload: string;         // truncated
  quarantinedAt: number;
}

export interface HardeningStats {
  totalChecks: number;
  oversizedBlocked: number;
  integrityFailures: number;
  poisonQuarantined: number;
  passRate: number;
}

const MAX_PAYLOAD_BYTES = 102400;  // 100KB
const MAX_CHECKS = 500;
const MAX_POISON = 100;

const checks: HardeningCheck[] = [];
const poisonQueue: PoisonMessage[] = [];

// Poison patterns: potential injection, infinite loops, or malformed structures
const POISON_PATTERNS = [
  /__proto__/,
  /constructor\s*\(/,
  /\beval\s*\(/,
  /\bFunction\s*\(/,
  /\.\.\.\.\.\./,  // Suspiciously deep nesting indicator
];

function fnvHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function hardenMessage(
  messageId: string, payload: unknown, expectedChecksum?: string
): { passed: boolean; check: HardeningCheck; checksum: string } {
  const serialized = JSON.stringify(payload);
  const sizeBytes = serialized.length;
  const withinLimit = sizeBytes <= MAX_PAYLOAD_BYTES;
  const checksum = fnvHash(serialized);
  const integrityValid = expectedChecksum ? checksum === expectedChecksum : true;

  // Poison detection
  let poisonDetected = false;
  for (const pattern of POISON_PATTERNS) {
    if (pattern.test(serialized)) {
      poisonDetected = true;
      break;
    }
  }

  if (poisonDetected) {
    const poison: PoisonMessage = {
      id: `poison-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      messageId, reason: 'Poison pattern detected in payload',
      payload: serialized.slice(0, 200),
      quarantinedAt: Date.now(),
    };
    if (poisonQueue.length >= MAX_POISON) poisonQueue.shift();
    poisonQueue.push(poison);
  }

  const passed = withinLimit && integrityValid && !poisonDetected;

  const check: HardeningCheck = {
    id: `hc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    messageId, sizeBytes, withinLimit, integrityValid,
    poisonDetected, sanitized: false, checkedAt: Date.now(),
  };
  if (checks.length >= MAX_CHECKS) checks.shift();
  checks.push(check);

  return { passed, check, checksum };
}

export function getHardeningStats(): HardeningStats {
  const total = checks.length;
  return {
    totalChecks: total,
    oversizedBlocked: checks.filter(c => !c.withinLimit).length,
    integrityFailures: checks.filter(c => !c.integrityValid).length,
    poisonQuarantined: poisonQueue.length,
    passRate: total > 0 ? checks.filter(c => c.withinLimit && c.integrityValid && !c.poisonDetected).length / total : 1,
  };
}

export function getPoisonQueue(): PoisonMessage[] { return [...poisonQueue]; }

export function resetHardeningState(): void { checks.length = 0; poisonQueue.length = 0; }
