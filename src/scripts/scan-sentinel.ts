import { runUniversalPoolScan, getUniversalPoolSize } from '@/lib/factory/universal-pool-scanner';
import * as fs from 'fs';
import * as path from 'path';

const sentinelDir = path.resolve(__dirname, '../products/auto-sentinel');
const files = fs.readdirSync(sentinelDir).filter(f => f.endsWith('.ts'));
const fullSource = files.map(f => fs.readFileSync(path.join(sentinelDir, f), 'utf-8')).join('\n');

console.log(`\n═══ AUTO-SENTINEL → ULTIMATE ASCENSION SCAN ═══`);
console.log(`Source files: ${files.length}, Total chars: ${fullSource.length}, Pool: ${getUniversalPoolSize()}\n`);

const result = runUniversalPoolScan(fullSource);

console.log(`Evaluated: ${result.totalCandidatesEvaluated} | Above threshold: ${result.candidatesAboveThreshold} | Selected: ${result.selectedPrimitives.length} | ${result.durationMs}ms\n`);

console.log('─── SOURCE DISTRIBUTION ───');
for (const [src, count] of Object.entries(result.sourceDistribution).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${src}: ${count}`);
}

console.log('\n─── ROLE DISTRIBUTION ───');
for (const [role, count] of Object.entries(result.roleDistribution).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${role}: ${count}`);
}

console.log('\n─── RANKED PRIMITIVES ───');
for (let i = 0; i < result.selectedPrimitives.length; i++) {
  const c = result.selectedPrimitives[i];
  console.log(`  ${String(i+1).padStart(2)}. ${c.primitive.id.padEnd(19)} ${c.sourceVertical.padEnd(10)} ${c.primitive.role.padEnd(7)} aff=${c.affinityScore.toFixed(3)} comp=${c.compoundingScore.toFixed(3)} hits=${c.signalHits}/${c.totalSignals}`);
}

const expected = ['GOVERNANCE','CONSCIENCE','DEFENSE','MEDIC','ENGINEER','AUDIT','IMMUNITY','SHADOW','REFLEX','COMPASS','EVOLUTION','SOVEREIGN','CORE','SYSTEM','BEACON'];

console.log('\n─── EXPECTED PRIMITIVE CHECK ───');
for (const id of expected) {
  const found = result.selectedPrimitives.find(c => c.primitive.id === id);
  console.log(`  ${id.padEnd(12)} ${found ? `✅ rank ${result.selectedPrimitives.indexOf(found)+1} (${found.compoundingScore.toFixed(3)})` : '❌ MISSED'}`);
}

console.log('\n─── UNEXPECTED ───');
const expectedSet = new Set(expected);
for (const c of result.selectedPrimitives) {
  if (!expectedSet.has(c.primitive.id)) {
    console.log(`  ⚠️  ${c.primitive.id} (${c.sourceVertical}, score: ${c.compoundingScore.toFixed(3)})`);
  }
}
