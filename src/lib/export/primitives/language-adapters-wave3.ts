/**
 * Wave 3 Language Adapters — Erlang, R, Objective-C, D, Groovy
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
// ERLANG ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════
export const ERLANG_ADAPTER: LanguageAdapter = {
  id: 'erlang',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quick_hash(io_lib:format("~p", [maps:get(data, Ctx)]))`,
  hashOfInput: () => `quick_hash(io_lib:format("~p", [maps:get(input, Ctx, #{})]))`,
  keysCount: () => `length(user_keys(maps:get(data, Ctx)))`,
  keysList: () => `user_keys(maps:get(data, Ctx))`,
  cjpiInt: () => `maps:get(cjpi, Meta)`,
  cjpiRatio: () => `maps:get(cjpi, Meta) / 100.0`,
  chainLength: () => `length(maps:get(chain, Meta))`,
  chainPosition: () =>
    `(case lists:member(Modname, maps:get(chain, Meta)) of true -> length(lists:takewhile(fun(M) -> M =/= Modname end, maps:get(chain, Meta))) + 1; false -> 0 end)`,
  errorCount: () => `length(maps:get(errors, Ctx))`,
  signalCount: () => `length(maps:get(signals, Ctx))`,
  payloadBytes: () => `length(lists:flatten(io_lib:format("~p", [maps:get(data, Ctx)])))`,
  elapsedMs: () => `erlang:system_time(millisecond) - maps:get(t0, Ctx)`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) =>
        `(case length(user_keys(maps:get(data, Ctx))) > ${n} of true -> ${jsonLiteral(l)}; false -> ${acc} end)`,
      jsonLiteral(fallback) as string,
    );
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) =>
        `(case maps:get(tier, Meta) =:= ${jsonLiteral(t)} of true -> ${typeof v === 'string' ? jsonLiteral(v) : v}; false -> ${acc} end)`,
      String(fb),
    );
  },
  tierPassthrough: () => `maps:get(tier, Meta)`,
  threatCount: (tokens) => {
    const s = `lists:flatten(io_lib:format("~p", [maps:get(data, Ctx)]))`;
    const checks = tokens
      .map((t) => `(string:str(${s}, ${jsonLiteral(t)}) > 0)`)
      .join(' orelse ');
    return `(case (${checks}) of true -> 1; false -> 0 end)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `(case (maps:get(cjpi, Meta) / 100.0) > ${th} of true -> ${jsonLiteral(hi)}; false -> ${jsonLiteral(lo)} end)`,
  fallbackState: () =>
    `(case length(maps:get(errors, Ctx)) > 0 of true -> "engaged"; false -> "standby" end)`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `${jsonLiteral(k)} => ${v}`).join(', ');
    return `#{${inner}}`;
  },
  setDataField: (key, val) =>
    `Ctx2 = maps:put(data, maps:put(${jsonLiteral(key)}, ${val}, maps:get(data, Ctx)), Ctx),`,
  emitSignal: (t) =>
    `Ctx3 = maps:put(signals, maps:get(signals, Ctx2) ++ [#{type => ${jsonLiteral(t)}, source => Modname, ts => erlang:system_time(millisecond)}], Ctx2), Ctx = Ctx3,`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `        ${jsonLiteral(mod)} ->\n${body.map((l) => `            ${l}`).join('\n')}\n            ok;`,
  switchOpen: () => `    case Modname of`,
  switchDefault: () =>
    `        _ ->
            CtxA = maps:put(data, maps:put("_module_" ++ string:lowercase(Modname), #{processed => true, handler => "generic"}, maps:get(data, Ctx)), Ctx),
            _CtxB = maps:put(signals, maps:get(signals, CtxA) ++ [#{type => "process", source => Modname, ts => erlang:system_time(millisecond)}], CtxA),
            ok`,
  switchClose: () => `    end`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// R ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════
export const R_ADAPTER: LanguageAdapter = {
  id: 'r',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quick_hash(jsonlite::toJSON(ctx$data))`,
  hashOfInput: () => `quick_hash(jsonlite::toJSON(ctx$input))`,
  keysCount: () => `length(user_keys(ctx$data))`,
  keysList: () => `user_keys(ctx$data)`,
  cjpiInt: () => `meta$cjpi`,
  cjpiRatio: () => `meta$cjpi / 100.0`,
  chainLength: () => `length(meta$chain)`,
  chainPosition: () =>
    `({ idx <- which(meta$chain == modname); if (length(idx) == 0) 0 else idx[1] })`,
  errorCount: () => `length(ctx$errors)`,
  signalCount: () => `length(ctx$signals)`,
  payloadBytes: () => `nchar(jsonlite::toJSON(ctx$data))`,
  elapsedMs: () => `as.integer((as.numeric(Sys.time()) - ctx$t0) * 1000)`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) =>
        `(if (length(user_keys(ctx$data)) > ${n}) ${jsonLiteral(l)} else ${acc})`,
      jsonLiteral(fallback) as string,
    );
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? jsonLiteral(fallback) : fallback;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) =>
        `(if (meta$tier == ${jsonLiteral(t)}) ${typeof v === 'string' ? jsonLiteral(v) : v} else ${acc})`,
      String(fb),
    );
  },
  tierPassthrough: () => `meta$tier`,
  threatCount: (tokens) => {
    const s = `as.character(jsonlite::toJSON(ctx$data))`;
    const checks = tokens
      .map((t) => `grepl(${jsonLiteral(t)}, ${s}, fixed = TRUE)`)
      .join(' || ');
    return `(if (${checks}) 1L else 0L)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `(if ((meta$cjpi / 100.0) > ${th}) ${jsonLiteral(hi)} else ${jsonLiteral(lo)})`,
  fallbackState: () =>
    `(if (length(ctx$errors) > 0) "engaged" else "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `${jsonLiteral(k)} = ${v}`).join(', ');
    return `list(${inner})`;
  },
  setDataField: (key, val) => `ctx$data[[${jsonLiteral(key)}]] <- ${val}`,
  emitSignal: (t) =>
    `ctx$signals[[length(ctx$signals) + 1]] <- list(type = ${jsonLiteral(t)}, source = modname, ts = as.integer(as.numeric(Sys.time()) * 1000))`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `    } else if (modname == ${jsonLiteral(mod)}) {\n${body.map((l) => `      ${l}`).join('\n')}`,
  switchOpen: () => `    if (FALSE) {`,
  switchDefault: () =>
    `    } else {
      ctx$data[[paste0("_module_", tolower(modname))]] <- list(processed = TRUE, handler = "generic")
      ctx$signals[[length(ctx$signals) + 1]] <- list(type = "process", source = modname, ts = as.integer(as.numeric(Sys.time()) * 1000))`,
  switchClose: () => `    }`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// OBJECTIVE-C ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════
export const OBJC_ADAPTER: LanguageAdapter = {
  id: 'objective-c',
  literal: (v) =>
    typeof v === 'string'
      ? `@${jsonLiteral(v)}`
      : typeof v === 'boolean'
      ? v
        ? '@YES'
        : '@NO'
      : `@(${v})`,
  hashOfData: () => `quickHash([NSString stringWithFormat:@"%@", ctx[@"data"]])`,
  hashOfInput: () => `quickHash([NSString stringWithFormat:@"%@", ctx[@"input"]])`,
  keysCount: () => `@(userKeys(ctx[@"data"]).count)`,
  keysList: () => `userKeys(ctx[@"data"])`,
  cjpiInt: () => `meta[@"cjpi"]`,
  cjpiRatio: () => `@([meta[@"cjpi"] doubleValue] / 100.0)`,
  chainLength: () => `@(((NSArray *)meta[@"chain"]).count)`,
  chainPosition: () => `@([(NSArray *)meta[@"chain"] indexOfObject:modname] + 1)`,
  errorCount: () => `@(((NSArray *)ctx[@"errors"]).count)`,
  signalCount: () => `@(((NSArray *)ctx[@"signals"]).count)`,
  payloadBytes: () => `@([[NSString stringWithFormat:@"%@", ctx[@"data"]] length])`,
  elapsedMs: () =>
    `@((NSInteger)([[NSDate date] timeIntervalSince1970] * 1000) - [ctx[@"t0"] integerValue])`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    const expr = sorted.reduceRight(
      (acc, [n, l]) =>
        `((userKeys(ctx[@"data"]).count > ${n}) ? @${jsonLiteral(l)} : ${acc})`,
      `@${jsonLiteral(fallback)}` as string,
    );
    return expr;
  },
  tierValue: (map, fallback) => {
    const fb = typeof fallback === 'string' ? `@${jsonLiteral(fallback)}` : `@(${fallback})`;
    return Object.entries(map).reduceRight(
      (acc, [t, v]) =>
        `([meta[@"tier"] isEqualToString:@${jsonLiteral(t)}] ? ${
          typeof v === 'string' ? `@${jsonLiteral(v)}` : `@(${v})`
        } : ${acc})`,
      String(fb),
    );
  },
  tierPassthrough: () => `meta[@"tier"]`,
  threatCount: (tokens) => {
    const s = `[NSString stringWithFormat:@"%@", ctx[@"data"]]`;
    const checks = tokens
      .map((t) => `[${s} containsString:@${jsonLiteral(t)}]`)
      .join(' || ');
    return `@((${checks}) ? 1 : 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `(([meta[@"cjpi"] doubleValue] / 100.0) > ${th} ? @${jsonLiteral(hi)} : @${jsonLiteral(lo)})`,
  fallbackState: () =>
    `(((NSArray *)ctx[@"errors"]).count > 0 ? @"engaged" : @"standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `@${jsonLiteral(k)}: ${v}`).join(', ');
    return `@{${inner}}`;
  },
  setDataField: (key, val) =>
    `((NSMutableDictionary *)ctx[@"data"])[@${jsonLiteral(key)}] = ${val};`,
  emitSignal: (t) =>
    `[(NSMutableArray *)ctx[@"signals"] addObject:@{@"type": @${jsonLiteral(t)}, @"source": modname, @"ts": @((NSInteger)([[NSDate date] timeIntervalSince1970] * 1000))}];`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `        else if ([modname isEqualToString:@${jsonLiteral(mod)}]) {\n${body
      .map((l) => `            ${l}`)
      .join('\n')}\n        }`,
  switchOpen: () => `        if (NO) {}`,
  switchDefault: () =>
    `        else {
            ((NSMutableDictionary *)ctx[@"data"])[[NSString stringWithFormat:@"_module_%@", [modname lowercaseString]]] = @{@"processed": @YES, @"handler": @"generic"};
            [(NSMutableArray *)ctx[@"signals"] addObject:@{@"type": @"process", @"source": modname, @"ts": @((NSInteger)([[NSDate date] timeIntervalSince1970] * 1000))}];
        }`,
  switchClose: () => ``,
};

// ═══════════════════════════════════════════════════════════════════════════════
// D ADAPTER
// ═══════════════════════════════════════════════════════════════════════════════
export const D_ADAPTER: LanguageAdapter = {
  id: 'd',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quickHash(ctx.data.toString())`,
  hashOfInput: () => `quickHash(ctx.input.toString())`,
  keysCount: () => `userKeys(ctx.data).length`,
  keysList: () => `userKeys(ctx.data)`,
  cjpiInt: () => `meta.cjpi`,
  cjpiRatio: () => `cast(double)meta.cjpi / 100.0`,
  chainLength: () => `meta.chain.length`,
  chainPosition: () =>
    `({ size_t i = 0; foreach(idx, m; meta.chain) { if (m == modname) return cast(int)(idx + 1); } return 0; }())`,
  errorCount: () => `ctx.errors.length`,
  signalCount: () => `ctx.signals.length`,
  payloadBytes: () => `ctx.data.toString().length`,
  elapsedMs: () => `cast(int)(Clock.currTime().toUnixTime() * 1000 - ctx.t0)`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) =>
        `(userKeys(ctx.data).length > ${n} ? ${jsonLiteral(l)} : ${acc})`,
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
    const s = `ctx.data.toString()`;
    const checks = tokens.map((t) => `${s}.canFind(${jsonLiteral(t)})`).join(' || ');
    return `((${checks}) ? 1 : 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `((cast(double)meta.cjpi / 100.0) > ${th} ? ${jsonLiteral(hi)} : ${jsonLiteral(lo)})`,
  fallbackState: () => `(ctx.errors.length > 0 ? "engaged" : "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `${jsonLiteral(k)}: JSONValue(${v})`).join(', ');
    return `JSONValue([${inner}])`;
  },
  setDataField: (key, val) => `ctx.data[${jsonLiteral(key)}] = JSONValue(${val});`,
  emitSignal: (t) =>
    `ctx.signals ~= JSONValue(["type": JSONValue(${jsonLiteral(t)}), "source": JSONValue(modname), "ts": JSONValue(cast(int)(Clock.currTime().toUnixTime() * 1000))]);`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `        case ${jsonLiteral(mod)}:\n${body.map((l) => `            ${l}`).join('\n')}\n            break;`,
  switchOpen: () => `    switch (modname) {`,
  switchDefault: () =>
    `        default:
            ctx.data["_module_" ~ modname.toLower()] = JSONValue(["processed": JSONValue(true), "handler": JSONValue("generic")]);
            ctx.signals ~= JSONValue(["type": JSONValue("process"), "source": JSONValue(modname), "ts": JSONValue(cast(int)(Clock.currTime().toUnixTime() * 1000))]);
            break;`,
  switchClose: () => `    }`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// GROOVY ADAPTER (JVM scripting, Java-like)
// ═══════════════════════════════════════════════════════════════════════════════
export const GROOVY_ADAPTER: LanguageAdapter = {
  id: 'groovy',
  literal: (v) => (typeof v === 'string' ? jsonLiteral(v) : String(v)),
  hashOfData: () => `quickHash(ctx.data.toString())`,
  hashOfInput: () => `quickHash(ctx.input.toString())`,
  keysCount: () => `userKeys(ctx.data).size()`,
  keysList: () => `userKeys(ctx.data)`,
  cjpiInt: () => `meta.cjpi`,
  cjpiRatio: () => `meta.cjpi / 100.0d`,
  chainLength: () => `meta.chain.size()`,
  chainPosition: () => `(meta.chain.indexOf(modname) + 1)`,
  errorCount: () => `ctx.errors.size()`,
  signalCount: () => `ctx.signals.size()`,
  payloadBytes: () => `ctx.data.toString().length()`,
  elapsedMs: () => `(System.currentTimeMillis() - ctx.t0)`,
  classified: (thresholds, fallback) => {
    const sorted = [...thresholds].sort((a, b) => b[0] - a[0]);
    return sorted.reduceRight(
      (acc, [n, l]) =>
        `(userKeys(ctx.data).size() > ${n} ? ${jsonLiteral(l)} : ${acc})`,
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
    const s = `ctx.data.toString()`;
    const checks = tokens.map((t) => `${s}.contains(${jsonLiteral(t)})`).join(' || ');
    return `((${checks}) ? 1 : 0)`;
  },
  fitnessStrategy: (th, hi, lo) =>
    `((meta.cjpi / 100.0d) > ${th} ? ${jsonLiteral(hi)} : ${jsonLiteral(lo)})`,
  fallbackState: () => `(ctx.errors.size() > 0 ? "engaged" : "standby")`,
  objectLiteral: (pairs) => {
    const inner = pairs.map(([k, v]) => `(${jsonLiteral(k)}): ${v}`).join(', ');
    return `[${inner}]`;
  },
  setDataField: (key, val) => `ctx.data[${jsonLiteral(key)}] = ${val}`,
  emitSignal: (t) =>
    `ctx.signals << [type: ${jsonLiteral(t)}, source: modname, ts: System.currentTimeMillis()]`,
  indent: indentLines,
  caseBlock: (mod, body) =>
    `        case ${jsonLiteral(mod)}:\n${body.map((l) => `            ${l}`).join('\n')}\n            break`,
  switchOpen: () => `    switch (modname) {`,
  switchDefault: () =>
    `        default:
            ctx.data["_module_" + modname.toLowerCase()] = [processed: true, handler: "generic"]
            ctx.signals << [type: "process", source: modname, ts: System.currentTimeMillis()]
            break`,
  switchClose: () => `    }`,
};

export const WAVE3_ADAPTERS: Record<string, LanguageAdapter> = {
  erlang: ERLANG_ADAPTER,
  r: R_ADAPTER,
  'objective-c': OBJC_ADAPTER,
  d: D_ADAPTER,
  groovy: GROOVY_ADAPTER,
};
