/**
 * Mana Engine — Lodash Live Attachment Demo
 * 
 * Demonstrates silent symbiotic attachment to lodash:
 * 1. Scans lodash for function boundaries
 * 2. Attaches DEFENSE gates, BEACON telemetry, and shadow rules
 * 3. Generates cryptographic proof that lodash source is unmodified
 * 4. Exercises the wrapped functions to show Layer 2 in action
 * 
 * U.S. Patent App. No. 64/031,637
 * © CMPSBL® — All rights reserved.
 */

import * as lodash from 'lodash';
import {
  configure,
  scan,
  attach,
  detach,
  generateProof,
  getManifest,
  getTelemetrySummary,
  registerRule,
  reset,
} from '../index';
import type { ManaCapability, ManaProof, ManaManifest } from '../types';

/**
 * Lodash source fingerprint — hash actual fn.toString() content.
 * IMPORTANT: Uses real source text, not just name+length.
 * This is a demo fingerprint — production would use full module source.
 */
function collectLodashSource(): string {
  const fns = ['get', 'set', 'merge', 'cloneDeep', 'debounce', 'throttle', 'groupBy', 'sortBy', 'uniq', 'flatten'];
  const sources: string[] = [];
  for (const name of fns) {
    const fn = (lodash as Record<string, unknown>)[name];
    if (typeof fn === 'function') {
      // Use actual source text for stronger fingerprint
      sources.push(`${name}:${fn.toString()}`);
    }
  }
  return sources.join('||');
}

/** Attachment configuration — which functions get which Layer 2 capabilities */
const ATTACHMENT_CONFIG: Array<{ functionName: string; capability: ManaCapability; rulePayload?: unknown }> = [
  // DEFENSE gates — protect critical data functions
  { functionName: 'merge', capability: 'defense_gate' },
  { functionName: 'set', capability: 'defense_gate' },
  { functionName: 'cloneDeep', capability: 'defense_gate' },

  // BEACON telemetry — observe usage patterns
  { functionName: 'get', capability: 'beacon_telemetry' },
  { functionName: 'groupBy', capability: 'beacon_telemetry' },
  { functionName: 'sortBy', capability: 'beacon_telemetry' },
  { functionName: 'uniq', capability: 'beacon_telemetry' },
  { functionName: 'flatten', capability: 'beacon_telemetry' },

  // Shadow rule — Mana says no
  { functionName: 'debounce', capability: 'shadow_rule', rulePayload: '🛑 MANA says: this function is under governance. Simon says no.' },
  { functionName: 'throttle', capability: 'shadow_rule', rulePayload: '🛑 MANA says: throttle is governed. The substrate is watching.' },

  // Governance hooks
  { functionName: 'merge', capability: 'governance_hook' },

  // Audit trail
  { functionName: 'get', capability: 'audit_trail' },

  // Circuit breaker
  { functionName: 'cloneDeep', capability: 'circuit_breaker' },
];

export interface LodashDemoResult {
  manifest: ManaManifest;
  proof: ManaProof;
  telemetrySummary: Record<string, { invocations: number; blocked: number }>;
  exerciseResults: Record<string, unknown>;
  functionCount: number;
  attachedCount: number;
}

/**
 * Run the full Lodash attachment demo.
 * Returns manifest, proof, and exercise results.
 */
export async function runLodashDemo(): Promise<LodashDemoResult> {
  // Reset engine for clean run
  reset();

  // Configure engine
  configure({
    telemetry: true,
    maxTelemetryEvents: 5000,
    dreamSynthesis: true,
    lexMode: 'permissive',
  });

  // Register a shadow rule via Lex — block debounce
  registerRule('shadow_rule', 'debounce', 'deny', 'Demo: Mana governance blocks debounce');
  registerRule('shadow_rule', 'throttle', 'deny', 'Demo: Mana governance blocks throttle');

  // Phase 1: Scan
  const hostModule = lodash as unknown as Record<string, unknown>;
  const functionNames = scan(hostModule, 'lodash', '4.18.1');

  // Phase 2: Collect source hash BEFORE attachment
  const sourceFingerprint = collectLodashSource();

  // Phase 3: Attach Layer 2
  const manifest = await attach(hostModule, ATTACHMENT_CONFIG, sourceFingerprint);

  // Phase 4: Exercise wrapped functions
  const exerciseResults: Record<string, unknown> = {};

  // Normal function calls — these go through Layer 2 transparently
  exerciseResults['get'] = lodash.get({ a: { b: 42 } }, 'a.b');
  exerciseResults['merge'] = lodash.merge({ a: 1 }, { b: 2 });
  exerciseResults['uniq'] = lodash.uniq([1, 2, 2, 3, 3, 3]);
  exerciseResults['sortBy'] = lodash.sortBy([3, 1, 2]);
  exerciseResults['flatten'] = lodash.flatten([[1, 2], [3, 4]]);
  exerciseResults['cloneDeep'] = lodash.cloneDeep({ nested: { value: true } });
  exerciseResults['groupBy'] = lodash.groupBy(['one', 'two', 'three'], 'length');

  // Shadow-ruled functions — these return Mana's message instead
  try {
    exerciseResults['debounce'] = (lodash as Record<string, unknown>).debounce;
    const debounceFn = lodash.debounce as unknown as Function;
    exerciseResults['debounce_result'] = debounceFn(() => 'should not execute', 100);
  } catch (err) {
    exerciseResults['debounce_result'] = err instanceof Error ? err.message : String(err);
  }

  try {
    const throttleFn = lodash.throttle as unknown as Function;
    exerciseResults['throttle_result'] = throttleFn(() => 'should not execute', 100);
  } catch (err) {
    exerciseResults['throttle_result'] = err instanceof Error ? err.message : String(err);
  }

  // Phase 5: Generate cryptographic proof
  const proof = await generateProof(sourceFingerprint);

  // Phase 6: Collect telemetry summary
  const telemetrySummary = getTelemetrySummary();

  return {
    manifest: getManifest(),
    proof,
    telemetrySummary,
    exerciseResults,
    functionCount: functionNames.length,
    attachedCount: manifest.attachmentPoints.length,
  };
}

/**
 * Run demo and detach — full lifecycle.
 */
export async function runLodashDemoWithDetach(): Promise<{
  attached: LodashDemoResult;
  detachManifest: ManaManifest;
  postDetachProof: ManaProof;
}> {
  const attached = await runLodashDemo();
  const sourceFingerprint = collectLodashSource();

  // Detach — restore lodash to original state
  const hostModule = lodash as unknown as Record<string, unknown>;
  const detachManifest = await detach(hostModule);

  // Post-detach proof — hash should still match
  const postDetachProof = await generateProof(sourceFingerprint);

  return { attached, detachManifest, postDetachProof };
}
