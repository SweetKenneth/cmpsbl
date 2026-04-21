import { SECURITY_LAYERS } from '@/lib/export/layers/security';
import { HOLOGRAPHIC_INTEGRATION_SUITE_LAYER } from '@/lib/export/layers/inventory/holographic-integration-suite.layer';
import { getAllLayerCode } from '@/lib/export/cmpsbl-layer-polyglot';

const layers = [SECURITY_LAYERS[2], HOLOGRAPHIC_INTEGRATION_SUITE_LAYER];
const code = getAllLayerCode(layers, 'swift');
console.log('LEN:', code.length);
console.log('has cmpsbl_ddos_check:', code.includes('cmpsbl_ddos_check'));
console.log('has cmpsbl_his_resonate_check:', code.includes('cmpsbl_his_resonate_check'));
console.log('--- FIRST 2000 ---');
console.log(code.slice(0, 2000));
