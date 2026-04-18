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

function resolveKey(m: SpecMethod, key: 'param'): string {
  return m.params?.[0]?.name ?? 'key';
}

function rbOp(op: MethodOp, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return @${op.field}`];
    case 'set': return [`@${op.field} = ${op.from}`];
    case 'inc': return [`@${op.field} += ${op.by ?? 1}`];
    case 'dec': return [`@${op.field} -= ${op.by ?? 1}`];
    case 'reset_field': return [`@${op.field} = 0`];
    case 'reset_all': return ['@__reset_all__ = true'];
    case 'clear_map': return [`@${op.field}.clear`];
    case 'map_inc': {
      const k = resolveKey(m, op.key);
      return [`@${op.field}[${k}] = (@${op.field}[${k}] || 0) + ${op.by ?? 1}`];
    }
    case 'snapshot':
      return [`return { ${op.fields.map(f => `${f}: @${f}`).join(', ')} }`];
    case 'sanitize_deep': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `__walk = lambda do |v|`,
        `  case v`,
        `  when Hash then v.each_with_object({}) { |(k, vv), h| h[k] = (k.to_s.start_with?('_cmpsbl_') || k.to_s.start_with?('__cmpsbl_')) ? vv : __walk.call(vv) }`,
        `  when Array then v.map { |x| __walk.call(x) }`,
        `  when String then v.gsub(/(api[_-]?key|secret|password|token|bearer\\s+[\\w.-]+|sk-[\\w-]{16,})/i, '[REDACTED]')`,
        `  else v`,
        `  end`,
        `end`,
        `return __walk.call(${p})`,
      ];
    }
    case 'strip_sidecar_keys': {
      const p = m.params?.[0]?.name ?? 'value';
      return [
        `__strip = lambda do |v|`,
        `  case v`,
        `  when Hash then v.reject { |k, _| k.to_s.start_with?('_cmpsbl_') || k.to_s.start_with?('__cmpsbl_') }.transform_values { |vv| __strip.call(vv) }`,
        `  when Array then v.map { |x| __strip.call(x) }`,
        `  else v`,
        `  end`,
        `end`,
        `return __strip.call(${p})`,
      ];
    }
    case 'ctx_chain_push': {
      const p = m.params?.[0]?.name ?? 'value';
      return [`(@${op.field} ||= []) << ${p}`];
    }
  }
}

function rbMethod(spec: ComponentSpec, m: SpecMethod): string {
  const params = (m.params ?? []).map(p => p.name).join(', ');
  const sig = params ? `def self.${m.name}(${params})` : `def self.${m.name}`;
  const body = m.ops.flatMap(o => rbOp(o, m));
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
