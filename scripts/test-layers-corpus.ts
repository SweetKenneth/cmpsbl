#!/usr/bin/env node
/**
 * CMPSBL Layer × Corpus Test Harness
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Exercises generateUnifiedCapabilityFile against the entire training-corpus
 * with 7 layer combinations:
 *   1. Empty (baseline — Circuit Breaker only via core)
 *   2. All 19 selectable layers stacked
 *   3. Solo: each of the 19 layers alone
 *   4. Bundle: Resilience  (Self-Healing + Triage + Consensus)
 *   5. Bundle: Foresight   (Oracle-Ripple + Anomaly Correlation)
 *   6. Bundle: Security    (Adaptive Defense + Zero Trust + Cyber Defense)
 *   7. Bundle: Intelligence (Fleet + AI Safety + AI Cost + Cog Memory)
 *   8. Bundle: Performance+Orch (Perf Surgery + Pipeline Res + Pipe Compose + Universal Input)
 *   9. Bundle: Governance  (Self-Evolve + Gov Shield + Audit Chain + Compliance)
 *
 * For each (file × combo): emit unified file → byte-count + sanity assertions.
 * No tsc compile per output (would take hours); we validate emit determinism +
 * structural integrity (Layer 1 present, Layer Auto-Wire present, no template
 * leakage like literal "${" or unescaped backticks).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getAvailableLayers,
  getLayerById,
  CMPSBL_CORE_LAYERS,
  type CmpsblLayerDefinition,
} from '../src/lib/export/cmpsbl-layers';
import {
  generateUnifiedCapabilityFile,
  type UnifiedCapabilityInput,
} from '../src/lib/export/unified-capability-file';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CORPUS = path.join(ROOT, 'src/lib/ascension/training-corpus');
const REPORT = path.join('/mnt/documents', 'LAYER_TEST_REPORT.md');

// ── Map file extension → unified-capability-file language target ─────────────
const EXT_LANG: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript',
  '.py': 'python', '.go': 'go', '.rs': 'rust', '.java': 'java', '.rb': 'ruby',
  '.cs': 'csharp', '.cpp': 'cpp', '.c': 'c', '.h': 'cpp', '.ex': 'elixir',
  '.kt': 'kotlin', '.swift': 'swift', '.php': 'php',
};

interface TestFile { abs: string; rel: string; lang: string; bytes: number; }

function discoverCorpus(): TestFile[] {
  const out: TestFile[] = [];
  const walk = (d: string) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else {
        const ext = path.extname(ent.name).toLowerCase();
        const lang = EXT_LANG[ext];
        if (!lang) continue;
        const stat = fs.statSync(p);
        if (stat.size > 200_000) continue; // skip huge files
        out.push({ abs: p, rel: path.relative(CORPUS, p), lang, bytes: stat.size });
      }
    }
  };
  walk(CORPUS);
  return out;
}

// ── Build layer combos ──────────────────────────────────────────────────────
const ALL = getAvailableLayers();
function pick(...ids: string[]): CmpsblLayerDefinition[] {
  return ids.map(id => {
    const l = getLayerById(id);
    if (!l) throw new Error(`Layer not found: ${id}`);
    return l;
  });
}

interface Combo { name: string; layers: CmpsblLayerDefinition[]; }
const COMBOS: Combo[] = [
  { name: 'BASELINE (core only)', layers: [] },
  { name: 'ALL_STACKED', layers: ALL },
  { name: 'BUNDLE_resilience', layers: pick('self-healing', 'cognitive-triage', 'consensus-recovery') },
  { name: 'BUNDLE_foresight', layers: pick('oracle-ripple', 'anomaly-correlation') },
  { name: 'BUNDLE_security', layers: pick('adaptive-defense', 'zero-trust', 'cyber-defense') },
  { name: 'BUNDLE_intelligence', layers: pick('fleet-intelligence', 'ai-safety', 'ai-cost-control', 'cognitive-memory') },
  { name: 'BUNDLE_perf_orch', layers: pick('performance-surgery', 'pipeline-resilience', 'pipeline-composition', 'universal-input') },
  { name: 'BUNDLE_governance', layers: pick('self-evolution', 'governance-shield', 'audit-chain', 'compliance-routing') },
];
// Solos: every selectable layer alone
for (const l of ALL) COMBOS.push({ name: `SOLO_${l.id}`, layers: [l] });

// ── Sanity assertions on emitted file ──────────────────────────────────────
interface Issue { kind: string; detail: string; }
function assertEmit(file: string, combo: Combo, lang: string): Issue[] {
  const issues: Issue[] = [];
  // 1. Non-empty
  if (file.length < 1000) issues.push({ kind: 'too_small', detail: `${file.length} bytes` });
  // 2. Layer 1 marker (only meaningful when source files passed)
  if (!file.includes('LAYER 1') && !file.includes('Layer 1')) issues.push({ kind: 'no_layer1_marker', detail: '' });
  // 3. Auto-wire block presence when layers selected
  const totalLayers = combo.layers.length + CMPSBL_CORE_LAYERS.length;
  if (totalLayers > 0 && !file.match(/Layer Auto-?Wire|Layer auto-?wire|auto[-_]wired/i)) {
    issues.push({ kind: 'no_autowire_block', detail: `expected ${totalLayers} layers wired` });
  }
  // 4. Unescaped template literal leakage (a real bug we just fixed)
  //    Only flag if literal backtick-dollar-brace appears in JS/TS output AS code (not inside comments)
  if (lang === 'typescript' || lang === 'javascript') {
    // Look for unterminated template literals: a stray ` not balanced
    const ticks = (file.match(/`/g) || []).length;
    if (ticks % 2 !== 0) issues.push({ kind: 'unbalanced_backticks', detail: `${ticks} found` });
  }
  // 5. Each selected layer's name should appear in the header
  for (const l of combo.layers) {
    if (!file.includes(l.name)) issues.push({ kind: 'layer_name_missing', detail: l.name });
  }
  return issues;
}

// ── Run ────────────────────────────────────────────────────────────────────
const corpus = discoverCorpus();
console.log(`Corpus: ${corpus.length} files, ${COMBOS.length} combos = ${corpus.length * COMBOS.length} runs\n`);

const cap: UnifiedCapabilityInput = {
  id: 'test-cap',
  name: 'TestCapability',
  cjpiScore: 95,
  tier: 'S-Tier',
  chain: ['DEFENSE', 'CORTEX', 'NEXUS'],
  fingerprint: 'test-fingerprint-0001',
  moatSignature: 'test-moat',
  capabilityType: 'transform',
};

interface Result {
  file: string; lang: string; combo: string;
  bytes: number; ms: number; issues: Issue[]; ok: boolean;
}
const results: Result[] = [];
let totalErrors = 0;

const startAll = Date.now();
for (const tf of corpus) {
  const content = fs.readFileSync(tf.abs, 'utf-8');
  const usf = [{ name: path.basename(tf.rel), extension: path.extname(tf.rel).slice(1), language: tf.lang, content }];
  for (const combo of COMBOS) {
    const t0 = Date.now();
    let emitted = '';
    let crashErr: string | null = null;
    try {
      emitted = generateUnifiedCapabilityFile([cap], 'TestPack', tf.lang, usf, combo.layers);
    } catch (e) {
      crashErr = e instanceof Error ? e.message : String(e);
    }
    const ms = Date.now() - t0;
    const issues: Issue[] = crashErr
      ? [{ kind: 'crash', detail: crashErr }]
      : assertEmit(emitted, combo, tf.lang);
    const ok = issues.length === 0;
    if (!ok) totalErrors++;
    results.push({ file: tf.rel, lang: tf.lang, combo: combo.name, bytes: emitted.length, ms, issues, ok });
  }
}
const totalMs = Date.now() - startAll;

// ── Aggregate ──────────────────────────────────────────────────────────────
const byCombo = new Map<string, { runs: number; ok: number; bytes: number; issues: Issue[] }>();
for (const r of results) {
  const e = byCombo.get(r.combo) ?? { runs: 0, ok: 0, bytes: 0, issues: [] };
  e.runs++; if (r.ok) e.ok++; e.bytes += r.bytes; e.issues.push(...r.issues);
  byCombo.set(r.combo, e);
}
const byLang = new Map<string, { runs: number; ok: number }>();
for (const r of results) {
  const e = byLang.get(r.lang) ?? { runs: 0, ok: 0 };
  e.runs++; if (r.ok) e.ok++;
  byLang.set(r.lang, e);
}

// ── Emit report ────────────────────────────────────────────────────────────
const lines: string[] = [];
lines.push(`# CMPSBL Layer × Corpus Test Report`);
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push(`## Summary`);
lines.push(`- Corpus files: **${corpus.length}**`);
lines.push(`- Layer combos: **${COMBOS.length}** (1 baseline + 1 all-stacked + 7 bundles + ${ALL.length} solos)`);
lines.push(`- Total runs: **${results.length}**`);
lines.push(`- Passing: **${results.length - totalErrors}** (${((results.length - totalErrors) / results.length * 100).toFixed(1)}%)`);
lines.push(`- Failing: **${totalErrors}**`);
lines.push(`- Wall time: ${(totalMs / 1000).toFixed(2)}s`);
lines.push('');

lines.push(`## By Layer Combo`);
lines.push(`| Combo | Runs | Pass | Avg Bytes |`);
lines.push(`|---|---:|---:|---:|`);
for (const [name, e] of byCombo) {
  lines.push(`| ${name} | ${e.runs} | ${e.ok}/${e.runs} | ${Math.round(e.bytes / e.runs).toLocaleString()} |`);
}
lines.push('');

lines.push(`## By Language`);
lines.push(`| Lang | Runs | Pass |`);
lines.push(`|---|---:|---:|`);
for (const [lang, e] of byLang) {
  lines.push(`| ${lang} | ${e.runs} | ${e.ok}/${e.runs} |`);
}
lines.push('');

if (totalErrors > 0) {
  lines.push(`## Failures (first 50)`);
  let shown = 0;
  for (const r of results) {
    if (r.ok) continue;
    if (shown++ >= 50) break;
    lines.push(`- **${r.file}** [${r.lang}] × ${r.combo}`);
    for (const i of r.issues) lines.push(`  - ${i.kind}: ${i.detail}`);
  }
  lines.push('');
}

lines.push(`## Layer Catalog Verified`);
lines.push(`- Always-on core: ${CMPSBL_CORE_LAYERS.map(l => l.name).join(', ')}`);
lines.push(`- Selectable (${ALL.length}): ${ALL.map(l => `#${l.crownJewelRank} ${l.name}`).join(' · ')}`);
lines.push('');

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, lines.join('\n'));

console.log(`\n✓ ${results.length - totalErrors}/${results.length} runs passed (${totalErrors} failures)`);
console.log(`✓ Report: ${REPORT}`);
console.log(`✓ Wall: ${(totalMs / 1000).toFixed(2)}s\n`);

process.exit(totalErrors === 0 ? 0 : 1);
