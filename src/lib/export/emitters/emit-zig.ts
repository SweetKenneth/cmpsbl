/**
 * CMPSBL® Zig emitter — std.Thread.Mutex + StringHashMap.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function zigType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'i64';
    case 'float': return 'f64';
    case 'bool': return 'bool';
    case 'string': return '[]const u8';
    case 'map<string,int>': case 'map<string,long>': return 'std.StringHashMap(i64)';
    case 'map<string,float>': return 'std.StringHashMap(f64)';
    case 'list<string>': case 'ring<string>': return 'std.ArrayList([]const u8)';
  }
}

function zigInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return 'undefined';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return 'undefined';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return String(f.init ?? false);
  return String(f.init ?? 0);
}

function resolveKey(m: SpecMethod): string {
  return m.params?.[0]?.name ?? 'key';
}

function zigOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return ${op.field};`];
    case 'set': return [`${op.field} = ${op.from};`];
    case 'inc': return [`${op.field} += ${op.by ?? 1};`];
    case 'dec': return [`${op.field} -= ${op.by ?? 1};`];
    case 'reset_field': return [`${op.field} = 0;`];
    case 'reset_all': return spec.fields.filter(f => !f.type.startsWith('map<') && !f.type.startsWith('list<') && !f.type.startsWith('ring<')).map(f => `${f.name} = ${zigInit(f)};`);
    case 'clear_map': return [`${op.field}.clearRetainingCapacity();`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [
        `const __cur = ${op.field}.get(${k}) orelse 0;`,
        `try ${op.field}.put(${k}, __cur + ${op.by ?? 1});`,
      ];
    }
    case 'snapshot': return [`// snapshot: caller composes struct from fields`];
    case 'sanitize_deep': {
      const p = m.params?.[0]?.name ?? 'value';
      return [`// DEGRADED: zig requires a runtime helper for tagged-union JSON walking`,
              `return cmpsbl_runtime.sanitize_deep(${p});`];
    }
    case 'strip_sidecar_keys': {
      const p = m.params?.[0]?.name ?? 'value';
      return [`// DEGRADED: delegated to runtime helper`,
              `return cmpsbl_runtime.strip_sidecars(${p});`];
    }
    case 'ctx_chain_push': {
      const p = m.params?.[0]?.name ?? 'value';
      return [`try ${op.field}.append(${p});`];
    }
  }
}

function zigRet(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return zigType(f.type);
    }
  }
  return 'void';
}

export function emitZig(spec: ComponentSpec): string {
  const lines: string[] = [
    `// CMPSBL® Ascension Kernel — ${spec.module}`,
    `// ${spec.description}`,
    'const std = @import("std");',
    '',
    'var __lock: std.Thread.Mutex = .{};',
    ...spec.fields.map(f => `var ${f.name}: ${zigType(f.type)} = ${zigInit(f)};${f.comment ? ` // ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${p.name}: ${zigType(p.type)}`).join(', ');
    const ret = zigRet(m, spec);
    const needsTry = m.ops.some(o => o.kind === 'map_inc');
    const retSig = needsTry ? `!${ret === 'void' ? 'void' : ret}` : ret;
    lines.push(`pub fn ${m.name}(${params}) ${retSig} {`);
    lines.push('    __lock.lock();');
    lines.push('    defer __lock.unlock();');
    for (const op of m.ops) for (const l of zigOp(op, spec, m)) lines.push(`    ${l}`);
    lines.push('}');
    lines.push('');
  }
  return lines.join('\n');
}
