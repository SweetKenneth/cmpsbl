/**
 * CMPSBL® Inventory Layer — Symbolic Crafter
 * Caps: ACCESS · CORTEX · DREAM · synthesis · generative scribe
 *
 * Generative synthesis layer that crafts new structures from existing
 * primitives — fabricating code, schemas, and configs on demand under
 * cortex governance and dynamo-grade execution.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Symbolic Crafter (proprietary).                            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

interface CmpsblCraftTemplate { id: string; pattern: string; slots: string[] }

const _CMPSBL_CRAFT_LIBRARY = new Map<string, CmpsblCraftTemplate>();

export function cmpsbl_craft_register(id: string, pattern: string): CmpsblCraftTemplate {
  const slots = [...pattern.matchAll(/\\{\\{(\\w+)\\}\\}/g)].map(m => m[1]);
  const t: CmpsblCraftTemplate = { id, pattern, slots: [...new Set(slots)] };
  _CMPSBL_CRAFT_LIBRARY.set(id, t);
  return t;
}

export function cmpsbl_craft_synthesize(id: string, slots: Record<string, string>): { ok: boolean; output: string; missing: string[] } {
  const t = _CMPSBL_CRAFT_LIBRARY.get(id);
  if (!t) return { ok: false, output: '', missing: ['<template>'] };
  const missing = t.slots.filter(s => !(s in slots));
  if (missing.length > 0) return { ok: false, output: '', missing };
  let out = t.pattern;
  for (const [k, v] of Object.entries(slots)) out = out.split('{{' + k + '}}').join(v);
  return { ok: true, output: out, missing: [] };
}

export function cmpsbl_craft_schema_from_sample(sample: Record<string, unknown>): { type: 'object'; properties: Record<string, { type: string }>; required: string[] } {
  const properties: Record<string, { type: string }> = {};
  const required: string[] = [];
  for (const [k, v] of Object.entries(sample)) {
    let type: string;
    if (v === null) type = 'null';
    else if (Array.isArray(v)) type = 'array';
    else type = typeof v;
    properties[k] = { type };
    if (v !== null && v !== undefined) required.push(k);
  }
  return { type: 'object', properties, required };
}

export function cmpsbl_craft_governance_check(output: string): { safe: boolean; reason: string } {
  // Cortex governance — block obvious eval/exec sinks
  const bad = /\\b(eval\\s*\\(|exec\\s*\\(|Function\\s*\\(|child_process|subprocess|os\\.system)\\b/;
  if (bad.test(output)) return { safe: false, reason: 'forbidden-sink' };
  if (output.length > 65_536) return { safe: false, reason: 'oversized' };
  return { safe: true, reason: 'ok' };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Symbolic Crafter (proprietary).                            ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import re

_CMPSBL_CRAFT_LIBRARY = {}

def cmpsbl_craft_register(id_str: str, pattern: str) -> dict:
    slots = list(dict.fromkeys(re.findall(r'\\{\\{(\\w+)\\}\\}', pattern)))
    t = { 'id': id_str, 'pattern': pattern, 'slots': slots }
    _CMPSBL_CRAFT_LIBRARY[id_str] = t
    return t

def cmpsbl_craft_synthesize(id_str: str, slots: dict) -> dict:
    t = _CMPSBL_CRAFT_LIBRARY.get(id_str)
    if not t:
        return { 'ok': False, 'output': '', 'missing': ['<template>'] }
    missing = [s for s in t['slots'] if s not in slots]
    if missing:
        return { 'ok': False, 'output': '', 'missing': missing }
    out = t['pattern']
    for k, v in slots.items():
        out = out.replace('{{' + k + '}}', str(v))
    return { 'ok': True, 'output': out, 'missing': [] }

def cmpsbl_craft_schema_from_sample(sample: dict) -> dict:
    properties = {}
    required = []
    for k, v in sample.items():
        if v is None:
            t = 'null'
        elif isinstance(v, bool):
            t = 'boolean'
        elif isinstance(v, (int, float)):
            t = 'number'
        elif isinstance(v, list):
            t = 'array'
        elif isinstance(v, dict):
            t = 'object'
        else:
            t = 'string'
        properties[k] = { 'type': t }
        if v is not None:
            required.append(k)
    return { 'type': 'object', 'properties': properties, 'required': required }

def cmpsbl_craft_governance_check(output: str) -> dict:
    bad = re.compile(r'\\b(eval\\s*\\(|exec\\s*\\(|Function\\s*\\(|child_process|subprocess|os\\.system)\\b')
    if bad.search(output):
        return { 'safe': False, 'reason': 'forbidden-sink' }
    if len(output) > 65_536:
        return { 'safe': False, 'reason': 'oversized' }
    return { 'safe': True, 'reason': 'ok' }
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_craft = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_craft(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const result = _cmpsbl_raw_execute_craft(capabilityName, input);
  // Governance check on any string outputs synthesized downstream
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    for (const [k, v] of Object.entries(result as Record<string, unknown>)) {
      if (typeof v === 'string') {
        const g = cmpsbl_craft_governance_check(v);
        if (!g.safe) throw new Error(\`[CMPSBL:Craft:\${capabilityName}] governance blocked output '\${k}': \${g.reason}\`);
      }
    }
  }
  return result;
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_craft = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Symbolic Crafter Layer (auto-wired)."""
    result = _cmpsbl_raw_execute_craft(capability_name, input_data)
    if isinstance(result, dict):
        for k, v in result.items():
            if isinstance(v, str):
                g = cmpsbl_craft_governance_check(v)
                if not g['safe']:
                    raise RuntimeError(f"[CMPSBL:Craft:{capability_name}] governance blocked output '{k}': {g['reason']}")
    return result`;

export const SYMBOLIC_CRAFTER_LAYER: CmpsblLayerDefinition = {
  id: 'symbolic-crafter',
  name: 'Symbolic Crafter Layer',
  crownJewelRank: 28,
  cjpi: 90,
  module: 'CORTEX×DREAM',
  description: 'Template-driven generative synthesis with slot validation, schema inference from samples, and cortex-governed safety check.',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_craft_governance_check',
    behavior: 'Runs governance check on every string output; blocks forbidden sinks (eval, subprocess, os.system) and oversized payloads.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
