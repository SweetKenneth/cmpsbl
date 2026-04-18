/**
 * CMPSBL® Rust emitter — renders ComponentSpec into thread-safe Rust module.
 * Uses Mutex<State> wrapper around a struct holding all fields.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

const HEADER = (m: string, d: string) =>
  `// CMPSBL® Ascension Kernel — ${m}\n// ${d}`;

function rsType(t: SpecField['type']): string {
  switch (t) {
    case 'int': return 'i64';
    case 'long': return 'i64';
    case 'float': return 'f64';
    case 'bool': return 'bool';
    case 'string': return 'String';
    case 'map<string,int>': return 'HashMap<String, i64>';
    case 'map<string,long>': return 'HashMap<String, i64>';
    case 'map<string,float>': return 'HashMap<String, f64>';
    case 'list<string>': return 'Vec<String>';
    case 'ring<string>': return 'Vec<String>';
  }
}

function rsInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return 'HashMap::new()';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return 'Vec::new()';
  if (f.type === 'string') return `String::from(${JSON.stringify(f.init ?? '')})`;
  if (f.type === 'bool') return String(f.init ?? false);
  return String(f.init ?? 0);
}

function pascal(s: string): string {
  return s.split('_').map(p => p[0].toUpperCase() + p.slice(1)).join('');
}

function resolveKey(m: SpecMethod, key: 'param'): string {
  return m.params?.[0]?.name ?? 'key';
}

function rsOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return s.${op.field}.clone();`];
    case 'set': return [`s.${op.field} = ${op.from};`];
    case 'inc': return [`s.${op.field} += ${op.by ?? 1};`];
    case 'dec': return [`s.${op.field} -= ${op.by ?? 1};`];
    case 'reset_field': return [`s.${op.field} = 0;`];
    case 'reset_all':
      return spec.fields.map(f => `s.${f.name} = ${rsInit(f)};`);
    case 'clear_map': return [`s.${op.field}.clear();`];
    case 'map_inc':
      return [`*s.${op.field}.entry(${resolveKey(m, op.key)}.to_string()).or_insert(0) += ${op.by ?? 1};`];
    case 'snapshot': {
      const pairs = op.fields.map(f => `("${f}".to_string(), format!("{:?}", s.${f}))`).join(', ');
      return [`return vec![${pairs}].into_iter().collect::<HashMap<String,String>>();`];
    }
  }
}

function returnTypeFor(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return ` -> ${rsType(f.type)}`;
    }
    if (op.kind === 'snapshot') return ' -> HashMap<String, String>';
  }
  return '';
}

export function emitRust(spec: ComponentSpec): string {
  const struct = `Cmpsbl${spec.module}State`;
  const lines: string[] = [
    HEADER(spec.module, spec.description),
    'use std::collections::HashMap;',
    'use std::sync::Mutex;',
    'use once_cell::sync::Lazy;',
    '',
    'pub struct ' + struct + ' {',
    ...spec.fields.map(f => `    pub ${f.name}: ${rsType(f.type)},${f.comment ? ` // ${f.comment}` : ''}`),
    '}',
    '',
    `static CMPSBL_${spec.module.toUpperCase()}: Lazy<Mutex<${struct}>> = Lazy::new(|| Mutex::new(${struct} {`,
    ...spec.fields.map(f => `    ${f.name}: ${rsInit(f)},`),
    '}));',
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${p.name}: ${rsType(p.type)}`).join(', ');
    const ret = returnTypeFor(m, spec);
    lines.push(`pub fn cmpsbl_${spec.module.toLowerCase()}_${m.name}(${params})${ret} {`);
    lines.push(`    let mut s = CMPSBL_${spec.module.toUpperCase()}.lock().unwrap();`);
    for (const op of m.ops) for (const l of rsOp(op, spec, m)) lines.push(`    ${l}`);
    lines.push('}');
    lines.push('');
  }
  return lines.join('\n');
}
