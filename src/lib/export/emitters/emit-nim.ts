/**
 * CMPSBL® Nim emitter — module-level vars + Lock from std/locks.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function nimType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'int64';
    case 'float': return 'float64';
    case 'bool': return 'bool';
    case 'string': return 'string';
    case 'map<string,int>': case 'map<string,long>': return 'Table[string, int64]';
    case 'map<string,float>': return 'Table[string, float64]';
    case 'list<string>': case 'ring<string>': return 'seq[string]';
  }
}

function nimInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return 'initTable[string, int64]()';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return '@[]';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return f.init ? 'true' : 'false';
  return `${f.init ?? 0}'i64`;
}

function resolveKey(m: SpecMethod): string {
  return m.params?.[0]?.name ?? 'key';
}

function nimOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return ${op.field}`];
    case 'set': return [`${op.field} = ${op.from}`];
    case 'inc': return [`${op.field} += ${op.by ?? 1}`];
    case 'dec': return [`${op.field} -= ${op.by ?? 1}`];
    case 'reset_field': return [`${op.field} = 0`];
    case 'reset_all': return spec.fields.map(f => `${f.name} = ${nimInit(f)}`);
    case 'clear_map': return [`${op.field}.clear()`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [`${op.field}[${k}] = ${op.field}.getOrDefault(${k}, 0) + ${op.by ?? 1}`];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `("${f}", ${f})`).join(', ');
      return [`return {${pairs}}.toTable`];
    }
  }
}

function nimRet(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return `: ${nimType(f.type)}`;
    }
    if (op.kind === 'snapshot') return ': Table[string, int64]';
  }
  return '';
}

export function emitNim(spec: ComponentSpec): string {
  const lines: string[] = [
    `## CMPSBL® Ascension Kernel — ${spec.module}`,
    `## ${spec.description}`,
    'import std/[locks, tables]',
    '',
    'var __lock: Lock',
    'initLock(__lock)',
    ...spec.fields.map(f => `var ${f.name}*: ${nimType(f.type)} = ${nimInit(f)}${f.comment ? `  ## ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${p.name}: ${nimType(p.type)}`).join(', ');
    const ret = nimRet(m, spec);
    lines.push(`proc ${m.name}*(${params})${ret} =`);
    lines.push('  acquire(__lock)');
    lines.push('  defer: release(__lock)');
    for (const op of m.ops) for (const l of nimOp(op, spec, m)) lines.push(`  ${l}`);
    lines.push('');
  }
  return lines.join('\n');
}
