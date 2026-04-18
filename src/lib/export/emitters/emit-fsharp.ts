/**
 * CMPSBL® F# emitter — module + lock object + mutable refs.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function fsType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'int64';
    case 'float': return 'double';
    case 'bool': return 'bool';
    case 'string': return 'string';
    case 'map<string,int>': case 'map<string,long>': return 'System.Collections.Generic.Dictionary<string, int64>';
    case 'map<string,float>': return 'System.Collections.Generic.Dictionary<string, double>';
    case 'list<string>': case 'ring<string>': return 'System.Collections.Generic.List<string>';
  }
}

function fsInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return `${fsType(f.type)}()`;
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return `${fsType(f.type)}()`;
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return f.init ? 'true' : 'false';
  return `${f.init ?? 0}L`;
}

function resolveKey(m: SpecMethod): string {
  return m.params?.[0]?.name ?? 'key';
}

function fsOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`${op.field}`];
    case 'set': return [`${op.field} <- ${op.from}`];
    case 'inc': return [`${op.field} <- ${op.field} + ${op.by ?? 1}L`];
    case 'dec': return [`${op.field} <- ${op.field} - ${op.by ?? 1}L`];
    case 'reset_field': return [`${op.field} <- 0L`];
    case 'reset_all': return spec.fields.filter(f => !f.type.startsWith('map<') && !f.type.startsWith('list<') && !f.type.startsWith('ring<')).map(f => `${f.name} <- ${fsInit(f)}`);
    case 'clear_map': return [`${op.field}.Clear()`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [
        `let __cur = if ${op.field}.ContainsKey(${k}) then ${op.field}.[${k}] else 0L`,
        `${op.field}.[${k}] <- __cur + ${op.by ?? 1}L`,
      ];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `"${f}", box ${f}`).join('; ');
      return [`dict [${pairs}]`];
    }
    case 'sanitize_deep': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `let __pat = System.Text.RegularExpressions.Regex(@"(api[_-]?key|secret|password|token|bearer\\s+[\\w.-]+|sk-[\\w-]{16,})", System.Text.RegularExpressions.RegexOptions.IgnoreCase)`,
        `let rec __walk (v: obj) : obj =`,
        `    match v with`,
        `    | :? System.Collections.IDictionary as d ->`,
        `        let out = System.Collections.Generic.Dictionary<obj, obj>()`,
        `        for k in d.Keys do let ks = string k in if ks.StartsWith("_cmpsbl_") || ks.StartsWith("__cmpsbl_") then out.[k] <- d.[k] else out.[k] <- __walk d.[k]`,
        `        box out`,
        `    | :? System.Collections.IList as l -> box [ for x in l -> __walk x ]`,
        `    | :? string as s -> box (__pat.Replace(s, "[REDACTED]"))`,
        `    | _ -> v`,
        `__walk (box ${p})`,
      ];
    }
    case 'strip_sidecar_keys': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `let rec __strip (v: obj) : obj =`,
        `    match v with`,
        `    | :? System.Collections.IDictionary as d ->`,
        `        let out = System.Collections.Generic.Dictionary<obj, obj>()`,
        `        for k in d.Keys do let ks = string k in if not (ks.StartsWith("_cmpsbl_") || ks.StartsWith("__cmpsbl_")) then out.[k] <- __strip d.[k]`,
        `        box out`,
        `    | :? System.Collections.IList as l -> box [ for x in l -> __strip x ]`,
        `    | _ -> v`,
        `__strip (box ${p})`,
      ];
    }
    case 'ctx_chain_push': {
      const p = m.params?.[0]?.name ?? 'value';
      return [`${op.field}.Add(${p})`];
    }
  }
}

export function emitFSharp(spec: ComponentSpec): string {
  const mod = `Cmpsbl${spec.module}`;
  const lines: string[] = [
    `// CMPSBL® Ascension Kernel — ${spec.module}`,
    `// ${spec.description}`,
    `module ${mod}`,
    '',
    'let private __lock = obj()',
    ...spec.fields.map(f => {
      const isCollection = f.type.startsWith('map<') || f.type.startsWith('list<') || f.type.startsWith('ring<');
      const decl = isCollection ? 'let private' : 'let mutable private';
      return `${decl} ${f.name} = ${fsInit(f)}${f.comment ? ` // ${f.comment}` : ''}`;
    }),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `(${p.name}: ${fsType(p.type)})`).join(' ');
    const sig = params || '()';
    lines.push(`let ${m.name} ${sig} =`);
    lines.push('    lock __lock (fun () ->');
    for (const op of m.ops) for (const l of fsOp(op, spec, m)) lines.push(`        ${l}`);
    lines.push('    )');
    lines.push('');
  }
  return lines.join('\n');
}
