/**
 * PY-50 Harness Sweep
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Runs 50 real-world Python OSS files through Ascension V2 with rotating
 * CMPSBL layer stacks and validates each export through the pre-export harness
 * AND an independent Python AST parse.
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import {
  generateUnifiedCapabilityFile,
  type UnifiedCapabilityInput,
} from '@/lib/export/unified-capability-file';
import { getAvailableLayers } from '@/lib/export/cmpsbl-layers';
import { runPreExportHarness } from '@/lib/ascension-v2/pre-export-harness';

const SRC_DIR = '/tmp/py50';
const OUT_DIR = '/tmp/py50-out';
// Wipe prior outputs so this run never reads stale exports from a previous sweep.
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
console.log(`[sweep] cleaned ${OUT_DIR} — every export below is freshly generated this run`);

const FILES = readdirSync(SRC_DIR).filter(f => f.endsWith('.py')).sort();

const CAPS: UnifiedCapabilityInput[] = [
  {
    id: 'sweep-cap-1', name: 'PySweep_Worker', cjpiScore: 92, tier: 'mythic',
    chain: ['DEFENSE', 'BRAIN', 'IMMUNITY'],
    fingerprint: 'PYSWEEP00000000000000000000000A0',
    moatSignature: 'PY50_SWEEP', capabilityType: 'worker',
  },
];

const allLayers = getAvailableLayers();

// Rotate layer stacks across the 50 files for diverse coverage.
// `[]` = cores only (the 7-piece "CMPSBL Hardening Layer")
// always inlined regardless of optional selections.
function stackFor(i: number): number[] {
  const patterns: number[][] = [
    [],                                 // cores only (CMPSBL Hardening baseline)
    [0],          [1],          [2],          [3],
    [0, 1],       [0, 2],       [0, 3],       [1, 2],
    [1, 3],       [2, 3],       [0, 1, 2],    [0, 1, 3],
    [0, 2, 3],    [1, 2, 3],    [0, 1, 2, 3],
  ];
  return patterns[i % patterns.length];
}

interface Row {
  file: string;
  bytes: number;
  layers: string;
  passed: boolean;
  critical: number;
  soft: number;
  astOk: boolean;
  candidateOk: boolean;       // Primitive #41 (CANDIDATE) wired in chain + handler present
  layer1Untouched: boolean;   // Original source byte-perfect inside export
  failedChecks: string[];
}

const rows: Row[] = [];
let idx = 0;

for (const file of FILES) {
  const src = readFileSync(join(SRC_DIR, file), 'utf-8');
  const layerIndices = stackFor(idx++);
  const selectedLayers = layerIndices.map(i => allLayers[i]).filter(Boolean);

  let ascendedCode = '';
  let buildErr = '';
  try {
    ascendedCode = generateUnifiedCapabilityFile(
      CAPS,
      `sweep_${file.replace('.py', '')}`,
      'python',
      [{ name: file, extension: 'py', language: 'python', content: src }],
      selectedLayers,
    );
    writeFileSync(join(OUT_DIR, `ascended-${file}`), ascendedCode);
  } catch (e: any) {
    buildErr = String(e?.message || e).split('\n')[0].slice(0, 160);
  }

  if (buildErr) {
    rows.push({
      file, bytes: src.length,
      layers: selectedLayers.map(l => l.name.split(' ')[0]).join('+') || 'cores-only',
      passed: false, critical: 99, soft: 0, astOk: false,
      candidateOk: false, layer1Untouched: false,
      failedChecks: [`BUILD: ${buildErr}`],
    });
    continue;
  }

  const report = runPreExportHarness({
    ascendedCode,
    language: 'python',
    originalFiles: [{ name: file, content: src }],
    selectedLayers,
  });

  // Independent AST verify
  let astOk = false;
  let astErr = '';
  try {
    execSync(
      `python3 -c "import ast,sys; ast.parse(open(sys.argv[1]).read())" "${join(OUT_DIR, `ascended-${file}`)}"`,
      { timeout: 15000, stdio: 'pipe' },
    );
    astOk = true;
  } catch (e: any) {
    astErr = String(e?.stderr || e?.message || e).split('\n').filter(Boolean).slice(-1)[0]?.slice(0, 120) || 'parse error';
  }

  // Primitive #41 (CANDIDATE) wiring check — chain entry + handler def present
  const candidateOk =
    /['"]CANDIDATE['"]/.test(ascendedCode) &&
    /def\s+handle_candidate\s*\(/.test(ascendedCode);

  // Layer-1 byte-perfect: original source must appear verbatim
  const layer1Untouched = ascendedCode.includes(src.replace(/\r\n/g, '\n'));

  const failedChecks = report.checks
    .filter(c => !c.passed)
    .map(c => `${c.severity[0].toUpperCase()}:${c.id}`);
  if (!astOk) failedChecks.push(`AST:${astErr}`);
  if (!candidateOk) failedChecks.push('P41:not-wired');
  if (!layer1Untouched) failedChecks.push('L1:mutated');

  rows.push({
    file,
    bytes: src.length,
    layers: selectedLayers.map(l => l.name.split(' ')[0]).join('+') || 'cores-only',
    passed: report.passed && astOk && candidateOk && layer1Untouched,
    critical: report.criticalFailures,
    soft: report.softWarnings,
    astOk,
    candidateOk,
    layer1Untouched,
    failedChecks,
  });
}

// ── Report ──
console.log('━'.repeat(132));
console.log('PY-50 ASCENSION V2 + HARNESS SWEEP — 50 REAL-WORLD PYTHON FILES');
console.log('CMPSBL Hardening Layer (the 7 always-on cores in the Circuit Breaker layer)');
console.log('Cores: Circuit Breaker · Timeout · Retry · Envelope · Trace · Degradation · BEACON');
console.log('━'.repeat(132));
console.log(
  'FILE'.padEnd(28) + 'SIZE'.padEnd(8) + 'LAYERS'.padEnd(22) +
  'VERDICT'.padEnd(10) + 'CRIT'.padEnd(6) + 'SOFT'.padEnd(6) +
  'AST'.padEnd(5) + 'P41'.padEnd(5) + 'L1'.padEnd(5) + 'NOTES'
);
console.log('─'.repeat(132));
for (const r of rows) {
  const size = r.bytes > 1024 ? `${(r.bytes / 1024).toFixed(0)}K` : `${r.bytes}B`;
  console.log(
    r.file.padEnd(28) + size.padEnd(8) + (r.layers || '—').slice(0, 21).padEnd(22) +
    (r.passed ? '✓ PASS' : '✗ FAIL').padEnd(10) +
    String(r.critical).padEnd(6) + String(r.soft).padEnd(6) +
    (r.astOk ? '✓' : '✗').padEnd(5) +
    (r.candidateOk ? '✓' : '✗').padEnd(5) +
    (r.layer1Untouched ? '✓' : '✗').padEnd(5) +
    r.failedChecks.slice(0, 3).join(' ')
  );
}
console.log('─'.repeat(132));

const total = rows.length;
const passed = rows.filter(r => r.passed).length;
const astFail = rows.filter(r => !r.astOk).length;
const p41Fail = rows.filter(r => !r.candidateOk).length;
const l1Fail = rows.filter(r => !r.layer1Untouched).length;
const totalCrit = rows.reduce((s, r) => s + (r.critical < 99 ? r.critical : 0), 0);
const totalSoft = rows.reduce((s, r) => s + r.soft, 0);
const buildFail = rows.filter(r => r.critical === 99).length;

console.log(`\nVerdict:                ${passed}/${total} files passed harness + AST + P41 + L1`);
console.log(`Build failures:         ${buildFail}`);
console.log(`Critical failures:      ${totalCrit}`);
console.log(`Soft warnings:          ${totalSoft}`);
console.log(`AST failures:           ${astFail}`);
console.log(`Primitive #41 failures: ${p41Fail}  (CANDIDATE chain entry + handler def)`);
console.log(`Layer-1 mutations:      ${l1Fail}  (original source must be byte-perfect)`);
console.log(`Output:                 ${OUT_DIR}`);

// Top failure modes
const modes = new Map<string, number>();
for (const r of rows) {
  for (const f of r.failedChecks) {
    const key = f.split(':').slice(0, 2).join(':');
    modes.set(key, (modes.get(key) || 0) + 1);
  }
}
if (modes.size) {
  console.log('\nTop failure modes:');
  [...modes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([k, v]) =>
    console.log(`  ${String(v).padStart(3)}× ${k}`)
  );
}

process.exit(passed === total ? 0 : 1);
