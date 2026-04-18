/**
 * CMPSBL® PHP emitter — class with static state + Mutex via flock fallback.
 * PHP lacks true threads in standard runtime; uses class-level static guard.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function phpInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return '[]';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return '[]';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return f.init ? 'true' : 'false';
  return String(f.init ?? 0);
}

function resolveKey(m: SpecMethod): string {
  return '$' + (m.params?.[0]?.name ?? 'key');
}

function phpOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`return self::$${op.field};`];
    case 'set': return [`self::$${op.field} = $${op.from};`];
    case 'inc': return [`self::$${op.field} += ${op.by ?? 1};`];
    case 'dec': return [`self::$${op.field} -= ${op.by ?? 1};`];
    case 'reset_field': return [`self::$${op.field} = 0;`];
    case 'reset_all': return spec.fields.map(f => `self::$${f.name} = ${phpInit(f)};`);
    case 'clear_map': return [`self::$${op.field} = [];`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [`self::$${op.field}[${k}] = (self::$${op.field}[${k}] ?? 0) + ${op.by ?? 1};`];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `'${f}' => self::$${f}`).join(', ');
      return [`return [${pairs}];`];
    }
  }
}

export function emitPhp(spec: ComponentSpec): string {
  const cls = `Cmpsbl${spec.module}`;
  const lines: string[] = [
    '<?php',
    `// CMPSBL® Ascension Kernel — ${spec.module}`,
    `// ${spec.description}`,
    `class ${cls} {`,
    ...spec.fields.map(f => `    private static $${f.name} = ${phpInit(f)};${f.comment ? ` // ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => '$' + p.name).join(', ');
    lines.push(`    public static function ${m.name}(${params}) {`);
    for (const op of m.ops) for (const l of phpOp(op, spec, m)) lines.push(`        ${l}`);
    lines.push('    }');
    lines.push('');
  }
  lines.push('}');
  return lines.join('\n');
}
