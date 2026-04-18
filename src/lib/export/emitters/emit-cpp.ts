/**
 * CMPSBL® C++ emitter — namespace + std::mutex + std::unordered_map / std::vector.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function cppType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'int64_t';
    case 'float': return 'double';
    case 'bool': return 'bool';
    case 'string': return 'std::string';
    case 'map<string,int>': case 'map<string,long>': return 'std::unordered_map<std::string,int64_t>';
    case 'map<string,float>': return 'std::unordered_map<std::string,double>';
    case 'list<string>': case 'ring<string>': return 'std::vector<std::string>';
  }
}

function cppInit(f: SpecField): string {
  if (f.type.startsWith('map<') || f.type.startsWith('list<') || f.type.startsWith('ring<')) return '{}';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return String(f.init ?? false);
  return String(f.init ?? 0);
}

function resolveKey(m: SpecMethod): string {
  return m.params?.[0]?.name ?? 'key';
}

function cppOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return ${op.field};`];
    case 'set': return [`${op.field} = ${op.from};`];
    case 'inc': return [`${op.field} += ${op.by ?? 1};`];
    case 'dec': return [`${op.field} -= ${op.by ?? 1};`];
    case 'reset_field': return [`${op.field} = 0;`];
    case 'reset_all': return spec.fields.map(f => `${f.name} = ${cppInit(f)};`);
    case 'clear_map': return [`${op.field}.clear();`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [`${op.field}[${k}] += ${op.by ?? 1};`];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `{"${f}", ${f}}`).join(', ');
      return [`return std::unordered_map<std::string,int64_t>{${pairs}};`];
    }
  }
}

function cppRet(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return cppType(f.type);
    }
    if (op.kind === 'snapshot') return 'std::unordered_map<std::string,int64_t>';
  }
  return 'void';
}

export function emitCpp(spec: ComponentSpec): string {
  const ns = `cmpsbl::${spec.module.toLowerCase()}`;
  const lines: string[] = [
    `// CMPSBL® Ascension Kernel — ${spec.module}`,
    `// ${spec.description}`,
    '#include <cstdint>',
    '#include <mutex>',
    '#include <string>',
    '#include <unordered_map>',
    '#include <vector>',
    '',
    `namespace ${ns} {`,
    '    static std::mutex __lock;',
    ...spec.fields.map(f => `    static ${cppType(f.type)} ${f.name} = ${cppInit(f)};${f.comment ? ` // ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${cppType(p.type)} ${p.name}`).join(', ');
    const ret = cppRet(m, spec);
    lines.push(`    ${ret} ${m.name}(${params}) {`);
    lines.push('        std::lock_guard<std::mutex> __g(__lock);');
    for (const op of m.ops) for (const l of cppOp(op, spec, m)) lines.push(`        ${l}`);
    lines.push('    }');
    lines.push('');
  }
  lines.push('}');
  return lines.join('\n');
}
