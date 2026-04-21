import { generateUnifiedCapabilityFile, type UnifiedCapabilityInput } from '@/lib/export/unified-capability-file';
import { SECURITY_LAYERS } from '@/lib/export/layers/security';
const CYBER_DEFENSE_LAYER = SECURITY_LAYERS[2];
import { runPreExportHarness } from '@/lib/ascension-v2/pre-export-harness';
import { HOLOGRAPHIC_INTEGRATION_SUITE_LAYER } from '@/lib/export/layers/inventory/holographic-integration-suite.layer';

const caps: UnifiedCapabilityInput[] = [{
  id: 'c1', name: 'Hello', cjpiScore: 90, tier: 'a', chain: ['CORE'],
  fingerprint: 'fp1', moatSignature: 'm1', capabilityType: 'ascended', description: 'test',
}];

const layers = [CYBER_DEFENSE_LAYER, HOLOGRAPHIC_INTEGRATION_SUITE_LAYER];
const src = [{ name: 'app.swift', extension: 'swift', language: 'swift', content: 'func greet() -> String { return "hi" }' }];

const code = generateUnifiedCapabilityFile(caps, 'test_pack', 'swift', src, layers);
console.log('--- ASCENDED LENGTH:', code.length);
for (const layer of layers) {
  const w = layer.autoWire.wrapperName;
  console.log(`wrapper "${w}" present:`, code.includes(w));
}
const h = runPreExportHarness({ ascendedCode: code, language: 'swift', originalFiles: src, selectedLayers: layers });
console.log('--- HARNESS PASSED:', h.passed);
for (const c of h.checks) {
  if (!c.passed) console.log('  FAIL', c.id, c.severity, '—', c.message);
}
// Find layer fragments
const idxCD = code.indexOf('Cyber Defense');
console.log('\n--- CD region (idx', idxCD, ') ---');
console.log(code.slice(Math.max(0, idxCD - 50), idxCD + 1200));
const idxHIS = code.indexOf('Holographic');
console.log('\n--- HIS region (idx', idxHIS, ') ---');
console.log(code.slice(Math.max(0, idxHIS - 50), idxHIS + 1200));
