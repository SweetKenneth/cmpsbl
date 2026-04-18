/**
 * CMPSBL® Component Spec — declarative kernel component definition.
 * One spec → 7 language emitters render idiomatic, thread-safe code.
 * © CMPSBL® — All rights reserved.
 */

export type FieldType =
  | 'int' | 'long' | 'float' | 'bool' | 'string'
  | 'map<string,int>' | 'map<string,long>' | 'map<string,float>'
  | 'list<string>' | 'ring<string>';

export interface SpecField {
  name: string;            // snake_case canonical
  type: FieldType;
  init: string | number | boolean; // language-agnostic literal
  comment?: string;
}

export type MethodOp =
  | { kind: 'get'; field: string }
  | { kind: 'set'; field: string; from: 'param' }
  | { kind: 'inc'; field: string; by?: number | string }
  | { kind: 'dec'; field: string; by?: number | string }
  | { kind: 'reset_field'; field: string }
  | { kind: 'reset_all' }
  | { kind: 'clear_map'; field: string }
  | { kind: 'map_inc'; field: string; key: 'param'; by?: number | string }
  | { kind: 'snapshot'; fields: string[] } // returns dict/struct of named fields
  // ── Symbiotic Layer 2 ops (Oracle-Ripple / AI-Safety / Cog-Memory parity) ──
  // Recursively redact secret-like strings inside the param value (deep walk).
  // Preserves CMPSBL framework keys ('_cmpsbl_…' / '__cmpsbl_…'). Returns sanitized value.
  | { kind: 'sanitize_deep'; from: 'param' }
  // Recursively strip map keys whose name starts with '_cmpsbl_' or '__cmpsbl_'.
  // Returns the cleaned value. Used by Cognitive Memory before persistence.
  | { kind: 'strip_sidecar_keys'; from: 'param' }
  // Append the param value to a context-scoped chain stored in `field` (declared as list<string>).
  // Uses thread-local where the language supports it; otherwise a mutex-guarded module list.
  | { kind: 'ctx_chain_push'; field: string; from: 'param' };

export interface SpecMethod {
  name: string;            // snake_case canonical
  params?: Array<{ name: string; type: FieldType }>;
  ops: MethodOp[];
  threadSafe?: boolean;    // wrap in lock (default: true)
  comment?: string;
}

export interface ComponentSpec {
  id: string;              // kebab-case, matches registry key
  module: string;          // PascalCase module name (Cmpsbl-prefixed by emitters)
  description: string;
  fields: SpecField[];
  methods: SpecMethod[];
}
