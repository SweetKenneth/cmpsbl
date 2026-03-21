/**
 * Pipeline Discovery Composer
 * Scores and ranks pipeline compositions from the vault's capability pool.
 * Uses cross-sector synergy, node diversity, and CJPI aggregation to find
 * the highest-value execution paths through the Memory Stream.
 */

import { supabase } from '@/integrations/supabase/client';

// Canonical 40-node matrix with sector assignments
const NODE_SECTORS: Record<string, string> = {
  CORE: 'Kernel', SPINE: 'Kernel', BRAIN: 'CCR', MEMORY: 'CCR', CORTEX: 'CCR',
  NERVE: 'OCG', DREAM: 'OCG', VISION: 'OCG', DECODE: 'EXE', ENCODE: 'EXE',
  NEXUS: 'EXE', DEFENSE: 'ESZ', IMMUNITY: 'ESZ', SHADOW: 'ESZ', FORGE: 'ESZ',
  HARVEST: 'EPZ', ECHO: 'EPZ', ORACLE: 'EPZ', EVOLUTION: 'EMZ', REFLEX: 'EMZ',
  MEDIC: 'EMZ', PHANTOM: 'CSZ', CONSCIENCE: 'CSZ', IDENTITY: 'CSZ',
  GOVERNANCE: 'Fields', AUDIT: 'Fields', ACCESS: 'Fields', SOVEREIGN: 'Fields',
  ANALYTICS: 'Plane', RIPPLE: 'Plane', TREATY: 'Plane', COMPASS: 'Plane',
  INCLUSIVE: 'Plane', LINGUA: 'Plane', SYSTEM: 'Shell', INTEGRATION: 'Shell',
  ENGINEER: 'Atlas', ATLAS: 'Atlas',
};

interface VaultEntry {
  id: string;
  name: string;
  cjpi: number;
  module_chain: string[];
  category: string;
  recommended_resale_price: number | null;
  tier: string;
}

export interface DiscoveredPipeline {
  name: string;
  codename: string;
  description: string;
  category: string;
  pipeline_score: number;
  capability_chain: { vaultId: string; name: string; cjpi: number; nodes: string[] }[];
  node_chain: string[];
  stage_count: number;
  estimated_value_usd: number;
  synergy_rating: number;
  cross_sector_count: number;
  unique_nodes: number;
  tier: string;
  discovery_method: string;
}

// Synergy bonus for cross-sector pipeline coverage
function calcSynergyRating(nodeChain: string[]): number {
  const sectors = new Set(nodeChain.map(n => NODE_SECTORS[n] || 'Unknown'));
  const sectorCount = sectors.size;
  // Base synergy from sector coverage (max 12 sectors)
  const coverageRatio = sectorCount / 12;
  // Bonus for hitting critical sectors
  const criticalSectors = ['Kernel', 'CCR', 'EXE', 'ESZ'];
  const criticalHits = criticalSectors.filter(s => sectors.has(s)).length;
  return Math.min(100, (coverageRatio * 60) + (criticalHits * 10));
}

// Pipeline codename generator
const CODENAME_PREFIXES = [
  'SOVEREIGN', 'ABSOLUTE', 'INFINITE', 'PERPETUAL', 'CARDINAL',
  'APEX', 'ZENITH', 'MERIDIAN', 'STELLAR', 'QUANTUM',
  'PRISMATIC', 'HARMONIC', 'RESONANT', 'CATALYTIC', 'EMERGENT',
  'CONVERGENT', 'RECURSIVE', 'TRANSCENDENT', 'OMNISCIENT', 'AUTONOMOUS',
];

const CODENAME_SUFFIXES = [
  'GENESIS', 'MATRIX', 'NEXUS', 'FORGE', 'CITADEL',
  'HELIX', 'PRISM', 'CASCADE', 'VERTEX', 'MERIDIAN',
  'CONTINUUM', 'EPOCH', 'DOMINION', 'VANGUARD', 'CRUCIBLE',
  'PARADIGM', 'SYNTHESIS', 'SPECTRUM', 'MONUMENT', 'IMPERATIVE',
];

function generateCodename(index: number): string {
  const p = CODENAME_PREFIXES[index % CODENAME_PREFIXES.length];
  const s = CODENAME_SUFFIXES[Math.floor(index / CODENAME_PREFIXES.length) % CODENAME_SUFFIXES.length];
  return `${p}-${s}`;
}

// Category descriptions for narrative
const CATEGORY_NARRATIVE: Record<string, string> = {
  orchestration: 'multi-system coordination and autonomous task sequencing',
  cognitive: 'deep reasoning, causal inference, and emergent intelligence',
  security: 'zero-trust verification, threat hunting, and autonomous defense',
  evolution: 'self-improving architecture and adaptive system mutation',
  learning: 'meta-cognitive training and knowledge crystallization',
  governance: 'policy enforcement, compliance automation, and audit integrity',
  integration: 'cross-system bridging and protocol normalization',
  synthesis: 'generative construction and capability fabrication',
  routing: 'intelligent traffic optimization and semantic path resolution',
  observability: 'deep telemetry, anomaly detection, and system introspection',
  acquisition: 'autonomous data harvesting and signal ingestion',
  privacy: 'data sovereignty, anonymization, and consent-aware processing',
  compliance: 'regulatory alignment and automated policy verification',
  prediction: 'probabilistic forecasting and scenario simulation',
  simulation: 'digital twin modeling and counterfactual generation',
  ethics: 'bias detection, fairness scoring, and ethical boundary enforcement',
  contracts: 'smart contract execution and agreement lifecycle management',
  localization: 'multilingual adaptation and cultural context translation',
  edge: 'distributed edge processing and low-latency execution',
  geospatial: 'location-aware intelligence and spatial reasoning',
};

/**
 * Compose superpipelines by chaining vault capabilities that maximize:
 * 1. Cross-sector node coverage (synergy)
 * 2. Aggregate CJPI score
 * 3. Category diversity
 * 4. Estimated value
 */
export async function discoverTopPipelines(count: number = 100): Promise<DiscoveredPipeline[]> {
  // Pull all CJPI 100 entries as building blocks
  const { data: vault100, error: e1 } = await supabase
    .from('vault_promotions')
    .select('id, name, cjpi, module_chain, category, recommended_resale_price, tier')
    .eq('cjpi', 100)
    .order('recommended_resale_price', { ascending: false });

  // Pull high-scoring 95+ as secondary
  const { data: vault95, error: e2 } = await supabase
    .from('vault_promotions')
    .select('id, name, cjpi, module_chain, category, recommended_resale_price, tier')
    .gte('cjpi', 95)
    .lt('cjpi', 100)
    .order('recommended_resale_price', { ascending: false })
    .limit(200);

  if (e1 || e2) throw new Error(`Vault query failed: ${e1?.message || e2?.message}`);

  const allEntries = [...(vault100 || []), ...(vault95 || [])] as VaultEntry[];
  
  // Group by category for diversity-aware composition
  const byCategory = new Map<string, VaultEntry[]>();
  for (const entry of allEntries) {
    const cat = entry.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(entry);
  }

  const pipelines: DiscoveredPipeline[] = [];
  
  // Strategy 1: Maximum-value chains (top entries chained by value)
  const topByValue = [...allEntries].sort((a, b) => 
    (b.recommended_resale_price || 0) - (a.recommended_resale_price || 0)
  );
  
  // Compose superpipelines of 3-6 stages
  for (let pipelineSize = 3; pipelineSize <= 6; pipelineSize++) {
    // Sliding window composition over top entries
    for (let i = 0; i < Math.min(topByValue.length - pipelineSize, 40); i++) {
      const stages = topByValue.slice(i, i + pipelineSize);
      const pipeline = composePipeline(stages, pipelines.length, 'value-maximizer');
      if (pipeline.synergy_rating >= 30) {
        pipelines.push(pipeline);
      }
    }
  }

  // Strategy 2: Cross-sector maximum synergy
  const categories = [...byCategory.keys()];
  for (let i = 0; i < Math.min(categories.length, 20); i++) {
    for (let j = i + 1; j < Math.min(categories.length, 20); j++) {
      const cat1 = byCategory.get(categories[i])!;
      const cat2 = byCategory.get(categories[j])!;
      if (cat1.length > 0 && cat2.length > 0) {
        // Take best from each category
        const stages = [cat1[0], cat2[0]];
        // Add a third from a different category if possible
        for (let k = j + 1; k < Math.min(categories.length, 20); k++) {
          const cat3 = byCategory.get(categories[k])!;
          if (cat3.length > 0) {
            stages.push(cat3[0]);
            break;
          }
        }
        const pipeline = composePipeline(stages, pipelines.length, 'cross-sector');
        if (pipeline.synergy_rating >= 25) {
          pipelines.push(pipeline);
        }
      }
    }
  }

  // Strategy 3: Full-spectrum (one from every category)
  const fullSpectrum: VaultEntry[] = [];
  for (const [, entries] of byCategory) {
    if (entries.length > 0) fullSpectrum.push(entries[0]);
  }
  if (fullSpectrum.length >= 5) {
    pipelines.push(composePipeline(fullSpectrum, pipelines.length, 'full-spectrum'));
  }

  // Score, sort, and take top N
  pipelines.sort((a, b) => b.pipeline_score - a.pipeline_score);
  
  // Deduplicate by node chain signature
  const seen = new Set<string>();
  const unique: DiscoveredPipeline[] = [];
  for (const p of pipelines) {
    const sig = p.node_chain.sort().join(',');
    if (!seen.has(sig)) {
      seen.add(sig);
      unique.push(p);
    }
  }

  // Assign ranks and tiers
  return unique.slice(0, count).map((p, i) => ({
    ...p,
    tier: i < 10 ? 'apex' : i < 30 ? 'mythic' : i < 60 ? 'relic' : 'prime',
    codename: generateCodename(i),
  }));
}

function composePipeline(
  stages: VaultEntry[],
  index: number,
  method: string
): DiscoveredPipeline {
  // Flatten all nodes
  const allNodes = stages.flatMap(s => s.module_chain || []);
  const uniqueNodes = [...new Set(allNodes)];
  const sectors = new Set(uniqueNodes.map(n => NODE_SECTORS[n] || 'Unknown'));
  const avgCjpi = stages.reduce((s, e) => s + e.cjpi, 0) / stages.length;
  const totalValue = stages.reduce((s, e) => s + (e.recommended_resale_price || 0), 0);
  const synergy = calcSynergyRating(uniqueNodes);
  const categories = [...new Set(stages.map(s => s.category))];

  // Pipeline score: weighted composite
  const score = (
    (avgCjpi * 0.3) +              // Quality weight
    (synergy * 0.25) +             // Synergy weight
    (uniqueNodes.length * 0.8) +   // Node diversity
    (sectors.size * 3) +           // Sector coverage bonus
    (stages.length * 2) +          // Depth bonus
    (categories.length * 4) +      // Category diversity bonus
    Math.min(Math.log10(totalValue + 1) * 5, 30)  // Value bonus (capped)
  );

  const primaryCat = categories[0] || 'synthesis';
  const narrative = CATEGORY_NARRATIVE[primaryCat] || 'advanced autonomous processing';
  const catList = categories.map(c => CATEGORY_NARRATIVE[c] || c).join(', ');

  return {
    name: stages.map(s => s.name).join(' → '),
    codename: generateCodename(index),
    description: `A ${stages.length}-stage superpipeline spanning ${sectors.size} architectural sectors and ${uniqueNodes.length} nodes. Chains ${catList} into a unified autonomous execution path. Aggregate quality: ${avgCjpi.toFixed(1)} CJPI across ${stages.length} crystallized capabilities.`,
    category: primaryCat,
    pipeline_score: Math.round(score * 100) / 100,
    capability_chain: stages.map(s => ({
      vaultId: s.id,
      name: s.name,
      cjpi: s.cjpi,
      nodes: s.module_chain || [],
    })),
    node_chain: uniqueNodes,
    stage_count: stages.length,
    estimated_value_usd: Math.round(totalValue * 100) / 100,
    synergy_rating: Math.round(synergy * 100) / 100,
    cross_sector_count: sectors.size,
    unique_nodes: uniqueNodes.length,
    tier: 'apex',
    discovery_method: method,
  };
}

/**
 * Persist discovered pipelines to the database
 */
export async function persistDiscoveredPipelines(pipelines: DiscoveredPipeline[]) {
  const rows = pipelines.map((p, i) => ({
    name: p.name,
    codename: p.codename,
    description: p.description,
    category: p.category,
    pipeline_score: p.pipeline_score,
    capability_chain: p.capability_chain,
    node_chain: p.node_chain,
    stage_count: p.stage_count,
    estimated_value_usd: p.estimated_value_usd,
    discovery_method: p.discovery_method,
    synergy_rating: p.synergy_rating,
    cross_sector_count: p.cross_sector_count,
    unique_nodes: p.unique_nodes,
    tier: p.tier,
    status: 'discovered',
    curated: i < 10,
    rank: i + 1,
  }));

  const { error } = await supabase
    .from('discovered_pipelines')
    .insert(rows);

  if (error) throw new Error(`Failed to persist pipelines: ${error.message}`);
  return rows.length;
}
