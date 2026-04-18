/**
 * CMPSBL® Perl emitter — package with file-scoped state; threads::shared optional.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function plInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return '{}';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return '[]';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return f.init ? '1' : '0';
  return String(f.init ?? 0);
}

function sigil(f: SpecField): string {
  if (f.type.startsWith('map<')) return '%';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return '@';
  return '$';
}

function resolveKey(m: SpecMethod): string {
  return '$' + (m.params?.[0]?.name ?? 'key');
}

function plOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  const fld = (n: string) => `$state{'${n}'}`;
  switch (op.kind) {
    case 'get': return [`return ${fld(op.field)};`];
    case 'set': return [`${fld(op.field)} = $${op.from};`];
    case 'inc': return [`${fld(op.field)} += ${op.by ?? 1};`];
    case 'dec': return [`${fld(op.field)} -= ${op.by ?? 1};`];
    case 'reset_field': return [`${fld(op.field)} = 0;`];
    case 'reset_all': return spec.fields.map(f => `${fld(f.name)} = ${plInit(f)};`);
    case 'clear_map': return [`${fld(op.field)} = {};`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [`${fld(op.field)}->{${k}} = (${fld(op.field)}->{${k}} // 0) + ${op.by ?? 1};`];
    }
    case 'snapshot': {
      const pairs = op.fields.map(f => `${f} => ${fld(f)}`).join(', ');
      return [`return { ${pairs} };`];
    }
    case 'sanitize_deep': {
      const p = '$' + (m.params?.[0]?.name ?? 'value');
      return [
        `my $__walk;`,
        `$__walk = sub { my $v = shift;`,
        `    if (ref($v) eq 'HASH') { my %o; for my $k (keys %$v) { if ($k =~ /^_{1,2}cmpsbl_/) { $o{$k} = $v->{$k} } else { $o{$k} = $__walk->($v->{$k}) } } return \\%o; }`,
        `    if (ref($v) eq 'ARRAY') { return [ map { $__walk->($_) } @$v ]; }`,
        `    if (!ref($v) && defined $v) { my $s = $v; $s =~ s/(api[_-]?key|secret|password|token|bearer\\s+[\\w.-]+|sk-[\\w-]{16,})/[REDACTED]/gi; return $s; }`,
        `    return $v;`,
        `};`,
        `return $__walk->(${p});`,
      ];
    }
    case 'strip_sidecar_keys': {
      const p = '$' + (m.params?.[0]?.name ?? 'value');
      return [
        `my $__strip;`,
        `$__strip = sub { my $v = shift;`,
        `    if (ref($v) eq 'HASH') { my %o; for my $k (keys %$v) { next if $k =~ /^_{1,2}cmpsbl_/; $o{$k} = $__strip->($v->{$k}); } return \\%o; }`,
        `    if (ref($v) eq 'ARRAY') { return [ map { $__strip->($_) } @$v ]; }`,
        `    return $v;`,
        `};`,
        `return $__strip->(${p});`,
      ];
    }
    case 'ctx_chain_push': {
      const p = '$' + (m.params?.[0]?.name ?? 'value');
      return [
        `$state{'${op.field}'} = [] unless ref($state{'${op.field}'}) eq 'ARRAY';`,
        `push @{ $state{'${op.field}'} }, ${p};`,
      ];
    }
  }
}

export function emitPerl(spec: ComponentSpec): string {
  const pkg = `Cmpsbl::${spec.module}`;
  const lines: string[] = [
    `# CMPSBL® Ascension Kernel — ${spec.module}`,
    `# ${spec.description}`,
    `package ${pkg};`,
    'use strict;',
    'use warnings;',
    '',
    'my %state = (',
    ...spec.fields.map(f => `    '${f.name}' => ${plInit(f)},${f.comment ? ` # ${f.comment}` : ''}`),
    ');',
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => '$' + p.name).join(', ');
    lines.push(`sub ${m.name} {`);
    if (params) lines.push(`    my (${params}) = @_;`);
    for (const op of m.ops) for (const l of plOp(op, spec, m)) lines.push(`    ${l}`);
    lines.push('}');
    lines.push('');
  }
  lines.push('1;');
  return lines.join('\n');
}
