/**
 * Ascension V2 Free-Tier Stress Harness
 * Runs each corpus file through the headless V2 pipeline:
 *   1. runPreAscensionGate           — does the gate accept it?
 *   2. computeMultiFileFingerprint   — fingerprint stability
 *   3. recommendLayers (pre-run)     — what does the Smart-Recs engine show a Free user?
 *   4. tier-gating audit             — how many of the 20 launch layers are Free-locked?
 *   5. deduplicateCapabilities       — synthetic discovery dedup sanity check
 *
 * Pure logic — no DB, no fetch, no browser. Mirrors what a Free user would
 * actually trigger in V2UploadStep / V2EnhanceStep / V2ProcessingStep.
 */
import * as fs from 'fs';
import * as path from 'path';
import { runPreAscensionGate, formatGateError } from '../../src/lib/ascension-v2/pre-ascension-gate';
import { computeMultiFileFingerprint } from '../../src/lib/ascension-v2/fingerprint-gate';
import { deduplicateCapabilities } from '../../src/lib/ascension-v2/dedup';
import { recommendLayers, summarizeStoreBundle, isStoreLayer } from '../../src/lib/factory/smart-recommendations';
import { TIER_LAYERS, TIER_META } from '../../src/lib/ascension-v2/tier-layers';
import { LAYERS as LAUNCH_LAYERS } from '../../src/components/ascension-v2/V2LaunchLayers';

const ROOT = '/tmp/corpus27';
const manifest: Array<{ file: string; lang: string; intent: string }> =
  JSON.parse(fs.readFileSync(path.join(ROOT, '_manifest.json'), 'utf8'));

interface FileResult {
  file: string;
  lang: string;
  intent: string;
  bytes: number;
  gate: { ok: boolean; checked: number; errors: string[] };
  fingerprint: { hash: string; functionCount: number; totalChars: number } | null;
  recsCount: number;
  recsTier: number;
  recsStore: number;
  bundleEligible: boolean;
  bundleSavingsCents: number;
  notes: string[];
}

const results: FileResult[] = [];

for (const m of manifest) {
  const fullPath = path.join(ROOT, m.file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const bytes = Buffer.byteLength(content);
  const notes: string[] = [];

  // 1. Pre-Ascension Gate
  const gate = runPreAscensionGate([{ name: m.file, content }], m.lang);
  let fingerprint: FileResult['fingerprint'] = null;
  if (gate.ok) {
    try {
      const fp = computeMultiFileFingerprint([{ name: m.file, content }], m.lang);
      fingerprint = { hash: fp.hash, functionCount: fp.functionCount, totalChars: fp.totalChars };
      if (fp.functionCount === 0) notes.push('FP: 0 functions detected');
    } catch (e) {
      notes.push(`FP error: ${(e as Error).message}`);
    }
  }

  // 2. Smart Recommendations (pre-run mode = covered=[])
  const recs = recommendLayers({ coveredPrimitives: [], selectedLayerIds: [], limit: 6 });
  const tierRecs = recs.filter((r) => !isStoreLayer(r.layer.id));
  const storeRecs = recs.filter((r) => isStoreLayer(r.layer.id));
  const bundle = summarizeStoreBundle(storeRecs.map((r) => r.layer));

  if (recs.length === 0) notes.push('No smart recs surfaced');
  if (storeRecs.length >= 3 && bundle.discountPercent === 0) notes.push('Store recs ≥3 but no bundle discount');

  results.push({
    file: m.file,
    lang: m.lang,
    intent: m.intent,
    bytes,
    gate: { ok: gate.ok, checked: gate.checked, errors: gate.errors.map(formatGateError) },
    fingerprint,
    recsCount: recs.length,
    recsTier: tierRecs.length,
    recsStore: storeRecs.length,
    bundleEligible: storeRecs.length >= 3 && bundle.discountPercent > 0,
    bundleSavingsCents: bundle.savingsCents,
    notes,
  });
}

// ── Tier gating audit (Free = builder) ──
const FREE_RANKS = new Set(TIER_LAYERS.builder.map((l) => l.rank));
const launchLayerAudit = LAUNCH_LAYERS.map((l) => ({
  rank: l.rank,
  name: l.name,
  freeAccess: FREE_RANKS.has(l.rank),
  pillar: l.pillar,
}));
const freeOnly = launchLayerAudit.filter((l) => l.freeAccess);
const lockedFromFree = launchLayerAudit.filter((l) => !l.freeAccess);

// ── Synthetic dedup test ──
const synth = Array.from({ length: 12 }, (_, i) => ({
  name: i % 3 === 0 ? `Self-Healing Cache v${i}` : i % 3 === 1 ? `Auto Recovery Engine ${i}` : `Telemetry Beacon ${i}`,
  cjpiScore: 50 + (i * 7) % 50,
  tier: 'platinum',
  description: '',
  chain: ['CANDIDATE', 'IMMUNITY'],
  chainDepth: 2,
}));
const dedup = deduplicateCapabilities(synth);

// ── Aggregate ──
const total = results.length;
const gatePassed = results.filter((r) => r.gate.ok).length;
const fpComputed = results.filter((r) => r.fingerprint !== null).length;
const zeroFn = results.filter((r) => r.fingerprint?.functionCount === 0).length;
const byLang: Record<string, { files: number; gateOk: number; zeroFn: number }> = {};
for (const r of results) {
  byLang[r.lang] ??= { files: 0, gateOk: 0, zeroFn: 0 };
  byLang[r.lang].files++;
  if (r.gate.ok) byLang[r.lang].gateOk++;
  if (r.fingerprint?.functionCount === 0) byLang[r.lang].zeroFn++;
}

const out = {
  summary: {
    total,
    gatePassed,
    gateFailed: total - gatePassed,
    fpComputed,
    zeroFunctionFiles: zeroFn,
  },
  byLanguage: byLang,
  smartRecsAuditFreeUser: {
    note: 'Pre-run mode (no covered primitives) — what a Free user sees the moment they hit /ascension-v2 step 2.',
    sample: results[0]
      ? {
          totalRecs: results[0].recsCount,
          tierIncluded: results[0].recsTier,
          storeLayers: results[0].recsStore,
          bundleEligible: results[0].bundleEligible,
          bundleSavingsCents: results[0].bundleSavingsCents,
        }
      : null,
  },
  freeUserTierAudit: {
    totalLaunchLayers: LAUNCH_LAYERS.length,
    freeUnlocked: freeOnly.length,
    lockedBehindUpgrade: lockedFromFree.length,
    freeLayers: freeOnly.map((l) => `#${l.rank} ${l.name} (${l.pillar})`),
    firstUpgradeWall: lockedFromFree.slice(0, 3).map((l) => `#${l.rank} ${l.name} (${l.pillar})`),
    tierPricing: Object.values(TIER_META).map((t) => `${t.glyph} ${t.name}: ${t.priceLabel} — ${t.tagline}`),
  },
  dedupSanity: {
    rawCount: dedup.rawCount,
    groupCount: dedup.groupCount,
    finalCount: dedup.capabilities.length,
    inRange: dedup.capabilities.length >= 4 && dedup.capabilities.length <= 7,
  },
  files: results,
};

fs.writeFileSync('/mnt/documents/ascension-v2-free-tier-stress.json', JSON.stringify(out, null, 2));

// Console report
console.log('═══ Ascension V2 — Free-Tier Stress Harness ═══\n');
console.log('SUMMARY:', JSON.stringify(out.summary, null, 2));
console.log('\nPER-LANGUAGE:');
for (const [k, v] of Object.entries(byLang)) {
  console.log(`  ${k.padEnd(12)} files=${v.files} gateOk=${v.gateOk}/${v.files} zeroFn=${v.zeroFn}`);
}
console.log('\nFREE-USER TIER AUDIT:');
console.log(`  Free unlocks: ${freeOnly.length}/20 launch layers`);
console.log(`  Free layers:`);
for (const l of freeOnly) console.log(`    ✓ #${l.rank} ${l.name}`);
console.log(`  Locked (need upgrade):  ${lockedFromFree.length}`);
console.log(`  Tier ladder:`);
for (const t of Object.values(TIER_META)) {
  console.log(`    ${t.glyph} ${t.name.padEnd(12)} ${(t.priceLabel || '').padEnd(8)} ${t.tagline}`);
}
console.log('\nSMART RECS (Free user, pre-run, no covered primitives):');
const r0 = results[0];
if (r0) {
  console.log(`  Total: ${r0.recsCount}   Tier-included: ${r0.recsTier}   Store: ${r0.recsStore}`);
  console.log(`  Bundle CTA shown? ${r0.bundleEligible ? 'YES' : 'no'}   Savings: ${r0.bundleSavingsCents}¢`);
}
console.log('\nDEDUP SANITY:', JSON.stringify(out.dedupSanity, null, 2));
console.log('\nFILES WITH ISSUES:');
const issues = results.filter((r) => !r.gate.ok || r.notes.length > 0);
if (issues.length === 0) console.log('  (none — clean run across all 27 files)');
for (const r of issues) {
  console.log(`  ${r.file.padEnd(28)} [${r.lang}] ${r.intent}`);
  for (const e of r.gate.errors) console.log(`     ✗ ${e}`);
  for (const n of r.notes) console.log(`     ⚠ ${n}`);
}
console.log('\nReport saved → /mnt/documents/ascension-v2-free-tier-stress.json');
