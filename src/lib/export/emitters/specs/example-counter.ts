/**
 * CMPSBL® Example Spec — minimal counter component.
 * Demonstrates the spec-driven emitter pattern end-to-end.
 */
import type { ComponentSpec } from '../spec';

export const EXAMPLE_COUNTER_SPEC: ComponentSpec = {
  id: 'example-counter',
  module: 'ExampleCounter',
  description: 'Thread-safe counter with per-key tallies. Emitter scaffold demo.',
  fields: [
    { name: 'total', type: 'long', init: 0, comment: 'monotonic call count' },
    { name: 'tallies', type: 'map<string,long>', init: 0, comment: 'per-key counts' },
  ],
  methods: [
    {
      name: 'tick',
      params: [{ name: 'key', type: 'string' }],
      ops: [
        { kind: 'inc', field: 'total' },
        { kind: 'map_inc', field: 'tallies', key: 'param' },
      ],
    },
    { name: 'get_total', ops: [{ kind: 'get', field: 'total' }] },
    {
      name: 'snapshot',
      ops: [{ kind: 'snapshot', fields: ['total'] }],
    },
    { name: 'reset', ops: [{ kind: 'reset_all' }] },
  ],
};
