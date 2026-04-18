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
    case 'sanitize_deep': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `import re as _re`,
        `_pat = _re.compile(r'(api[_-]?key|secret|password|token|bearer\\s+[\\w.-]+|sk-[\\w-]{16,})', _re.I)`,
        `def _walk(v):`,
        `    if isinstance(v, dict):`,
        `        return {k: (vv if (isinstance(k, str) and (k.startswith('_cmpsbl_') or k.startswith('__cmpsbl_'))) else _walk(vv)) for k, vv in v.items()}`,
        `    if isinstance(v, list):`,
        `        return [_walk(x) for x in v]`,
        `    if isinstance(v, str):`,
        `        return _pat.sub('[REDACTED]', v)`,
        `    return v`,
        `return _walk(${p})`,
      ];
    }
    case 'strip_sidecar_keys': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `def _strip(v):`,
        `    if isinstance(v, dict):`,
        `        return {k: _strip(vv) for k, vv in v.items() if not (isinstance(k, str) and (k.startswith('_cmpsbl_') or k.startswith('__cmpsbl_')))}`,
        `    if isinstance(v, list):`,
        `        return [_strip(x) for x in v]`,
        `    return v`,
        `return _strip(${p})`,
      ];
    }
    case 'ctx_chain_push': {
      const p = m.params?.[0]?.name ?? 'value';
      return [`_state['${op.field}'].append(${p})`];
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
