import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
);

const FINTECH_ENGINES = ['LEDGER','VAULT_FIN','TICKER','CLEARING','RISKCORE','PAYRAIL','TAXENGINE','MATCHBOOK'];
const FINTECH_AGENTS = ['SENTINEL_FIN','REGULATOR','ARBITER','UNDERWRITER','TREASURER','AUDITOR','PORTFOLIO','COMPLIANCE'];
const ALL = [...FINTECH_ENGINES, ...FINTECH_AGENTS];
const SPINE = ['CORE','DEFENSE','GOVERNANCE','BRAIN','FAILSAFE','BEACON','AUTOMATON','NEXUS','CORTEX','ARCHITECT','MEMORY','MEDIC'];

// Crown Jewel backfill - 144 tiered entries (9 per primitive: 2 S, 4 A, 3 B)
const cjRows = [];
let rank = 600;
for (const prim of ALL) {
  const tiers = [
    {t:'S',count:2,cjpiBase:95},
    {t:'A',count:4,cjpiBase:88},
    {t:'B',count:3,cjpiBase:82},
  ];
  let idx = 1;
  for (const {t,count,cjpiBase} of tiers) {
    for (let i = 0; i < count; i++) {
      const cjpi = cjpiBase + Math.floor(Math.random()*5);
      cjRows.push({
        id: `FIN-CJ-${prim}-${t}${idx}`,
        name: `${prim} ${t}-Tier Capability #${idx}`,
        description: `${t}-Tier Crown Jewel for ${prim} fintech primitive`,
        cjpi_score: cjpi,
        primitive_chain: [prim],
        status: 'registry',
        is_crown_jewel: true,
        vertical: 'fintech',
        crown_jewel_capabilities: { tier: t, primitive: prim, vertical: 'fintech' },
        category: 'fintech',
      });
      rank++;
      idx++;
    }
  }
}

// Seed discoveries - 200 domain-specific
const discoveries = [];
const categories = ['payment-processing','risk-management','regulatory-compliance','fraud-detection','settlement','trading','treasury','tax-computation','lending','portfolio-management'];

function seedRng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}
const rand = seedRng(0xF10EC04);

for (let i = 0; i < 200; i++) {
  const chainLen = 3 + Math.floor(rand() * 4);
  const chain = [];
  const pool = [...ALL, ...SPINE];
  for (let c = 0; c < chainLen; c++) {
    chain.push(pool[Math.floor(rand() * pool.length)]);
  }
  const cjpi = 60 + Math.floor(rand() * 40);
  const cat = categories[Math.floor(rand() * categories.length)];
  let status, route;
  if (cjpi >= 95) { status = 'registry'; route = 'vault'; }
  else if (cjpi >= 80) { status = 'showroom'; route = 'showroom'; }
  else { status = 'junkyard'; route = 'junkyard'; }

  discoveries.push({
    id: `FNSD-${String(i).padStart(4,'0')}`,
    name: `Fintech Discovery #${i+1}`,
    description: `Discovered ${cat} capability chain: ${chain.join(' → ')}`,
    cjpi_score: cjpi,
    primitive_chain: chain,
    status,
    is_crown_jewel: false,
    vertical: 'fintech',
    category: cat,
  });
}

// Insert CJs
const allRows = [...cjRows, ...discoveries];
const BATCH = 100;
let inserted = 0;
for (let i = 0; i < allRows.length; i += BATCH) {
  const batch = allRows.slice(i, i + BATCH);
  const { error } = await supabase.from('discoveries').upsert(batch, { onConflict: 'id' });
  if (error) { console.error('Batch error:', error.message); }
  else { inserted += batch.length; }
}

// Verify
const { count } = await supabase.from('discoveries').select('*', { count: 'exact', head: true }).eq('vertical', 'fintech');
console.log(`Inserted: ${inserted} rows`);
console.log(`Total fintech discoveries in DB: ${count}`);
