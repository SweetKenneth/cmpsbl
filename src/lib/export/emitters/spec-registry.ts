/**
 * CMPSBL® Spec Registry
 * Maps layer.id → ComponentSpec so the emitter fallback can render
 * any registered spec into 21 native languages on demand.
 *
 * Resolution order in cmpsbl-layer-polyglot:
 *   1. Native registry (hand-tuned bodies)         ← always wins
 *   2. Spec registry + emitter (this file)         ← scales to N langs
 *   3. Structural fallback                         ← last resort
 *
 * Add new components by importing their spec and calling registerSpec().
 * © CMPSBL® — All rights reserved.
 */
import type { ComponentSpec } from './spec';
import { EXAMPLE_COUNTER_SPEC } from './specs/example-counter';

const SPEC_REGISTRY = new Map<string, ComponentSpec>();

export function registerSpec(spec: ComponentSpec): void {
  SPEC_REGISTRY.set(spec.id, spec);
}

export function getSpec(layerId: string): ComponentSpec | undefined {
  return SPEC_REGISTRY.get(layerId);
}

export function listRegisteredSpecs(): string[] {
  return Array.from(SPEC_REGISTRY.keys());
}

// Eagerly register all known specs at module load.
registerSpec(EXAMPLE_COUNTER_SPEC);
