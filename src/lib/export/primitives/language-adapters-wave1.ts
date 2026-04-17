/**
 * Wave 1 Language Adapters — PHP, Elixir, Haskell, F#, Julia
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Same LanguageAdapter contract as the original Tier-A adapters.
 * Each renders BehavioralSpec fields as idiomatic native syntax so
 * every one of the 40 primitives produces real work in every language.
 *
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
// PHP ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════
export const PHP_ADAPTER: LanguageAdapter = {
  id: 'php',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quick_hash(json_encode($ctx['data']))`,
  hashOfInput: () => `quick_hash(json_encode($ctx['input'] ?? []))`,
  keysCount: () => `count(user_keys($ctx['data']))`,
  keysList: () => `array_values(user_keys($ctx['data']))`,
  cjpiInt: () => `(int)$meta['cjpi']`,
  cjpiRatio: () => `((int)$meta['cjpi']) / 100.0`,
  chainLength: () => `count($meta['chain'])`,
  chainPosition: () => `(array_search($module, $meta['chain']) === false ? 0 : array_search($module, $meta['chain']) + 1)`,
  errorCount: () => `count($ctx['errors'])`,
  signalCount: () => `count($ctx['signals'])`,
  payloadBytes: () => `strlen(json_encode($ctx['data']))`,
  elapsedMs: () => `(int)((microtime(true) - $ctx['t0']) * 1000)`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) => `(count(user_keys($ctx['data'])) > ${n} ? ${jsonLiteral(l)} : ${acc})`,
      jsonLiteral(fallback) as string,
    );
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) => `($meta['tier'] === ${jsonLiteral(t)} ? ${typeof v === 'string' ? jsonLiteral(v) : v} : ${acc})`,
      String(fb),
    );
  },
  tierPassthrough: () => `$meta['tier']`,
  threatCount: (tokens) => {
    const s = `json_encode($ctx['data'])`;
    const checks = tokens.map((t) => `strpos(${s}, ${jsonLiteral(t)}) !== false`).join(' || ');
    return `((${checks}) ? 1 : 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `((((int)$meta['cjpi']) / 100.0) > ${th} ? ${jsonLiteral(hi)} : ${jsonLiteral(lo)})`,
  fallbackState: () => `(count($ctx['errors']) > 0 ? 'engaged' : 'standby')`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `${jsonLiteral(k)} => ${v}`).join(', ');
    return `[${inner}]`;
  },
  setDataField: (key, val) => `$ctx['data'][${jsonLiteral(key)}] = ${val};`,
  emitSignal: (t) =>
    `$ctx['signals'][] = ['type' => ${jsonLiteral(t)}, 'source' => $module, 'ts' => (int)(microtime(true) * 1000)];`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `        case ${jsonLiteral(mod)}:\n${body.map((l) => `            ${l}`).join('\n')}\n            break;`,
  switchOpen: () => `    switch ($module) {`,
  switchDefault: () =>
    `        default:
            $ctx['data']['_module_' . strtolower($module)] = ['processed' => true, 'handler' => 'generic'];
            $ctx['signals'][] = ['type' => 'process', 'source' => $module, 'ts' => (int)(microtime(true) * 1000)];
            break;`,
  switchClose: () => `    }`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ELIXIR ADAPTER (functional, pattern-match based)
// ═══════════════════════════════════════════════════════════════════════════════
// Elixir doesn't really do "switch" — we render a `case module do ... end`
export const ELIXIR_ADAPTER: LanguageAdapter = {
  id: 'elixir',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quick_hash(:erlang.term_to_binary(ctx.data))`,
  hashOfInput: () => `quick_hash(:erlang.term_to_binary(Map.get(ctx, :input, %{})))`,
  keysCount: () => `length(user_keys(ctx.data))`,
  keysList: () => `user_keys(ctx.data)`,
  cjpiInt: () => `meta.cjpi`,
  cjpiRatio: () => `meta.cjpi / 100.0`,
  chainLength: () => `length(meta.chain)`,
  chainPosition: () => `(case Enum.find_index(meta.chain, fn m -> m == module end) do nil -> 0; i -> i + 1 end)`,
  errorCount: () => `length(ctx.errors)`,
  signalCount: () => `length(ctx.signals)`,
  payloadBytes: () => `byte_size(:erlang.term_to_binary(ctx.data))`,
  elapsedMs: () => `System.monotonic_time(:millisecond) - ctx.t0`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) => `(if length(user_keys(ctx.data)) > ${n}, do: ${jsonLiteral(l)}, else: ${acc})`,
      jsonLiteral(fallback) as string,
    );
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) => `(if meta.tier == ${jsonLiteral(t)}, do: ${typeof v === 'string' ? jsonLiteral(v) : v}, else: ${acc})`,
      String(fb),
    );
  },
  tierPassthrough: () => `meta.tier`,
  threatCount: (tokens) => {
    const s = `:erlang.term_to_binary(ctx.data) |> Base.encode16()`;
    const checks = tokens.map((t) => `String.contains?(${s}, ${jsonLiteral(t)})`).join(' or ');
    return `(if ${checks}, do: 1, else: 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `(if (meta.cjpi / 100.0) > ${th}, do: ${jsonLiteral(hi)}, else: ${jsonLiteral(lo)})`,
  fallbackState: () => `(if length(ctx.errors) > 0, do: "engaged", else: "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `${jsonLiteral(k)} => ${v}`).join(', ');
    return `%{${inner}}`;
  },
  setDataField: (key, val) =>
    `ctx = put_in(ctx.data[${jsonLiteral(key)}], ${val})`,
  emitSignal: (t) =>
    `ctx = Map.update!(ctx, :signals, fn s -> s ++ [%{type: ${jsonLiteral(t)}, source: module, ts: System.system_time(:millisecond)}] end)`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `      ${jsonLiteral(mod)} ->\n${body.map((l) => `        ${l}`).join('\n')}\n        ctx`,
  switchOpen: () => `    ctx = case module do`,
  switchDefault: () =>
    `      _ ->
        ctx = put_in(ctx.data["_module_" <> String.downcase(module)], %{processed: true, handler: "generic"})
        Map.update!(ctx, :signals, fn s -> s ++ [%{type: "process", source: module, ts: System.system_time(:millisecond)}] end)`,
  switchClose: () => `    end`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// HASKELL ADAPTER (pure functional — uses State-style record updates)
// ═══════════════════════════════════════════════════════════════════════════════
// We render a `case` on the module String returning an updated Ctx via let-bindings.
export const HASKELL_ADAPTER: LanguageAdapter = {
  id: 'haskell',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `JString (quickHash (show (ctxData ctx)))`,
  hashOfInput: () => `JString (quickHash (show (ctxInput ctx)))`,
  keysCount: () => `JInt (length (userKeys (ctxData ctx)))`,
  keysList: () => `JArr (map JString (userKeys (ctxData ctx)))`,
  cjpiInt: () => `JInt (metaCjpi meta)`,
  cjpiRatio: () => `JNum (fromIntegral (metaCjpi meta) / 100.0)`,
  chainLength: () => `JInt (length (metaChain meta))`,
  chainPosition: () => `JInt (chainPosition (metaChain meta) modName)`,
  errorCount: () => `JInt (length (ctxErrors ctx))`,
  signalCount: () => `JInt (length (ctxSignals ctx))`,
  payloadBytes: () => `JInt (length (show (ctxData ctx)))`,
  elapsedMs: () => `JInt (elapsedMs ctx)`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    const expr = sorted.reduceRight(
      (acc, [n, l]) =>
        `(if length (userKeys (ctxData ctx)) > ${n} then ${jsonLiteral(l)} else ${acc})`,
      jsonLiteral(fallback) as string,
    );
    return `JString ${expr}`;
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    const expr = Object.entries(map).reduceRight(
      (acc, [t, v]) =>
        `(if metaTier meta == ${jsonLiteral(t)} then ${typeof v === 'string' ? jsonLiteral(v) : v} else ${acc})`,
      String(fb),
    );
    return `JString ${expr}`;
  },
  tierPassthrough: () => `JString (metaTier meta)`,
  threatCount: (tokens) => {
    const s = `show (ctxData ctx)`;
    const checks = tokens.map((t) => `isInfixOf ${jsonLiteral(t)} (${s})`).join(' || ');
    return `JInt (if ${checks} then 1 else 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `JString (if (fromIntegral (metaCjpi meta) / 100.0) > ${th} then ${jsonLiteral(hi)} else ${jsonLiteral(lo)})`,
  fallbackState: () =>
    `JString (if length (ctxErrors ctx) > 0 then "engaged" else "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `(${jsonLiteral(k)}, ${v})`).join(', ');
    return `JObj (Map.fromList [${inner}])`;
  },
  setDataField: (key, val) =>
    `let ctx' = ctx { ctxData = Map.insert ${jsonLiteral(key)} (${val}) (ctxData ctx) }`,
  emitSignal: (t) =>
    `in ctx' { ctxSignals = ctxSignals ctx' ++ [Signal { sigType = ${jsonLiteral(t)}, sigSource = modName, sigTs = nowMs }] }`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `      ${jsonLiteral(mod)} ->\n${body.map((l) => `        ${l}`).join('\n')}`,
  switchOpen: () => `    case modName of`,
  switchDefault: () =>
    `      _ ->
        let ctx' = ctx { ctxData = Map.insert ("_module_" ++ map toLower modName) (JObj (Map.fromList [("processed", JBool True), ("handler", JString "generic")])) (ctxData ctx) }
        in ctx' { ctxSignals = ctxSignals ctx' ++ [Signal { sigType = "process", sigSource = modName, sigTs = nowMs }] }`,
  switchClose: () => ``,
};

// ═══════════════════════════════════════════════════════════════════════════════
// F# ADAPTER (functional / .NET; uses pattern match)
// ═══════════════════════════════════════════════════════════════════════════════
export const FSHARP_ADAPTER: LanguageAdapter = {
  id: 'fsharp',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quickHash (sprintf "%A" ctx.Data)`,
  hashOfInput: () => `quickHash (sprintf "%A" ctx.Input)`,
  keysCount: () => `(userKeys ctx.Data |> List.length)`,
  keysList: () => `(userKeys ctx.Data)`,
  cjpiInt: () => `meta.Cjpi`,
  cjpiRatio: () => `(float meta.Cjpi / 100.0)`,
  chainLength: () => `(List.length meta.Chain)`,
  chainPosition: () =>
    `(match List.tryFindIndex (fun m -> m = modName) meta.Chain with | Some i -> i + 1 | None -> 0)`,
  errorCount: () => `(List.length ctx.Errors)`,
  signalCount: () => `(List.length ctx.Signals)`,
  payloadBytes: () => `(sprintf "%A" ctx.Data |> String.length)`,
  elapsedMs: () => `(int (System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - ctx.T0))`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) =>
        `(if (userKeys ctx.Data |> List.length) > ${n} then ${jsonLiteral(l)} else ${acc})`,
      jsonLiteral(fallback) as string,
    );
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) =>
        `(if meta.Tier = ${jsonLiteral(t)} then ${typeof v === 'string' ? jsonLiteral(v) : v} else ${acc})`,
      String(fb),
    );
  },
  tierPassthrough: () => `meta.Tier`,
  threatCount: (tokens) => {
    const s = `(sprintf "%A" ctx.Data)`;
    const checks = tokens.map((t) => `${s}.Contains(${jsonLiteral(t)})`).join(' || ');
    return `(if ${checks} then 1 else 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `(if (float meta.Cjpi / 100.0) > ${th} then ${jsonLiteral(hi)} else ${jsonLiteral(lo)})`,
  fallbackState: () =>
    `(if List.length ctx.Errors > 0 then "engaged" else "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `(${jsonLiteral(k)}, box ${v})`).join('; ');
    return `Map.ofList [${inner}]`;
  },
  setDataField: (key, val) =>
    `ctx <- { ctx with Data = Map.add ${jsonLiteral(key)} (box ${val}) ctx.Data }`,
  emitSignal: (t) =>
    `ctx <- { ctx with Signals = ctx.Signals @ [{ Type = ${jsonLiteral(t)}; Source = modName; Ts = System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }] }`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `        | ${jsonLiteral(mod)} ->\n${body.map((l) => `            ${l}`).join('\n')}`,
  switchOpen: () => `    let mutable ctx = ctx\n    match modName with`,
  switchDefault: () =>
    `        | _ ->
            ctx <- { ctx with Data = Map.add ("_module_" + modName.ToLower()) (box (Map.ofList [("processed", box true); ("handler", box "generic")])) ctx.Data }
            ctx <- { ctx with Signals = ctx.Signals @ [{ Type = "process"; Source = modName; Ts = System.DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }] }`,
  switchClose: () => `    ctx`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// JULIA ADAPTER (scientific; if/elseif chain over module string)
// ═══════════════════════════════════════════════════════════════════════════════
export const JULIA_ADAPTER: LanguageAdapter = {
  id: 'julia',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quick_hash(string(ctx.data))`,
  hashOfInput: () => `quick_hash(string(get(ctx, :input, Dict())))`,
  keysCount: () => `length(user_keys(ctx.data))`,
  keysList: () => `user_keys(ctx.data)`,
  cjpiInt: () => `meta.cjpi`,
  cjpiRatio: () => `meta.cjpi / 100.0`,
  chainLength: () => `length(meta.chain)`,
  chainPosition: () =>
    `(idx = findfirst(==(modname), meta.chain); idx === nothing ? 0 : idx)`,
  errorCount: () => `length(ctx.errors)`,
  signalCount: () => `length(ctx.signals)`,
  payloadBytes: () => `length(string(ctx.data))`,
  elapsedMs: () => `Int(round((time() - ctx.t0) * 1000))`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) =>
        `(length(user_keys(ctx.data)) > ${n} ? ${jsonLiteral(l)} : ${acc})`,
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
    const s = `string(ctx.data)`;
    const checks = tokens.map((t) => `occursin(${jsonLiteral(t)}, ${s})`).join(' || ');
    return `((${checks}) ? 1 : 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `((meta.cjpi / 100.0) > ${th} ? ${jsonLiteral(hi)} : ${jsonLiteral(lo)})`,
  fallbackState: () =>
    `(length(ctx.errors) > 0 ? "engaged" : "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `${jsonLiteral(k)} => ${v}`).join(', ');
    return `Dict{String,Any}(${inner})`;
  },
  setDataField: (key, val) => `ctx.data[${jsonLiteral(key)}] = ${val}`,
  emitSignal: (t) =>
    `push!(ctx.signals, Dict("type" => ${jsonLiteral(t)}, "source" => modname, "ts" => Int(round(time() * 1000))))`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `    elseif modname == ${jsonLiteral(mod)}\n${body.map((l) => `        ${l}`).join('\n')}`,
  switchOpen: () => `    if false`,
  switchDefault: () =>
    `    else
        ctx.data["_module_" * lowercase(modname)] = Dict("processed" => true, "handler" => "generic")
        push!(ctx.signals, Dict("type" => "process", "source" => modname, "ts" => Int(round(time() * 1000))))`,
  switchClose: () => `    end`,
};

export const WAVE1_ADAPTERS: Record<string, LanguageAdapter> = {
  php: PHP_ADAPTER,
  elixir: ELIXIR_ADAPTER,
  haskell: HASKELL_ADAPTER,
  fsharp: FSHARP_ADAPTER,
  julia: JULIA_ADAPTER,
};
