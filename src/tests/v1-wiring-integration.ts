/**
 * V1 Wiring Integration Tests — Post-Patch Corrections
 * Verifies: Engine ↔ Fingerprint Gate ↔ Audit Chain ↔ Safe Detach
 * 
 * Updated for:
 * #1: Identity enforcement (scan required)
 * #2: Trust staging (candidate vs trusted)
 * #5: Session-scoped boundaries
 * #6: Single detach authority
 * #7: Structured audit semantics
 */

// ── Test Harness ──
let passed = 0;
let failed = 0;
const results: Array<{ name: string; pass: boolean; detail: string }> = [];

function assert(condition: boolean, name: string, detail = ''): void {
  if (condition) {
    passed++;
    results.push({ name, pass: true, detail });
  } else {
    failed++;
    results.push({ name, pass: false, detail: detail || 'Assertion failed' });
  }
}

// ══════════════════════════════════════════════════════════════
// Imports
// ══════════════════════════════════════════════════════════════

import { configure, attach, detach, reset, getState, scan } from '../lib/mana/engine';
import { createSession } from '../lib/mana/session';
import { registerFingerprint, resetFingerprintGate, computeCanonicalFingerprint, getTrustState } from '../core/boot/fingerprintGate';
import { getAuditLog, resetAuditChain, verifyChainIntegrity } from '../core/audit/auditChain';
import { resetSafeDetach } from '../lib/mana/detach-safe';
import { resetLex } from '../lib/mana/lex';

function fullReset(): void {
  reset();
  resetFingerprintGate();
  resetAuditChain();
  resetSafeDetach();
  resetLex();
}

// ══════════════════════════════════════════════════════════════
// TEST 1: Attach records fingerprint verification to audit chain
// ══════════════════════════════════════════════════════════════

async function test1_attachRecordsFingerprint(): Promise<void> {
  fullReset();
  configure({ telemetry: true, lexMode: 'permissive' });

  const hostModule = {
    processPayment: (amount: number) => amount * 1.1,
    validateInput: (input: string) => input.length > 0,
  };

  // #1: Must scan to establish identity before attach
  scan(hostModule as unknown as Record<string, unknown>, 'test-pkg', '1.0.0');

  await attach(
    hostModule as unknown as Record<string, unknown>,
    [{ functionName: 'processPayment', capability: 'defense_gate' as const }],
    'test-source-code',
  );

  const auditLog = getAuditLog();
  const fpEvent = auditLog.find(e => e.eventType === 'fingerprint_verify');
  assert(fpEvent !== undefined, 'W1: Fingerprint verification recorded in audit chain');
  assert(fpEvent?.source === 'mana.engine', 'W1: Audit source is mana.engine');
  // #7: Structured audit fields
  assert(fpEvent?.phase === 'boot', 'W1: Audit phase is boot');

  const attachEvent = auditLog.find(e => e.eventType === 'attach_complete');
  assert(attachEvent !== undefined, 'W1: Attach completion recorded in audit chain');
  assert(attachEvent?.decision === 'success', 'W1: Attach decision is success');
  assert(attachEvent?.phase === 'attachment', 'W1: Attach phase is attachment');
}

// ══════════════════════════════════════════════════════════════
// TEST 2: Invalid fingerprint blocks attachment
// ══════════════════════════════════════════════════════════════

async function test2_invalidFingerprintBlocks(): Promise<void> {
  fullReset();
  configure({ telemetry: true, lexMode: 'permissive' });

  const goodModule = {
    processPayment: () => 42,
    validateInput: () => true,
  };

  // Register a known-good fingerprint with real identity
  const fp = computeCanonicalFingerprint(
    goodModule as unknown as Record<string, unknown>,
    'payments', '1.0.0',
  );
  registerFingerprint('payments', fp);

  // Create a tampered module (different structure)
  const tamperedModule = {
    processPayment: () => 42,
    validateInput: () => true,
    hackedFunction: () => 'pwned',
  };

  // Must scan with same package name
  scan(tamperedModule as unknown as Record<string, unknown>, 'payments', '1.0.0');

  let blocked = false;
  try {
    await attach(
      tamperedModule as unknown as Record<string, unknown>,
      [{ functionName: 'processPayment', capability: 'defense_gate' as const }],
      'tampered-source',
    );
  } catch (err) {
    blocked = (err as Error).message.includes('FINGERPRINT');
  }

  assert(blocked, 'W2: Invalid fingerprint blocks attachment');

  const auditLog = getAuditLog();
  const fpEvent = auditLog.find(e => e.eventType === 'fingerprint_verify');
  assert(fpEvent?.decision === 'invalid' || fpEvent?.decision === 'suspect', 'W2: Audit records invalid/suspect verdict');
}

// ══════════════════════════════════════════════════════════════
// TEST 3: Detach uses safe detach protocol + records audit
// ══════════════════════════════════════════════════════════════

async function test3_detachUsesSafeProtocol(): Promise<void> {
  fullReset();
  configure({ telemetry: true, lexMode: 'permissive' });

  const hostModule = {
    processPayment: (amount: number) => amount * 1.1,
  };

  scan(hostModule as unknown as Record<string, unknown>, 'pay-pkg', '1.0.0');

  await attach(
    hostModule as unknown as Record<string, unknown>,
    [{ functionName: 'processPayment', capability: 'beacon_telemetry' as const }],
    'test-source',
  );

  assert(getState() === 'symbiotic', 'W3: State is symbiotic after attach');

  await detach(hostModule as unknown as Record<string, unknown>);

  assert(getState() === 'detached', 'W3: State is detached after detach');

  // #7: Verify structured audit
  const auditLog = getAuditLog();
  const detachStart = auditLog.find(e => e.eventType === 'detach_start');
  const detachComplete = auditLog.find(e => e.eventType === 'detach_complete');
  assert(detachStart !== undefined, 'W3: Detach start recorded in audit');
  assert(detachComplete !== undefined, 'W3: Detach complete recorded in audit');
  assert(detachComplete?.phase === 'detachment', 'W3: Detach phase is detachment');

  const result = (hostModule as unknown as Record<string, unknown>).processPayment;
  assert(typeof result === 'function', 'W3: Function restored after detach');
}

// ══════════════════════════════════════════════════════════════
// TEST 4: Full audit chain integrity after attach/detach cycle
// ══════════════════════════════════════════════════════════════

async function test4_auditChainIntegrityAfterCycle(): Promise<void> {
  fullReset();
  configure({ telemetry: true, lexMode: 'permissive' });

  const hostModule = {
    fn1: () => 'a',
    fn2: () => 'b',
  };

  scan(hostModule as unknown as Record<string, unknown>, 'integrity-pkg', '1.0.0');

  await attach(
    hostModule as unknown as Record<string, unknown>,
    [
      { functionName: 'fn1', capability: 'defense_gate' as const },
      { functionName: 'fn2', capability: 'beacon_telemetry' as const },
    ],
    'test-source',
  );

  await detach(hostModule as unknown as Record<string, unknown>);

  const integrity = verifyChainIntegrity();
  assert(integrity.valid, 'W4: Audit chain integrity valid after full cycle', integrity.brokenReason ?? '');
  assert(integrity.totalEntries >= 4, 'W4: At least 4 audit entries', `entries=${integrity.totalEntries}`);
}

// ══════════════════════════════════════════════════════════════
// TEST 5: Session-scoped engine uses all V1 integrations
// ══════════════════════════════════════════════════════════════

async function test5_sessionUsesV1Integrations(): Promise<void> {
  fullReset();

  const session = createSession('test-session');
  session.configure({ telemetry: true, lexMode: 'permissive' });

  const hostModule = {
    doWork: () => 'result',
  };

  // #1: scan establishes identity
  session.scan(hostModule as unknown as Record<string, unknown>, 'session-pkg', '1.0.0');

  await session.attach(
    hostModule as unknown as Record<string, unknown>,
    [{ functionName: 'doWork', capability: 'beacon_telemetry' as const }],
    'session-source',
  );

  assert(session.getState() === 'symbiotic', 'W5: Session is symbiotic');

  // #2: First boot creates candidate baseline, not trusted
  const trustState = getTrustState('session-pkg');
  assert(trustState === 'candidate_baseline', 'W5: First boot trust state is candidate_baseline', `was ${trustState}`);

  const auditLog = getAuditLog();
  const sessionEvents = auditLog.filter(e => e.source.includes('test-session'));
  assert(sessionEvents.length >= 2, 'W5: Session events in audit chain', `count=${sessionEvents.length}`);

  await session.detach(hostModule as unknown as Record<string, unknown>);
  assert(session.getState() === 'detached', 'W5: Session detached');

  session.destroy();
}

// ══════════════════════════════════════════════════════════════
// TEST 6: Identity enforcement — placeholder rejected
// ══════════════════════════════════════════════════════════════

async function test6_identityEnforcement(): Promise<void> {
  fullReset();
  configure({ telemetry: true, lexMode: 'permissive' });

  const hostModule = { fn: () => 'x' };

  // Do NOT scan — identity will be placeholder ('unknown'/'0.0.0')
  let blocked = false;
  try {
    await attach(
      hostModule as unknown as Record<string, unknown>,
      [{ functionName: 'fn', capability: 'beacon_telemetry' as const }],
      'test-source',
    );
  } catch (err) {
    blocked = (err as Error).message.includes('IDENTITY');
  }

  assert(blocked, 'W6: Placeholder identity blocks attachment');
}

// ══════════════════════════════════════════════════════════════
// RUN ALL TESTS
// ══════════════════════════════════════════════════════════════

console.log('╔══════════════════════════════════════════════════╗');
console.log('║  V1 WIRING INTEGRATION TESTS — POST-PATCH        ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('');

const tests = [
  { name: '1. Attach records fingerprint to audit', fn: test1_attachRecordsFingerprint },
  { name: '2. Invalid fingerprint blocks attach', fn: test2_invalidFingerprintBlocks },
  { name: '3. Detach uses safe protocol + audit', fn: test3_detachUsesSafeProtocol },
  { name: '4. Audit chain integrity after cycle', fn: test4_auditChainIntegrityAfterCycle },
  { name: '5. Session uses V1 + trust staging', fn: test5_sessionUsesV1Integrations },
  { name: '6. Identity enforcement — placeholder rejected', fn: test6_identityEnforcement },
];

(async () => {
  for (const test of tests) {
    console.log(`▶ ${test.name}`);
    try {
      await test.fn();
      console.log('  ✓ passed');
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ name: test.name, pass: false, detail: msg });
      console.log(`  ✗ FAILED: ${msg}`);
    }
  }

  console.log('');
  console.log('══════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════════════');
  console.log('');

  if (failed > 0) {
    console.log('❌ FAILURES:');
    for (const r of results) {
      if (!r.pass) console.log(`  • ${r.name}: ${r.detail}`);
    }
    process.exit(1);
  } else {
    console.log('✅ ALL V1 WIRING VERIFIED — POST-PATCH CORRECTIONS HOLD');
  }
})();
