/**
 * Polyglot Transpiler — BehavioralSpec → Native Handler Code
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Reads PRIMITIVE_SPECS + a LanguageAdapter and emits the complete
 * `handle_module` switch body for that target language.
 *
 * Behavioural identity: the same spec produces semantically equivalent
 * code in every Tier-A language. Add a primitive once → it works
 * everywhere instantly.
 *
 * © CMPSBL® — All rights reserved.
 */

import { PRIMITIVE_SPECS, type PrimitiveSpec, type SpecField } from './behavioral-spec';
import type { LanguageAdapter } from './language-adapters';

/**
 * Render a single SpecField into the target language's expression syntax.
 * Returns a string expression (no trailing semicolon).
 */
function renderField(field: SpecField, adapter: LanguageAdapter): string {
  switch (field.kind) {
    case 'literal':
      return adapter.literal(field.value);
    case 'keys_count':
      return adapter.keysCount();
    case 'cjpi_ratio':
      return adapter.cjpiRatio();
    case 'cjpi_int':
      return adapter.cjpiInt();
    case 'chain_length':
      return adapter.chainLength();
    case 'chain_position':
      return adapter.chainPosition();
    case 'error_count':
      return adapter.errorCount();
    case 'signal_count':
      return adapter.signalCount();
    case 'payload_bytes':
      return adapter.payloadBytes();
    case 'elapsed_ms':
      return adapter.elapsedMs();
    case 'hash_of_data':
      return adapter.hashOfData();
    case 'hash_of_input':
      return adapter.hashOfInput();
    case 'keys_list':
      return adapter.keysList();
    case 'tier_value':
      return adapter.tierValue(field.map, field.fallback);
    case 'tier_passthrough':
      return adapter.tierPassthrough();
    case 'classified':
      return adapter.classified(field.thresholds, field.fallback);
    case 'threat_count':
      return adapter.threatCount(field.tokens);
    case 'compute_fitness_strategy':
      return adapter.fitnessStrategy(field.threshold, field.high, field.low);
    case 'compute_fallback_state':
      return adapter.fallbackState();
  }
}

/** Render the full body for a single primitive's case block */
function renderCaseBody(spec: PrimitiveSpec, adapter: LanguageAdapter): string[] {
  const pairs = spec.fields.map(f => [f.name, renderField(f, adapter)] as [string, string]);
  const objectExpr = adapter.objectLiteral(pairs);
  return [
    adapter.setDataField(spec.outputKey, objectExpr),
    adapter.emitSignal(spec.signalType),
  ];
}

/**
 * Transpile all 39 primitives into a complete `handle_module` switch
 * body for the given language. The caller is responsible for wrapping
 * this with the appropriate function signature and helpers.
 */
export function transpileHandlers(adapter: LanguageAdapter): string {
  const lines: string[] = [];
  lines.push(adapter.switchOpen());
  for (const spec of PRIMITIVE_SPECS) {
    const body = renderCaseBody(spec, adapter);
    lines.push(adapter.caseBlock(spec.module, body));
  }
  lines.push(adapter.switchDefault());
  lines.push(adapter.switchClose());
  return lines.join('\n');
}

/**
 * Transpile handlers for a specific subset of primitives (used when
 * a target language only supports a partial set or for tier-based gating).
 */
export function transpileHandlersFor(adapter: LanguageAdapter, modules: string[]): string {
  const allowed = new Set(modules.map(m => m.toUpperCase()));
  const filtered = PRIMITIVE_SPECS.filter(s => allowed.has(s.module));
  const lines: string[] = [];
  lines.push(adapter.switchOpen());
  for (const spec of filtered) {
    const body = renderCaseBody(spec, adapter);
    lines.push(adapter.caseBlock(spec.module, body));
  }
  lines.push(adapter.switchDefault());
  lines.push(adapter.switchClose());
  return lines.join('\n');
}

/** Sanity report — useful for tests and debugging */
export interface TranspileReport {
  language: string;
  primitiveCount: number;
  handlerLines: number;
  bytes: number;
  modules: string[];
}

export function reportTranspilation(adapter: LanguageAdapter): TranspileReport {
  const code = transpileHandlers(adapter);
  return {
    language: adapter.id,
    primitiveCount: PRIMITIVE_SPECS.length,
    handlerLines: code.split('\n').length,
    bytes: code.length,
    modules: PRIMITIVE_SPECS.map(s => s.module),
  };
}
