/**
 * CMPSBL® Go emitter — renders ComponentSpec into thread-safe Go package code.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

const HEADER = (m: string, d: string) =>
  `// CMPSBL® Ascension Kernel — ${m}\n// ${d}`;

function goType(t: SpecField['type']): string {
  switch (t) {
    case 'int': return 'int';
    case 'long': return 'int64';
    case 'float': return 'float64';
    case 'bool': return 'bool';
    case 'string': return 'string';
    case 'map<string,int>': return 'map[string]int';
    case 'map<string,long>': return 'map[string]int64';
    case 'map<string,float>': return 'map[string]float64';
    case 'list<string>': return '[]string';
    case 'ring<string>': return '[]string';
  }
}

function goInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return `make(${goType(f.type)})`;
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return `[]string{}`;
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return String(f.init ?? false);
  return String(f.init ?? 0);
}

function goVarName(s: string): string {
  return 'cmpsbl' + s.split('_').map(p => p[0].toUpperCase() + p.slice(1)).join('');
}

function pascal(s: string): string {
  return s.split('_').map(p => p[0].toUpperCase() + p.slice(1)).join('');
}

function resolveKey(m: SpecMethod, key: 'param'): string {
  return m.params?.[0]?.name ?? 'key';
}

function goOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  const v = (f: string) => goVarName(f);
  switch (op.kind) {
    case 'get': return [`return ${v(op.field)}`];
    case 'set': return [`${v(op.field)} = ${op.from}`];
    case 'inc': return [`${v(op.field)} += ${op.by ?? 1}`];
    case 'dec': return [`${v(op.field)} -= ${op.by ?? 1}`];
    case 'reset_field': return [`${v(op.field)} = 0`];
    case 'reset_all':
      return spec.fields.map(f => `${v(f.name)} = ${goInit(f)}`);
    case 'clear_map':
      return [`for k := range ${v(op.field)} { delete(${v(op.field)}, k) }`];
    case 'map_inc':
      return [`${v(op.field)}[${resolveKey(m, op.key)}] += ${op.by ?? 1}`];
    case 'snapshot': {
      const pairs = op.fields.map(f => `"${f}": ${v(f)}`).join(', ');
      return [`return map[string]interface{}{${pairs}}`];
    }
  }
}

function returnTypeFor(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return ' ' + goType(f.type);
    }
    if (op.kind === 'snapshot') return ' map[string]interface{}';
  }
  return '';
}

export function emitGo(spec: ComponentSpec): string {
  const lines: string[] = [
    HEADER(spec.module, spec.description),
    'import "sync"',
    '',
    `var cmpsbl${spec.module}Mu sync.Mutex`,
    ...spec.fields.map(f => `var ${goVarName(f.name)} ${goType(f.type)} = ${goInit(f)}${f.comment ? ` // ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${p.name} ${goType(p.type)}`).join(', ');
    const ret = returnTypeFor(m, spec);
    lines.push(`func Cmpsbl${spec.module}${pascal(m.name)}(${params})${ret} {`);
    if (m.threadSafe !== false) {
      lines.push(`\tcmpsbl${spec.module}Mu.Lock()`);
      lines.push(`\tdefer cmpsbl${spec.module}Mu.Unlock()`);
    }
    for (const op of m.ops) for (const l of goOp(op, spec, m)) lines.push(`\t${l}`);
    lines.push('}');
    lines.push('');
  }
  return lines.join('\n');
}
