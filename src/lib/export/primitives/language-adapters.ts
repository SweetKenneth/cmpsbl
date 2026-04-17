/**
 * Language Adapters — Native Syntax Maps for Tier-A Transpiler
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Each adapter exposes the syntactic primitives needed to render any
 * BehavioralSpec field as real, idiomatic code in its target language.
 *
 * Adding a new language = implement LanguageAdapter and register it.
 * Behaviour identity is preserved across all languages.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { SpecField } from './behavioral-spec';

/**
 * A LanguageAdapter renders BehavioralSpec field expressions into the
 * target language's expression syntax. The transpiler composes these
 * expressions into a `handle_module` switch body.
 */
export interface LanguageAdapter {
  id: string;
  /** Format a literal value (string/number/boolean) */
  literal(v: string | number | boolean): string;
  /** Render an expression that yields a string hash of a serialized value */
  hashOfData(): string;
  hashOfInput(): string;
  /** Number of user keys (those NOT starting with '_') */
  keysCount(): string;
  /** List of user keys */
  keysList(): string;
  /** cjpi as an integer expression */
  cjpiInt(): string;
  /** cjpi / 100.0 */
  cjpiRatio(): string;
  /** chain length / position of current module / errors length / signals length */
  chainLength(): string;
  chainPosition(): string;
  errorCount(): string;
  signalCount(): string;
  /** Bytes of serialized data */
  payloadBytes(): string;
  /** Milliseconds elapsed since pipeline start */
  elapsedMs(): string;
  /** Tiered classification by user_keys count */
  classified(thresholds: Array<[number, string]>, fallback: string): string;
  /** Tier-keyed lookup with fallback */
  tierValue(map: Record<string, string | number>, fallback: string | number): string;
  /** Pass-through tier name */
  tierPassthrough(): string;
  /** Threat token scan over serialized data — returns count */
  threatCount(tokens: string[]): string;
  /** Conditional fitness strategy */
  fitnessStrategy(threshold: number, high: string, low: string): string;
  /** Compute fallback string from errors length */
  fallbackState(): string;
  /** Build a map/object literal from (fieldName → expression) pairs */
  objectLiteral(pairs: Array<[string, string]>): string;
  /** Assign ctx.data[key] = value */
  setDataField(key: string, valueExpr: string): string;
  /** Push signal: { type, source: mod, ts: now } */
  emitSignal(signalType: string): string;
  /** Indent a block of code by N spaces (for embedding inside switch) */
  indent(code: string, spaces: number): string;
  /** Wrap a list of statements as a switch case body */
  caseBlock(module: string, body: string[]): string;
  /** Wrap the entire switch */
  switchOpen(): string;
  switchDefault(): string;
  switchClose(): string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function indentLines(code: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return code.split('\n').map(l => (l ? pad + l : l)).join('\n');
}

function jsonLiteral(v: string | number | boolean): string {
  if (typeof v === 'string') return JSON.stringify(v);
  return String(v);
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUST ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════

export const RUST_ADAPTER: LanguageAdapter = {
  id: 'rust',
  literal: (v) => typeof v === 'string' ? `json!(${jsonLiteral(v)})` : `json!(${v})`,
  hashOfData: () => `json!(quick_hash(&format!("{:?}", ctx.data)))`,
  hashOfInput: () => `json!(quick_hash(&format!("{:?}", ctx.input)))`,
  keysCount: () => `json!(user_keys(&ctx.data).len())`,
  keysList: () => `json!(user_keys(&ctx.data))`,
  cjpiInt: () => `json!(meta.cjpi)`,
  cjpiRatio: () => `json!(meta.cjpi as f64 / 100.0)`,
  chainLength: () => `json!(meta.chain.len())`,
  chainPosition: () => `json!(meta.chain.iter().position(|m| m == module).unwrap_or(0))`,
  errorCount: () => `json!(ctx.errors.len())`,
  signalCount: () => `json!(ctx.signals.len())`,
  payloadBytes: () => `json!(format!("{:?}", ctx.data).len())`,
  elapsedMs: () => `json!(ctx.t0.elapsed().as_secs_f64() * 1000.0)`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    const conds = sorted.map(([n, label]) => `if k > ${n} { ${jsonLiteral(label)} }`).join(' else ');
    return `json!({ let k = user_keys(&ctx.data).len(); ${conds} else { ${jsonLiteral(fallback)} } })`;
  },
  tierValue: (map, fallback) => {
    const arms = Object.entries(map).map(([t, v]) => `${jsonLiteral(t)} => json!(${jsonLiteral(v)})`).join(', ');
    return `match meta.tier.as_str() { ${arms}, _ => json!(${jsonLiteral(fallback)}) }`;
  },
  tierPassthrough: () => `json!(meta.tier.clone())`,
  threatCount: (tokens) => {
    const checks = tokens.map(t => `s.contains(${jsonLiteral(t)})`).join(' || ');
    return `json!({ let s = format!("{:?}", ctx.data); if ${checks} { 1 } else { 0 } })`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `json!(if (meta.cjpi as f64 / 100.0) > ${th} { ${jsonLiteral(hi)} } else { ${jsonLiteral(lo)} })`,
  fallbackState: () => `json!(if ctx.errors.len() > 0 { "engaged" } else { "standby" })`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `(${jsonLiteral(k)}.to_string(), ${v})`).join(', ');
    return `json!(std::collections::HashMap::<String, serde_json::Value>::from_iter(vec![${inner}]))`;
  },
  setDataField: (key, val) => `ctx.data.insert(${jsonLiteral(key)}.into(), ${val});`,
  emitSignal: (t) =>
    `ctx.signals.push(HashMap::from([("type".into(), json!(${jsonLiteral(t)})), ("source".into(), json!(module)), ("ts".into(), json!(now_ms()))]));`,
  indent: indentLines,
  caseBlock: (mod, body) => `        ${jsonLiteral(mod)} => {\n${body.map(l => `            ${l}`).join('\n')}\n        }`,
  switchOpen: () => `    match module {`,
  switchDefault: () => `        _ => {
            let key = format!("_module_{}", module.to_lowercase());
            ctx.data.insert(key, json!({"processed": true, "handler": "generic"}));
            ctx.signals.push(HashMap::from([("type".into(), json!("process")), ("source".into(), json!(module)), ("ts".into(), json!(now_ms()))]));
        }`,
  switchClose: () => `    }`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// GO ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════

export const GO_ADAPTER: LanguageAdapter = {
  id: 'go',
  literal: jsonLiteral,
  hashOfData: () => `quickHash(fmt.Sprintf("%v", ctx.Data))`,
  hashOfInput: () => `quickHash(fmt.Sprintf("%v", ctx.Input))`,
  keysCount: () => `len(userKeys(ctx.Data))`,
  keysList: () => `userKeysList(ctx.Data)`,
  cjpiInt: () => `meta.CJPI`,
  cjpiRatio: () => `float64(meta.CJPI) / 100.0`,
  chainLength: () => `len(meta.Chain)`,
  chainPosition: () => `chainPosition(meta.Chain, module)`,
  errorCount: () => `len(ctx.Errors)`,
  signalCount: () => `len(ctx.Signals)`,
  payloadBytes: () => `len(fmt.Sprintf("%v", ctx.Data))`,
  elapsedMs: () => `float64(time.Since(ctx.T0).Microseconds()) / 1000.0`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    const conds = sorted.map(([n, l]) => `k > ${n}: ${jsonLiteral(l)}`).join(', ');
    return `func() string { k := len(userKeys(ctx.Data)); switch { ${sorted.map(([n, l]) => `case k > ${n}: return ${jsonLiteral(l)}`).join('; ')}; default: return ${jsonLiteral(fallback)} } }()`;
  },
  tierValue: (map, fallback) => {
    const cases = Object.entries(map).map(([t, v]) => `case ${jsonLiteral(t)}: return ${typeof v === 'string' ? jsonLiteral(v) : v}`).join('; ');
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return `func() interface{} { switch meta.Tier { ${cases}; default: return ${fb} } }()`;
  },
  tierPassthrough: () => `meta.Tier`,
  threatCount: (tokens) => {
    const checks = tokens.map(t => `strings.Contains(s, ${jsonLiteral(t)})`).join(' || ');
    return `func() int { s := fmt.Sprintf("%v", ctx.Data); if ${checks} { return 1 }; return 0 }()`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `func() string { if float64(meta.CJPI)/100.0 > ${th} { return ${jsonLiteral(hi)} }; return ${jsonLiteral(lo)} }()`,
  fallbackState: () => `func() string { if len(ctx.Errors) > 0 { return "engaged" }; return "standby" }()`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `${jsonLiteral(k)}: ${v}`).join(', ');
    return `map[string]interface{}{${inner}}`;
  },
  setDataField: (key, val) => `ctx.Data[${jsonLiteral(key)}] = ${val}`,
  emitSignal: (t) => `ctx.Signals = append(ctx.Signals, Signal{Type: ${jsonLiteral(t)}, Source: module, Ts: time.Now().UnixMilli()})`,
  indent: indentLines,
  caseBlock: (mod, body) => `\tcase ${jsonLiteral(mod)}:\n${body.map(l => `\t\t${l}`).join('\n')}`,
  switchOpen: () => `\tswitch module {`,
  switchDefault: () => `\tdefault:
\t\tkey := "_module_" + strings.ToLower(module)
\t\tctx.Data[key] = map[string]interface{}{"processed": true, "handler": "generic"}
\t\tctx.Signals = append(ctx.Signals, Signal{Type: "process", Source: module, Ts: time.Now().UnixMilli()})`,
  switchClose: () => `\t}`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// JAVA ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════

export const JAVA_ADAPTER: LanguageAdapter = {
  id: 'java',
  literal: (v) => typeof v === 'string' ? jsonLiteral(v) : String(v),
  hashOfData: () => `quickHash(data.toString())`,
  hashOfInput: () => `quickHash(input.toString())`,
  keysCount: () => `userKeys(data).size()`,
  keysList: () => `new ArrayList<>(userKeys(data))`,
  cjpiInt: () => `(int) meta.get("cjpi")`,
  cjpiRatio: () => `((int) meta.get("cjpi")) / 100.0`,
  chainLength: () => `((List<?>) meta.get("chain")).size()`,
  chainPosition: () => `((List<String>) meta.get("chain")).indexOf(module)`,
  errorCount: () => `errors.size()`,
  signalCount: () => `signals.size()`,
  payloadBytes: () => `data.toString().length()`,
  elapsedMs: () => `(System.nanoTime() - t0) / 1_000_000.0`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    const expr = sorted.reduceRight(
      (acc, [n, l]) => `(userKeys(data).size() > ${n} ? ${jsonLiteral(l)} : ${acc})`,
      jsonLiteral(fallback) as string,
    );
    return expr;
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    const expr = Object.entries(map).reduceRight(
      (acc, [t, v]) => `(${jsonLiteral(t)}.equals(meta.get("tier")) ? ${typeof v === 'string' ? jsonLiteral(v) : v} : ${acc})`,
      String(fb),
    );
    return expr;
  },
  tierPassthrough: () => `(String) meta.get("tier")`,
  threatCount: (tokens) => {
    const s = `data.toString()`;
    const checks = tokens.map(t => `${s}.contains(${jsonLiteral(t)})`).join(' || ');
    return `((${checks}) ? 1 : 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `((((int) meta.get("cjpi")) / 100.0) > ${th} ? ${jsonLiteral(hi)} : ${jsonLiteral(lo)})`,
  fallbackState: () => `(errors.size() > 0 ? "engaged" : "standby")`,
  objectLiteral: (pairs) => {
    const entries = pairs.map(([k, v]) => `Map.entry(${jsonLiteral(k)}, (Object) ${v})`).join(', ');
    return `Map.ofEntries(${entries})`;
  },
  setDataField: (key, val) => `data.put(${jsonLiteral(key)}, ${val});`,
  emitSignal: (t) => `signals.add(Map.of("type", ${jsonLiteral(t)}, "source", module, "ts", System.currentTimeMillis()));`,
  indent: indentLines,
  caseBlock: (mod, body) => `            case ${jsonLiteral(mod)}: {\n${body.map(l => `                ${l}`).join('\n')}\n                break;\n            }`,
  switchOpen: () => `        switch (module) {`,
  switchDefault: () => `            default: {
                data.put("_module_" + module.toLowerCase(), Map.of("processed", true, "handler", "generic"));
                signals.add(Map.of("type", "process", "source", module, "ts", System.currentTimeMillis()));
                break;
            }`,
  switchClose: () => `        }`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// C# ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════

export const CSHARP_ADAPTER: LanguageAdapter = {
  id: 'csharp',
  literal: (v) => typeof v === 'string' ? jsonLiteral(v) : (typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v)),
  hashOfData: () => `QuickHash(JsonSerializer.Serialize(data))`,
  hashOfInput: () => `QuickHash(JsonSerializer.Serialize(input))`,
  keysCount: () => `UserKeys(data).Count`,
  keysList: () => `UserKeys(data).ToList()`,
  cjpiInt: () => `(int)meta["cjpi"]`,
  cjpiRatio: () => `((int)meta["cjpi"]) / 100.0`,
  chainLength: () => `((List<string>)meta["chain"]).Count`,
  chainPosition: () => `((List<string>)meta["chain"]).IndexOf(module)`,
  errorCount: () => `errors.Count`,
  signalCount: () => `signals.Count`,
  payloadBytes: () => `JsonSerializer.Serialize(data).Length`,
  elapsedMs: () => `sw.Elapsed.TotalMilliseconds`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) => `(UserKeys(data).Count > ${n} ? ${jsonLiteral(l)} : ${acc})`,
      jsonLiteral(fallback) as string,
    );
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) => `((string)meta["tier"] == ${jsonLiteral(t)} ? ${typeof v === 'string' ? jsonLiteral(v) : v} : ${acc})`,
      String(fb),
    );
  },
  tierPassthrough: () => `(string)meta["tier"]`,
  threatCount: (tokens) => {
    const s = `JsonSerializer.Serialize(data)`;
    const checks = tokens.map(t => `${s}.Contains(${jsonLiteral(t)})`).join(' || ');
    return `((${checks}) ? 1 : 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `((((int)meta["cjpi"]) / 100.0) > ${th} ? ${jsonLiteral(hi)} : ${jsonLiteral(lo)})`,
  fallbackState: () => `(errors.Count > 0 ? "engaged" : "standby")`,
  objectLiteral: (pairs) => {
    const entries = pairs.map(([k, v]) => `[${jsonLiteral(k)}] = ${v}`).join(', ');
    return `new Dictionary<string, object> { ${entries} }`;
  },
  setDataField: (key, val) => `data[${jsonLiteral(key)}] = ${val};`,
  emitSignal: (t) =>
    `signals.Add(new Dictionary<string, object> { ["type"] = ${jsonLiteral(t)}, ["source"] = module, ["ts"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() });`,
  indent: indentLines,
  caseBlock: (mod, body) => `                case ${jsonLiteral(mod)}: {\n${body.map(l => `                    ${l}`).join('\n')}\n                    break;\n                }`,
  switchOpen: () => `            switch (module) {`,
  switchDefault: () => `                default: {
                    data[$"_module_{module.ToLower()}"] = new Dictionary<string, object> { ["processed"] = true, ["handler"] = "generic" };
                    signals.Add(new Dictionary<string, object> { ["type"] = "process", ["source"] = module, ["ts"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() });
                    break;
                }`,
  switchClose: () => `            }`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// SWIFT, KOTLIN, RUBY, LUA, DART, SCALA, C, C++ adapters share simpler patterns
// They use a generic adapter factory below
// ═══════════════════════════════════════════════════════════════════════════════

interface SimpleAdapterDef {
  id: string;
  hashFn: string;          // function call expression e.g. quickHash(x)
  serializeFn: string;     // function name to serialize ctx.data
  dataAccess: string;      // how to access ctx.data (e.g. data, ctx.data, $data)
  inputAccess: string;
  errorsAccess: string;
  signalsAccess: string;
  chainAccess: string;
  cjpiAccess: string;
  tierAccess: string;
  userKeysFn: string;      // function returning list of user keys
  nowMsFn: string;         // expression yielding now in ms
  elapsedExpr: string;     // expression yielding ms since pipeline start
  caseKeyword: string;
  caseFormat: (lit: string) => string;
  setExpr: (key: string, val: string) => string;
  pushSignalExpr: (type: string) => string;
  defaultBlock: string;
  switchOpen: string;
  switchClose: string;
  objectLit: (pairs: Array<[string, string]>) => string;
  ternary: (cond: string, hi: string, lo: string) => string;
  containsExpr: (haystack: string, needle: string) => string;
  caseIndent: string;
  bodyIndent: string;
}

function buildSimpleAdapter(d: SimpleAdapterDef): LanguageAdapter {
  return {
    id: d.id,
    literal: (v) => typeof v === 'string' ? jsonLiteral(v) : (typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v)),
    hashOfData: () => `${d.hashFn}(${d.serializeFn}(${d.dataAccess}))`,
    hashOfInput: () => `${d.hashFn}(${d.serializeFn}(${d.inputAccess}))`,
    keysCount: () => `${d.userKeysFn}(${d.dataAccess}).count`,
    keysList: () => `${d.userKeysFn}(${d.dataAccess})`,
    cjpiInt: () => d.cjpiAccess,
    cjpiRatio: () => `(${d.cjpiAccess}) / 100.0`,
    chainLength: () => `${d.chainAccess}.count`,
    chainPosition: () => `${d.chainAccess}.indexOf(module)`,
    errorCount: () => `${d.errorsAccess}.count`,
    signalCount: () => `${d.signalsAccess}.count`,
    payloadBytes: () => `${d.serializeFn}(${d.dataAccess}).length`,
    elapsedMs: () => d.elapsedExpr,
    classified: (thresholds, fallback) => {
      const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
      return sorted.reduceRight(
        (acc, [n, l]) => d.ternary(`${d.userKeysFn}(${d.dataAccess}).count > ${n}`, jsonLiteral(l), acc),
        jsonLiteral(fallback) as string,
      );
    },
    tierValue: (map, fallback) => {
      const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
      return Object.entries(map).reduceRight(
        (acc, [t, v]) => d.ternary(`${d.tierAccess} == ${jsonLiteral(t)}`, typeof v === 'string' ? jsonLiteral(v) : String(v), acc),
        String(fb),
      );
    },
    tierPassthrough: () => d.tierAccess,
    threatCount: (tokens) => {
      const s = `${d.serializeFn}(${d.dataAccess})`;
      const checks = tokens.map(t => d.containsExpr(s, jsonLiteral(t))).join(' || ');
      return d.ternary(checks, '1', '0');
    },
    fitnessStrategy: (th, hi, lo) =>
      d.ternary(`((${d.cjpiAccess}) / 100.0) > ${th}`, jsonLiteral(hi), jsonLiteral(lo)),
    fallbackState: () => d.ternary(`${d.errorsAccess}.count > 0`, jsonLiteral('engaged'), jsonLiteral('standby')),
    objectLiteral: d.objectLit,
    setDataField: d.setExpr,
    emitSignal: d.pushSignalExpr,
    indent: indentLines,
    caseBlock: (mod, body) =>
      `${d.caseIndent}${d.caseKeyword} ${d.caseFormat(jsonLiteral(mod))}\n${body.map(l => `${d.bodyIndent}${l}`).join('\n')}`,
    switchOpen: () => d.switchOpen,
    switchDefault: () => d.defaultBlock,
    switchClose: () => d.switchClose,
  };
}

// ─── SWIFT ────────────────────────────────────────────────────────────────────
export const SWIFT_ADAPTER = buildSimpleAdapter({
  id: 'swift',
  hashFn: 'quickHash', serializeFn: 'String(describing:)',
  dataAccess: 'ctx.data', inputAccess: 'ctx.input',
  errorsAccess: 'ctx.errors', signalsAccess: 'ctx.signals',
  chainAccess: 'meta.chain', cjpiAccess: 'Double(meta.cjpi)', tierAccess: 'meta.tier',
  userKeysFn: 'userKeys', nowMsFn: 'Int(Date().timeIntervalSince1970 * 1000)',
  elapsedExpr: '(Date().timeIntervalSince1970 - ctx.t0) * 1000',
  caseKeyword: 'case', caseFormat: (lit) => `${lit}:`,
  setExpr: (k, v) => `ctx.data[${jsonLiteral(k)}] = ${v}`,
  pushSignalExpr: (t) => `ctx.signals.append(["type": ${jsonLiteral(t)}, "source": module, "ts": Int(Date().timeIntervalSince1970 * 1000)])`,
  defaultBlock: `        default:
            ctx.data["_module_\\(module.lowercased())"] = ["processed": true, "handler": "generic"] as JsonMap
            ctx.signals.append(["type": "process", "source": module, "ts": Int(Date().timeIntervalSince1970 * 1000)])`,
  switchOpen: `        switch module {`,
  switchClose: `        }`,
  objectLit: (pairs) => `[${pairs.map(([k, v]) => `${jsonLiteral(k)}: ${v}`).join(', ')}] as JsonMap`,
  ternary: (c, h, l) => `((${c}) ? ${h} : ${l})`,
  containsExpr: (h, n) => `${h}.contains(${n})`,
  caseIndent: '        ', bodyIndent: '            ',
});

// ─── KOTLIN ───────────────────────────────────────────────────────────────────
export const KOTLIN_ADAPTER = buildSimpleAdapter({
  id: 'kotlin',
  hashFn: 'quickHash', serializeFn: 'serialize',
  dataAccess: 'data', inputAccess: 'input',
  errorsAccess: 'errors', signalsAccess: 'signals',
  chainAccess: '(meta["chain"] as List<String>)', cjpiAccess: '(meta["cjpi"] as Int).toDouble()',
  tierAccess: '(meta["tier"] as String)',
  userKeysFn: 'userKeys', nowMsFn: 'System.currentTimeMillis()',
  elapsedExpr: '(System.nanoTime() - t0) / 1_000_000.0',
  caseKeyword: '', caseFormat: (lit) => `${lit} -> {`,
  setExpr: (k, v) => `data[${jsonLiteral(k)}] = ${v}`,
  pushSignalExpr: (t) => `signals.add(mapOf("type" to ${jsonLiteral(t)}, "source" to module, "ts" to System.currentTimeMillis()))`,
  defaultBlock: `        else -> {
            data["_module_\${module.lowercase()}"] = mapOf("processed" to true, "handler" to "generic")
            signals.add(mapOf("type" to "process", "source" to module, "ts" to System.currentTimeMillis()))
        }`,
  switchOpen: `    when (module) {`,
  switchClose: `    }`,
  objectLit: (pairs) => `mapOf(${pairs.map(([k, v]) => `${jsonLiteral(k)} to ${v}`).join(', ')})`,
  ternary: (c, h, l) => `(if (${c}) ${h} else ${l})`,
  containsExpr: (h, n) => `${h}.contains(${n})`,
  caseIndent: '        ', bodyIndent: '            ',
});

// Override caseBlock for Kotlin to close the brace
KOTLIN_ADAPTER.caseBlock = (mod, body) =>
  `        ${jsonLiteral(mod)} -> {\n${body.map(l => `            ${l}`).join('\n')}\n        }`;

// ─── RUBY ─────────────────────────────────────────────────────────────────────
export const RUBY_ADAPTER = buildSimpleAdapter({
  id: 'ruby',
  hashFn: 'quick_hash', serializeFn: 'serialize',
  dataAccess: 'data', inputAccess: 'input',
  errorsAccess: 'errors', signalsAccess: 'signals',
  chainAccess: 'meta[:chain]', cjpiAccess: 'meta[:cjpi].to_f', tierAccess: 'meta[:tier]',
  userKeysFn: 'user_keys', nowMsFn: '(Time.now.to_f * 1000).to_i',
  elapsedExpr: '((Time.now.to_f - ctx[:t0]) * 1000)',
  caseKeyword: 'when', caseFormat: (lit) => lit,
  setExpr: (k, v) => `data[${jsonLiteral(k)}] = ${v}`,
  pushSignalExpr: (t) => `signals << { type: ${jsonLiteral(t)}, source: mod, ts: (Time.now.to_f * 1000).to_i }`,
  defaultBlock: `      else
        data["_module_#{mod.downcase}"] = { processed: true, handler: 'generic' }
        signals << { type: 'process', source: mod, ts: (Time.now.to_f * 1000).to_i }`,
  switchOpen: `      case mod`,
  switchClose: `      end`,
  objectLit: (pairs) => `{ ${pairs.map(([k, v]) => `${jsonLiteral(k)} => ${v}`).join(', ')} }`,
  ternary: (c, h, l) => `((${c}) ? ${h} : ${l})`,
  containsExpr: (h, n) => `${h}.include?(${n})`,
  caseIndent: '      ', bodyIndent: '        ',
});
RUBY_ADAPTER.caseBlock = (mod, body) =>
  `      when ${jsonLiteral(mod)}\n${body.map(l => `        ${l}`).join('\n')}`;
RUBY_ADAPTER.keysCount = () => `user_keys(data).length`;
RUBY_ADAPTER.chainLength = () => `meta[:chain].length`;
RUBY_ADAPTER.chainPosition = () => `(meta[:chain].index(mod) || 0)`;
RUBY_ADAPTER.errorCount = () => `errors.length`;
RUBY_ADAPTER.signalCount = () => `signals.length`;
RUBY_ADAPTER.payloadBytes = () => `serialize(data).length`;
RUBY_ADAPTER.classified = (thresholds, fallback) => {
  const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
  return sorted.reduceRight(
    (acc, [n, l]) => `(user_keys(data).length > ${n} ? ${jsonLiteral(l)} : ${acc})`,
    jsonLiteral(fallback) as string,
  );
};
RUBY_ADAPTER.fallbackState = () => `(errors.length > 0 ? 'engaged' : 'standby')`;

// ─── LUA ──────────────────────────────────────────────────────────────────────
export const LUA_ADAPTER = buildSimpleAdapter({
  id: 'lua',
  hashFn: 'quick_hash', serializeFn: 'serialize',
  dataAccess: 'data', inputAccess: 'input',
  errorsAccess: 'errors', signalsAccess: 'signals',
  chainAccess: 'meta.chain', cjpiAccess: 'meta.cjpi', tierAccess: 'meta.tier',
  userKeysFn: 'user_keys', nowMsFn: 'os.time() * 1000',
  elapsedExpr: '(os.clock() - ctx.t0) * 1000',
  caseKeyword: '', caseFormat: () => '',
  setExpr: (k, v) => `data[${jsonLiteral(k)}] = ${v}`,
  pushSignalExpr: (t) => `table.insert(signals, { type = ${jsonLiteral(t)}, source = mod, ts = os.time() * 1000 })`,
  defaultBlock: '',
  switchOpen: '',
  switchClose: '',
  objectLit: (pairs) => `{ ${pairs.map(([k, v]) => `[${jsonLiteral(k)}] = ${v}`).join(', ')} }`,
  ternary: (c, h, l) => `((${c}) and ${h} or ${l})`,
  containsExpr: (h, n) => `(string.find(${h}, ${n}, 1, true) ~= nil)`,
  caseIndent: '', bodyIndent: '        ',
});
// Lua uses if/elseif chain rather than switch — override
LUA_ADAPTER.caseBlock = (mod, body) =>
  `    elseif mod == ${jsonLiteral(mod)} then\n${body.map(l => `        ${l}`).join('\n')}`;
LUA_ADAPTER.switchOpen = () => `    if false then`;
LUA_ADAPTER.switchDefault = () => `    else
        data["_module_" .. string.lower(mod)] = { processed = true, handler = "generic" }
        table.insert(signals, { type = "process", source = mod, ts = os.time() * 1000 })`;
LUA_ADAPTER.switchClose = () => `    end`;
LUA_ADAPTER.keysCount = () => `#user_keys(data)`;
LUA_ADAPTER.chainLength = () => `#meta.chain`;
LUA_ADAPTER.chainPosition = () => `(table_index_of(meta.chain, mod) or 0)`;
LUA_ADAPTER.errorCount = () => `#errors`;
LUA_ADAPTER.signalCount = () => `#signals`;
LUA_ADAPTER.payloadBytes = () => `#serialize(data)`;
LUA_ADAPTER.classified = (thresholds, fallback) => {
  const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
  return sorted.reduceRight(
    (acc, [n, l]) => `((#user_keys(data) > ${n}) and ${jsonLiteral(l)} or ${acc})`,
    jsonLiteral(fallback) as string,
  );
};
LUA_ADAPTER.fallbackState = () => `((#errors > 0) and "engaged" or "standby")`;

// ─── DART ─────────────────────────────────────────────────────────────────────
export const DART_ADAPTER = buildSimpleAdapter({
  id: 'dart',
  hashFn: 'quickHash', serializeFn: 'serialize',
  dataAccess: 'data', inputAccess: 'input',
  errorsAccess: 'errors', signalsAccess: 'signals',
  chainAccess: '(meta["chain"] as List)', cjpiAccess: '(meta["cjpi"] as int).toDouble()',
  tierAccess: '(meta["tier"] as String)',
  userKeysFn: 'userKeys', nowMsFn: 'DateTime.now().millisecondsSinceEpoch',
  elapsedExpr: '(DateTime.now().millisecondsSinceEpoch - t0).toDouble()',
  caseKeyword: 'case', caseFormat: (lit) => `${lit}:`,
  setExpr: (k, v) => `data[${jsonLiteral(k)}] = ${v};`,
  pushSignalExpr: (t) => `signals.add({"type": ${jsonLiteral(t)}, "source": mod, "ts": DateTime.now().millisecondsSinceEpoch});`,
  defaultBlock: `      default:
        data["_module_\${mod.toLowerCase()}"] = {"processed": true, "handler": "generic"};
        signals.add({"type": "process", "source": mod, "ts": DateTime.now().millisecondsSinceEpoch});
        break;`,
  switchOpen: `    switch (mod) {`,
  switchClose: `    }`,
  objectLit: (pairs) => `{${pairs.map(([k, v]) => `${jsonLiteral(k)}: ${v}`).join(', ')}}`,
  ternary: (c, h, l) => `((${c}) ? ${h} : ${l})`,
  containsExpr: (h, n) => `${h}.contains(${n})`,
  caseIndent: '      ', bodyIndent: '        ',
});
DART_ADAPTER.caseBlock = (mod, body) =>
  `      case ${jsonLiteral(mod)}:\n${body.map(l => `        ${l}`).join('\n')}\n        break;`;

// ─── SCALA ────────────────────────────────────────────────────────────────────
export const SCALA_ADAPTER = buildSimpleAdapter({
  id: 'scala',
  hashFn: 'quickHash', serializeFn: 'serialize',
  dataAccess: 'data', inputAccess: 'input',
  errorsAccess: 'errors', signalsAccess: 'signals',
  chainAccess: 'meta("chain").asInstanceOf[List[String]]',
  cjpiAccess: 'meta("cjpi").asInstanceOf[Int].toDouble',
  tierAccess: 'meta("tier").asInstanceOf[String]',
  userKeysFn: 'userKeys', nowMsFn: 'System.currentTimeMillis()',
  elapsedExpr: '(System.nanoTime() - t0) / 1000000.0',
  caseKeyword: 'case', caseFormat: (lit) => `${lit} =>`,
  setExpr: (k, v) => `data(${jsonLiteral(k)}) = ${v}`,
  pushSignalExpr: (t) => `signals += Map("type" -> ${jsonLiteral(t)}, "source" -> module, "ts" -> System.currentTimeMillis())`,
  defaultBlock: `      case _ =>
        data(s"_module_\${module.toLowerCase}") = Map("processed" -> true, "handler" -> "generic")
        signals += Map("type" -> "process", "source" -> module, "ts" -> System.currentTimeMillis())`,
  switchOpen: `    module match {`,
  switchClose: `    }`,
  objectLit: (pairs) => `Map(${pairs.map(([k, v]) => `${jsonLiteral(k)} -> ${v}`).join(', ')})`,
  ternary: (c, h, l) => `(if (${c}) ${h} else ${l})`,
  containsExpr: (h, n) => `${h}.contains(${n})`,
  caseIndent: '      ', bodyIndent: '        ',
});
SCALA_ADAPTER.caseBlock = (mod, body) =>
  `      case ${jsonLiteral(mod)} =>\n${body.map(l => `        ${l}`).join('\n')}`;

// ─── C ────────────────────────────────────────────────────────────────────────
export const C_ADAPTER = buildSimpleAdapter({
  id: 'c',
  hashFn: 'cmpsbl_quick_hash', serializeFn: 'cmpsbl_serialize',
  dataAccess: '&ctx->data', inputAccess: '&ctx->input',
  errorsAccess: 'ctx->errors', signalsAccess: 'ctx->signals',
  chainAccess: 'meta->chain', cjpiAccess: 'meta->cjpi', tierAccess: 'meta->tier',
  userKeysFn: 'cmpsbl_user_keys_count', nowMsFn: 'cmpsbl_now_ms()',
  elapsedExpr: '(cmpsbl_now_ms() - ctx->t0)',
  caseKeyword: 'case', caseFormat: (lit) => `${lit}:`,
  setExpr: (k, v) => `cmpsbl_set(&ctx->data, ${jsonLiteral(k)}, ${v});`,
  pushSignalExpr: (t) => `cmpsbl_emit_signal(ctx, ${jsonLiteral(t)}, module);`,
  defaultBlock: `        default: {
            char key[128]; snprintf(key, sizeof(key), "_module_%s", module);
            cmpsbl_set_generic(&ctx->data, key);
            cmpsbl_emit_signal(ctx, "process", module);
            break;
        }`,
  switchOpen: `    switch (cmpsbl_module_id(module)) {`,
  switchClose: `    }`,
  objectLit: () => `cmpsbl_object_new()`,
  ternary: (c, h, l) => `((${c}) ? ${h} : ${l})`,
  containsExpr: (h, n) => `(strstr(${h}, ${n}) != NULL)`,
  caseIndent: '        ', bodyIndent: '            ',
});
C_ADAPTER.keysCount = () => `cmpsbl_user_keys_count(&ctx->data)`;
C_ADAPTER.chainLength = () => `meta->chain_len`;
C_ADAPTER.chainPosition = () => `cmpsbl_chain_position(meta, module)`;
C_ADAPTER.errorCount = () => `ctx->errors_len`;
C_ADAPTER.signalCount = () => `ctx->signals_len`;
C_ADAPTER.payloadBytes = () => `cmpsbl_serialize_len(&ctx->data)`;
// In C we set fields via setter calls for each key in the object — simpler: emit a setter per field
C_ADAPTER.objectLiteral = (pairs) => {
  // Build via inline block — the transpiler handles this with pre-statements
  return `({ cmpsbl_obj_t* o = cmpsbl_object_new(); ${pairs.map(([k, v]) => `cmpsbl_obj_set(o, ${jsonLiteral(k)}, ${v});`).join(' ')} o; })`;
};
C_ADAPTER.caseBlock = (mod, body) =>
  `        case CMPSBL_MOD_${mod}: {\n${body.map(l => `            ${l}`).join('\n')}\n            break;\n        }`;

// ─── C++ ──────────────────────────────────────────────────────────────────────
export const CPP_ADAPTER = buildSimpleAdapter({
  id: 'cpp',
  hashFn: 'quick_hash', serializeFn: 'serialize',
  dataAccess: 'ctx.data', inputAccess: 'ctx.input',
  errorsAccess: 'ctx.errors', signalsAccess: 'ctx.signals',
  chainAccess: 'meta.chain', cjpiAccess: 'static_cast<double>(meta.cjpi)', tierAccess: 'meta.tier',
  userKeysFn: 'user_keys', nowMsFn: 'now_ms()',
  elapsedExpr: '(std::chrono::duration<double, std::milli>(std::chrono::steady_clock::now() - ctx.t0).count())',
  caseKeyword: 'case', caseFormat: (lit) => `${lit}:`,
  setExpr: (k, v) => `ctx.data[${jsonLiteral(k)}] = ${v};`,
  pushSignalExpr: (t) => `ctx.signals.push_back({{"type", ${jsonLiteral(t)}}, {"source", module}, {"ts", now_ms()}});`,
  defaultBlock: `        default: {
            ctx.data["_module_" + to_lower(module)] = json::object({{"processed", true}, {"handler", "generic"}});
            ctx.signals.push_back({{"type", "process"}, {"source", module}, {"ts", now_ms()}});
            break;
        }`,
  switchOpen: `    switch (module_hash(module)) {`,
  switchClose: `    }`,
  objectLit: (pairs) => `json::object({${pairs.map(([k, v]) => `{${jsonLiteral(k)}, ${v}}`).join(', ')}})`,
  ternary: (c, h, l) => `((${c}) ? ${h} : ${l})`,
  containsExpr: (h, n) => `(${h}.find(${n}) != std::string::npos)`,
  caseIndent: '        ', bodyIndent: '            ',
});
CPP_ADAPTER.keysCount = () => `user_keys(ctx.data).size()`;
CPP_ADAPTER.chainLength = () => `meta.chain.size()`;
CPP_ADAPTER.chainPosition = () => `chain_position(meta.chain, module)`;
CPP_ADAPTER.errorCount = () => `ctx.errors.size()`;
CPP_ADAPTER.signalCount = () => `ctx.signals.size()`;
CPP_ADAPTER.payloadBytes = () => `serialize(ctx.data).size()`;
CPP_ADAPTER.caseBlock = (mod, body) =>
  `        case module_hash(${jsonLiteral(mod)}): {\n${body.map(l => `            ${l}`).join('\n')}\n            break;\n        }`;

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

import { WAVE1_ADAPTERS } from './language-adapters-wave1';
import { WAVE2_ADAPTERS } from './language-adapters-wave2';
import { WAVE3_ADAPTERS } from './language-adapters-wave3';

export const TIER_A_ADAPTERS: Record<string, LanguageAdapter> = {
  rust: RUST_ADAPTER,
  go: GO_ADAPTER,
  java: JAVA_ADAPTER,
  csharp: CSHARP_ADAPTER,
  swift: SWIFT_ADAPTER,
  kotlin: KOTLIN_ADAPTER,
  ruby: RUBY_ADAPTER,
  lua: LUA_ADAPTER,
  dart: DART_ADAPTER,
  scala: SCALA_ADAPTER,
  c: C_ADAPTER,
  cpp: CPP_ADAPTER,
  ...WAVE1_ADAPTERS,
  ...WAVE2_ADAPTERS,
  ...WAVE3_ADAPTERS,
};

export function getAdapter(lang: string): LanguageAdapter | undefined {
  return TIER_A_ADAPTERS[lang.toLowerCase()];
}

// Re-export Wave 1 adapters for direct consumers
export {
  PHP_ADAPTER,
  ELIXIR_ADAPTER,
  HASKELL_ADAPTER,
  FSHARP_ADAPTER,
  JULIA_ADAPTER,
} from './language-adapters-wave1';

// Re-export Wave 2 adapters for direct consumers
export {
  CLOJURE_ADAPTER,
  OCAML_ADAPTER,
  ZIG_ADAPTER,
  NIM_ADAPTER,
  CRYSTAL_ADAPTER,
} from './language-adapters-wave2';

// Re-export Wave 3 adapters for direct consumers
export {
  ERLANG_ADAPTER,
  R_ADAPTER,
  OBJC_ADAPTER,
  D_ADAPTER,
  GROOVY_ADAPTER,
} from './language-adapters-wave3';
