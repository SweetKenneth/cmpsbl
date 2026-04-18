/**
 * CMPSBL® D emitter — module + shared static this + synchronized blocks.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function dType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'long';
    case 'float': return 'double';
    case 'bool': return 'bool';
    case 'string': return 'string';
    case 'map<string,int>': case 'map<string,long>': return 'long[string]';
    case 'map<string,float>': return 'double[string]';
    case 'list<string>': case 'ring<string>': return 'string[]';
  }
}

function dInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return 'null';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return '[]';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return String(f.init ?? false);
  return `${f.init ?? 0}L`;
}

function resolveKey(m: SpecMethod): string {
  return m.params?.[0]?.name ?? 'key';
}

function dOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return ${op.field};`];
    case 'set': return [`${op.field} = ${op.from};`];
    case 'inc': return [`${op.field} += ${op.by ?? 1};`];
    case 'dec': return [`${op.field} -= ${op.by ?? 1};`];
    case 'reset_field': return [`${op.field} = 0;`];
    case 'reset_all': return spec.fields.map(f => `${f.name} = ${dInit(f)};`);
    case 'clear_map': return [`${op.field} = null;`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [`${op.field}[${k}] = (${k} in ${op.field} ? ${op.field}[${k}] : 0L) + ${op.by ?? 1}L;`];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `"${f}": ${f}`).join(', ');
      return [`return [${pairs}];`];
    }
  }
}

function dRet(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return dType(f.type);
    }
    if (op.kind === 'snapshot') return 'long[string]';
  }
  return 'void';
}

export function emitD(spec: ComponentSpec): string {
  const mod = `cmpsbl.${spec.module.toLowerCase()}`;
  const lines: string[] = [
    `// CMPSBL® Ascension Kernel — ${spec.module}`,
    `// ${spec.description}`,
    `module ${mod};`,
    'import core.sync.mutex;',
    '',
    'private __gshared Mutex __lock;',
    'shared static this() { __lock = new Mutex; }',
    '',
    ...spec.fields.map(f => `private __gshared ${dType(f.type)} ${f.name} = ${dInit(f)};${f.comment ? ` // ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${dType(p.type)} ${p.name}`).join(', ');
    const ret = dRet(m, spec);
    lines.push(`${ret} ${m.name}(${params}) {`);
    lines.push('    __lock.lock(); scope(exit) __lock.unlock();');
    for (const op of m.ops) for (const l of dOp(op, spec, m)) lines.push(`    ${l}`);
    lines.push('}');
    lines.push('');
  }
  return lines.join('\n');
}
