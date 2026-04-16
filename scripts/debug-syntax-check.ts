import { readFileSync } from 'node:fs';
import { generateUnifiedCapabilityFile, type UnifiedCapabilityInput } from '@/lib/export/unified-capability-file';
import { getAvailableLayers } from '@/lib/export/cmpsbl-layers';
import { validateLayer2 } from '@/lib/export/layer2-validator';

const src = readFileSync('/tmp/py12-files/requests_sessions.py', 'utf-8');
const layers = getAvailableLayers();
const caps: UnifiedCapabilityInput[] = [{
  id: 'd', name: 'Worker', cjpiScore: 90, tier: 'mythic',
  chain: ['DEFENSE'], fingerprint: 'X'.repeat(32), moatSignature: 'M', capabilityType: 'w',
}];
const code = generateUnifiedCapabilityFile(
  caps, 'debug', 'python',
  [{ name: 'requests_sessions.py', extension: 'py', language: 'python', content: src }],
  [layers[0]],
);
const r = validateLayer2(code, 'python');
console.log('ERRORS:', r.errors.filter(e => e.severity === 'error').slice(0, 5));
console.log('TOTAL ERRORS:', r.errors.filter(e => e.severity === 'error').length);
console.log('WARNINGS:', r.errors.filter(e => e.severity === 'warning').length);
