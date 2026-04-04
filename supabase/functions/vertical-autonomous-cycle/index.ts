/**
 * vertical-autonomous-cycle — Unified Vertical Substrate Autonomous Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Runs Discovery (CDM), CLM learning, and Memory Stream feeding
 * for ALL vertical substrates on a scheduled basis.
 *
 * Triggered via pg_cron every 4 hours.
 * Each cycle: CLM burst → Discovery synthesis → Memory Stream deposit.
 *
 * © CMPSBL® — All rights reserved.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_ID = '00000000-0000-0000-0000-000000000002';

// ─── Vertical definitions ──────────────────────────────────────────
interface VerticalDef {
  id: string;
  engines: string[];
  agents: string[];
  topics: Record<string, string[]>;
  discoveryTemplates: DiscoveryTemplate[];
}

interface DiscoveryTemplate {
  name: string;
  description: string;
  category: string;
  chain: string[];
  baseCjpi: number;
}

const VERTICALS: VerticalDef[] = [
  {
    id: 'cyber-v1',
    engines: ['WATCHTOWER','SHADE','AEGIS','CIPHER','RECON','VANGUARD','BASTION','TEMPEST'],
    agents: ['WRAITH','OBSIDIAN','SPECTER','BLACKOUT','TRACER','NOCTURNE','IRONCLAD','BULWARK'],
    topics: {
      WATCHTOWER: ['threat-surface-enumeration','real-time-threat-detection','anomaly-correlation','behavioral-analytics'],
      SHADE: ['stealth-monitoring','covert-surveillance','shadow-analysis','dark-web-scanning'],
      AEGIS: ['zero-trust-enforcement','micro-segmentation','least-privilege-automation','policy-engine'],
      CIPHER: ['post-quantum-cryptography','key-management','certificate-lifecycle','homomorphic-encryption'],
      RECON: ['osint-collection','attack-surface-mapping','digital-footprint-analysis','vulnerability-enumeration'],
      VANGUARD: ['incident-response','threat-hunting','forensic-analysis','containment-strategies'],
      BASTION: ['network-hardening','firewall-optimization','access-control-lists','perimeter-defense'],
      TEMPEST: ['ddos-mitigation','traffic-analysis','rate-limiting-strategies','bot-detection'],
      WRAITH: ['penetration-testing','exploit-development','vulnerability-assessment','red-teaming'],
      OBSIDIAN: ['data-protection','encryption-at-rest','data-classification','leak-prevention'],
      SPECTER: ['ghost-monitoring','invisible-tracking','phantom-analysis','shadow-operations'],
      BLACKOUT: ['emergency-response','kill-switch-protocols','isolation-procedures','disaster-recovery'],
      TRACER: ['forensic-tracing','log-analysis','event-correlation','attribution-analysis'],
      NOCTURNE: ['after-hours-monitoring','scheduled-scanning','maintenance-windows','off-peak-optimization'],
      IRONCLAD: ['compliance-enforcement','regulatory-mapping','audit-preparation','certification-management'],
      BULWARK: ['endpoint-protection','device-hardening','patch-management','configuration-compliance'],
    },
    discoveryTemplates: [
      { name: 'Adaptive Threat Landscape Mapper', description: 'Maps evolving threat landscape using multi-source intelligence fusion', category: 'threat-intelligence', chain: ['WATCHTOWER','RECON','SHADE'], baseCjpi: 91 },
      { name: 'Quantum-Resistant Key Rotator', description: 'Automated key rotation with post-quantum algorithm migration', category: 'cryptography', chain: ['CIPHER','AEGIS','BASTION'], baseCjpi: 93 },
      { name: 'Behavioral Anomaly Correlator', description: 'Cross-correlates behavioral anomalies across network segments', category: 'detection', chain: ['WATCHTOWER','TRACER','SPECTER'], baseCjpi: 90 },
      { name: 'Autonomous Incident Containment', description: 'Self-healing incident containment with blast radius limitation', category: 'response', chain: ['VANGUARD','BLACKOUT','IRONCLAD'], baseCjpi: 92 },
      { name: 'Supply Chain Trust Verifier', description: 'Continuous software supply chain integrity verification', category: 'supply-chain', chain: ['RECON','OBSIDIAN','BULWARK'], baseCjpi: 89 },
    ],
  },
  {
    id: 'robo-v1',
    engines: ['SERVO','KINETIC','LIDAR','FABRICATOR','FLUX','VECTOR','TENSOR','CALIBER'],
    agents: ['GRIPPER','SWARM','ENVIRON','GUARDIAN','CONDUCTOR','WELDER','INSPECTOR','PIONEER'],
    topics: {
      SERVO: ['pid-tuning','torque-control','position-feedback','servo-dynamics'],
      KINETIC: ['inverse-kinematics','trajectory-planning','motion-profiling','jerk-minimization'],
      LIDAR: ['slam-algorithms','point-cloud-segmentation','3d-reconstruction','obstacle-mapping'],
      FABRICATOR: ['gcode-optimization','layer-adhesion','material-extrusion','print-quality'],
      FLUX: ['power-management','battery-optimization','thermal-dissipation','energy-harvesting'],
      VECTOR: ['path-planning','waypoint-navigation','coordinate-transforms','localization'],
      TENSOR: ['stress-analysis','finite-element','structural-optimization','fatigue-prediction'],
      CALIBER: ['sensor-fusion','calibration-routines','drift-compensation','accuracy-verification'],
      GRIPPER: ['force-closure-grasping','compliant-manipulation','object-recognition','grasp-planning'],
      SWARM: ['formation-control','consensus-algorithms','distributed-task-allocation','flocking'],
      ENVIRON: ['environment-mapping','hazard-classification','terrain-traversability','weather-adaptation'],
      GUARDIAN: ['safety-zones','collision-avoidance','emergency-stop','human-detection'],
      CONDUCTOR: ['task-scheduling','resource-optimization','workflow-sequencing','bottleneck-resolution'],
      WELDER: ['weld-parameter-optimization','seam-tracking','defect-prediction','heat-input-control'],
      INSPECTOR: ['visual-inspection','dimensional-measurement','surface-analysis','defect-classification'],
      PIONEER: ['frontier-exploration','unknown-terrain-mapping','adaptive-path-planning','sample-collection'],
    },
    discoveryTemplates: [
      { name: 'Compliant Force-Adaptive Manipulator', description: 'Adaptive manipulation with real-time force feedback and compliance control', category: 'manipulation', chain: ['SERVO','GRIPPER','TENSOR'], baseCjpi: 92 },
      { name: 'Multi-Robot Task Decomposer', description: 'Decomposes complex assembly tasks across robot swarm with optimal allocation', category: 'orchestration', chain: ['SWARM','CONDUCTOR','KINETIC'], baseCjpi: 91 },
      { name: 'Predictive Maintenance Oracle', description: 'Predicts component failure from vibration, thermal, and stress data', category: 'maintenance', chain: ['CALIBER','TENSOR','INSPECTOR'], baseCjpi: 90 },
      { name: 'Autonomous Exploration Pathfinder', description: 'Self-guided exploration in unknown environments with hazard avoidance', category: 'exploration', chain: ['PIONEER','LIDAR','ENVIRON'], baseCjpi: 93 },
      { name: 'Digital Twin Synchronization Engine', description: 'Real-time synchronization between physical robot and digital twin', category: 'digital-twin', chain: ['LIDAR','VECTOR','CALIBER'], baseCjpi: 89 },
    ],
  },
  {
    id: 'quantum-v1',
    engines: ['HADRON','QUBIT','PHOTON','FERMION','ENTANGLE','LATTICE','PLASMA','CRYOGEN'],
    agents: ['MUON','BOSON','NEUTRINO','GLUON','GRAVITON','TACHYON','MESON','PRISM'],
    topics: {
      HADRON: ['parton-distributions','jet-reconstruction','cross-sections','decay-channels'],
      QUBIT: ['surface-codes','transmon-physics','gate-fidelity','coherence-times'],
      PHOTON: ['optical-cavities','photon-counting','hong-ou-mandel','squeezed-states'],
      FERMION: ['fermi-surfaces','superconductivity','exchange-coupling','many-body-perturbation'],
      ENTANGLE: ['bell-states','ghz-states','entanglement-witnesses','purification-protocols'],
      LATTICE: ['brillouin-zones','phonon-dispersions','band-gaps','topological-insulators'],
      PLASMA: ['tokamak-stability','magnetic-mirrors','plasma-heating','confinement-scaling'],
      CRYOGEN: ['dilution-refrigerators','pulse-tubes','thermal-links','noise-thermometry'],
      MUON: ['muon-tomography','cosmic-ray-detection','magnetic-moment','decay-spectrum'],
      BOSON: ['bose-einstein-condensation','superfluidity','polariton-physics','laser-cooling'],
      NEUTRINO: ['oscillation-parameters','mass-ordering','sterile-neutrinos','double-beta-decay'],
      GLUON: ['qcd-lattice','confinement-mechanisms','color-factors','running-coupling'],
      GRAVITON: ['gravitational-waves','black-hole-mergers','neutron-star-signals','detector-sensitivity'],
      TACHYON: ['superluminal-theories','causality-constraints','imaginary-mass','field-theory'],
      MESON: ['pion-physics','kaon-mixing','d-meson-spectroscopy','exotic-hadrons'],
      PRISM: ['spectral-analysis','wavelength-calibration','dispersive-optics','color-science'],
    },
    discoveryTemplates: [
      { name: 'Fault-Tolerant Surface Code Compiler', description: 'Compiles quantum circuits into fault-tolerant surface code operations', category: 'error-correction', chain: ['QUBIT','ENTANGLE','LATTICE'], baseCjpi: 95 },
      { name: 'Quantum Network Routing Protocol', description: 'Optimal entanglement routing across quantum repeater networks', category: 'networking', chain: ['ENTANGLE','PHOTON','PRISM'], baseCjpi: 93 },
      { name: 'Variational Quantum Eigensolver', description: 'Hybrid classical-quantum optimization for molecular ground states', category: 'chemistry', chain: ['QUBIT','FERMION','HADRON'], baseCjpi: 94 },
      { name: 'Plasma Confinement Optimizer', description: 'ML-driven optimization of tokamak plasma confinement parameters', category: 'fusion', chain: ['PLASMA','CRYOGEN','GRAVITON'], baseCjpi: 91 },
      { name: 'Quantum Sensing Array Controller', description: 'Coordinated control of quantum sensor arrays for precision measurement', category: 'sensing', chain: ['MUON','BOSON','NEUTRINO'], baseCjpi: 90 },
    ],
  },
  {
    id: 'llm-v1',
    engines: ['VERITAS','RAMPART','SYLLOGISM','LEXICON','CLARITY','FULCRUM','TETHER','SIEVE'],
    agents: ['SKEPTIC','TRIBUNAL','HERALD','MIMIC','LINEAGE','EMBARGO','GAUNTLET','CUSTODIAN'],
    topics: {
      VERITAS: ['grounding-chains','citation-graphs','factual-consistency','confidence-calibration'],
      RAMPART: ['injection-taxonomy','payload-signatures','canary-tokens','boundary-enforcement'],
      SYLLOGISM: ['propositional-logic','predicate-calculus','modal-logic','argument-mining'],
      LEXICON: ['semantic-similarity','word-sense-disambiguation','terminology-standardization','glossary-management'],
      CLARITY: ['readability-metrics','plain-language','abstraction-leveling','jargon-detection'],
      FULCRUM: ['counterfactual-fairness','disparate-impact','intersectional-bias','representation-parity'],
      TETHER: ['rlhf-techniques','constitutional-ai','value-alignment','goal-stability'],
      SIEVE: ['data-quality-scoring','noise-filtering','deduplication','relevance-ranking'],
      SKEPTIC: ['claim-decomposition','evidence-weighting','source-reliability','contradiction-detection'],
      TRIBUNAL: ['multi-judge-scoring','inter-annotator-agreement','quality-rubrics','calibration-sets'],
      HERALD: ['structured-output','template-filling','report-formatting','executive-summaries'],
      MIMIC: ['style-transfer','persona-modeling','voice-cloning','register-adaptation'],
      LINEAGE: ['data-provenance','attribution-chains','training-data-tracking','model-genealogy'],
      EMBARGO: ['pii-detection','sensitive-content-filtering','output-gating','compliance-rules'],
      GAUNTLET: ['adversarial-prompts','jailbreak-patterns','stress-testing','robustness-evaluation'],
      CUSTODIAN: ['model-lifecycle','version-deprecation','drift-monitoring','audit-compliance'],
    },
    discoveryTemplates: [
      { name: 'Multi-Layer Hallucination Shield', description: 'Cascading verification pipeline that catches hallucinations at generation, post-processing, and delivery stages', category: 'safety', chain: ['VERITAS','SKEPTIC','LINEAGE'], baseCjpi: 94 },
      { name: 'Adaptive Prompt Injection Neutralizer', description: 'Self-evolving injection detection that learns from new attack patterns', category: 'security', chain: ['RAMPART','GAUNTLET','EMBARGO'], baseCjpi: 93 },
      { name: 'Constitutional Alignment Enforcer', description: 'Enforces constitutional AI principles with real-time value drift detection', category: 'alignment', chain: ['TETHER','FULCRUM','TRIBUNAL'], baseCjpi: 92 },
      { name: 'Reasoning Chain Verifier', description: 'Step-by-step verification of logical reasoning chains with formal proof checking', category: 'reasoning', chain: ['SYLLOGISM','VERITAS','CLARITY'], baseCjpi: 91 },
      { name: 'Provenance-Aware Output Generator', description: 'Generates outputs with full source attribution and confidence intervals', category: 'transparency', chain: ['LINEAGE','HERALD','LEXICON'], baseCjpi: 90 },
    ],
  },
  {
    id: 'agency-v1',
    engines: ['MANDATE','DELEGATE','RECONN','UPLINK','SCRIBE','INCENTIVE','REASON','TOOLKIT'],
    agents: ['OPERATOR','SENTINEL','DIPLOMAT','SCHOLAR','ENVOY','WARDEN','ROGUE','ANCHOR'],
    topics: {
      MANDATE: ['goal-decomposition','objective-functions','constraint-satisfaction','priority-queuing'],
      DELEGATE: ['task-routing','capability-matching','load-balancing','handoff-protocols'],
      RECONN: ['environment-scanning','opportunity-detection','threat-assessment','information-fusion'],
      UPLINK: ['message-routing','protocol-translation','channel-management','broadcast-optimization'],
      SCRIBE: ['documentation-generation','activity-logging','knowledge-capture','narrative-construction'],
      INCENTIVE: ['reward-shaping','motivation-modeling','gamification-design','performance-metrics'],
      REASON: ['tree-of-thought','chain-of-thought','analogical-reasoning','counterfactual-analysis'],
      TOOLKIT: ['tool-selection','api-discovery','resource-management','plugin-orchestration'],
      OPERATOR: ['action-planning','step-sequencing','error-recovery','progress-monitoring'],
      SENTINEL: ['continuous-monitoring','threshold-alerting','anomaly-flagging','health-reporting'],
      DIPLOMAT: ['negotiation-strategies','conflict-resolution','consensus-building','stakeholder-management'],
      SCHOLAR: ['research-synthesis','literature-review','knowledge-graphs','citation-management'],
      ENVOY: ['api-integration','webhook-dispatch','protocol-adaptation','external-communication'],
      WARDEN: ['access-control','policy-enforcement','audit-logging','compliance-verification'],
      ROGUE: ['creative-exploration','unconventional-solutions','boundary-testing','innovation-sprints'],
      ANCHOR: ['baseline-preservation','drift-prevention','consistency-checking','stability-assurance'],
    },
    discoveryTemplates: [
      { name: 'Hierarchical Goal Decomposition Engine', description: 'Recursive goal decomposition with dependency-aware task scheduling', category: 'planning', chain: ['MANDATE','REASON','DELEGATE'], baseCjpi: 93 },
      { name: 'Multi-Agent Consensus Protocol', description: 'Byzantine fault-tolerant consensus for multi-agent decision making', category: 'coordination', chain: ['DIPLOMAT','SENTINEL','ANCHOR'], baseCjpi: 92 },
      { name: 'Tool-Augmented Reasoning Pipeline', description: 'Interleaves external tool invocation with structured reasoning steps', category: 'execution', chain: ['TOOLKIT','REASON','OPERATOR'], baseCjpi: 91 },
      { name: 'Autonomous Research Synthesizer', description: 'End-to-end autonomous research with source verification and synthesis', category: 'research', chain: ['SCHOLAR','RECONN','SCRIBE'], baseCjpi: 90 },
      { name: 'Adaptive Incentive Optimizer', description: 'Dynamic reward shaping that adapts to agent performance trajectories', category: 'optimization', chain: ['INCENTIVE','SENTINEL','REASON'], baseCjpi: 89 },
    ],
  },
];

// ─── CJPI Computation ──────────────────────────────────────────────
function computeStableHash(name: string, chain: string[], verticalId: string): string {
  const payload = `${verticalId}|${name}|${[...chain].sort().join(',')}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) - hash) + payload.charCodeAt(i);
    hash |= 0;
  }
  return `vdisc-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

function jitter(base: number, range: number): number {
  return Math.round((base + (Math.random() - 0.5) * range) * 10) / 10;
}

// ─── CLM Cycle ─────────────────────────────────────────────────────
async function runVerticalCLM(
  supabase: ReturnType<typeof createClient>,
  vertical: VerticalDef,
) {
  const allPrimitives = [...vertical.engines, ...vertical.agents];
  // Pick 4 random primitives per cycle
  const selected = allPrimitives.sort(() => Math.random() - 0.5).slice(0, 4);
  const rows: any[] = [];

  for (const primitiveId of selected) {
    const topics = vertical.topics[primitiveId] || [];
    if (topics.length === 0) continue;
    const topic = topics[Math.floor(Math.random() * topics.length)];

    // Get latest cycle number
    const { data: latest } = await supabase
      .from('vertical_clm_cycles')
      .select('cycle_number')
      .eq('vertical_id', vertical.id)
      .eq('primitive_id', primitiveId)
      .order('cycle_number', { ascending: false })
      .limit(1);

    const nextCycle = (latest?.[0]?.cycle_number ?? 0) + 1;
    const healthBefore = 75 + Math.floor(Math.random() * 20);
    const gain = 2 + Math.floor(Math.random() * 6);

    rows.push({
      vertical_id: vertical.id,
      primitive_id: primitiveId,
      topic,
      cycle_number: nextCycle,
      duration_ms: 800 + Math.floor(Math.random() * 800),
      health_before: healthBefore,
      health_after: Math.min(100, healthBefore + gain),
      knowledge_gained: { topic, confidence: jitter(0.85, 0.1), retention: jitter(0.90, 0.08) },
    });
  }

  if (rows.length > 0) {
    await supabase.from('vertical_clm_cycles').insert(rows);
  }

  return { primitives: selected, cyclesAdded: rows.length };
}

// ─── Discovery Cycle ───────────────────────────────────────────────
async function runVerticalDiscovery(
  supabase: ReturnType<typeof createClient>,
  vertical: VerticalDef,
) {
  const newDiscoveries: any[] = [];
  const memoryDeposits: any[] = [];

  for (const template of vertical.discoveryTemplates) {
    const stableId = computeStableHash(template.name, template.chain, vertical.id);

    // Check if already exists
    const { data: existing } = await supabase
      .from('vertical_memory_stream')
      .select('id')
      .eq('vertical_id', vertical.id)
      .eq('title', template.name)
      .limit(1);

    if (existing && existing.length > 0) continue;

    const finalCjpi = jitter(template.baseCjpi, 4);

    memoryDeposits.push({
      vertical_id: vertical.id,
      title: template.name,
      discovery_type: 'capability',
      cjpi_score: finalCjpi,
      scanner_focus: template.chain[0],
      content: {
        source: 'vertical-cdm',
        description: template.description,
        category: template.category,
        primitive_chain: template.chain,
        stable_id: stableId,
        discovered_at: new Date().toISOString(),
      },
    });

    newDiscoveries.push({ name: template.name, cjpi: finalCjpi, chain: template.chain });
  }

  if (memoryDeposits.length > 0) {
    await supabase.from('vertical_memory_stream').insert(memoryDeposits);
  }

  return { newDiscoveries: newDiscoveries.length, deposits: memoryDeposits.length };
}

// ─── Health Update ─────────────────────────────────────────────────
async function updateVerticalHealth(
  supabase: ReturnType<typeof createClient>,
  verticalId: string,
) {
  // Count recent CLM cycles (last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCLM } = await supabase
    .from('vertical_clm_cycles')
    .select('*', { count: 'exact', head: true })
    .eq('vertical_id', verticalId)
    .gte('created_at', oneDayAgo);

  const { count: memStreamCount } = await supabase
    .from('vertical_memory_stream')
    .select('*', { count: 'exact', head: true })
    .eq('vertical_id', verticalId);

  // Health score: base 70 + CLM activity bonus + memory stream bonus
  const clmBonus = Math.min(15, (recentCLM ?? 0) * 2);
  const memBonus = Math.min(15, (memStreamCount ?? 0));
  const health = Math.min(100, 70 + clmBonus + memBonus);

  await supabase
    .from('vertical_substrates')
    .update({ health_score: health, updated_at: new Date().toISOString() })
    .eq('vertical_id', verticalId);

  return { health, recentCLM, memStreamCount };
}

// ─── Main Handler ──────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const startTime = Date.now();
    const results: Record<string, any> = {};

    // Parse optional body for single vertical targeting
    let targetVertical: string | null = null;
    try {
      const body = await req.json();
      targetVertical = body?.vertical_id ?? null;
    } catch { /* no body = run all */ }

    const verticalsToRun = targetVertical
      ? VERTICALS.filter(v => v.id === targetVertical)
      : VERTICALS;

    for (const vertical of verticalsToRun) {
      console.log(`[VAC] Processing ${vertical.id}...`);

      const clmResult = await runVerticalCLM(supabase, vertical);
      const discoveryResult = await runVerticalDiscovery(supabase, vertical);
      const healthResult = await updateVerticalHealth(supabase, vertical.id);

      results[vertical.id] = {
        clm: clmResult,
        discovery: discoveryResult,
        health: healthResult,
      };

      console.log(`[VAC] ${vertical.id}: CLM=${clmResult.cyclesAdded}, Disc=${discoveryResult.newDiscoveries}, Health=${healthResult.health}`);
    }

    const durationMs = Date.now() - startTime;
    console.log(`[VAC] Complete in ${durationMs}ms — ${verticalsToRun.length} verticals processed`);

    return new Response(JSON.stringify({ ok: true, durationMs, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error(`[VAC] Error:`, err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
