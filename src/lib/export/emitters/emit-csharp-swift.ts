/**
 * CMPSBL® C# + Swift emitters.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function pascal(s: string): string {
  return s.split('_').map(p => p[0].toUpperCase() + p.slice(1)).join('');
}

// ── C# ──────────────────────────────────────────────────────────────────────
function csType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'long';
    case 'float': return 'double';
    case 'bool': return 'bool';
    case 'string': return 'string';
    case 'map<string,int>': case 'map<string,long>': return 'System.Collections.Generic.Dictionary<string,long>';
    case 'map<string,float>': return 'System.Collections.Generic.Dictionary<string,double>';
    case 'list<string>': case 'ring<string>': return 'System.Collections.Generic.List<string>';
  }
}
function csInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return `new ${csType(f.type)}()`;
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return `new ${csType(f.type)}()`;
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return String(f.init ?? false);
  return `${f.init ?? 0}L`;
}
function resolveKey(m: SpecMethod, key: 'param'): string {
  return m.params?.[0]?.name ?? 'key';
}

function csOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return ${op.field};`];
    case 'set': return [`${op.field} = ${op.from};`];
    case 'inc': return [`${op.field} += ${op.by ?? 1};`];
    case 'dec': return [`${op.field} -= ${op.by ?? 1};`];
    case 'reset_field': return [`${op.field} = 0;`];
    case 'reset_all': return spec.fields.map(f => `${f.name} = ${csInit(f)};`);
    case 'clear_map': return [`${op.field}.Clear();`];
    case 'map_inc': {
      const k = resolveKey(m, op.key);
      return [`${op.field}[${k}] = (${op.field}.TryGetValue(${k}, out var __v) ? __v : 0L) + ${op.by ?? 1}L;`];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `{"${f}", ${f}}`).join(', ');
      return [`return new System.Collections.Generic.Dictionary<string,object>{${pairs}};`];
    }
    case 'sanitize_deep': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `var __pat = new System.Text.RegularExpressions.Regex("(?i)(api[_-]?key|secret|password|token|bearer\\\\s+[\\\\w.-]+|sk-[\\\\w-]{16,})");`,
        `System.Func<object, object> __walk = null;`,
        `__walk = (object v) => {`,
        `    if (v is System.Collections.IDictionary d) { var o = new System.Collections.Generic.Dictionary<object, object>(); foreach (System.Collections.DictionaryEntry e in d) { var ks = (e.Key ?? "").ToString(); o[e.Key] = (ks.StartsWith("_cmpsbl_") || ks.StartsWith("__cmpsbl_")) ? e.Value : __walk(e.Value); } return o; }`,
        `    if (v is System.Collections.IList l) { var o = new System.Collections.Generic.List<object>(); foreach (var x in l) o.Add(__walk(x)); return o; }`,
        `    if (v is string s) return __pat.Replace(s, "[REDACTED]");`,
        `    return v;`,
        `};`,
        `return __walk(${p});`,
      ];
    }
    case 'strip_sidecar_keys': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `System.Func<object, object> __strip = null;`,
        `__strip = (object v) => {`,
        `    if (v is System.Collections.IDictionary d) { var o = new System.Collections.Generic.Dictionary<object, object>(); foreach (System.Collections.DictionaryEntry e in d) { var ks = (e.Key ?? "").ToString(); if (ks.StartsWith("_cmpsbl_") || ks.StartsWith("__cmpsbl_")) continue; o[e.Key] = __strip(e.Value); } return o; }`,
        `    if (v is System.Collections.IList l) { var o = new System.Collections.Generic.List<object>(); foreach (var x in l) o.Add(__strip(x)); return o; }`,
        `    return v;`,
        `};`,
        `return __strip(${p});`,
      ];
    }
    case 'ctx_chain_push': {
      const p = m.params?.[0]?.name ?? 'value';
      return [`${op.field}.Add((${p}).ToString());`];
    }
  }
}
function csRet(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return csType(f.type);
    }
    if (op.kind === 'snapshot') return 'System.Collections.Generic.Dictionary<string,object>';
  }
  return 'void';
}
export function emitCSharp(spec: ComponentSpec): string {
  const cls = `Cmpsbl${spec.module}`;
  const lines: string[] = [
    `// CMPSBL® Ascension Kernel — ${spec.module}`,
    `// ${spec.description}`,
    `public static class ${cls} {`,
    '    private static readonly object LOCK = new object();',
    ...spec.fields.map(f => `    private static ${csType(f.type)} ${f.name} = ${csInit(f)};${f.comment ? ` // ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${csType(p.type)} ${p.name}`).join(', ');
    const ret = csRet(m, spec);
    lines.push(`    public static ${ret} ${pascal(m.name)}(${params}) {`);
    lines.push('        lock (LOCK) {');
    for (const op of m.ops) for (const l of csOp(op, spec, m)) lines.push(`            ${l}`);
    lines.push('        }');
    lines.push('    }');
    lines.push('');
  }
  lines.push('}');
  return lines.join('\n');
}

// ── Swift ───────────────────────────────────────────────────────────────────
function swType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'Int64';
    case 'float': return 'Double';
    case 'bool': return 'Bool';
    case 'string': return 'String';
    case 'map<string,int>': case 'map<string,long>': return '[String: Int64]';
    case 'map<string,float>': return '[String: Double]';
    case 'list<string>': case 'ring<string>': return '[String]';
  }
}
function swInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return '[:]';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return '[]';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return String(f.init ?? false);
  return String(f.init ?? 0);
}
function swOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return ${op.field}`];
    case 'set': return [`${op.field} = ${op.from}`];
    case 'inc': return [`${op.field} += ${op.by ?? 1}`];
    case 'dec': return [`${op.field} -= ${op.by ?? 1}`];
    case 'reset_field': return [`${op.field} = 0`];
    case 'reset_all': return spec.fields.map(f => `${f.name} = ${swInit(f)}`);
    case 'clear_map': return [`${op.field}.removeAll()`];
    case 'map_inc':
      return [`${op.field}[${resolveKey(m, op.key)}, default: 0] += ${op.by ?? 1}`];
    case 'snapshot': {
      const pairs = op.fields.map(f => `"${f}": ${f}`).join(', ');
      return [`return [${pairs}]`];
    }
  }
}
function swRet(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return ` -> ${swType(f.type)}`;
    }
    if (op.kind === 'snapshot') return ' -> [String: Any]';
  }
  return '';
}
export function emitSwift(spec: ComponentSpec): string {
  const en = `Cmpsbl${spec.module}`;
  const lines: string[] = [
    `// CMPSBL® Ascension Kernel — ${spec.module}`,
    `// ${spec.description}`,
    'import Foundation',
    `public enum ${en} {`,
    '    private static let lock = NSLock()',
    ...spec.fields.map(f => `    nonisolated(unsafe) private static var ${f.name}: ${swType(f.type)} = ${swInit(f)}${f.comment ? ` // ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `_ ${p.name}: ${swType(p.type)}`).join(', ');
    const ret = swRet(m, spec);
    lines.push(`    public static func ${m.name}(${params})${ret} {`);
    lines.push('        lock.lock(); defer { lock.unlock() }');
    for (const op of m.ops) for (const l of swOp(op, spec, m)) lines.push(`        ${l}`);
    lines.push('    }');
    lines.push('');
  }
  lines.push('}');
  return lines.join('\n');
}
