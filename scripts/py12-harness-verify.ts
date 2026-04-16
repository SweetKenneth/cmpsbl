/**
 * PY-12 + Pre-Export Harness Verification
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Runs the same 12 real-world Python files through Ascension V2 and
 * verifies the new pre-export harness gates them correctly.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import {
  generateUnifiedCapabilityFile,
  type UnifiedCapabilityInput,
} from '@/lib/export/unified-capability-file';
import { getAvailableLayers } from '@/lib/export/cmpsbl-layers';
import { runPreExportHarness } from '@/lib/ascension-v2/pre-export-harness';

const FILES = [
  'flask_app.py', 'requests_sessions.py', 'django_validators.py',
  'httpx_client.py', 'click_core.py', 'pydantic_main.py',
  'celery_base.py', 'starlette_routing.py', 'jinja2_environment.py',
  'aiohttp_web_app.py', 'fastapi_applications.py', 'sqlalchemy_engine.py',
];

const LAYER_STACKS: Record<string, number[]> = {
  'flask_app.py':            [0, 1, 2, 3],
  'requests_sessions.py':    [0],
  'django_validators.py':    [1, 2],
  'httpx_client.py':         [0, 3],
  'click_core.py':           [2, 3],
  'pydantic_main.py':        [0, 1],
  'celery_base.py':          [1, 3],
  'starlette_routing.py':    [0, 2],
  'jinja2_environment.py':   [0, 1, 2],
  'aiohttp_web_app.py':      [3],
  'fastapi_applications.py': [1, 2, 3],
  'sqlalchemy_engine.py':    [0, 1, 2, 3],
};

const CAPS: UnifiedCapabilityInput[] = [
  {
    id: 'harness-cap-1', name: 'PyHarness_Worker', cjpiScore: 92, tier: 'mythic',
    chain: ['DEFENSE', 'BRAIN', 'IMMUNITY'],
    fingerprint: 'HARNESSCAP1000000000000000000000',
    moatSignature: 'HARNESS_TEST', capabilityType: 'worker',
  },
];

const SRC_DIR = '/tmp/py12-files';
const OUT_DIR = '/tmp/py12-harness-out';
mkdirSync(OUT_DIR, { recursive: true });
const allLayers = getAvailableLayers();

interface Row {
  file: string;
  layers: string;
  passed: boolean;
  critical: number;
  soft: number;
  details: string[];
}
const rows: Row[] = [];

for (const file of FILES) {
  const src = readFileSync(join(SRC_DIR, file), 'utf-8');
  const layerIndices = LAYER_STACKS[file] || [0];
  const selectedLayers = layerIndices.map(i => allLayers[i]).filter(Boolean);

  const ascendedCode = generateUnifiedCapabilityFile(
    CAPS, `harness_${file.replace('.py', '')}`, 'python',
    [{ name: file, extension: 'py', language: 'python', content: src }],
    selectedLayers,
  );

  writeFileSync(join(OUT_DIR, `ascended-${file}`), ascendedCode);

  const report = runPreExportHarness({
    ascendedCode,
    language: 'python',
    originalFiles: [{ name: file, content: src }],
    selectedLayers,
  });

  // Independent confirmation: run python AST on the ascended output
  let astOk = false;
  try {
    execSync(
      `python3 -c "import ast; ast.parse(open('${join(OUT_DIR, `ascended-${file}`)}').read())"`,
      { timeout: 10000 },
    );
    astOk = true;
  } catch {/* fail */}

  rows.push({
    file,
    layers: selectedLayers.map(l => l.name.split(' ')[0]).join('+'),
    passed: report.passed && astOk,
    critical: report.criticalFailures,
    soft: report.softWarnings,
    details: report.checks.map(c =>
      `${c.passed ? '✓' : '✗'}${c.severity[0]} ${c.id}`
    ),
  });
}

console.log('━'.repeat(110));
console.log('PRE-EXPORT HARNESS VERIFICATION — 12 REAL-WORLD PYTHON FILES');
console.log('━'.repeat(110));
console.log(
  'FILE'.padEnd(28) + 'LAYERS'.padEnd(28) + 'VERDICT'.padEnd(10) +
  'CRIT'.padEnd(6) + 'SOFT'.padEnd(6) + 'CHECKS'
);
console.log('─'.repeat(110));
for (const r of rows) {
  console.log(
    r.file.padEnd(28) +
    r.layers.padEnd(28) +
    (r.passed ? '✓ PASS' : '✗ FAIL').padEnd(10) +
    String(r.critical).padEnd(6) +
    String(r.soft).padEnd(6) +
    r.details.join(' ')
  );
}
console.log('─'.repeat(110));
const total = rows.length;
const passed = rows.filter(r => r.passed).length;
const totalCrit = rows.reduce((s, r) => s + r.critical, 0);
const totalSoft = rows.reduce((s, r) => s + r.soft, 0);
console.log(`Verdict:           ${passed}/${total} files passed harness AND independent AST`);
console.log(`Critical failures: ${totalCrit}`);
console.log(`Soft warnings:     ${totalSoft}`);
console.log(`Output:            ${OUT_DIR}`);
process.exit(passed === total ? 0 : 1);
