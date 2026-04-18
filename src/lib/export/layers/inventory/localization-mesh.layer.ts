/**
 * CMPSBL® Localization Mesh Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Translates, transcreates, and persona-shifts strings across locales using
 * a hierarchical bridge. Caches resolutions and falls back through a
 * locale → language → root chain.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS_CODE = `// CMPSBL® Localization Mesh — TS
export interface LocaleEntry {
  key: string;
  locale: string;
  value: string;
  persona?: string;
  updatedAt: number;
}
const LOCALES = new Map<string, LocaleEntry>();

function bridgeChain(locale: string): string[] {
  const out: string[] = [locale];
  if (locale.includes('-')) out.push(locale.split('-')[0]);
  out.push('root');
  return out;
}

export function cmpsbl_loc_set(key: string, locale: string, value: string, persona?: string): LocaleEntry {
  const id = persona ? key + '@' + locale + ':' + persona : key + '@' + locale;
  const entry: LocaleEntry = { key, locale, value, persona, updatedAt: Date.now() };
  LOCALES.set(id, entry);
  return entry;
}

export function cmpsbl_loc_resolve(key: string, locale: string, persona?: string): string | null {
  for (const loc of bridgeChain(locale)) {
    if (persona) {
      const personaHit = LOCALES.get(key + '@' + loc + ':' + persona);
      if (personaHit) return personaHit.value;
    }
    const hit = LOCALES.get(key + '@' + loc);
    if (hit) return hit.value;
  }
  return null;
}

export function cmpsbl_loc_coverage(locale: string): number {
  const allKeys = new Set(Array.from(LOCALES.values()).map(e => e.key));
  if (allKeys.size === 0) return 1;
  let covered = 0;
  for (const k of allKeys) if (cmpsbl_loc_resolve(k, locale) !== null) covered += 1;
  return covered / allKeys.size;
}
`;

const PY_CODE = `# CMPSBL® Localization Mesh — PY
import time
from typing import Dict, List, Optional, TypedDict

class LocaleEntry(TypedDict):
    key: str
    locale: str
    value: str
    persona: Optional[str]
    updated_at: float

_LOCALES: Dict[str, LocaleEntry] = {}

def _bridge_chain(locale: str) -> List[str]:
    out = [locale]
    if "-" in locale:
        out.append(locale.split("-")[0])
    out.append("root")
    return out

def cmpsbl_loc_set(key: str, locale: str, value: str, persona: Optional[str] = None) -> LocaleEntry:
    id_ = f"{key}@{locale}:{persona}" if persona else f"{key}@{locale}"
    entry: LocaleEntry = {"key": key, "locale": locale, "value": value, "persona": persona, "updated_at": time.time()}
    _LOCALES[id_] = entry
    return entry

def cmpsbl_loc_resolve(key: str, locale: str, persona: Optional[str] = None) -> Optional[str]:
    for loc in _bridge_chain(locale):
        if persona:
            hit = _LOCALES.get(f"{key}@{loc}:{persona}")
            if hit:
                return hit["value"]
        hit = _LOCALES.get(f"{key}@{loc}")
        if hit:
            return hit["value"]
    return None

def cmpsbl_loc_coverage(locale: str) -> float:
    all_keys = {e["key"] for e in _LOCALES.values()}
    if not all_keys:
        return 1.0
    covered = sum(1 for k in all_keys if cmpsbl_loc_resolve(k, locale) is not None)
    return covered / len(all_keys)
`;

const TS_WIRE = `
const _cmpsbl_raw_execute_loc = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_loc(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // Resolve declared locale key (if any) onto the payload before execution
  const __loc = (input as any)?.__cmpsbl_locale;
  const __loc_key = (input as any)?.__cmpsbl_locale_key;
  if (__loc && __loc_key) {
    const resolved = cmpsbl_loc_resolve(__loc_key, __loc);
    if (resolved !== null) (input as any).__cmpsbl_locale_resolved = resolved;
  }
  return _cmpsbl_raw_execute_loc(capabilityName, input);
};`;

const PY_WIRE = `
_cmpsbl_raw_execute_loc = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Localization Mesh (auto-wired)."""
    if isinstance(input_data, dict):
        loc = input_data.get("__cmpsbl_locale")
        key = input_data.get("__cmpsbl_locale_key")
        if loc and key:
            resolved = cmpsbl_loc_resolve(key, loc)
            if resolved is not None:
                input_data["__cmpsbl_locale_resolved"] = resolved
    return _cmpsbl_raw_execute_loc(capability_name, input_data)`;

export const LOCALIZATION_MESH_LAYER: CmpsblLayerDefinition = {
  id: 'localization-mesh',
  name: 'Localization Mesh Layer',
  crownJewelRank: 20,
  cjpi: 8.4,
  module: 'INTEGRATION',
  description:
    'Translates, transcreates, and persona-shifts strings across locales via a hierarchical bridge with locale → language → root fallback.',
  priceCents: 5900,
  tsCode: TS_CODE,
  pyCode: PY_CODE,
  autoWire: {
    wrapperName: 'cmpsbl_loc_resolve',
    behavior: 'Resolves declared locale keys on inputs prior to execute, attaching the localized value to the payload.',
    tsWire: TS_WIRE,
    pyWire: PY_WIRE,
  },
};
