/**
 * CMPSBL® Lua emitter — module table; cooperative concurrency (no native locks).
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function luaInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return '{}';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return '{}';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return f.init ? 'true' : 'false';
  return String(f.init ?? 0);
}

function resolveKey(m: SpecMethod): string {
  return m.params?.[0]?.name ?? 'key';
}

function luaOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return state.${op.field}`];
    case 'set': return [`state.${op.field} = ${op.from}`];
    case 'inc': return [`state.${op.field} = state.${op.field} + ${op.by ?? 1}`];
    case 'dec': return [`state.${op.field} = state.${op.field} - ${op.by ?? 1}`];
    case 'reset_field': return [`state.${op.field} = 0`];
    case 'reset_all': return spec.fields.map(f => `state.${f.name} = ${luaInit(f)}`);
    case 'clear_map': return [`state.${op.field} = {}`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [`state.${op.field}[${k}] = (state.${op.field}[${k}] or 0) + ${op.by ?? 1}`];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `${f} = state.${f}`).join(', ');
      return [`return { ${pairs} }`];
    }
  }
}

export function emitLua(spec: ComponentSpec): string {
  const lines: string[] = [
    `-- CMPSBL® Ascension Kernel — ${spec.module}`,
    `-- ${spec.description}`,
    'local M = {}',
    'local state = {',
    ...spec.fields.map(f => `    ${f.name} = ${luaInit(f)},${f.comment ? ` -- ${f.comment}` : ''}`),
    '}',
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => p.name).join(', ');
    lines.push(`function M.${m.name}(${params})`);
    for (const op of m.ops) for (const l of luaOp(op, spec, m)) lines.push(`    ${l}`);
    lines.push('end');
    lines.push('');
  }
  lines.push('return M');
  return lines.join('\n');
}
