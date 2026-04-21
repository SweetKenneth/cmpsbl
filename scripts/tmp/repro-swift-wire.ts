import { generateUnifiedCapabilityFile, type UnifiedCapabilityInput } from '@/lib/export/unified-capability-file';
import { CYBER_DEFENSE_LAYER } from '@/lib/export/layers/security';
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
