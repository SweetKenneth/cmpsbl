/**
 * Stress Test Part 2 — runner.
 * Reads corpus, runs detectLanguage + detectFunctionBoundaries + buildAttachmentPlan,
 * compares to expected capabilities, emits report.
 */
import * as fs from 'fs';
import * as path from 'path';
import { detectLanguage } from '../../src/lib/factory/code-metrics';
import { detectFunctionBoundaries, buildAttachmentPlan } from '../../src/lib/mana/findings-bridge';

const ROOT = '/tmp/stress2/corpus';
const manifest: Array<{file:string;lang:string;expect:string[]}> =
  JSON.parse(fs.readFileSync(path.join(ROOT, '_manifest.json'), 'utf8'));

// Activate ALL primitives so we test pure capability-signal recall, not gating.
const ALL_PRIMITIVES = new Set([
  'DEFENSE','BEACON','GOVERNANCE','FAILSAFE','AUDIT','SHADOW','DREAM','MEMORY',
  'NEXUS','BRAIN','ORACLE','CORTEX','ECHO','HARVEST','PHANTOM','LINGUA','NERVE',
  'COMPASS','SANDBOX','MEDIC','VISION'
]);

interface FileResult {
  file: string;
  expectedLang: string;
  detectedLang: string;
  langConfidence: number;
  langOk: boolean;
  boundaries: number;
  expectedCaps: string[];
  detectedCaps: string[];
  missedCaps: string[];
  extraCaps: string[];
}

const results: FileResult[] = [];

for (const m of manifest) {
  const src = fs.readFileSync(path.join(ROOT, m.file), 'utf8');
  const det = detectLanguage(src, m.file);
  const boundaries = detectFunctionBoundaries(src);
  const findings = buildAttachmentPlan(boundaries, ALL_PRIMITIVES);
  const detectedCaps = Array.from(new Set(findings
    .filter(f => f.capability !== 'beacon_telemetry')
    .map(f => f.capability)));
  const missedCaps = m.expect.filter(c => !detectedCaps.includes(c));
  const extraCaps = detectedCaps.filter(c => !m.expect.includes(c));
  results.push({
    file: m.file,
    expectedLang: m.lang,
    detectedLang: det.language,
    langConfidence: det.confidence,
    langOk: det.language === m.lang,
    boundaries: boundaries.length,
    expectedCaps: m.expect,
    detectedCaps,
    missedCaps,
    extraCaps,
  });
}

// ── Aggregate ──
const total = results.length;
const langOk = results.filter(r => r.langOk).length;
const zeroBoundary = results.filter(r => r.boundaries === 0).length;
const totalExpectedCaps = results.reduce((s, r) => s + r.expectedCaps.length, 0);
const totalCapsHit = results.reduce((s, r) =>
  s + r.expectedCaps.filter(c => r.detectedCaps.includes(c)).length, 0);

// Per-language stats
const byLang: Record<string, { files: number; langOk: number; expected: number; hit: number; zeroBoundary: number }> = {};
for (const r of results) {
  const k = r.expectedLang;
  byLang[k] ??= { files: 0, langOk: 0, expected: 0, hit: 0, zeroBoundary: 0 };
  byLang[k].files++;
  if (r.langOk) byLang[k].langOk++;
  byLang[k].expected += r.expectedCaps.length;
  byLang[k].hit += r.expectedCaps.filter(c => r.detectedCaps.includes(c)).length;
  if (r.boundaries === 0) byLang[k].zeroBoundary++;
}

// Top missed capabilities
const missCount: Record<string, number> = {};
for (const r of results) for (const c of r.missedCaps) missCount[c] = (missCount[c] ?? 0) + 1;
const topMissed = Object.entries(missCount).sort((a,b)=>b[1]-a[1]);

const out = {
  summary: {
    total,
    langAccuracy: +(langOk/total*100).toFixed(1),
    capabilityRecall: +(totalCapsHit/totalExpectedCaps*100).toFixed(1),
    totalExpectedCaps,
    totalCapsHit,
    zeroBoundaryFiles: zeroBoundary,
  },
  byLanguage: Object.fromEntries(Object.entries(byLang).map(([k,v]) => [k, {
    files: v.files,
    langAccuracy: +(v.langOk/v.files*100).toFixed(1),
    capabilityRecall: v.expected ? +(v.hit/v.expected*100).toFixed(1) : 100,
    expectedCaps: v.expected,
    hitCaps: v.hit,
    zeroBoundary: v.zeroBoundary,
  }])),
  topMissedCapabilities: topMissed,
  files: results,
};

fs.writeFileSync('/mnt/documents/ascension-stress-test-part2-results.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out.summary, null, 2));
console.log('\n--- Per-language ---');
for (const [k,v] of Object.entries(out.byLanguage)) console.log(k, JSON.stringify(v));
console.log('\n--- Top missed capabilities ---');
for (const [c,n] of topMissed) console.log(`  ${c}: missed in ${n} file(s)`);
console.log('\n--- Files with zero boundaries ---');
for (const r of results.filter(r => r.boundaries === 0)) console.log(`  ${r.file} (lang=${r.detectedLang}/${r.expectedLang})`);
console.log('\n--- Files with missed caps ---');
for (const r of results.filter(r => r.missedCaps.length)) console.log(`  ${r.file}: missed [${r.missedCaps.join(', ')}]`);
