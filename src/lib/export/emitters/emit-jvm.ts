/**
 * CMPSBL® Java + Kotlin emitters — share JVM type mapping.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function pascal(s: string): string {
  return s.split('_').map(p => p[0].toUpperCase() + p.slice(1)).join('');
}

// ── Java ────────────────────────────────────────────────────────────────────
function javaType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'long';
    case 'float': return 'double';
    case 'bool': return 'boolean';
    case 'string': return 'String';
    case 'map<string,int>': case 'map<string,long>': return 'java.util.Map<String,Long>';
    case 'map<string,float>': return 'java.util.Map<String,Double>';
    case 'list<string>': case 'ring<string>': return 'java.util.List<String>';
  }
}
function javaInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return 'new java.util.HashMap<>()';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return 'new java.util.ArrayList<>()';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return String(f.init ?? false);
  return `${f.init ?? 0}L`;
}
function resolveKey(m: SpecMethod, key: 'param'): string {
  return m.params?.[0]?.name ?? 'key';
}

function javaOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return ${op.field};`];
    case 'set': return [`${op.field} = ${op.from};`];
    case 'inc': return [`${op.field} += ${op.by ?? 1};`];
    case 'dec': return [`${op.field} -= ${op.by ?? 1};`];
    case 'reset_field': return [`${op.field} = 0;`];
    case 'reset_all': return spec.fields.map(f => `${f.name} = ${javaInit(f)};`);
    case 'clear_map': return [`${op.field}.clear();`];
    case 'map_inc':
      return [`${op.field}.merge(${resolveKey(m, op.key)}, ${op.by ?? 1}L, Long::sum);`];
    case 'snapshot': {
      const pairs = op.fields.map(f => `m.put("${f}", ${f});`).join(' ');
      return [`java.util.Map<String,Object> m = new java.util.HashMap<>(); ${pairs} return m;`];
    }
  }
}
function javaRet(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return javaType(f.type);
    }
    if (op.kind === 'snapshot') return 'java.util.Map<String,Object>';
  }
  return 'void';
}
export function emitJava(spec: ComponentSpec): string {
  const cls = `Cmpsbl${spec.module}`;
  const lines: string[] = [
    `// CMPSBL® Ascension Kernel — ${spec.module}`,
    `// ${spec.description}`,
    `public final class ${cls} {`,
    '    private static final Object LOCK = new Object();',
    ...spec.fields.map(f => `    private static ${javaType(f.type)} ${f.name} = ${javaInit(f)};${f.comment ? ` // ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${javaType(p.type)} ${p.name}`).join(', ');
    const ret = javaRet(m, spec);
    lines.push(`    public static ${ret} ${m.name}(${params}) {`);
    lines.push('        synchronized (LOCK) {');
    for (const op of m.ops) for (const l of javaOp(op, spec, m)) lines.push(`            ${l}`);
    lines.push('        }');
    lines.push('    }');
    lines.push('');
  }
  lines.push('}');
  return lines.join('\n');
}

// ── Kotlin ──────────────────────────────────────────────────────────────────
function ktType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'Long';
    case 'float': return 'Double';
    case 'bool': return 'Boolean';
    case 'string': return 'String';
    case 'map<string,int>': case 'map<string,long>': return 'MutableMap<String, Long>';
    case 'map<string,float>': return 'MutableMap<String, Double>';
    case 'list<string>': case 'ring<string>': return 'MutableList<String>';
  }
}
function ktInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return 'mutableMapOf()';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return 'mutableListOf()';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return String(f.init ?? false);
  return `${f.init ?? 0}L`;
}
function ktOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return ${op.field}`];
    case 'set': return [`${op.field} = ${op.from}`];
    case 'inc': return [`${op.field} += ${op.by ?? 1}`];
    case 'dec': return [`${op.field} -= ${op.by ?? 1}`];
    case 'reset_field': return [`${op.field} = 0L`];
    case 'reset_all': return spec.fields.map(f => `${f.name} = ${ktInit(f)}`);
    case 'clear_map': return [`${op.field}.clear()`];
    case 'map_inc': {
      const k = resolveKey(m, op.key);
      return [`${op.field}[${k}] = (${op.field}[${k}] ?: 0L) + ${op.by ?? 1}L`];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `"${f}" to ${f}`).join(', ');
      return [`return mapOf(${pairs})`];
    }
  }
}
function ktRet(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return `: ${ktType(f.type)}`;
    }
    if (op.kind === 'snapshot') return ': Map<String, Any>';
  }
  return '';
}
export function emitKotlin(spec: ComponentSpec): string {
  const obj = `Cmpsbl${spec.module}`;
  const lines: string[] = [
    `// CMPSBL® Ascension Kernel — ${spec.module}`,
    `// ${spec.description}`,
    `object ${obj} {`,
    '    private val LOCK = Any()',
    ...spec.fields.map(f => `    private var ${f.name}: ${ktType(f.type)} = ${ktInit(f)}${f.comment ? ` // ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${p.name}: ${ktType(p.type)}`).join(', ');
    const ret = ktRet(m, spec);
    lines.push(`    fun ${m.name}(${params})${ret} {`);
    lines.push('        synchronized(LOCK) {');
    for (const op of m.ops) for (const l of ktOp(op, spec)) lines.push(`            ${l}`);
    lines.push('        }');
    lines.push('    }');
    lines.push('');
  }
  lines.push('}');
  return lines.join('\n');
}
