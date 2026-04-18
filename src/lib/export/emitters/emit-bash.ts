/**
 * CMPSBL® Bash emitter — functions over global vars; flock for serialization.
 * Maps use associative arrays (bash 4+).
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function shInit(f: SpecField): string {
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return f.init ? '1' : '0';
  return String(f.init ?? 0);
}

function declareLine(f: SpecField, prefix: string): string {
  const name = `${prefix}_${f.name}`;
  if (f.type.startsWith('map<')) return `declare -gA ${name}=()`;
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return `declare -ga ${name}=()`;
  return `${name}=${shInit(f)}`;
}

function resolveKey(m: SpecMethod): string {
  return '"$' + (m.params?.[0]?.name ?? 'key') + '"';
}

function shOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod, prefix: string): string[] {
  const v = (n: string) => `${prefix}_${n}`;
  switch (op.kind) {
    case 'get': return [`echo "\${${v(op.field)}}"`];
    case 'set': return [`${v(op.field)}="$${op.from}"`];
    case 'inc': return [`${v(op.field)}=$(( ${v(op.field)} + ${op.by ?? 1} ))`];
    case 'dec': return [`${v(op.field)}=$(( ${v(op.field)} - ${op.by ?? 1} ))`];
    case 'reset_field': return [`${v(op.field)}=0`];
    case 'reset_all': return spec.fields.map(f => {
      if (f.type.startsWith('map<')) return `${v(f.name)}=()`;
      if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return `${v(f.name)}=()`;
      return `${v(f.name)}=${shInit(f)}`;
    });
    case 'clear_map': return [`${v(op.field)}=()`];
    case 'map_inc': {
      const k = resolveKey(m);
      const cur = `\${${v(op.field)}[${k}]:-0}`;
      return [`${v(op.field)}[${k}]=$(( ${cur} + ${op.by ?? 1} ))`];
    }
    case 'snapshot': {
      const lines = ['echo "{"'];
      op.fields.forEach((f, i) => {
        const sep = i < op.fields.length - 1 ? ',' : '';
        lines.push(`echo "  \\"${f}\\": \${${v(f)}}${sep}"`);
      });
      lines.push('echo "}"');
      return lines;
    }
    // Tier-3: bash cannot deep-walk JSON natively. Emit shallow regex redaction
    // and pass-through for non-string params; document the limitation.
    case 'sanitize_deep': {
      const p = '"$' + (m.params?.[0]?.name ?? 'value') + '"';
      return [
        `# DEGRADED: shallow string redaction only (bash has no native JSON walker)`,
        `local __out=$(echo ${p} | sed -E 's/(api[_-]?key|secret|password|token|bearer[[:space:]]+[A-Za-z0-9._-]+|sk-[A-Za-z0-9_-]{16,})/[REDACTED]/Ig')`,
        `echo "$__out"`,
      ];
    }
    case 'strip_sidecar_keys': {
      const p = '"$' + (m.params?.[0]?.name ?? 'value') + '"';
      return [
        `# DEGRADED: pass-through (bash cannot mutate JSON keys without jq)`,
        `# Recommend: pipe through 'jq "walk(if type == \\"object\\" then with_entries(select(.key | startswith(\\"_cmpsbl_\\") | not)) else . end)"' externally.`,
        `echo ${p}`,
      ];
    }
    case 'ctx_chain_push': {
      const p = '"$' + (m.params?.[0]?.name ?? 'value') + '"';
      return [`${v(op.field)}+=(${p})`];
    }
  }
}

export function emitBash(spec: ComponentSpec): string {
  const prefix = `CMPSBL_${spec.module.toUpperCase()}`;
  const lines: string[] = [
    '#!/usr/bin/env bash',
    `# CMPSBL® Ascension Kernel — ${spec.module}`,
    `# ${spec.description}`,
    'set -u',
    '',
    ...spec.fields.map(f => `${declareLine(f, prefix)}${f.comment ? ` # ${f.comment}` : ''}`),
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map((p, i) => `local ${p.name}="$${i + 1}"`);
    lines.push(`${prefix.toLowerCase()}_${m.name}() {`);
    for (const p of params) lines.push(`    ${p}`);
    for (const op of m.ops) for (const l of shOp(op, spec, m, prefix)) lines.push(`    ${l}`);
    lines.push('}');
    lines.push('');
  }
  return lines.join('\n');
}
