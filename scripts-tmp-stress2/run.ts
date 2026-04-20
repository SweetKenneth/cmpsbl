import * as fs from 'fs';
import * as path from 'path';
import { detectLanguage } from '../src/lib/factory/code-metrics';
import { detectFunctionBoundaries, buildAttachmentPlan } from '../src/lib/mana/findings-bridge';

const ROOT = '/tmp/stress2/corpus';
const manifest: Array<{file:string;lang:string;expect:string[]}> =
  JSON.parse(fs.readFileSync(path.join(ROOT, '_manifest.json'), 'utf8'));

const ALL = new Set(['DEFENSE','BEACON','GOVERNANCE','FAILSAFE','AUDIT','SHADOW','DREAM','MEMORY',
  'NEXUS','BRAIN','ORACLE','CORTEX','ECHO','HARVEST','PHANTOM','LINGUA','NERVE','COMPASS','SANDBOX','MEDIC','VISION']);

let totalExp=0, totalHit=0, langOk=0;
const misses: string[] = [];
for (const m of manifest) {
  const src = fs.readFileSync(path.join(ROOT, m.file), 'utf8');
  const det = detectLanguage(src, m.file);
  if (det.language === m.lang) langOk++;
  const b = detectFunctionBoundaries(src);
  const f = buildAttachmentPlan(b, ALL);
  const caps = new Set(f.filter(x=>x.capability!=='beacon_telemetry').map(x=>x.capability));
  totalExp += m.expect.length;
  const hit = m.expect.filter(c => caps.has(c));
  totalHit += hit.length;
  const missed = m.expect.filter(c => !caps.has(c));
  if (missed.length) misses.push(`  ${m.file}: missed [${missed.join(', ')}] | boundaries=${b.map(x=>x.name).slice(0,8).join(',')}`);
}
console.log(`Lang: ${langOk}/${manifest.length} (${(langOk/manifest.length*100).toFixed(1)}%)`);
console.log(`Caps: ${totalHit}/${totalExp} (${(totalHit/totalExp*100).toFixed(1)}%)`);
console.log('\nRemaining misses:');
for (const m of misses) console.log(m);
