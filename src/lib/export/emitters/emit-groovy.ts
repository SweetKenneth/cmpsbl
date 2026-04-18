/**
 * CMPSBL® Groovy emitter — class with @Synchronized + ConcurrentHashMap.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function gvType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'long';
    case 'float': return 'double';
    case 'bool': return 'boolean';
    case 'string': return 'String';
    case 'map<string,int>': case 'map<string,long>': return 'Map<String, Long>';
    case 'map<string,float>': return 'Map<String, Double>';
    case 'list<string>': case 'ring<string>': return 'List<String>';
  }
}

function gvInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return '[:]';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return '[]';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return String(f.init ?? false);
  return `${f.init ?? 0}L`;
}

function resolveKey(m: SpecMethod): string {
  return m.params?.[0]?.name ?? 'key';
}

function gvOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return ${op.field}`];
    case 'set': return [`${op.field} = ${op.from}`];
    case 'inc': return [`${op.field} += ${op.by ?? 1}`];
    case 'dec': return [`${op.field} -= ${op.by ?? 1}`];
    case 'reset_field': return [`${op.field} = 0L`];
    case 'reset_all': return spec.fields.map(f => `${f.name} = ${gvInit(f)}`);
    case 'clear_map': return [`${op.field}.clear()`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [`${op.field}[${k}] = (${op.field}[${k}] ?: 0L) + ${op.by ?? 1}L`];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `'${f}': ${f}`).join(', ');
      return [`return [${pairs}]`];
    }
    case 'sanitize_deep': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `def __pat = ~/(?i)(api[_-]?key|secret|password|token|bearer\\s+[\\w.-]+|sk-[\\w-]{16,})/`,
        `def __walk`,
        `__walk = { v ->`,
        `    if (v instanceof Map) { def o = [:]; v.each { k, vv -> def ks = k.toString(); o[k] = (ks.startsWith('_cmpsbl_') || ks.startsWith('__cmpsbl_')) ? vv : __walk(vv) }; return o }`,
        `    if (v instanceof List) return v.collect { __walk(it) }`,
        `    if (v instanceof String) return v.replaceAll(__pat, '[REDACTED]')`,
        `    return v`,
        `}`,
        `return __walk(${p})`,
      ];
    }
    case 'strip_sidecar_keys': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `def __strip`,
        `__strip = { v ->`,
        `    if (v instanceof Map) { def o = [:]; v.each { k, vv -> def ks = k.toString(); if (!(ks.startsWith('_cmpsbl_') || ks.startsWith('__cmpsbl_'))) o[k] = __strip(vv) }; return o }`,
        `    if (v instanceof List) return v.collect { __strip(it) }`,
        `    return v`,
        `}`,
        `return __strip(${p})`,
      ];
    }
    case 'ctx_chain_push': {
      const p = m.params?.[0]?.name ?? 'value';
      return [`${op.field} << ${p}`];
    }
  }
}

function gvRet(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return gvType(f.type);
    }
    if (op.kind === 'snapshot') return 'Map<String, Object>';
  }
  return 'void';
}

export function emitGroovy(spec: ComponentSpec): string {
  const cls = `Cmpsbl${spec.module}`;
  const lines: string[] = [
    `// CMPSBL® Ascension Kernel — ${spec.module}`,
    `// ${spec.description}`,
    'import groovy.transform.Synchronized',
    '',
    `class ${cls} {`,
    ...spec.fields.map(f => `    private static ${gvType(f.type)} ${f.name} = ${gvInit(f)}${f.comment ? ` // ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${gvType(p.type)} ${p.name}`).join(', ');
    const ret = gvRet(m, spec);
    lines.push('    @Synchronized');
    lines.push(`    static ${ret} ${m.name}(${params}) {`);
    for (const op of m.ops) for (const l of gvOp(op, spec, m)) lines.push(`        ${l}`);
    lines.push('    }');
    lines.push('');
  }
  lines.push('}');
  return lines.join('\n');
}
