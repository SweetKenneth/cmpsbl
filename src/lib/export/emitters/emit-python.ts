/**
 * CMPSBL® Python emitter — thread-safe via threading.Lock().
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function pyInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return '{}';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return '[]';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return f.init ? 'True' : 'False';
  return String(f.init ?? 0);
}

function resolveKey(m: SpecMethod): string {
  return m.params?.[0]?.name ?? 'key';
}

function pyOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return _state['${op.field}']`];
    case 'set': return [`_state['${op.field}'] = ${op.from}`];
    case 'inc': return [`_state['${op.field}'] += ${op.by ?? 1}`];
    case 'dec': return [`_state['${op.field}'] -= ${op.by ?? 1}`];
    case 'reset_field': return [`_state['${op.field}'] = 0`];
    case 'reset_all': return spec.fields.map(f => `_state['${f.name}'] = ${pyInit(f)}`);
    case 'clear_map': return [`_state['${op.field}'].clear()`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [`_state['${op.field}'][${k}] = _state['${op.field}'].get(${k}, 0) + ${op.by ?? 1}`];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `'${f}': _state['${f}']`).join(', ');
      return [`return {${pairs}}`];
    }
  }
}

export function emitPython(spec: ComponentSpec): string {
  const lines: string[] = [
    `# CMPSBL® Ascension Kernel — ${spec.module}`,
    `# ${spec.description}`,
    'import threading',
    '',
    '_lock = threading.Lock()',
    '_state = {',
    ...spec.fields.map(f => `    '${f.name}': ${pyInit(f)},${f.comment ? `  # ${f.comment}` : ''}`),
    '}',
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => p.name).join(', ');
    lines.push(`def ${m.name}(${params}):`);
    lines.push('    with _lock:');
    for (const op of m.ops) for (const l of pyOp(op, spec, m)) lines.push(`        ${l}`);
    lines.push('');
  }
  return lines.join('\n');
}
