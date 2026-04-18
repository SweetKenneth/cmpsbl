/**
 * CMPSBL® C emitter — file-scoped statics + pthread_mutex.
 * Maps approximated as fixed-capacity open-addressing tables (string keys hashed).
 * For unbounded maps, link against an external hash-table lib.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function cType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'long long';
    case 'float': return 'double';
    case 'bool': return 'int';
    case 'string': return 'const char*';
    case 'map<string,int>': case 'map<string,long>': return 'cmpsbl_map_t';
    case 'map<string,float>': return 'cmpsbl_fmap_t';
    case 'list<string>': case 'ring<string>': return 'cmpsbl_list_t';
  }
}

function cInit(f: SpecField): string {
  if (f.type.startsWith('map<') || f.type.startsWith('list<') || f.type.startsWith('ring<')) return '{0}';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return f.init ? '1' : '0';
  return `${f.init ?? 0}LL`;
}

function resolveKey(m: SpecMethod): string {
  return m.params?.[0]?.name ?? 'key';
}

function cOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`long long __r = ${op.field}; pthread_mutex_unlock(&__lock); return __r;`];
    case 'set': return [`${op.field} = ${op.from};`];
    case 'inc': return [`${op.field} += ${op.by ?? 1};`];
    case 'dec': return [`${op.field} -= ${op.by ?? 1};`];
    case 'reset_field': return [`${op.field} = 0;`];
    case 'reset_all': return spec.fields.map(f => `${f.name} = ${cInit(f)};`);
    case 'clear_map': return [`cmpsbl_map_clear(&${op.field});`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [`cmpsbl_map_inc(&${op.field}, ${k}, ${op.by ?? 1});`];
    }
    case 'snapshot': return [`/* snapshot: caller fills out-struct */`];
  }
}

function cRet(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return cType(f.type);
    }
  }
  return 'void';
}

export function emitC(spec: ComponentSpec): string {
  const prefix = `cmpsbl_${spec.module.toLowerCase()}`;
  const lines: string[] = [
    `/* CMPSBL® Ascension Kernel — ${spec.module} */`,
    `/* ${spec.description} */`,
    '#include <pthread.h>',
    '#include <string.h>',
    '#include "cmpsbl_runtime.h"  /* provides cmpsbl_map_t, cmpsbl_list_t, helpers */',
    '',
    'static pthread_mutex_t __lock = PTHREAD_MUTEX_INITIALIZER;',
    ...spec.fields.map(f => `static ${cType(f.type)} ${f.name} = ${cInit(f)};${f.comment ? ` /* ${f.comment} */` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${cType(p.type)} ${p.name}`).join(', ') || 'void';
    const ret = cRet(m, spec);
    lines.push(`${ret} ${prefix}_${m.name}(${params}) {`);
    lines.push('    pthread_mutex_lock(&__lock);');
    const hasGet = m.ops.some(o => o.kind === 'get');
    for (const op of m.ops) for (const l of cOp(op, spec, m)) lines.push(`    ${l}`);
    if (!hasGet) lines.push('    pthread_mutex_unlock(&__lock);');
    lines.push('}');
    lines.push('');
  }
  return lines.join('\n');
}
