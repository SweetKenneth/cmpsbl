/**
 * Wave 2 Language Adapters — Clojure, OCaml, Zig, Nim, Crystal
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * © CMPSBL® — All rights reserved.
 */

import type { LanguageAdapter } from './language-adapters';

function jsonLiteral(v: string | number | boolean): string {
  if (typeof v === 'string') return JSON.stringify(v);
  return String(v);
}

function indentLines(code: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return code.split('\n').map((l) => (l ? pad + l : l)).join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLOJURE ADAPTER (Lisp; uses `case` macro)
// ═══════════════════════════════════════════════════════════════════════════════
export const CLOJURE_ADAPTER: LanguageAdapter = {
  id: 'clojure',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `(quick-hash (pr-str (:data ctx)))`,
  hashOfInput: () => `(quick-hash (pr-str (:input ctx)))`,
  keysCount: () => `(count (user-keys (:data ctx)))`,
  keysList: () => `(vec (user-keys (:data ctx)))`,
  cjpiInt: () => `(:cjpi meta)`,
  cjpiRatio: () => `(/ (:cjpi meta) 100.0)`,
  chainLength: () => `(count (:chain meta))`,
  chainPosition: () =>
    `(let [i (.indexOf (:chain meta) modname)] (if (neg? i) 0 (inc i)))`,
  errorCount: () => `(count (:errors ctx))`,
  signalCount: () => `(count (:signals ctx))`,
  payloadBytes: () => `(count (pr-str (:data ctx)))`,
  elapsedMs: () => `(- (System/currentTimeMillis) (:t0 ctx))`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) =>
        `(if (> (count (user-keys (:data ctx))) ${n}) ${jsonLiteral(l)} ${acc})`,
      jsonLiteral(fallback) as string,
    );
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) =>
        `(if (= (:tier meta) ${jsonLiteral(t)}) ${typeof v === 'string' ? jsonLiteral(v) : v} ${acc})`,
      String(fb),
    );
  },
  tierPassthrough: () => `(:tier meta)`,
  threatCount: (tokens) => {
    const s = `(pr-str (:data ctx))`;
    const checks = tokens
      .map((t) => `(.contains ${s} ${jsonLiteral(t)})`)
      .join(' ');
    return `(if (or ${checks}) 1 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `(if (> (/ (:cjpi meta) 100.0) ${th}) ${jsonLiteral(hi)} ${jsonLiteral(lo)})`,
  fallbackState: () =>
    `(if (pos? (count (:errors ctx))) "engaged" "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `${jsonLiteral(k)} ${v}`).join(' ');
    return `{${inner}}`;
  },
  setDataField: (key, val) =>
    `(set! ctx (assoc-in ctx [:data ${jsonLiteral(key)}] ${val}))`,
  emitSignal: (t) =>
    `(set! ctx (update ctx :signals conj {"type" ${jsonLiteral(t)} "source" modname "ts" (System/currentTimeMillis)}))`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `      ${jsonLiteral(mod)}\n      (do\n${body.map((l) => `        ${l}`).join('\n')})`,
  switchOpen: () => `    (case modname`,
  switchDefault: () =>
    `      (do
        (set! ctx (assoc-in ctx [:data (str "_module_" (.toLowerCase modname))] {"processed" true "handler" "generic"}))
        (set! ctx (update ctx :signals conj {"type" "process" "source" modname "ts" (System/currentTimeMillis)}))))`,
  switchClose: () => ``,
};

// ═══════════════════════════════════════════════════════════════════════════════
// OCAML ADAPTER (functional; uses `match`)
// ═══════════════════════════════════════════════════════════════════════════════
export const OCAML_ADAPTER: LanguageAdapter = {
  id: 'ocaml',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quick_hash (string_of_data ctx.data)`,
  hashOfInput: () => `quick_hash (string_of_data ctx.input)`,
  keysCount: () => `List.length (user_keys ctx.data)`,
  keysList: () => `user_keys ctx.data`,
  cjpiInt: () => `meta.cjpi`,
  cjpiRatio: () => `(float_of_int meta.cjpi) /. 100.0`,
  chainLength: () => `List.length meta.chain`,
  chainPosition: () =>
    `(try (List.find_index (fun m -> m = modname) meta.chain |> Option.value ~default:(-1)) + 1 with _ -> 0)`,
  errorCount: () => `List.length ctx.errors`,
  signalCount: () => `List.length ctx.signals`,
  payloadBytes: () => `String.length (string_of_data ctx.data)`,
  elapsedMs: () => `int_of_float ((Unix.gettimeofday () -. ctx.t0) *. 1000.0)`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) =>
        `(if List.length (user_keys ctx.data) > ${n} then ${jsonLiteral(l)} else ${acc})`,
      jsonLiteral(fallback) as string,
    );
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) =>
        `(if meta.tier = ${jsonLiteral(t)} then ${typeof v === 'string' ? jsonLiteral(v) : v} else ${acc})`,
      String(fb),
    );
  },
  tierPassthrough: () => `meta.tier`,
  threatCount: (tokens) => {
    const s = `string_of_data ctx.data`;
    const checks = tokens
      .map((t) => `(try ignore (Str.search_forward (Str.regexp_string ${jsonLiteral(t)}) (${s}) 0); true with Not_found -> false)`)
      .join(' || ');
    return `(if ${checks} then 1 else 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `(if ((float_of_int meta.cjpi) /. 100.0) > ${th} then ${jsonLiteral(hi)} else ${jsonLiteral(lo)})`,
  fallbackState: () =>
    `(if List.length ctx.errors > 0 then "engaged" else "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `(${jsonLiteral(k)}, JBox ${v})`).join('; ');
    return `JObj [${inner}]`;
  },
  setDataField: (key, val) =>
    `ctx.data <- (${jsonLiteral(key)}, ${val}) :: (List.filter (fun (k,_) -> k <> ${jsonLiteral(key)}) ctx.data)`,
  emitSignal: (t) =>
    `ctx.signals <- ctx.signals @ [{ stype = ${jsonLiteral(t)}; ssource = modname; sts = int_of_float (Unix.gettimeofday () *. 1000.0) }]`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `      | ${jsonLiteral(mod)} ->\n${body.map((l) => `          ${l}`).join('\n')}`,
  switchOpen: () => `    (match modname with`,
  switchDefault: () =>
    `      | _ ->
          ctx.data <- ("_module_" ^ String.lowercase_ascii modname, JObj [("processed", JBox "true"); ("handler", JBox "generic")]) :: ctx.data;
          ctx.signals <- ctx.signals @ [{ stype = "process"; ssource = modname; sts = int_of_float (Unix.gettimeofday () *. 1000.0) }])`,
  switchClose: () => ``,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ZIG ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════
export const ZIG_ADAPTER: LanguageAdapter = {
  id: 'zig',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quickHash(ctx.serializeData())`,
  hashOfInput: () => `quickHash(ctx.serializeInput())`,
  keysCount: () => `ctx.userKeysCount()`,
  keysList: () => `ctx.userKeysList()`,
  cjpiInt: () => `meta.cjpi`,
  cjpiRatio: () => `(@as(f64, @floatFromInt(meta.cjpi)) / 100.0)`,
  chainLength: () => `meta.chain.len`,
  chainPosition: () => `ctx.chainPosition(modname)`,
  errorCount: () => `ctx.errors.items.len`,
  signalCount: () => `ctx.signals.items.len`,
  payloadBytes: () => `ctx.serializeData().len`,
  elapsedMs: () => `(std.time.milliTimestamp() - ctx.t0)`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) =>
        `(if (ctx.userKeysCount() > ${n}) ${jsonLiteral(l)} else ${acc})`,
      jsonLiteral(fallback) as string,
    );
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) =>
        `(if (std.mem.eql(u8, meta.tier, ${jsonLiteral(t)})) ${typeof v === 'string' ? jsonLiteral(v) : v} else ${acc})`,
      String(fb),
    );
  },
  tierPassthrough: () => `meta.tier`,
  threatCount: (tokens) => {
    const s = `ctx.serializeData()`;
    const checks = tokens
      .map((t) => `(std.mem.indexOf(u8, ${s}, ${jsonLiteral(t)}) != null)`)
      .join(' or ');
    return `(if (${checks}) @as(i32, 1) else @as(i32, 0))`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `(if ((@as(f64, @floatFromInt(meta.cjpi)) / 100.0) > ${th}) ${jsonLiteral(hi)} else ${jsonLiteral(lo)})`,
  fallbackState: () =>
    `(if (ctx.errors.items.len > 0) "engaged" else "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `.{ .key = ${jsonLiteral(k)}, .value = ${v} }`).join(', ');
    return `&[_]Pair{${inner}}`;
  },
  setDataField: (key, val) =>
    `try ctx.setData(${jsonLiteral(key)}, ${val});`,
  emitSignal: (t) =>
    `try ctx.emitSignal(${jsonLiteral(t)}, modname);`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `        if (std.mem.eql(u8, modname, ${jsonLiteral(mod)})) {\n${body.map((l) => `            ${l}`).join('\n')}\n            return;\n        }`,
  switchOpen: () => `    {`,
  switchDefault: () =>
    `        // default branch
        try ctx.setGenericModule(modname);
        try ctx.emitSignal("process", modname);`,
  switchClose: () => `    }`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// NIM ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════
export const NIM_ADAPTER: LanguageAdapter = {
  id: 'nim',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quickHash($ctx.data)`,
  hashOfInput: () => `quickHash($ctx.input)`,
  keysCount: () => `userKeys(ctx.data).len`,
  keysList: () => `userKeys(ctx.data)`,
  cjpiInt: () => `meta.cjpi`,
  cjpiRatio: () => `meta.cjpi.float / 100.0`,
  chainLength: () => `meta.chain.len`,
  chainPosition: () => `(let i = meta.chain.find(modname); (if i < 0: 0 else: i + 1))`,
  errorCount: () => `ctx.errors.len`,
  signalCount: () => `ctx.signals.len`,
  payloadBytes: () => `($ctx.data).len`,
  elapsedMs: () => `int(epochTime() * 1000) - ctx.t0`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) =>
        `(if userKeys(ctx.data).len > ${n}: ${jsonLiteral(l)} else: ${acc})`,
      jsonLiteral(fallback) as string,
    );
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) =>
        `(if meta.tier == ${jsonLiteral(t)}: ${typeof v === 'string' ? jsonLiteral(v) : v} else: ${acc})`,
      String(fb),
    );
  },
  tierPassthrough: () => `meta.tier`,
  threatCount: (tokens) => {
    const s = `$ctx.data`;
    const checks = tokens.map((t) => `${s}.contains(${jsonLiteral(t)})`).join(' or ');
    return `(if ${checks}: 1 else: 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `(if (meta.cjpi.float / 100.0) > ${th}: ${jsonLiteral(hi)} else: ${jsonLiteral(lo)})`,
  fallbackState: () =>
    `(if ctx.errors.len > 0: "engaged" else: "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `(${jsonLiteral(k)}, %* ${v})`).join(', ');
    return `{${inner}}.toTable`;
  },
  setDataField: (key, val) => `ctx.data[${jsonLiteral(key)}] = %* ${val}`,
  emitSignal: (t) =>
    `ctx.signals.add(%*{"type": ${jsonLiteral(t)}, "source": modname, "ts": int(epochTime() * 1000)})`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `    of ${jsonLiteral(mod)}:\n${body.map((l) => `      ${l}`).join('\n')}`,
  switchOpen: () => `    case modname:`,
  switchDefault: () =>
    `    else:
      ctx.data["_module_" & modname.toLowerAscii] = %* {"processed": true, "handler": "generic"}
      ctx.signals.add(%*{"type": "process", "source": modname, "ts": int(epochTime() * 1000)})`,
  switchClose: () => ``,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CRYSTAL ADAPTER (Ruby-like syntax, compiled)
// ═══════════════════════════════════════════════════════════════════════════════
export const CRYSTAL_ADAPTER: LanguageAdapter = {
  id: 'crystal',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quick_hash(ctx.data.to_json)`,
  hashOfInput: () => `quick_hash(ctx.input.to_json)`,
  keysCount: () => `user_keys(ctx.data).size`,
  keysList: () => `user_keys(ctx.data)`,
  cjpiInt: () => `meta.cjpi`,
  cjpiRatio: () => `meta.cjpi.to_f / 100.0`,
  chainLength: () => `meta.chain.size`,
  chainPosition: () => `(meta.chain.index(modname).try(&.+(1)) || 0)`,
  errorCount: () => `ctx.errors.size`,
  signalCount: () => `ctx.signals.size`,
  payloadBytes: () => `ctx.data.to_json.bytesize`,
  elapsedMs: () => `(Time.utc.to_unix_ms - ctx.t0)`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) =>
        `(user_keys(ctx.data).size > ${n} ? ${jsonLiteral(l)} : ${acc})`,
      jsonLiteral(fallback) as string,
    );
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) =>
        `(meta.tier == ${jsonLiteral(t)} ? ${typeof v === 'string' ? jsonLiteral(v) : v} : ${acc})`,
      String(fb),
    );
  },
  tierPassthrough: () => `meta.tier`,
  threatCount: (tokens) => {
    const s = `ctx.data.to_json`;
    const checks = tokens.map((t) => `${s}.includes?(${jsonLiteral(t)})`).join(' || ');
    return `((${checks}) ? 1 : 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `((meta.cjpi.to_f / 100.0) > ${th} ? ${jsonLiteral(hi)} : ${jsonLiteral(lo)})`,
  fallbackState: () =>
    `(ctx.errors.size > 0 ? "engaged" : "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `${jsonLiteral(k)} => ${v}`).join(', ');
    return `{${inner}} of String => JSON::Any`;
  },
  setDataField: (key, val) => `ctx.data[${jsonLiteral(key)}] = JSON.parse(${val}.to_json)`,
  emitSignal: (t) =>
    `ctx.signals << {"type" => ${jsonLiteral(t)}, "source" => modname, "ts" => Time.utc.to_unix_ms}`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `      when ${jsonLiteral(mod)}\n${body.map((l) => `        ${l}`).join('\n')}`,
  switchOpen: () => `    case modname`,
  switchDefault: () =>
    `      else
        ctx.data["_module_#{modname.downcase}"] = JSON.parse({"processed" => true, "handler" => "generic"}.to_json)
        ctx.signals << {"type" => "process", "source" => modname, "ts" => Time.utc.to_unix_ms}`,
  switchClose: () => `    end`,
};

export const WAVE2_ADAPTERS: Record<string, LanguageAdapter> = {
  clojure: CLOJURE_ADAPTER,
  ocaml: OCAML_ADAPTER,
  zig: ZIG_ADAPTER,
  nim: NIM_ADAPTER,
  crystal: CRYSTAL_ADAPTER,
};
