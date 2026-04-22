/**
 * CMPSBL® Envelope Verifier — Phase 5
 *
 * The 4 canonical generators (TS / JS / Python / PHP) and the 23 polyglot
 * artifacts all emit a structurally-identical `_cmpsbl` envelope. This
 * module is the single source of truth for *validating* that envelope at
 * runtime, in dev tooling, in CI, or inside the substrate's auditors.
 *
 * It does NOT execute generated code. It accepts a parsed envelope object
 * (already JSON-decoded if it came from another language) and returns a
 * structured verification result — never throws on malformed input.
 *
 * Locked by canonical-parity-snapshot.test.ts so future Phase 5+ work
 * cannot drift the envelope contract without explicit re-alignment.
 */
import type { GovernanceMode } from '@/lib/ascension-v2/governance-mode';

export type EnvelopeStrategy = 'native' | 'passthrough' | 'failed';

export interface EnvelopeIssue {
  /** Dotted path to the offending key, e.g. `_cmpsbl.execution.strategy`. */
  readonly path: string;
  /** Stable machine code — useful for CI gates and dashboards. */
  readonly code:
    | 'MISSING_KEY'
    | 'WRONG_TYPE'
    | 'INVALID_ENUM'
    | 'INCONSISTENT_STATE'
    | 'EMPTY_CHAIN';
  readonly message: string;
}

export interface EnvelopeVerification {
  readonly ok: boolean;
  readonly issues: ReadonlyArray<EnvelopeIssue>;
  /** Convenience: extracted top-level facts when the envelope parses. */
  readonly summary: {
    readonly capability: string | null;
    readonly mode: GovernanceMode | null;
    readonly strategy: EnvelopeStrategy | null;
    readonly originalExecuted: boolean | null;
    readonly verdict: 'block' | 'warn' | 'allow' | null;
  };
}

const VALID_MODES: ReadonlySet<GovernanceMode> = new Set(['observe', 'soft', 'enforce']);
const VALID_STRATEGIES: ReadonlySet<EnvelopeStrategy> = new Set(['native', 'passthrough', 'failed']);

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function pushMissing(out: EnvelopeIssue[], path: string): void {
  out.push({ path, code: 'MISSING_KEY', message: `required key "${path}" is missing` });
}

function pushType(out: EnvelopeIssue[], path: string, expected: string, actual: unknown): void {
  out.push({
    path,
    code: 'WRONG_TYPE',
    message: `"${path}" expected ${expected}, got ${Array.isArray(actual) ? 'array' : typeof actual}`,
  });
}

/**
 * Verify a parsed `_cmpsbl` envelope object against the V1 contract.
 * Pass either the full envelope or just the `_cmpsbl` block — both shapes
 * are tolerated to keep tooling integration simple.
 */
export function verifyEnvelope(input: unknown): EnvelopeVerification {
  const issues: EnvelopeIssue[] = [];
  const summary: EnvelopeVerification['summary'] = {
    capability: null, mode: null, strategy: null, originalExecuted: null, verdict: null,
  };

  if (!isObj(input)) {
    issues.push({ path: '<root>', code: 'WRONG_TYPE', message: 'envelope must be a JSON object' });
    return { ok: false, issues, summary };
  }

  // Accept either the full envelope (with _original/_pipeline/_cmpsbl) or
  // a bare _cmpsbl block — Phase 5 verifiers run in both contexts.
  const cmpsbl = isObj(input._cmpsbl) ? (input._cmpsbl as Record<string, unknown>) : input;

  // Top-level _cmpsbl required keys
  for (const key of ['capability', 'cjpi', 'tier', 'chain', 'mode', 'execution']) {
    if (!(key in cmpsbl)) pushMissing(issues, `_cmpsbl.${key}`);
  }

  if (typeof cmpsbl.capability === 'string') {
    (summary as { capability: string | null }).capability = cmpsbl.capability;
  } else if ('capability' in cmpsbl) {
    pushType(issues, '_cmpsbl.capability', 'string', cmpsbl.capability);
  }

  if (typeof cmpsbl.cjpi !== 'number' && 'cjpi' in cmpsbl) {
    pushType(issues, '_cmpsbl.cjpi', 'number', cmpsbl.cjpi);
  }

  if (typeof cmpsbl.tier !== 'string' && 'tier' in cmpsbl) {
    pushType(issues, '_cmpsbl.tier', 'string', cmpsbl.tier);
  }

  if (!Array.isArray(cmpsbl.chain)) {
    if ('chain' in cmpsbl) pushType(issues, '_cmpsbl.chain', 'string[]', cmpsbl.chain);
  } else if (cmpsbl.chain.length === 0) {
    issues.push({ path: '_cmpsbl.chain', code: 'EMPTY_CHAIN', message: 'chain must contain at least one primitive' });
  } else if (cmpsbl.chain.some((p) => typeof p !== 'string')) {
    pushType(issues, '_cmpsbl.chain[]', 'string', cmpsbl.chain);
  }

  if (typeof cmpsbl.mode === 'string' && VALID_MODES.has(cmpsbl.mode as GovernanceMode)) {
    (summary as { mode: GovernanceMode | null }).mode = cmpsbl.mode as GovernanceMode;
  } else if ('mode' in cmpsbl) {
    issues.push({
      path: '_cmpsbl.mode',
      code: 'INVALID_ENUM',
      message: `mode must be one of observe|soft|enforce, got ${JSON.stringify(cmpsbl.mode)}`,
    });
  }

  // execution sub-block
  if (isObj(cmpsbl.execution)) {
    const exec = cmpsbl.execution;
    for (const key of ['original_executed', 'original_error', 'execution_ms', 'strategy']) {
      if (!(key in exec)) pushMissing(issues, `_cmpsbl.execution.${key}`);
    }
    if (typeof exec.original_executed === 'boolean') {
      (summary as { originalExecuted: boolean | null }).originalExecuted = exec.original_executed;
    } else if ('original_executed' in exec) {
      pushType(issues, '_cmpsbl.execution.original_executed', 'boolean', exec.original_executed);
    }
    if (exec.original_error !== null && typeof exec.original_error !== 'string' && 'original_error' in exec) {
      pushType(issues, '_cmpsbl.execution.original_error', 'string|null', exec.original_error);
    }
    if (typeof exec.execution_ms !== 'number' && 'execution_ms' in exec) {
      pushType(issues, '_cmpsbl.execution.execution_ms', 'number', exec.execution_ms);
    }
    if (typeof exec.strategy === 'string' && VALID_STRATEGIES.has(exec.strategy as EnvelopeStrategy)) {
      (summary as { strategy: EnvelopeStrategy | null }).strategy = exec.strategy as EnvelopeStrategy;
    } else if ('strategy' in exec) {
      issues.push({
        path: '_cmpsbl.execution.strategy',
        code: 'INVALID_ENUM',
        message: `strategy must be one of native|passthrough|failed, got ${JSON.stringify(exec.strategy)}`,
      });
    }

    // Cross-field consistency: enforce mode + passthrough is forbidden.
    // The generators throw before returning in that case; if a verifier
    // sees this combo it means the envelope was tampered with or captured
    // before the throw — flag it.
    if (
      summary.mode === 'enforce' &&
      summary.originalExecuted === false &&
      summary.strategy === 'passthrough'
    ) {
      issues.push({
        path: '_cmpsbl',
        code: 'INCONSISTENT_STATE',
        message: 'enforce mode must never return a passthrough envelope — generator contract violated',
      });
    }
  } else if ('execution' in cmpsbl) {
    pushType(issues, '_cmpsbl.execution', 'object', cmpsbl.execution);
  }

  // Optional defense verdict surface (only present when DEFENSE ran).
  // We extract it from _enriched._defense or _pipeline.signals[] when the
  // full envelope was passed in.
  if (input !== cmpsbl && isObj(input)) {
    const enriched = isObj(input._enriched) ? input._enriched : null;
    const defense = enriched && isObj(enriched._defense) ? enriched._defense : null;
    if (defense && typeof defense.verdict === 'string') {
      const v = defense.verdict;
      if (v === 'block' || v === 'warn' || v === 'allow') {
        (summary as { verdict: 'block' | 'warn' | 'allow' | null }).verdict = v;
      } else {
        issues.push({
          path: '_enriched._defense.verdict',
          code: 'INVALID_ENUM',
          message: `defense verdict must be block|warn|allow, got ${JSON.stringify(v)}`,
        });
      }
    }
  }

  return { ok: issues.length === 0, issues, summary };
}

/**
 * Convenience: parse a JSON string emitted by any of the 4 generators
 * (or any of the 23 polyglot bridges) and run the verifier against it.
 */
export function verifyEnvelopeJson(json: string): EnvelopeVerification {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    return {
      ok: false,
      issues: [{
        path: '<root>',
        code: 'WRONG_TYPE',
        message: `invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
      }],
      summary: { capability: null, mode: null, strategy: null, originalExecuted: null, verdict: null },
    };
  }
  return verifyEnvelope(parsed);
}
