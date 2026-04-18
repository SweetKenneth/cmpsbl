/**
 * CMPSBL® Scala emitter — object singleton + synchronized.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function scType(t: SpecField['type']): string {
  switch (t) {
    case 'int': case 'long': return 'Long';
    case 'float': return 'Double';
    case 'bool': return 'Boolean';
    case 'string': return 'String';
    case 'map<string,int>': case 'map<string,long>': return 'scala.collection.mutable.Map[String, Long]';
    case 'map<string,float>': return 'scala.collection.mutable.Map[String, Double]';
    case 'list<string>': case 'ring<string>': return 'scala.collection.mutable.ArrayBuffer[String]';
  }
}

function scInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return 'scala.collection.mutable.Map.empty';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return 'scala.collection.mutable.ArrayBuffer.empty';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return String(f.init ?? false);
  return `${f.init ?? 0}L`;
}

function resolveKey(m: SpecMethod): string {
  return m.params?.[0]?.name ?? 'key';
}

function scOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`${op.field}`];
    case 'set': return [`${op.field} = ${op.from}`];
    case 'inc': return [`${op.field} += ${op.by ?? 1}`];
    case 'dec': return [`${op.field} -= ${op.by ?? 1}`];
    case 'reset_field': return [`${op.field} = 0L`];
    case 'reset_all': return spec.fields.filter(f => !f.type.startsWith('map<') && !f.type.startsWith('list<') && !f.type.startsWith('ring<')).map(f => `${f.name} = ${scInit(f)}`);
    case 'clear_map': return [`${op.field}.clear()`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [`${op.field}(${k}) = ${op.field}.getOrElse(${k}, 0L) + ${op.by ?? 1}L`];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `"${f}" -> ${f}`).join(', ');
      return [`Map[String, Any](${pairs})`];
    }
    case 'sanitize_deep': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `val __pat = "(?i)(api[_-]?key|secret|password|token|bearer\\\\s+[\\\\w.-]+|sk-[\\\\w-]{16,})".r`,
        `def __walk(v: Any): Any = v match {`,
        `    case mp: scala.collection.Map[_, _] => mp.map { case (k, vv) => val ks = k.toString; (k, if (ks.startsWith("_cmpsbl_") || ks.startsWith("__cmpsbl_")) vv else __walk(vv)) }.toMap`,
        `    case it: Iterable[_] => it.map(__walk).toList`,
        `    case s: String => __pat.replaceAllIn(s, "[REDACTED]")`,
        `    case other => other`,
        `}`,
        `__walk(${p})`,
      ];
    }
    case 'strip_sidecar_keys': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `def __strip(v: Any): Any = v match {`,
        `    case mp: scala.collection.Map[_, _] => mp.collect { case (k, vv) if { val ks = k.toString; !(ks.startsWith("_cmpsbl_") || ks.startsWith("__cmpsbl_")) } => (k, __strip(vv)) }.toMap`,
        `    case it: Iterable[_] => it.map(__strip).toList`,
        `    case other => other`,
        `}`,
        `__strip(${p})`,
      ];
    }
    case 'ctx_chain_push': {
      const p = m.params?.[0]?.name ?? 'value';
      return [`${op.field} += ${p}`];
    }
  }
}

function scRet(m: SpecMethod, spec: ComponentSpec): string {
  for (const op of m.ops) {
    if (op.kind === 'get') {
      const f = spec.fields.find(f => f.name === op.field);
      if (f) return `: ${scType(f.type)}`;
    }
    if (op.kind === 'snapshot') return ': Map[String, Any]';
  }
  return ': Unit';
}

export function emitScala(spec: ComponentSpec): string {
  const obj = `Cmpsbl${spec.module}`;
  const lines: string[] = [
    `// CMPSBL® Ascension Kernel — ${spec.module}`,
    `// ${spec.description}`,
    `object ${obj} {`,
    '    private val __lock = new Object',
    ...spec.fields.map(f => {
      const isCollection = f.type.startsWith('map<') || f.type.startsWith('list<') || f.type.startsWith('ring<');
      const decl = isCollection ? 'private val' : 'private var';
      return `    ${decl} ${f.name}: ${scType(f.type)} = ${scInit(f)}${f.comment ? ` // ${f.comment}` : ''}`;
    }),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => `${p.name}: ${scType(p.type)}`).join(', ');
    const ret = scRet(m, spec);
    lines.push(`    def ${m.name}(${params})${ret} = __lock.synchronized {`);
    for (const op of m.ops) for (const l of scOp(op, spec, m)) lines.push(`        ${l}`);
    lines.push('    }');
    lines.push('');
  }
  lines.push('}');
  return lines.join('\n');
}
