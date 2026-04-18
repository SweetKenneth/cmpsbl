/**
 * CMPSBL® Ruby emitter — renders ComponentSpec into thread-safe Ruby module.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

const HEADER = (m: string, d: string) =>
  `# CMPSBL® Ascension Kernel — ${m}\n# ${d}`;

function rbInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return '{}';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return '[]';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return String(f.init ?? false);
  return String(f.init ?? 0);
}

function rbOp(op: MethodOp): string[] {
  switch (op.kind) {
    case 'get': return [`return @${op.field}`];
    case 'set': return [`@${op.field} = ${op.from}`];
    case 'inc': return [`@${op.field} += ${op.by ?? 1}`];
    case 'dec': return [`@${op.field} -= ${op.by ?? 1}`];
    case 'reset_field': return [`@${op.field} = 0`];
    case 'reset_all': return ['@__reset_all__ = true'];
    case 'clear_map': return [`@${op.field}.clear`];
    case 'map_inc':
      return [`@${op.field}[${op.key}] = (@${op.field}[${op.key}] || 0) + ${op.by ?? 1}`];
    case 'snapshot':
      return [`return { ${op.fields.map(f => `${f}: @${f}`).join(', ')} }`];
  }
}

function rbMethod(spec: ComponentSpec, m: SpecMethod): string {
  const params = (m.params ?? []).map(p => p.name).join(', ');
  const sig = params ? `def self.${m.name}(${params})` : `def self.${m.name}`;
  const body = m.ops.flatMap(rbOp);
  // reset_all expands to clearing every field
  if (m.ops.some(o => o.kind === 'reset_all')) {
    body.length = 0;
    for (const f of spec.fields) body.push(`@${f.name} = ${rbInit(f)}`);
  }
  const wrapped = m.threadSafe !== false
    ? ['  @mutex.synchronize do', ...body.map(l => `    ${l}`), '  end']
    : body.map(l => `  ${l}`);
  const lines = [sig, ...wrapped, 'end'];
  return lines.join('\n');
}

export function emitRuby(spec: ComponentSpec): string {
  const moduleName = `Cmpsbl${spec.module}`;
  const lines: string[] = [
    HEADER(spec.module, spec.description),
    `module ${moduleName}`,
    '  @mutex = Mutex.new',
    ...spec.fields.map(f => `  @${f.name} = ${rbInit(f)}${f.comment ? ` # ${f.comment}` : ''}`),
    '',
    ...spec.methods.map(m => rbMethod(spec, m).split('\n').map(l => `  ${l}`).join('\n')),
    'end',
  ];
  return lines.join('\n');
}
