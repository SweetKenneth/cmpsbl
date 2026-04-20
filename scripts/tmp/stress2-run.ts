/**
 * Ascension V2 Free-Tier Stress Harness
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

const results: any[] = [];
for (const m of manifest) {
  const content = fs.readFileSync(path.join(ROOT, m.file), 'utf8');
  const notes: string[] = [];
  const gate = runPreAscensionGate([{ name: m.file, content }], m.lang);
  let fp: any = null;
  if (gate.ok) {
    try {
      const f = computeMultiFileFingerprint([{ name: m.file, content }], m.lang);
      fp = { hash: f.hash, functionCount: f.functionCount, totalChars: f.totalChars };
      if (f.functionCount === 0) notes.push('FP: 0 functions');
    } catch (e) { notes.push(`FP error: ${(e as Error).message}`); }
  }
  results.push({
    file: m.file, lang: m.lang, intent: m.intent, bytes: Buffer.byteLength(content),
    gateOk: gate.ok, gateErrors: gate.errors.map(formatGateError),
    fingerprint: fp, notes,
  });
}

const recs = recommendLayers({ coveredPrimitives: [], selectedLayerIds: [], limit: 6, userTier: 'builder' });
const tierRecs = recs.filter((r) => !isStoreLayer(r.layer.id));
const storeRecs = recs.filter((r) => isStoreLayer(r.layer.id));
const attachableNow = recs.filter((r) => !(r as any).upgradeRequired);
const lockedSuggestions = recs.filter((r) => (r as any).upgradeRequired);
const bundle = summarizeStoreBundle(storeRecs.map((r) => r.layer));

const FREE_RANKS = new Set(TIER_LAYERS.builder.map((l) => l.rank));
const freeLayers = LAUNCH_LAYERS.filter((l) => FREE_RANKS.has(l.rank));
const lockedLayers = LAUNCH_LAYERS.filter((l) => !FREE_RANKS.has(l.rank));

const synth = Array.from({ length: 12 }, (_, i) => ({
  name: i % 3 === 0 ? `Self-Healing v${i}` : i % 3 === 1 ? `Auto Recovery ${i}` : `Telemetry ${i}`,
  cjpiScore: 50 + (i * 7) % 50, tier: 'platinum', description: '',
  chain: ['CANDIDATE', 'IMMUNITY'], chainDepth: 2,
}));
const dedup = deduplicateCapabilities(synth);

const total = results.length;
const gatePassed = results.filter((r) => r.gateOk).length;
const byLang: Record<string, { files: number; ok: number; zeroFn: number }> = {};
for (const r of results) {
  byLang[r.lang] ??= { files: 0, ok: 0, zeroFn: 0 };
  byLang[r.lang].files++;
  if (r.gateOk) byLang[r.lang].ok++;
  if (r.fingerprint?.functionCount === 0) byLang[r.lang].zeroFn++;
}

const out = {
  summary: { total, gatePassed, gateFailed: total - gatePassed },
  byLanguage: byLang,
  smartRecsFreeUser: {
    totalRecs: recs.length, tierIncluded: tierRecs.length, store: storeRecs.length,
    attachableNow: attachableNow.length, lockedSuggestions: lockedSuggestions.length,
    bundleEligible: storeRecs.length >= 3 && bundle.discountPercent > 0,
    bundleDiscountPct: bundle.discountPercent, bundleSavingsCents: bundle.savingsCents,
    items: recs.map((r: any) => `${r.layer.name} [${isStoreLayer(r.layer.id) ? 'STORE $' + (r.layer.priceCents/100).toFixed(2) : (r.upgradeRequired ? 'LOCKED→' + r.upgradeRequired : 'ATTACH-NOW')}] ← ${r.driverPrimitive}`),
  },
  freeUserTierAudit: {
    totalLaunchLayers: LAUNCH_LAYERS.length,
    freeUnlocked: freeLayers.length, locked: lockedLayers.length,
    freeLayers: freeLayers.map((l) => `#${l.rank} ${l.name}`),
    firstUpgradeWall: lockedLayers.slice(0, 5).map((l) => `#${l.rank} ${l.name} (${l.pillar})`),
    tierPricing: Object.values(TIER_META).map((t) => `${t.glyph} ${t.name}: ${t.priceLabel} — ${t.tagline}`),
  },
  dedupSanity: {
    raw: dedup.rawCount, groups: dedup.groupCount, final: dedup.capabilities.length,
    inRange: dedup.capabilities.length >= 4 && dedup.capabilities.length <= 7,
  },
  files: results,
};

fs.writeFileSync('/mnt/documents/ascension-v2-free-tier-stress.json', JSON.stringify(out, null, 2));

console.log('═══ V2 Free-Tier Stress ═══');
console.log('SUMMARY:', JSON.stringify(out.summary));
console.log('\nPER-LANGUAGE:');
for (const [k, v] of Object.entries(byLang)) console.log(`  ${k.padEnd(12)} ok=${v.ok}/${v.files} zeroFn=${v.zeroFn}`);
console.log('\nFREE TIER AUDIT:');
console.log(`  Free unlocks: ${freeLayers.length}/20 launch layers`);
freeLayers.forEach((l) => console.log(`    ✓ #${l.rank} ${l.name}`));
console.log(`  Locked (upgrade): ${lockedLayers.length}`);
console.log('  Tier ladder:');
Object.values(TIER_META).forEach((t) => console.log(`    ${t.glyph} ${t.name.padEnd(12)} ${(t.priceLabel || '').padEnd(8)} ${t.tagline}`));
console.log('\nSMART RECS (Free/Builder user, pre-run):');
console.log(`  Total=${recs.length} AttachNow=${attachableNow.length} Locked=${lockedSuggestions.length} Store=${storeRecs.length} BundleCTA=${out.smartRecsFreeUser.bundleEligible}`);
out.smartRecsFreeUser.items.forEach((s: string) => console.log(`    • ${s}`));
console.log('\nDEDUP:', JSON.stringify(out.dedupSanity));
console.log('\nFILE ISSUES:');
const issues = results.filter((r) => !r.gateOk || r.notes.length > 0);
if (!issues.length) console.log('  (none)');
for (const r of issues) {
  console.log(`  ${r.file.padEnd(28)} [${r.lang}] ${r.intent}`);
  r.gateErrors.forEach((e: string) => console.log(`     ✗ ${e}`));
  r.notes.forEach((n: string) => console.log(`     ⚠ ${n}`));
}
console.log('\n→ /mnt/documents/ascension-v2-free-tier-stress.json');
