/**
 * CMPSBL® Capability Activation Guide Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates per-primitive, developer-facing integration
 * instructions from the capability activation ledger.
 *
 * This is NOT a summary or marketing document.
 * This is a deterministic, reproducible integration guide.
 *
 * Constraint: Only includes primitives where generated=true AND bound=true.
 * Claims never exceed ledger evidence.
 *
 * © CMPSBL® — All rights reserved.
 */

import type {
  CapabilityActivationLedger,
  CapabilityLedgerEntry,
  CapabilityState,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — ACTIVATION GUIDE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** How much developer effort is required to activate this primitive */
export type ActivationMode =
  | 'automatic'  // Already active — no integration work needed
  | 'assisted'   // Minimal modification — one-line import or config change
  | 'manual';    // Explicit integration required — developer writes glue code

/** Before/after behavior description */
export interface BehaviorDelta {
  /** What happens WITHOUT this primitive active */
  readonly before: string;
  /** What happens WITH this primitive active */
  readonly after: string;
}

/** How to confirm the primitive is working */
export interface VerificationStep {
  /** Human-readable instruction */
  readonly instruction: string;
  /** What output or state change to look for */
  readonly expectedOutcome: string;
  /** Optional: command or code to run */
  readonly command?: string;
}

/** Safety and compatibility notes */
export interface SafetyNotes {
  /** Impact on existing behavior */
  readonly compatibilityImpact: string;
  /** Whether activation can be reversed */
  readonly reversibility: string;
  /** Performance considerations */
  readonly performanceNotes: string;
}

/** A single integration step with copy-paste code */
export interface IntegrationStep {
  /** Step number (1-indexed) */
  readonly step: number;
  /** What this step does */
  readonly description: string;
  /** Where to place this code (file + function/location) */
  readonly placement: string;
  /** What L1 code this connects to */
  readonly connectsTo: string;
  /** Copy-paste-ready code snippet */
  readonly code: string;
  /** Language of the code snippet */
  readonly language: string;
}

/** Full activation entry for one primitive */
export interface PrimitiveActivationEntry {
  /** Primitive name */
  readonly name: string;
  /** Current lifecycle state */
  readonly state: CapabilityState;
  /** Target binding locations */
  readonly targets: readonly string[];
  /** Activation mode */
  readonly activationMode: ActivationMode;
  /** Exact integration steps */
  readonly integrationSteps: readonly IntegrationStep[];
  /** Before/after behavior */
  readonly behaviorDelta: BehaviorDelta;
  /** How to verify it works */
  readonly verificationSteps: readonly VerificationStep[];
  /** Safety notes */
  readonly safetyNotes: SafetyNotes;
}

/** The complete activation guide document */
export interface CapabilityActivationGuide {
  /** Guide schema version */
  readonly version: '1.0.0';
  /** Artifact fingerprint */
  readonly fingerprintId: string;
  /** ISO-8601 generation timestamp */
  readonly generatedAt: string;
  /** Source language of the artifact */
  readonly sourceLanguage: string;
  /** Total primitives in the artifact (all states) */
  readonly totalPrimitives: number;
  /** Primitives included in this guide (generated + bound only) */
  readonly activatablePrimitives: number;
  /** Per-primitive activation entries */
  readonly entries: readonly PrimitiveActivationEntry[];
  /** Canonical system limitations */
  readonly limitations: readonly string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — PRIMITIVE ACTIVATION KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Per-primitive activation knowledge.
 * Each record contains deterministic, reproducible integration details.
 * Values are derived from the actual PRIMITIVE_WRAPPERS in generate-refurbished-code.ts.
 */
interface PrimitiveActivationKnowledge {
  readonly runtimeImport: string;
  readonly initCode: string;
  readonly activationMode: ActivationMode;
  readonly behaviorBefore: string;
  readonly behaviorAfter: string;
  readonly verifyInstruction: string;
  readonly verifyExpected: string;
  readonly verifyCommand?: string;
  readonly compatibilityImpact: string;
  readonly reversibility: string;
  readonly performanceNotes: string;
}

const ACTIVATION_KNOWLEDGE: Readonly<Record<string, PrimitiveActivationKnowledge>> = {
  failsafe: {
    runtimeImport: "import { CircuitBreaker, SnapshotManager } from '@cmpsbl/runtime/failsafe';",
    initCode: "const breaker = CircuitBreaker.create({ threshold: 5, resetMs: 30_000 });\nSnapshotManager.init({ autoSnapshot: true, intervalMs: 300_000 });",
    activationMode: 'assisted',
    behaviorBefore: 'Unhandled exceptions crash the process. No recovery mechanism. State is lost on failure.',
    behaviorAfter: 'Circuit breaker trips after 5 consecutive failures, preventing cascade. State snapshots enable recovery to last known good state.',
    verifyInstruction: 'Trigger 6 consecutive errors on any wrapped function. The circuit breaker should open and reject further calls with a CircuitOpenError.',
    verifyExpected: 'After 5 failures: subsequent calls throw CircuitOpenError. After 30s: circuit resets and allows one probe call.',
    verifyCommand: "// Trigger test:\nfor (let i = 0; i < 6; i++) { try { await wrappedFn('bad-input'); } catch(e) { console.log(e.name); } }",
    compatibilityImpact: 'Adds latency (~0.1ms) per call for threshold tracking. Existing error handling remains intact.',
    reversibility: 'Fully reversible. Remove import and init lines to restore original behavior.',
    performanceNotes: 'SnapshotManager writes to disk every 5 minutes. Ensure write permissions on the working directory.',
  },
  defense: {
    runtimeImport: "import { DefenseLayer, RequestValidator, DeviceFingerprint } from '@cmpsbl/runtime/defense';",
    initCode: "DefenseLayer.activate({ mode: 'enforce', fingerprinting: true });\nRequestValidator.init({ blockInjection: true, blockXSS: true, rateLimitPerIp: 100 });",
    activationMode: 'assisted',
    behaviorBefore: 'Inputs pass through unchecked. No injection protection. No rate limiting.',
    behaviorAfter: 'All inputs validated against injection patterns (SQL, XSS). Requests rate-limited to 100/IP. Device fingerprinting active.',
    verifyInstruction: "Send a request containing '<script>alert(1)</script>' in any input field.",
    verifyExpected: "Request is rejected with HTTP 400 and body: { blocked: true, reason: 'xss_detected' }",
    compatibilityImpact: 'May reject previously-accepted malformed inputs. Review existing input formats before enabling in production.',
    reversibility: 'Fully reversible. Remove activation lines to disable all enforcement.',
    performanceNotes: 'Adds ~0.3ms per request for validation. Rate limit state is in-memory (reset on restart).',
  },
  governance: {
    runtimeImport: "import { GovernancePolicy, ComplianceAuditor } from '@cmpsbl/runtime/governance';",
    initCode: "GovernancePolicy.enforce({\n  maxConcurrency: 100,\n  auditAllMutations: true,\n  requireApprovalAbove: 'high-risk',\n});\nComplianceAuditor.start({ logDestination: 'structured' });",
    activationMode: 'manual',
    behaviorBefore: 'No concurrency limits. Mutations are unaudited. High-risk operations execute without approval.',
    behaviorAfter: 'Concurrency capped at 100. All mutations produce structured audit logs. High-risk operations require explicit approval.',
    verifyInstruction: 'Perform a mutation operation and check the structured log output.',
    verifyExpected: 'A JSON audit entry appears with: { action, actor, timestamp, risk_level, approved }',
    compatibilityImpact: 'High-risk operations will BLOCK until approved. Requires approval workflow integration.',
    reversibility: 'Reversible. Remove policy enforcement to restore unlimited concurrency and unaudited mutations.',
    performanceNotes: 'Audit logging adds ~1ms per mutation. Log volume scales with write throughput.',
  },
  beacon: {
    runtimeImport: "import { HealthBeacon, MetricsCollector } from '@cmpsbl/runtime/beacon';",
    initCode: "HealthBeacon.start({ interval: 15_000, endpoints: ['/_health', '/_ready'] });\nMetricsCollector.init({ exportFormat: 'prometheus' });",
    activationMode: 'assisted',
    behaviorBefore: 'No health endpoints. No metrics collection. Monitoring tools have no visibility.',
    behaviorAfter: 'Health check at /_health every 15s. Readiness at /_ready. Prometheus-compatible metrics exported.',
    verifyInstruction: 'After activation, send GET /_health.',
    verifyExpected: "HTTP 200 with body: { status: 'healthy', uptime_ms: <number>, checks: [...] }",
    compatibilityImpact: 'Registers two new HTTP endpoints. Ensure no route conflicts with /_health or /_ready.',
    reversibility: 'Fully reversible. Stopping the beacon removes endpoints.',
    performanceNotes: 'Health check runs a lightweight self-test every 15s. Negligible CPU. ~2KB memory for metrics buffer.',
  },
  memory: {
    runtimeImport: "import { PersistentMemory, StateRecovery } from '@cmpsbl/runtime/memory';",
    initCode: "PersistentMemory.init({ adapter: 'filesystem', snapshotOnCrash: true });\nStateRecovery.enable({ strategy: 'last-known-good' });",
    activationMode: 'manual',
    behaviorBefore: 'All state is in-memory and lost on process restart. No crash recovery.',
    behaviorAfter: 'State persisted to filesystem. On crash, StateRecovery restores to last known good snapshot.',
    verifyInstruction: "Write a value with PersistentMemory.set('test_key', { value: 42 }), then restart the process and read it back.",
    verifyExpected: "PersistentMemory.get('test_key') returns { value: 42 } after restart.",
    compatibilityImpact: 'Requires filesystem write access. Serializable state only (no functions, no circular refs).',
    reversibility: 'Reversible. Remove init to revert to in-memory only. Snapshot files remain on disk for manual cleanup.',
    performanceNotes: 'Snapshot writes are async and non-blocking. Crash snapshots add ~5ms to shutdown hook.',
  },
  conscience: {
    runtimeImport: "import { EthicalGate, AlignmentMonitor } from '@cmpsbl/runtime/conscience';",
    initCode: "EthicalGate.init({ blockThreshold: 0.30, reviewThreshold: 0.60 });\nAlignmentMonitor.start({ driftAlertThreshold: 0.15 });",
    activationMode: 'manual',
    behaviorBefore: 'No ethical boundary checks. All operations execute regardless of alignment score.',
    behaviorAfter: 'Operations with confidence < 0.30 are blocked. Between 0.30-0.60 flagged for review. Alignment drift triggers alerts.',
    verifyInstruction: 'Submit an operation with a confidence score below 0.30.',
    verifyExpected: "Operation is blocked with: { blocked: true, reason: 'below_ethical_threshold', score: <number> }",
    compatibilityImpact: 'Will BLOCK low-confidence operations. Requires confidence scoring in your decision pipeline.',
    reversibility: 'Fully reversible. Remove EthicalGate to restore unchecked execution.',
    performanceNotes: 'Gate evaluation adds ~0.05ms per operation. AlignmentMonitor runs async background checks.',
  },
  immunity: {
    runtimeImport: "import { DependencyShield, IsolationBarrier } from '@cmpsbl/runtime/immunity';",
    initCode: "DependencyShield.init({ monitorCVEs: true, autoQuarantine: true });\nIsolationBarrier.enforce({ blastRadius: 'component', fallbackOnFailure: true });",
    activationMode: 'assisted',
    behaviorBefore: 'Vulnerable dependencies execute normally. A compromised dependency affects the entire process.',
    behaviorAfter: 'Known CVEs trigger auto-quarantine. Compromised components are isolated with fallback behavior.',
    verifyInstruction: 'Check DependencyShield.status() after initialization.',
    verifyExpected: "Returns: { monitored: <count>, quarantined: <count>, lastScanAt: <timestamp> }",
    compatibilityImpact: 'Auto-quarantine may disable dependencies. Test with autoQuarantine: false first.',
    reversibility: 'Fully reversible. Remove init to restore unmonitored dependency execution.',
    performanceNotes: 'CVE check runs on startup and every 24h. IsolationBarrier adds ~0.2ms per cross-component call.',
  },
  encode: {
    runtimeImport: "import { BehavioralMapper, IntentTracer } from '@cmpsbl/runtime/encode';",
    initCode: "BehavioralMapper.scan({ traceDepth: 'full', documentExports: true });\nIntentTracer.enable({ tagFunctions: true, generateSignatures: true });",
    activationMode: 'automatic',
    behaviorBefore: 'No behavioral mapping. Function intent is undocumented.',
    behaviorAfter: 'All exported functions tagged with behavioral signatures. Intent traces available for debugging.',
    verifyInstruction: 'Call IntentTracer.getSignatures() after init.',
    verifyExpected: 'Returns a Map<string, FunctionSignature> with entries for each exported function.',
    compatibilityImpact: 'Read-only analysis. No behavioral changes to existing code.',
    reversibility: 'Fully reversible. Remove to disable tracing.',
    performanceNotes: 'Initial scan adds 50-200ms at startup. Runtime tracing adds ~0.01ms per call.',
  },
  oracle: {
    runtimeImport: "import { PredictiveAnalyzer, FailureForecast } from '@cmpsbl/runtime/oracle';",
    initCode: "PredictiveAnalyzer.init({ horizon: '60s', confidenceThreshold: 0.75 });\nFailureForecast.monitor({ cascadeDetection: true, alertOnDrift: true });",
    activationMode: 'manual',
    behaviorBefore: 'No failure prediction. Cascading failures are detected only after impact.',
    behaviorAfter: 'PredictiveAnalyzer forecasts failures 60s ahead. FailureForecast detects cascade chains before they propagate.',
    verifyInstruction: 'Check FailureForecast.status() after running under load for 60s.',
    verifyExpected: "Returns: { monitoring: true, cascadesDetected: <number>, lastForecastAt: <timestamp> }",
    compatibilityImpact: 'Read-only monitoring. Does not modify execution flow unless alertOnDrift triggers a callback.',
    reversibility: 'Fully reversible. Remove init to disable prediction.',
    performanceNotes: 'FailureForecast collects metrics in a rolling 60s window. ~5KB memory overhead.',
  },
  cortex: {
    runtimeImport: "import { ReasoningEngine, ContextRouter } from '@cmpsbl/runtime/cortex';",
    initCode: "ReasoningEngine.init({ maxChainDepth: 5, timeoutMs: 10_000 });\nContextRouter.enable({ weightByRecency: true, parallelBranches: 3 });",
    activationMode: 'manual',
    behaviorBefore: 'No multi-step reasoning. Decisions are single-pass with no context routing.',
    behaviorAfter: 'Multi-step reasoning chains up to depth 5. Context is routed to the most relevant branch by recency weight.',
    verifyInstruction: 'Submit a multi-step reasoning request through ReasoningEngine.reason().',
    verifyExpected: "Returns: { steps: [...], depth: <number>, confidence: <number>, routedTo: <branch> }",
    compatibilityImpact: 'Requires structured input for reasoning chains. Existing single-pass logic is unaffected.',
    reversibility: 'Fully reversible. Remove init to disable reasoning chains.',
    performanceNotes: 'Each reasoning step adds latency. Max depth 5 × 10s timeout = 50s worst case. Use timeoutMs to constrain.',
  },
  audit: {
    runtimeImport: "import { AuditTrail, ComplianceRecorder } from '@cmpsbl/runtime/audit';",
    initCode: "AuditTrail.init({ immutable: true, hashChain: 'sha256' });\nComplianceRecorder.enable({ retentionDays: 365, exportFormat: 'json' });",
    activationMode: 'assisted',
    behaviorBefore: 'No audit trail. Operations leave no compliance record.',
    behaviorAfter: 'Every operation produces an immutable, hash-chained audit entry. 365-day retention with JSON export.',
    verifyInstruction: 'Perform any operation, then call AuditTrail.getLatest().',
    verifyExpected: "Returns: { id, action, actor, timestamp, hash, previousHash }",
    compatibilityImpact: 'Write-heavy workloads will generate large audit logs. Plan storage accordingly.',
    reversibility: 'Audit entries are immutable once created. Disabling stops new entries but retains existing ones.',
    performanceNotes: 'SHA-256 hash computation adds ~0.05ms per entry. Storage grows linearly with operation volume.',
  },
  sentinel: {
    runtimeImport: "import { SentinelMonitor, AnomalyDetector } from '@cmpsbl/runtime/sentinel';",
    initCode: "SentinelMonitor.init({ scanIntervalMs: 30_000, autoRemediate: false });\nAnomalyDetector.enable({ baselinePeriodMs: 300_000, sensitivityLevel: 'medium' });",
    activationMode: 'assisted',
    behaviorBefore: 'No continuous monitoring. Anomalies detected only through manual inspection.',
    behaviorAfter: 'Sentinel scans every 30s. AnomalyDetector builds a 5-minute behavioral baseline and flags statistical deviations.',
    verifyInstruction: 'Wait 60s after init, then call SentinelMonitor.getStatus().',
    verifyExpected: "Returns: { scanning: true, scansCompleted: <number>, anomaliesDetected: <number> }",
    compatibilityImpact: 'Background scanning. No impact on existing request flow.',
    reversibility: 'Fully reversible. Stop the monitor to halt scanning.',
    performanceNotes: 'Scans are async and non-blocking. AnomalyDetector retains ~10KB of baseline data.',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — GUIDE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a Capability Activation Guide from the activation ledger.
 *
 * Only includes primitives where generated=true AND bound=true.
 * All instructions are deterministic, reproducible, and copy-paste ready.
 */
export function generateActivationGuide(
  ledger: CapabilityActivationLedger,
  sourceLanguage: string,
): CapabilityActivationGuide {
  const activatableEntries = ledger.entries.filter(
    e => e.generated && e.bound && e.targets.length > 0,
  );

  const entries = activatableEntries.map(entry =>
    buildActivationEntry(entry, sourceLanguage),
  );

  return {
    version: '1.0.0',
    fingerprintId: ledger.fingerprintId,
    generatedAt: new Date().toISOString(),
    sourceLanguage,
    totalPrimitives: ledger.entries.length,
    activatablePrimitives: entries.length,
    entries,
    limitations: [
      'L2 wrappers are structural by default — runtime behavior requires completing the activation steps in this guide.',
      'CMPSBL does not guarantee behavioral outcomes without activation.',
      'Verification steps confirm activation succeeded — do not skip them.',
      'All code snippets are deterministic and reproducible. Same input produces same output.',
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — PER-PRIMITIVE ENTRY BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

function buildActivationEntry(
  entry: CapabilityLedgerEntry,
  sourceLanguage: string,
): PrimitiveActivationEntry {
  const knowledgeKey = entry.name.toLowerCase();
  const knowledge = ACTIVATION_KNOWLEDGE[knowledgeKey];

  if (!knowledge) {
    return buildGenericActivationEntry(entry, sourceLanguage);
  }

  const integrationSteps = buildIntegrationSteps(entry, knowledge, sourceLanguage);
  const behaviorDelta = buildBehaviorDelta(entry, knowledge);
  const verificationSteps = buildVerificationSteps(entry, knowledge);
  const safetyNotes = buildSafetyNotes(knowledge);

  return {
    name: entry.name,
    state: entry.state,
    targets: entry.targets,
    activationMode: entry.activated ? 'automatic' : knowledge.activationMode,
    integrationSteps,
    behaviorDelta,
    verificationSteps,
    safetyNotes,
  };
}

function buildGenericActivationEntry(
  entry: CapabilityLedgerEntry,
  _sourceLanguage: string,
): PrimitiveActivationEntry {
  return {
    name: entry.name,
    state: entry.state,
    targets: entry.targets,
    activationMode: 'manual',
    integrationSteps: [{
      step: 1,
      description: `Import and initialize the ${entry.name} runtime module`,
      placement: 'Application entry point (e.g., main.ts, index.ts, app.py)',
      connectsTo: entry.targets.length > 0
        ? `L1 functions: ${entry.targets.join(', ')}`
        : 'L1 application entry point',
      code: `// Import the ${entry.name} runtime\nimport { ${entry.name}Runtime } from '@cmpsbl/runtime/${entry.name.toLowerCase()}';\n\n// Initialize\n${entry.name}Runtime.init();`,
      language: 'typescript',
    }],
    behaviorDelta: {
      before: `No ${entry.name} capability active. Default behavior unchanged.`,
      after: `${entry.name} wrapper active on ${entry.targets.length} target(s). See runtime documentation for specific behavioral changes.`,
    },
    verificationSteps: [{
      instruction: `Check ${entry.name}Runtime.status() after initialization.`,
      expectedOutcome: `Returns { active: true, targets: ${entry.targets.length} }`,
    }],
    safetyNotes: {
      compatibilityImpact: 'Review target function signatures for compatibility before activation.',
      reversibility: 'Fully reversible. Remove import and init lines to restore original behavior.',
      performanceNotes: 'Overhead varies by primitive. Monitor latency after activation.',
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — STEP BUILDERS
// ═══════════════════════════════════════════════════════════════════════════════

function buildIntegrationSteps(
  entry: CapabilityLedgerEntry,
  knowledge: PrimitiveActivationKnowledge,
  _sourceLanguage: string,
): IntegrationStep[] {
  const steps: IntegrationStep[] = [];

  // Step 1: Import
  steps.push({
    step: 1,
    description: `Add the ${entry.name} runtime import`,
    placement: 'Top of your application entry point file',
    connectsTo: 'L2 orchestration layer (already generated in ascended-source)',
    code: knowledge.runtimeImport,
    language: 'typescript',
  });

  // Step 2: Initialize
  steps.push({
    step: 2,
    description: `Initialize ${entry.name} with recommended configuration`,
    placement: 'Application startup / initialization block (after imports, before server.listen or main())',
    connectsTo: entry.targets.length > 0
      ? `L1 targets: ${entry.targets.join(', ')}`
      : 'L1 application runtime',
    code: knowledge.initCode,
    language: 'typescript',
  });

  // Step 3: Verify (if not automatic)
  if (knowledge.activationMode !== 'automatic') {
    steps.push({
      step: 3,
      description: `Verify ${entry.name} is active`,
      placement: 'After initialization completes (e.g., in a post-init health check)',
      connectsTo: 'Runtime verification — confirms L2 hooks are firing',
      code: knowledge.verifyCommand ?? `// Verify activation\nconsole.log('${entry.name} status:', JSON.stringify(${entry.name.charAt(0).toUpperCase() + entry.name.slice(1).toLowerCase()}Runtime.status()));`,
      language: 'typescript',
    });
  }

  return steps;
}

function buildBehaviorDelta(
  entry: CapabilityLedgerEntry,
  knowledge: PrimitiveActivationKnowledge,
): BehaviorDelta {
  // If already activated, reflect that truthfully
  if (entry.activated) {
    return {
      before: knowledge.behaviorBefore,
      after: `${knowledge.behaviorAfter} (CONFIRMED: activation detected in runtime)`,
    };
  }

  return {
    before: knowledge.behaviorBefore,
    after: `${knowledge.behaviorAfter} (PENDING: requires completing activation steps above)`,
  };
}

function buildVerificationSteps(
  entry: CapabilityLedgerEntry,
  knowledge: PrimitiveActivationKnowledge,
): VerificationStep[] {
  const steps: VerificationStep[] = [{
    instruction: knowledge.verifyInstruction,
    expectedOutcome: knowledge.verifyExpected,
    command: knowledge.verifyCommand,
  }];

  // If behaviorally verified, note that
  if (entry.behaviorallyVerified) {
    steps.push({
      instruction: 'Behavioral verification already confirmed by CMPSBL probe engine.',
      expectedOutcome: 'No further verification needed. See ledger evidence for proof.',
    });
  }

  return steps;
}

function buildSafetyNotes(knowledge: PrimitiveActivationKnowledge): SafetyNotes {
  return {
    compatibilityImpact: knowledge.compatibilityImpact,
    reversibility: knowledge.reversibility,
    performanceNotes: knowledge.performanceNotes,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — HTML RENDERING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Render the activation guide as a standalone HTML document.
 * Branded, light-theme, suitable for inclusion in export ZIPs.
 */
export function renderActivationGuideHtml(guide: CapabilityActivationGuide): string {
  const entryHtml = guide.entries.map(renderEntryHtml).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CMPSBL® Capability Activation Guide</title>
  <style>
    :root { --brand: #1a1a2e; --accent: #6c63ff; --bg: #fafafa; --code-bg: #f0f0f0; --border: #e0e0e0; --success: #22c55e; --warning: #f59e0b; --danger: #ef4444; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--brand); line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.2rem; margin-top: 2rem; border-bottom: 2px solid var(--accent); padding-bottom: 0.3rem; }
    h3 { font-size: 1rem; margin-top: 1.2rem; color: #444; }
    .meta { color: #666; font-size: 0.85rem; margin-bottom: 2rem; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .badge-automatic { background: #dcfce7; color: #166534; }
    .badge-assisted { background: #fef3c7; color: #92400e; }
    .badge-manual { background: #fee2e2; color: #991b1b; }
    .badge-state { background: #e0e7ff; color: #3730a3; }
    .entry { border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; margin: 1rem 0; background: white; }
    .step { margin: 0.8rem 0; padding: 0.8rem; background: #f8f9fa; border-left: 3px solid var(--accent); border-radius: 0 4px 4px 0; }
    .step-num { font-weight: 700; color: var(--accent); }
    .placement { font-size: 0.8rem; color: #666; margin-top: 0.3rem; }
    pre { background: var(--code-bg); padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.85rem; margin: 0.5rem 0; border: 1px solid var(--border); }
    code { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
    .delta { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0.5rem 0; }
    .delta-before, .delta-after { padding: 0.8rem; border-radius: 6px; font-size: 0.85rem; }
    .delta-before { background: #fef2f2; border: 1px solid #fecaca; }
    .delta-after { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .verify { background: #eff6ff; padding: 0.8rem; border-radius: 6px; margin: 0.5rem 0; border: 1px solid #bfdbfe; }
    .safety { background: #fffbeb; padding: 0.8rem; border-radius: 6px; margin: 0.5rem 0; border: 1px solid #fde68a; font-size: 0.85rem; }
    .limitations { margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 6px; font-size: 0.85rem; }
    .limitations li { margin: 0.3rem 0; }
    .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.75rem; color: #999; }
  </style>
</head>
<body>
  <h1>CMPSBL® Capability Activation Guide</h1>
  <div class="meta">
    Fingerprint: <code>${escapeHtml(guide.fingerprintId)}</code><br>
    Generated: ${guide.generatedAt}<br>
    Source Language: ${escapeHtml(guide.sourceLanguage)}<br>
    Activatable Primitives: ${guide.activatablePrimitives} of ${guide.totalPrimitives} detected
  </div>

${entryHtml}

  <div class="limitations">
    <h3>System Limitations</h3>
    <ul>
      ${guide.limitations.map(l => `<li>${escapeHtml(l)}</li>`).join('\n      ')}
    </ul>
  </div>

  <div class="footer">
    CMPSBL® Governed Cognitive Infrastructure · U.S. Patent App. Nos. 64/029,678 &amp; 64/031,637<br>
    © CMPSBL® — All rights reserved. This guide is generated per artifact and is deterministic.
  </div>
</body>
</html>`;
}

function renderEntryHtml(entry: PrimitiveActivationEntry): string {
  const modeBadge = `<span class="badge badge-${entry.activationMode}">${entry.activationMode}</span>`;
  const stateBadge = `<span class="badge badge-state">${entry.state.replace('_', ' ')}</span>`;

  const stepsHtml = entry.integrationSteps.map(s => `
    <div class="step">
      <div><span class="step-num">Step ${s.step}:</span> ${escapeHtml(s.description)}</div>
      <div class="placement">📁 ${escapeHtml(s.placement)}</div>
      <div class="placement">🔗 Connects to: ${escapeHtml(s.connectsTo)}</div>
      <pre><code>${escapeHtml(s.code)}</code></pre>
    </div>`).join('\n');

  const verifyHtml = entry.verificationSteps.map(v => `
    <div class="verify">
      <strong>Test:</strong> ${escapeHtml(v.instruction)}<br>
      <strong>Expected:</strong> ${escapeHtml(v.expectedOutcome)}
      ${v.command ? `<pre><code>${escapeHtml(v.command)}</code></pre>` : ''}
    </div>`).join('\n');

  return `
  <div class="entry">
    <h2>${escapeHtml(entry.name)} ${modeBadge} ${stateBadge}</h2>
    <p>Targets: <code>${entry.targets.length > 0 ? entry.targets.map(escapeHtml).join(', ') : 'application-level'}</code></p>

    <h3>Integration Steps</h3>
    ${stepsHtml}

    <h3>Behavior Change</h3>
    <div class="delta">
      <div class="delta-before"><strong>Before:</strong><br>${escapeHtml(entry.behaviorDelta.before)}</div>
      <div class="delta-after"><strong>After:</strong><br>${escapeHtml(entry.behaviorDelta.after)}</div>
    </div>

    <h3>Verification</h3>
    ${verifyHtml}

    <h3>Safety Notes</h3>
    <div class="safety">
      <strong>Compatibility:</strong> ${escapeHtml(entry.safetyNotes.compatibilityImpact)}<br>
      <strong>Reversibility:</strong> ${escapeHtml(entry.safetyNotes.reversibility)}<br>
      <strong>Performance:</strong> ${escapeHtml(entry.safetyNotes.performanceNotes)}
    </div>

    ${entry.integrationSteps.length === 0 ? '<p><em>No integration steps available — see generic runtime documentation.</em></p>' : ''}
  </div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
