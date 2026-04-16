/**
 * PY-12 Layer Stack Stress Test
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 12 real-world Python files × different CMPSBL layer stacks.
 * Tests both generateRefurbishedCode and generateUnifiedCapabilityFile.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { generateRefurbishedCode } from '@/lib/factory/generate-refurbished-code';
import { validateLayer2Linkage } from '@/lib/export/layer2-validator';
import {
  generateUnifiedCapabilityFile,
  type UnifiedCapabilityInput,
} from '@/lib/export/unified-capability-file';
import { getAvailableLayers } from '@/lib/export/cmpsbl-layers';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';

const FILES = [
  'flask_app.py',
  'requests_sessions.py',
  'django_validators.py',
  'httpx_client.py',
  'click_core.py',
  'pydantic_main.py',
  'celery_base.py',
  'starlette_routing.py',
  'jinja2_environment.py',
  'aiohttp_web_app.py',
  'fastapi_applications.py',
  'sqlalchemy_engine.py',
];

const PRIMS: PrimitiveRecommendation[] = [
  { primitiveId: 'defense',    name: 'DEFENSE',    category: 'Layer',  impactScore: 95, rationale: 'PY12 stress', chainPosition: 1, collisionScore: 95 },
  { primitiveId: 'brain',      name: 'BRAIN',      category: 'Organ',  impactScore: 92, rationale: 'PY12 stress', chainPosition: 2, collisionScore: 92 },
  { primitiveId: 'immunity',   name: 'IMMUNITY',   category: 'Layer',  impactScore: 90, rationale: 'PY12 stress', chainPosition: 3, collisionScore: 90 },
  { primitiveId: 'failsafe',   name: 'FAILSAFE',   category: 'Engine', impactScore: 88, rationale: 'PY12 stress', chainPosition: 4, collisionScore: 88 },
  { primitiveId: 'phantom',    name: 'PHANTOM',    category: 'Organ',  impactScore: 86, rationale: 'PY12 stress', chainPosition: 5, collisionScore: 86 },
  { primitiveId: 'conscience', name: 'CONSCIENCE', category: 'Layer',  impactScore: 84, rationale: 'PY12 stress', chainPosition: 6, collisionScore: 84 },
];

const FP = 'PY12STRESSTESTABCDEF1234567890AA';
const OUT_DIR = '/tmp/py12-out';
const SRC_DIR = '/tmp/py12-files';
mkdirSync(OUT_DIR, { recursive: true });

const allLayers = getAvailableLayers();

// Different layer stacks for each file to stress-test different combos
const LAYER_STACKS: Record<string, number[]> = {
  'flask_app.py':             [0, 1, 2, 3],   // all 4 layers
  'requests_sessions.py':     [0],             // circuit breaker only
  'django_validators.py':     [1, 2],          // self-healing + triage
  'httpx_client.py':          [0, 3],          // circuit breaker + consensus
  'click_core.py':            [2, 3],          // triage + consensus
  'pydantic_main.py':         [0, 1],          // circuit breaker + self-healing
  'celery_base.py':           [1, 3],          // self-healing + consensus
  'starlette_routing.py':     [0, 2],          // circuit breaker + triage
  'jinja2_environment.py':    [0, 1, 2],       // 3 layers
  'aiohttp_web_app.py':       [3],             // consensus only
  'fastapi_applications.py':  [1, 2, 3],       // 3 layers no circuit breaker
  'sqlalchemy_engine.py':     [0, 1, 2, 3],   // all 4 layers
};

const CAPS: UnifiedCapabilityInput[] = [
  {
    id: 'py12-cap-1', name: 'PyWorker_Alpha', cjpiScore: 93, tier: 'mythic',
    chain: ['DEFENSE', 'BRAIN', 'IMMUNITY', 'FAILSAFE'],
    fingerprint: 'PY12ALPHA00000000000000000000000',
    moatSignature: 'ENTERPRISE_PY_ALPHA',
    capabilityType: 'worker',
  },
  {
    id: 'py12-cap-2', name: 'PyWorker_Beta', cjpiScore: 89, tier: 'legendary',
    chain: ['PHANTOM', 'CONSCIENCE', 'BRAIN'],
    fingerprint: 'PY12BETA000000000000000000000000',
    moatSignature: 'ENTERPRISE_PY_BETA',
    capabilityType: 'analyzer',
  },
];

interface Result {
  file: string;
  srcLines: number;
  layerStack: string;
  refurbBytes: number; refurbOk: boolean; refurbErr?: string;
  unifiedBytes: number; unifiedOk: boolean; unifiedErr?: string;
  linkOk: boolean; linkErrs: string[];
  pyExecOk: boolean; pyExecErr?: string;
}

const results: Result[] = [];

for (const file of FILES) {
  const src = readFileSync(join(SRC_DIR, file), 'utf-8');
  const layerIndices = LAYER_STACKS[file] || [0];
  const selectedLayers = layerIndices.map(i => allLayers[i]).filter(Boolean);
  const stackLabel = selectedLayers.map(l => l.name).join('+');

  const r: Result = {
    file,
    srcLines: src.split('\n').length,
    layerStack: stackLabel,
    refurbBytes: 0, refurbOk: false,
    unifiedBytes: 0, unifiedOk: false,
    linkOk: false, linkErrs: [],
    pyExecOk: false,
  };

  // (a) Refurbished code (Layer 1 + Layer 2)
  try {
    const out = generateRefurbishedCode(src, PRIMS, FP, 'Python', file);
    r.refurbBytes = out.length;
    r.refurbOk = true;
    writeFileSync(join(OUT_DIR, `refurb-${file}`), out);

    const link = validateLayer2Linkage(out, 'Python', [file]);
    r.linkOk = link.linked;
    r.linkErrs = link.errors || [];
  } catch (e: any) {
    r.refurbErr = String(e?.message || e).split('\n')[0].slice(0, 250);
  }

  // (b) Unified capability file with layer stack merged
  try {
    const out2 = generateUnifiedCapabilityFile(
      CAPS, `py12_${file.replace('.py', '')}`, 'python', undefined, selectedLayers,
    );
    r.unifiedBytes = out2.length;
    r.unifiedOk = true;
    writeFileSync(join(OUT_DIR, `unified-${file}`), out2);
  } catch (e: any) {
    r.unifiedErr = String(e?.message || e).split('\n')[0].slice(0, 250);
  }

  // (c) Syntax-check the unified Python output
  if (r.unifiedOk) {
    try {
      execSync(`python3 -c "import ast; ast.parse(open('${join(OUT_DIR, `unified-${file}`)}').read())"`, { timeout: 10000 });
      r.pyExecOk = true;
    } catch (e: any) {
      r.pyExecErr = String(e?.stderr || e?.message || e).split('\n').filter((l: string) => l.includes('Error')).join(' ').slice(0, 250) || 'AST parse failed';
    }
  }

  results.push(r);
}

// ── Report ──
console.log('━'.repeat(100));
console.log('PY-12 LAYER STACK STRESS TEST — REAL WORLD PYTHON');
console.log('━'.repeat(100));
console.log(
  'FILE'.padEnd(28) +
  'LINES'.padEnd(7) +
  'LAYERS'.padEnd(40) +
  'REFURB'.padEnd(10) +
  'UNIFIED'.padEnd(10) +
  'LINK'.padEnd(6) +
  'PYAST'
);
console.log('─'.repeat(100));
for (const r of results) {
  const ref = r.refurbOk ? `✓ ${(r.refurbBytes / 1024).toFixed(0)}K`.padEnd(10) : '✗ FAIL'.padEnd(10);
  const uni = r.unifiedOk ? `✓ ${(r.unifiedBytes / 1024).toFixed(0)}K`.padEnd(10) : '✗ FAIL'.padEnd(10);
  const link = r.refurbOk ? (r.linkOk ? '✓' : '✗') : '—';
  const pyast = r.pyExecOk ? '✓' : (r.unifiedOk ? '✗' : '—');
  console.log(
    `${r.file.padEnd(28)}${String(r.srcLines).padEnd(7)}${r.layerStack.padEnd(40)}${ref}${uni}${link.padEnd(6)}${pyast}`
  );
  if (r.refurbErr)  console.log(`   refurb:  ${r.refurbErr}`);
  if (r.unifiedErr) console.log(`   unified: ${r.unifiedErr}`);
  if (r.pyExecErr)  console.log(`   pyast:   ${r.pyExecErr}`);
  if (!r.linkOk && r.refurbOk && r.linkErrs.length) {
    console.log(`   link:    ${r.linkErrs.slice(0, 2).join(' | ')}`);
  }
}
console.log('─'.repeat(100));
const refOk = results.filter(r => r.refurbOk).length;
const uniOk = results.filter(r => r.unifiedOk).length;
const linkOk = results.filter(r => r.linkOk).length;
const pyOk = results.filter(r => r.pyExecOk).length;
console.log(`refurb:  ${refOk}/${results.length}`);
console.log(`unified: ${uniOk}/${results.length}`);
console.log(`linkage: ${linkOk}/${results.length}`);
console.log(`py-ast:  ${pyOk}/${results.length}`);
console.log(`output:  ${OUT_DIR}`);

const allGreen = refOk === 12 && uniOk === 12 && pyOk === 12;
process.exit(allGreen ? 0 : 1);
