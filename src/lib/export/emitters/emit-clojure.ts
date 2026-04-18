/**
 * CMPSBL® Clojure emitter — namespaced atoms with swap! for thread-safety.
 */
import type { ComponentSpec, SpecField, SpecMethod, MethodOp } from './spec';

function cljInit(f: SpecField): string {
  if (f.type.startsWith('map<')) return '{}';
  if (f.type.startsWith('list<') || f.type.startsWith('ring<')) return '[]';
  if (f.type === 'string') return JSON.stringify(f.init ?? '');
  if (f.type === 'bool') return f.init ? 'true' : 'false';
  return String(f.init ?? 0);
}

function resolveKey(m: SpecMethod): string {
  return m.params?.[0]?.name ?? 'key';
}

function cljOp(op: MethodOp, spec: ComponentSpec, m: SpecMethod): string[] {
  switch (op.kind) {
    case 'get': return [`(get @state :${op.field})`];
    case 'set': return [`(swap! state assoc :${op.field} ${op.from})`];
    case 'inc': return [`(swap! state update :${op.field} (fnil + 0) ${op.by ?? 1})`];
    case 'dec': return [`(swap! state update :${op.field} (fnil - 0) ${op.by ?? 1})`];
    case 'reset_field': return [`(swap! state assoc :${op.field} 0)`];
    case 'reset_all': {
      const pairs = spec.fields.map(f => `:${f.name} ${cljInit(f)}`).join(' ');
      return [`(reset! state {${pairs}})`];
    }
    case 'clear_map': return [`(swap! state assoc :${op.field} {})`];
    case 'map_inc': {
      const k = resolveKey(m);
      return [`(swap! state update-in [:${op.field} ${k}] (fnil + 0) ${op.by ?? 1})`];
    }
    case 'snapshot': {
      const keys = op.fields.map(f => `:${f}`).join(' ');
      return [`(select-keys @state [${keys}])`];
    }
  }
}

export function emitClojure(spec: ComponentSpec): string {
  const ns = `cmpsbl.${spec.module.toLowerCase()}`;
  const initPairs = spec.fields.map(f => `:${f.name} ${cljInit(f)}`).join(' ');
  const lines: string[] = [
    `;; CMPSBL® Ascension Kernel — ${spec.module}`,
    `;; ${spec.description}`,
    `(ns ${ns})`,
    '',
    `(defonce ^:private state (atom {${initPairs}}))`,
    '',
  ];
  for (const m of spec.methods) {
    const params = (m.params ?? []).map(p => p.name).join(' ');
    lines.push(`(defn ${m.name} [${params}]`);
    const ops = m.ops.flatMap(op => cljOp(op, spec, m));
    for (const l of ops) lines.push(`  ${l}`);
    lines.push(')');
    lines.push('');
  }
  return lines.join('\n');
}
