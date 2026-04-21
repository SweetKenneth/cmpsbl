/**
 * CMPSBL® Inventory Layer — Geographic Data Residency Layer
 * Primitives: PARTITION · GATE · RESIDENCY
 *
 * Distinct from regulatory-compliance (rules) and localization-mesh (translation):
 * enforces geographic data residency at the function call boundary.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Geographic Data Residency Layer (proprietary).                ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblRegion = 'us' | 'eu' | 'apac' | 'gov' | 'unknown';
const _CMPSBL_DSP_PARTITIONS = new Map<string, CmpsblRegion>();
const _CMPSBL_DSP_POLICY: Record<CmpsblRegion, CmpsblRegion[]> = {
  us: ['us', 'gov'], eu: ['eu'], apac: ['apac'], gov: ['gov'], unknown: [],
};

export function cmpsbl_dsp_partition(recordId: string, region: CmpsblRegion): void {
  _CMPSBL_DSP_PARTITIONS.set(recordId, region);
}

export function cmpsbl_dsp_residency(recordId: string): CmpsblRegion {
  return _CMPSBL_DSP_PARTITIONS.get(recordId) ?? 'unknown';
}

export function cmpsbl_dsp_gate(recordId: string, callerRegion: CmpsblRegion): { allowed: boolean; reason: string } {
  const dataRegion = cmpsbl_dsp_residency(recordId);
  if (dataRegion === 'unknown') return { allowed: false, reason: 'unclassified-data' };
  const allowed = _CMPSBL_DSP_POLICY[callerRegion]?.includes(dataRegion) ?? false;
  return { allowed, reason: allowed ? 'residency-match' : \`\${callerRegion}-cannot-access-\${dataRegion}\` };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Geographic Data Residency Layer (proprietary).                ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

from typing import Dict

_CMPSBL_DSP_PARTITIONS: Dict[str, str] = {}
_CMPSBL_DSP_POLICY: Dict[str, list] = {
    'us': ['us', 'gov'], 'eu': ['eu'], 'apac': ['apac'], 'gov': ['gov'], 'unknown': [],
}

def cmpsbl_dsp_partition(record_id: str, region: str) -> None:
    _CMPSBL_DSP_PARTITIONS[record_id] = region

def cmpsbl_dsp_residency(record_id: str) -> str:
    return _CMPSBL_DSP_PARTITIONS.get(record_id, 'unknown')

def cmpsbl_dsp_gate(record_id: str, caller_region: str) -> dict:
    data_region = cmpsbl_dsp_residency(record_id)
    if data_region == 'unknown': return { 'allowed': False, 'reason': 'unclassified-data' }
    allowed = data_region in _CMPSBL_DSP_POLICY.get(caller_region, [])
    return { 'allowed': allowed, 'reason': 'residency-match' if allowed else f'{caller_region}-cannot-access-{data_region}' }
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_dsp = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_dsp(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const recordId = String((input as Record<string, unknown>)._cmpsbl_record_id ?? '');
  const callerRegion = String((input as Record<string, unknown>)._cmpsbl_region ?? 'unknown') as 'us' | 'eu' | 'apac' | 'gov' | 'unknown';
  if (recordId) {
    const gate = cmpsbl_dsp_gate(recordId, callerRegion);
    if (!gate.allowed) {
      throw new Error(\`[CMPSBL:DataSovereignty:\${capabilityName}] \${gate.reason}\`);
    }
  }
  return _cmpsbl_raw_execute_dsp(capabilityName, input);
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_dsp = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    record_id = str(input_data.get('_cmpsbl_record_id', ''))
    caller_region = str(input_data.get('_cmpsbl_region', 'unknown'))
    if record_id:
        gate = cmpsbl_dsp_gate(record_id, caller_region)
        if not gate['allowed']:
            raise RuntimeError(f"[CMPSBL:DataSovereignty:{capability_name}] {gate['reason']}")
    return _cmpsbl_raw_execute_dsp(capability_name, input_data)`;

export const DATA_SOVEREIGNTY_PARTITIONER_LAYER: CmpsblLayerDefinition = {
  id: 'data-sovereignty-partitioner',
  name: 'Geographic Data Residency Layer',
  crownJewelRank: 35,
  cjpi: 97,
  module: 'COMPLIANCE×CORTEX',
  description: 'Classifies records by region (EU, US, APAC) and gates cross-region access at the function-call boundary — meet GDPR / data-residency contracts without re-architecting your storage.',
  priceCents: 9900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_dsp_gate',
    behavior: 'Reads _cmpsbl_record_id + _cmpsbl_region from input; fail-closed on residency violation.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
