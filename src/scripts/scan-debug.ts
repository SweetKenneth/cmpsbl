import { runUniversalPoolScan, getUniversalPoolSize } from '@/lib/factory/universal-pool-scanner';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Temporarily patch to get ALL candidates
// Instead, let's just run the scan and check the full scored list
// We need to look at the scoring internals

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sentinelDir = path.resolve(__dirname, '../products/auto-sentinel');
const files = fs.readdirSync(sentinelDir).filter(f => f.endsWith('.ts'));
const fullSource = files.map(f => fs.readFileSync(path.join(sentinelDir, f), 'utf-8')).join('\n');
const lowerCode = fullSource.toLowerCase();

// Check what signals match for missed primitives
const missed = ['CONSCIENCE', 'MEDIC', 'SHADOW', 'REFLEX', 'COMPASS', 'EVOLUTION', 'SOVEREIGN', 'BEACON'];

const SPINE_SIGNALS: Record<string, string[]> = {
  CONSCIENCE: ['ethic', 'bias', 'fair', 'moral', 'boundary', 'responsible', 'transparent', 'preflight', 'conscience', 'ethical', 'review_required', 'blocked_categories'],
  MEDIC: ['diagnos', 'triage', 'assess', 'repair', 'severity', 'damage', 'triageissue', 'triageall', 'riskscore', 'autofixable'],
  SHADOW: ['canary', 'shadow', 'trace', 'monitor', 'snapshot', 'baseline', 'compare', 'observe', 'pre_snapshot', 'post_snapshot', 'presnapshot', 'postsnapshot'],
  REFLEX: ['retry', 'circuit', 'breaker', 'timeout', 'backoff', 'fallback', 'degrade', 'cooldown', 'graceful', 'circuit_breaker', 'degradation'],
  COMPASS: ['direction', 'priority', 'weight', 'rank', 'sort', 'order', 'threshold', 'severity_order', 'confidence', 'riskscore'],
  EVOLUTION: ['evolve', 'mutate', 'generation', 'adapt', 'select', 'fitness', 'population', 'upgrade', 'patch', 'update', 'updateconfig'],
  SOVEREIGN: ['policy', 'compliance', 'classify', 'regulation', 'jurisdiction', 'consent', 'data_class', 'blockedcategories', 'governancepolicy'],
  BEACON: ['beacon', 'heartbeat', 'health_signal', 'healthsignal', 'telemetry', 'uptime', 'emithealthsignal', 'beaconhealthsignal'],
};

console.log('─── MISSED PRIMITIVE SIGNAL ANALYSIS ───');
for (const id of missed) {
  const signals = SPINE_SIGNALS[id] || [];
  const hits = signals.filter(s => lowerCode.includes(s));
  const hitRatio = signals.length > 0 ? hits.length / signals.length : 0;
  const signalAffinity = Math.min(hitRatio / 0.15, 1);
  console.log(`\n${id}:`);
  console.log(`  Hits: ${hits.length}/${signals.length} (ratio: ${hitRatio.toFixed(3)})`);
  console.log(`  Signal affinity: ${signalAffinity.toFixed(3)}`);
  console.log(`  Matched: ${hits.join(', ')}`);
  console.log(`  Missed: ${signals.filter(s => !lowerCode.includes(s)).join(', ')}`);
}

// Also check what score rank 40 (the cutoff) gets
console.log('\n─── SCORE COMPRESSION CHECK ───');
const result = runUniversalPoolScan(fullSource);
const scores = result.selectedPrimitives.map(c => c.compoundingScore);
console.log(`Top score: ${scores[0]}, Bottom score: ${scores[scores.length-1]}`);
console.log(`Range: ${(scores[0] - scores[scores.length-1]).toFixed(3)}`);
console.log(`Score at rank 8 (MIN_SLOTS): ${scores[7]}`);
console.log(`Largest gap in top 40:`);
for (let i = 1; i < scores.length; i++) {
  const gap = scores[i-1] - scores[i];
  const pct = gap / scores[i-1];
  if (pct > 0.02) console.log(`  rank ${i} → ${i+1}: ${scores[i-1].toFixed(3)} → ${scores[i].toFixed(3)} (drop: ${(pct*100).toFixed(1)}%)`);
}

// Check MEDIC's actual PoolCandidate score
import { getSpinePrimitives } from '@/lib/factory/vertical-substrate';
const spine = getSpinePrimitives();
const medic = spine.find(p => p.id === 'MEDIC');
console.log('\n─── MEDIC PRIMITIVE DETAILS ───');
console.log(JSON.stringify(medic, null, 2));
console.log(`Capabilities: ${medic?.capabilities.length}`);
console.log(`BreadthScore would be: ${Math.min((medic?.capabilities.length ?? 0) / 6, 1)}`);
console.log(`Weight factor: ${Math.min((medic?.weight ?? 0) / 0.03, 1)}`);
