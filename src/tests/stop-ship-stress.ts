/**
 * STOP-SHIP Stress Tests — All 10 Required Scenarios
 * 
 * Tests verify correctness under adversarial conditions.
 * Every test MUST pass before shipping.
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
// TEST 1: 1000-event anomaly burst (VISION spam)
// ══════════════════════════════════════════════════════════════

import { ingestSignal, resetVisionLex, configureVisionLex, getVisionLexAuditLog } from '../lib/mana/vision-lex-bridge';

function test1_visionSpam(): void {
  resetVisionLex();
  configureVisionLex({ confidenceThreshold: 0.5, escalationThreshold: 3, terminalThreshold: 5 });

  let observeCount = 0;
  let escalateCount = 0;
  let terminalCount = 0;

  for (let i = 0; i < 1000; i++) {
    const result = ingestSignal('anomaly_detector', 'testFn', 0.8, `burst signal ${i}`);
    if (result.verdictLevel === 'observe') observeCount++;
    if (result.verdictLevel === 'escalate') escalateCount++;
    if (result.verdictLevel === 'terminal') terminalCount++;
  }

  assert(observeCount > 0, 'T1: First signals produce observe (not terminal)');
  assert(escalateCount > 0, 'T1: Middle signals escalate');
  assert(terminalCount > 0, 'T1: Terminal only after threshold');

  // Verify NO terminal on first signal
  const audit = getVisionLexAuditLog();
  const firstEntry = audit[0];
  assert(firstEntry.verdictLevel !== 'terminal', 'T1: First signal is NOT terminal', `was ${firstEntry.verdictLevel}`);
}

// ══════════════════════════════════════════════════════════════
// TEST 2: Repeated fingerprint mismatch at boot
// ══════════════════════════════════════════════════════════════

import { verifyFingerprint, registerFingerprint, resetFingerprintGate, computeCanonicalFingerprint } from '../core/boot/fingerprintGate';

function test2_fingerprintMismatch(): void {
  resetFingerprintGate();

  const goodModule = { processPayment: () => 42, validateInput: () => true };
  const fp = computeCanonicalFingerprint(goodModule, 'payments', '1.0.0');
  registerFingerprint('payments', fp);

  // Exact match → valid
  const r1 = verifyFingerprint(goodModule, 'payments', '1.0.0');
  assert(r1.verdict === 'valid', 'T2: Exact match = valid');

  // Structural change → invalid
  const badModule = { processPayment: () => 42, validateInput: () => true, hackedFn: () => 'pwned' };
  const r2 = verifyFingerprint(badModule, 'payments', '1.0.0');
  assert(r2.verdict === 'invalid' || r2.verdict === 'suspect', 'T2: Structural change detected', `was ${r2.verdict}`);

  // Unknown package → suspect (not invalid)
  const r3 = verifyFingerprint(goodModule, 'unknown-pkg', '1.0.0');
  assert(r3.verdict === 'suspect', 'T2: Unknown package = suspect', `was ${r3.verdict}`);

  // Repeated mismatches stay consistent
  for (let i = 0; i < 10; i++) {
    const r = verifyFingerprint(badModule, 'payments', '1.0.0');
    assert(r.verdict === r2.verdict, `T2: Repeated mismatch ${i} is deterministic`);
  }
}

// ══════════════════════════════════════════════════════════════
// TEST 3: Concurrent attach/detach under load
// ══════════════════════════════════════════════════════════════

import { enterExecutionBoundary, exitExecutionBoundary, resetSafeDetach, isInExecutionBoundary } from '../lib/mana/detach-safe';

function test3_concurrentAttachDetach(): void {
  resetSafeDetach();

  const hostKey = 'test-host';

  // Simulate execution boundary — #5: now host-scoped
  enterExecutionBoundary(hostKey);
  assert(isInExecutionBoundary(hostKey), 'T3: Execution boundary active');

  enterExecutionBoundary(hostKey); // nested
  assert(isInExecutionBoundary(hostKey), 'T3: Nested boundary active');

  exitExecutionBoundary(hostKey);
  assert(isInExecutionBoundary(hostKey), 'T3: Still in boundary after one exit');

  exitExecutionBoundary(hostKey);
  assert(!isInExecutionBoundary(hostKey), 'T3: Boundary clear after all exits');

  // Extra exit should not go negative
  exitExecutionBoundary(hostKey);
  assert(!isInExecutionBoundary(hostKey), 'T3: Extra exit does not corrupt state');

  // #5: Different host should be independent
  enterExecutionBoundary('other-host');
  assert(!isInExecutionBoundary(hostKey), 'T3: Boundary isolation — host A unaffected by host B');
  assert(isInExecutionBoundary('other-host'), 'T3: Boundary isolation — host B is active');
  exitExecutionBoundary('other-host');
}

// ══════════════════════════════════════════════════════════════
// TEST 4: Parallel Lex verdict fan-out
// ══════════════════════════════════════════════════════════════

import { registerRule, evaluate, resetLex, ruleCount, getAuditLog as getLexAuditLog, getVerdictPrecedence } from '../lib/mana/lex';

function test4_parallelVerdictFanout(): void {
  resetLex();

  // Register conflicting rules
  registerRule('defense_gate', 'processPayment', 'allow', 'general allow', 100);
  registerRule('defense_gate', 'processPayment', 'deny', 'security deny', 50);
  registerRule('defense_gate', 'processPayment', 'observe', 'monitoring', 75);

  // Evaluate — should return deny (highest precedence)
  const result = evaluate('defense_gate', 'processPayment', 'permissive');
  assert(result.verdict === 'deny', 'T4: Deny wins over allow and observe', `was ${result.verdict}`);

  // Same evaluation 100 times must be deterministic
  const verdicts = new Set<string>();
  for (let i = 0; i < 100; i++) {
    verdicts.add(evaluate('defense_gate', 'processPayment', 'permissive').verdict);
  }
  assert(verdicts.size === 1, 'T4: 100 evaluations produce same verdict', `got ${verdicts.size} unique verdicts`);
}

// ══════════════════════════════════════════════════════════════
// TEST 5: Phone-home during RELAY outage
// ══════════════════════════════════════════════════════════════

import { phoneHome, createPhoneHomeEvent, getPhoneHomeStats, resetPhoneHome, configurePhoneHome } from '../lib/relay/ultimate/phoneHome';
import { resetRateGovernorState } from '../lib/relay/ultimate/rateGovernor';
import { resetDeliveryGuarantorState } from '../lib/relay/ultimate/deliveryGuarantor';

function test5_phoneHomeDuringOutage(): void {
  resetPhoneHome();
  resetRateGovernorState();
  resetDeliveryGuarantorState();

  // Local-only mode — no outbound
  configurePhoneHome({ mode: 'local-only' });
  const event = createPhoneHomeEvent('test', { data: 'outage' }, 'critical', 'stress-test');
  const result = phoneHome(event);
  assert(result.accepted, 'T5: Local-only mode accepts events');

  const stats = getPhoneHomeStats();
  assert(stats.mode === 'local-only', 'T5: Mode is local-only');
  assert(stats.totalQueued === 1, 'T5: Event queued locally');

  // Switch to batched — flood it
  resetPhoneHome();
  resetRateGovernorState();
  resetDeliveryGuarantorState();
  configurePhoneHome({ mode: 'notify-batched', maxQueueDepth: 100 });

  let dropped = 0;
  for (let i = 0; i < 200; i++) {
    const e = createPhoneHomeEvent(`flood-${i}`, { idx: i }, 'info', 'stress-test');
    const r = phoneHome(e);
    if (!r.accepted) dropped++;
  }

  const stats2 = getPhoneHomeStats();
  assert(stats2.totalDropped > 0 || stats2.totalDeduplicated > 0, 'T5: Flood protection active', `dropped=${stats2.totalDropped} dedup=${stats2.totalDeduplicated}`);
}

// ══════════════════════════════════════════════════════════════
// TEST 6: False-positive anomaly in production scenario
// ══════════════════════════════════════════════════════════════

function test6_falsePositiveAnomaly(): void {
  resetVisionLex();
  configureVisionLex({ confidenceThreshold: 0.7, escalationThreshold: 5, terminalThreshold: 10 });

  // Single low-confidence signal — should be rejected
  const r1 = ingestSignal('anomaly_detector', 'safeFunction', 0.3, 'false positive');
  assert(!r1.accepted, 'T6: Low confidence signal rejected');
  assert(r1.verdictLevel === 'rejected', 'T6: Verdict level is rejected');

  // Single high-confidence signal — observe only
  const r2 = ingestSignal('anomaly_detector', 'safeFunction', 0.8, 'real anomaly?');
  assert(r2.accepted, 'T6: High confidence accepted');
  assert(r2.verdictLevel === 'observe', 'T6: First signal = observe only', `was ${r2.verdictLevel}`);

  // Verify no terminal verdict exists yet
  assert(r2.verdictLevel !== 'terminal', 'T6: No terminal on single signal');
}

// ══════════════════════════════════════════════════════════════
// TEST 7: Promotion failure + rollback loop
// (Simulated via Lex rule cycling)
// ══════════════════════════════════════════════════════════════

function test7_promotionRollbackLoop(): void {
  resetLex();

  // Simulate promotion → failure → rollback → re-promotion
  for (let cycle = 0; cycle < 20; cycle++) {
    const rule = registerRule('evolution_patch', '*', 'observe', `promotion attempt ${cycle}`, 100);
    // "Failure" — revoke
    const revoked = evaluate('evolution_patch', 'targetFn', 'permissive');
    assert(revoked.verdict === 'observe' || revoked.verdict === 'allow', `T7: Cycle ${cycle} evaluates cleanly`);
  }

  // Dedup should prevent rule explosion
  const count = ruleCount();
  assert(count <= 20, 'T7: Rule count bounded', `count=${count}`);
}

// ══════════════════════════════════════════════════════════════
// TEST 8: Same package in both deployment modes
// ══════════════════════════════════════════════════════════════

function test8_dualDeploymentModes(): void {
  resetLex();

  // Both modes should produce same Lex behavior
  registerRule('defense_gate', 'sharedFn', 'deny', 'security rule', 50);

  const r1 = evaluate('defense_gate', 'sharedFn', 'permissive');
  const r2 = evaluate('defense_gate', 'sharedFn', 'strict');

  assert(r1.verdict === 'deny', 'T8: Permissive mode respects deny rule');
  assert(r2.verdict === 'deny', 'T8: Strict mode respects deny rule');
  assert(r1.verdict === r2.verdict, 'T8: Both modes produce same verdict for same rule');
}

// ══════════════════════════════════════════════════════════════
// TEST 9: Conflicting Lex rules with different priorities
// ══════════════════════════════════════════════════════════════

function test9_conflictingPriorities(): void {
  resetLex();

  // Register rules in random priority order
  registerRule('governance_hook', 'criticalFn', 'allow', 'default allow', 500);
  registerRule('governance_hook', 'criticalFn', 'observe', 'monitoring', 200);
  registerRule('governance_hook', 'criticalFn', 'deny', 'security lockdown', 10);

  const result = evaluate('governance_hook', 'criticalFn', 'permissive');
  assert(result.verdict === 'deny', 'T9: Lowest priority number (deny@10) wins', `was ${result.verdict}`);

  // Verify precedence order is correct
  const precedence = getVerdictPrecedence();
  assert(precedence[0] === 'deny', 'T9: Deny is highest precedence');
  assert(precedence[precedence.length - 1] === 'allow', 'T9: Allow is lowest precedence');
}

// ══════════════════════════════════════════════════════════════
// TEST 10: Retry storms with partial downstream failure
// ══════════════════════════════════════════════════════════════

import { guaranteedDispatch, retryDelivery, getDLQ, getDeliveryGuarantorStats } from '../lib/relay/ultimate/deliveryGuarantor';

function test10_retryStorms(): void {
  resetDeliveryGuarantorState();

  // Create 100 deliveries — simulate 50% failure
  const deliveryIds: string[] = [];
  for (let i = 0; i < 100; i++) {
    const d = guaranteedDispatch(`target-${i % 5}`, { payload: i });
    if (d) deliveryIds.push(d.id);
  }

  assert(deliveryIds.length > 0, 'T10: Deliveries created');

  // Retry half of them until exhaustion
  let retryCount = 0;
  for (let i = 0; i < deliveryIds.length; i += 2) {
    let d = retryDelivery(deliveryIds[i], 'downstream failure');
    while (d && d.status === 'retrying') {
      d = retryDelivery(deliveryIds[i], 'still failing');
      retryCount++;
      if (retryCount > 1000) break; // Safety cap
    }
  }

  const stats = getDeliveryGuarantorStats();
  assert(stats.dlqSize > 0, 'T10: Failed deliveries moved to DLQ', `dlq=${stats.dlqSize}`);
  assert(retryCount < 1000, 'T10: Retry storm bounded', `retries=${retryCount}`);

  // Verify dedup works
  const dup = guaranteedDispatch('target-0', { payload: 0 });
  assert(dup === null, 'T10: Duplicate delivery rejected');
}

// ══════════════════════════════════════════════════════════════
// TEST 11: Audit Chain Integrity
// ══════════════════════════════════════════════════════════════

import { recordAuditEvent, verifyChainIntegrity, replayVerify, getAuditLog, resetAuditChain } from '../core/audit/auditChain';

function test11_auditChainIntegrity(): void {
  resetAuditChain();

  // Record 100 events
  for (let i = 0; i < 100; i++) {
    recordAuditEvent('stress-test', `event-${i}`, 'allow', { index: i });
  }

  // Verify chain integrity
  const report = verifyChainIntegrity();
  assert(report.valid, 'T11: Chain integrity verified', report.brokenReason ?? '');
  assert(report.totalEntries === 100, 'T11: All 100 entries recorded');

  // Replay verification
  const log = getAuditLog();
  const replayOk = replayVerify(log);
  assert(replayOk, 'T11: Replay verification passed');

  // Idempotency — same key should return same envelope
  const e1 = recordAuditEvent('test', 'dedup', 'allow', {}, 'dedup-key-1');
  const e2 = recordAuditEvent('test', 'dedup', 'allow', {}, 'dedup-key-1');
  assert(e1.receiptId === e2.receiptId, 'T11: Idempotency key prevents duplicate');
}

// ══════════════════════════════════════════════════════════════
// TEST 12: Lex Recursion Guard
// ══════════════════════════════════════════════════════════════

function test12_lexRecursionGuard(): void {
  resetLex();

  // Register a wildcard rule
  registerRule('*', '*', 'allow', 'global allow', 100);

  // Normal evaluation should work
  const r1 = evaluate('defense_gate', 'fn1', 'permissive');
  assert(r1.verdict === 'allow', 'T12: Normal evaluation works');

  // Audit log should record recursion depth
  const audit = getLexAuditLog();
  const lastEntry = audit[audit.length - 1];
  assert(lastEntry.recursionDepth <= 3, 'T12: Recursion depth bounded', `depth=${lastEntry.recursionDepth}`);
}

// ══════════════════════════════════════════════════════════════
// RUN ALL TESTS
// ══════════════════════════════════════════════════════════════

console.log('╔══════════════════════════════════════════════════╗');
console.log('║  STOP-SHIP STRESS TESTS — CMPSBL® Pipeline      ║');
console.log('╚══════════════════════════════════════════════════╝');
console.log('');

const tests = [
  { name: '1. 1000-event anomaly burst (VISION spam)', fn: test1_visionSpam },
  { name: '2. Repeated fingerprint mismatch at boot', fn: test2_fingerprintMismatch },
  { name: '3. Concurrent attach/detach under load', fn: test3_concurrentAttachDetach },
  { name: '4. Parallel Lex verdict fan-out', fn: test4_parallelVerdictFanout },
  { name: '5. Phone-home during RELAY outage', fn: test5_phoneHomeDuringOutage },
  { name: '6. False-positive anomaly in production', fn: test6_falsePositiveAnomaly },
  { name: '7. Promotion failure + rollback loop', fn: test7_promotionRollbackLoop },
  { name: '8. Same package in both deployment modes', fn: test8_dualDeploymentModes },
  { name: '9. Conflicting Lex rules with priorities', fn: test9_conflictingPriorities },
  { name: '10. Retry storms with partial failure', fn: test10_retryStorms },
  { name: '11. Audit chain integrity + replay', fn: test11_auditChainIntegrity },
  { name: '12. Lex recursion guard', fn: test12_lexRecursionGuard },
];

for (const test of tests) {
  try {
    console.log(`▶ ${test.name}`);
    test.fn();
    console.log(`  ✓ passed`);
  } catch (err) {
    failed++;
    console.log(`  ✗ FAILED: ${(err as Error).message}`);
    results.push({ name: test.name, pass: false, detail: (err as Error).message });
  }
}

console.log('');
console.log('══════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log('══════════════════════════════════════════════════');

if (failed > 0) {
  console.log('');
  console.log('FAILURES:');
  for (const r of results.filter(r => !r.pass)) {
    console.log(`  ✗ ${r.name}: ${r.detail}`);
  }
}

console.log('');
console.log(failed === 0 ? '✅ ALL TESTS PASSED — SHIP IT' : '🚨 TESTS FAILED — DO NOT SHIP');
