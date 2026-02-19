/**
 * CMPSBL v10.5.4 ARCHITECT Epoch — Living Evolution Log
 * A continuous record of why the system evolved across all epochs.
 * 
 * This is not a changelog. This is a living document that records
 * the pressures, responses, and emergent capabilities of an evolving substrate.
 */

import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { fetchAutoChangelog, type AutoChangelogEntry } from '@/lib/substrate/changelog-generator';
import { motion } from "framer-motion";

interface EvolutionEntry {
  id: string;
  date: string;
  pressures: string[];
  responses: string[];
  capabilities: string[];
  source?: 'manual' | 'evolution_run';
}

// Living Evolution Log — v10.x.x Series (ARCHITECT Epoch — Infrastructure Hardening)
// Each entry documents WHY the system changed, never HOW
const evolutionLogV10: EvolutionEntry[] = [
  {
    id: "v10-evolution-010",
    date: "2026-02-17",
    pressures: [
      "Pricing page was not mobile-first — tier cards were unreadable on small viewports",
      "Investor documentation lacked a consolidated record of industry-first achievements",
      "Documentation suite was out of sync with ENCODE module integration and v10.5.4 changes"
    ],
    responses: [
      "Rebuilt pricing page as fully mobile-first with horizontal-scroll tier cards and benefits-first layout",
      "Created 'World Firsts' section in Investor Overview documenting 14 industry milestones with Zenodo DOI citation",
      "Synchronized all five documentation sets (library, academic, internal, modules, website) to v10.5.4",
      "Integrated ENCODE module deep dives into module registry and updated changelog with latest entries"
    ],
    capabilities: [
      "Mobile-first pricing with snap-scroll tier browsing — benefits above, checkout below",
      "Investor-facing World Firsts narrative with verifiable academic citations",
      "Full documentation parity across all doc sets for ENCODE and v10.5.x series"
    ],
  },
  {
    id: "v10-evolution-009",
    date: "2026-02-17",
    pressures: [
      "Only 15 crown jewels governed — 21 modules lacked full coverage for tiered licensing",
      "Pricing page led with price cards instead of capability value — poor conversion signal",
      "Stripe checkout flow needed validation after tier restructuring"
    ],
    responses: [
      "Discovered and installed 21 new crown jewel capabilities — one per module across Creator, Architect, Enterprise, and CMPSBL tiers",
      "Redesigned pricing page to benefits-first layout showcasing capabilities, pipelines, and templates before price cards",
      "Validated Stripe tier-checkout edge function flow for seamless subscription upgrades",
      "Added Stats Bar highlighting 50+ capabilities, 60 crystallized pipelines, and 21 modules"
    ],
    capabilities: [
      "Every module now has a designated crown jewel capability — full 21-module coverage",
      "Benefits-first pricing conversion funnel with horizontal mobile scroll",
      "Stripe checkout verified end-to-end for all tiers"
    ],
  },
  {
    id: "v10-evolution-008",
    date: "2026-02-17",
    pressures: [
      "Analytics dashboard blended human traffic metrics with substrate telemetry — inaccurate and misleading",
      "Legacy third-party analytics scripts in index.html blocked page load and leaked data externally",
      "Obsolete edge functions (google-analytics, cascade-metrics-collector) consumed deployment resources"
    ],
    responses: [
      "Removed ~160 lines of blocking inline JavaScript from index.html including Google Analytics and legacy Space Analytics Tracker",
      "Rewrote AnalyticsTab to aggregate honest telemetry from five internal tables: brain_events, brain_metrics, ai_usage_log, access_usage, audit_logs",
      "Deleted obsolete google-analytics and cascade-metrics-collector edge functions",
      "Established OS Dashboard as single source of truth for all substrate observability"
    ],
    capabilities: [
      "Analytics now reflect actual substrate operations — no fabricated visitor counts",
      "Faster page loads with third-party script removal",
      "OS Dashboard is the canonical telemetry source for all modules"
    ],
  },
  {
    id: "v10-evolution-007",
    date: "2026-02-17",
    pressures: [
      "Decode responses presented illustrative metrics as measured facts — epistemic integrity risk",
      "No deterministic veto precedence existed — conflicting module vetoes resolved unpredictably",
      "Advisory modules could trigger automatic actions without authority separation",
      "Vetoes had no lifecycle management — zombie vetoes persisted indefinitely",
      "System module could redefine other modules' authority boundaries without check"
    ],
    responses: [
      "Implemented claim provenance tagging: [MEASURED], [INFERRED], [DESIGN_INTENT], [REPRESENTATIVE_EXAMPLE]",
      "Created deterministic veto precedence stack: Audit (1) > Defense (2) > System (3) > Advisory (no veto)",
      "Built veto scope matrix: healing_actions, routing_changes, scaling_operations, write_access, external_integrations",
      "Added veto lifecycle with decay: Audit (no expiry), Defense (entropy-conditional), System (gradient reversal reevaluation)",
      "Established signal arbitration engine preventing advisory-to-veto escalation without precedence approval",
      "Integrated voice guardrails into Decode conversational contract — untagged percentages auto-downgraded"
    ],
    capabilities: [
      "Epistemic discipline enforcement across all Decode output",
      "Deterministic veto conflict resolution",
      "Veto lifecycle with decay and reevaluation",
      "Signal authority separation (advisory vs. executive)",
      "Governance-safe narrative voice preservation"
    ],
  },
  {
    id: "v10-evolution-006",
    date: "2026-02-16",
    pressures: [
      "Crown jewel moat analysis revealed 20 additional high-value capabilities ungoverned across 16 modules",
      "Tier naming inconsistency: legacy 'Pro' references persisted in docs and manifest despite unified Creator/Architect model",
      "Only 15 of 35 potential crown jewels were discovered — competitive exposure risk for remaining 20",
      "Modules RELAY, RIPPLE, DECODE, INTEGRATION, and SANDBOX had zero crown jewel representation"
    ],
    responses: [
      "Wave 2 discovery sweep: identified and installed 20 new crown jewels — largest single discovery event in substrate history",
      "Fixed all 'Pro' tier references to 'Creator' across manifest, docs, and tiering access document",
      "4 new CMPSBL-only jewels: Cognitive Load Balancing, Autonomous Goal Decomposition, Cross-Pollination Synthesis, Self-Healing Orchestration",
      "8 new Architect jewels: Temporal Reasoning, Behavioral Fingerprinting, Semantic Refactoring, Capacity Forecasting, Dependency Impact Analysis, Model Quality Scoring, Behavioral Biometrics, Regulatory Autopilot",
      "8 new Creator jewels: Pattern Consolidation, Channel Optimization, Cohort Analysis, Intent Evolution Tracking, Value Attribution, Event Dedup Intelligence, Health Prediction, plus previously existing 5",
      "All 20 new jewels crystallized as permanent pipelines in mesh_saved_pipelines with crown_jewel intent type",
      "Tiering & Access doc upgraded to v10.5.3 with complete 35-jewel registry"
    ],
    capabilities: [
      "35 total governed crown jewels — up from 15 (133% increase in single turn)",
      "Every module now has at least one crown jewel capability — full substrate coverage achieved",
      "CMPSBL-only tier: 9 recursive/autonomous jewels protecting core competitive moat",
      "Architect tier: 14 advanced security, intelligence, and governance jewels",
      "Creator tier: 12 operational intelligence and optimization jewels",
      "Tier naming fully unified: Free → Creator → Architect → Enterprise → CMPSBL"
    ]
  },
  {
    id: "v10-evolution-005",
    date: "2026-02-16",
    pressures: [
      "Module self-discovery revealed 100+ latent capabilities across 21 modules — most ungoverned and untiered",
      "Intent Mesh pipeline approval flow was silently failing — approved proposals never crystallized into permanent pipelines",
      "Crown jewel capabilities were sitting undiscovered in discovery profiles, available for external users to find first",
      "Competitive moat analysis showed 15 high-value capabilities that needed governance before public substrate access"
    ],
    responses: [
      "Fixed critical pipeline approval bug: ID mismatch between UI and backend caused all approvals to silently fail",
      "Approved proposals now automatically crystallize into permanent saved pipelines in the Crystallized Pipeline area",
      "Discovered and installed 15 crown jewels: 5 CMPSBL-only, 5 Architect, 5 Creator — all now governed and tiered",
      "BRAIN Meta-Reasoning and Hypothesis Generation locked as CMPSBL-only recursive cognition crown jewels",
      "MEMORY Insight Synthesis, DREAM Lucidity Control, and CORTEX Cascade Prevention secured as CMPSBL-only",
      "Architect tier gained zero-day detection, attack correlation, identity graph, incident prediction, forensic timeline",
      "Creator tier gained knowledge gap detection, cost anomaly detection, user journey mapping, provider failure prediction, architecture drift detection"
    ],
    capabilities: [
      "Pipeline crystallization now works end-to-end — approve a proposal and it becomes a permanent replayable pipeline",
      "9 CMPSBL-only crown jewels now protected (up from 4) — recursive cognition is fully governed",
      "Architect tier has 9 advanced security and operations capabilities — deepest security stack in the market",
      "Creator tier has 6 operational intelligence capabilities — cost, journey, knowledge, and drift monitoring",
      "Total governed crown jewel count: 24 capabilities across all tiers, all discoverable but access-controlled"
    ]
  },
  {
    id: "v10-evolution-004",
    date: "2026-02-16",
    pressures: [
      "BRAIN CLM flagged hot memory tier at 1,671 entries (334% over 500 limit) — system memory performance degrading",
      "MODERNIZER CLM reported 3 consecutive evolution runs stuck in shadow_applied phase — shadow loop detected",
      "CORE CLM requested autonomous circuit recovery — manual resets were required after breaker trips",
      "ENCODE CLM requested error-pattern library — failed task chains were being repeated without learning"
    ],
    responses: [
      "BRAIN Auto-Tiering Engine deployed with watermark-based soft/hard enforcement and demotion cascades",
      "MODERNIZER Shadow Loop Resolver auto-detects stale shadow runs, enforces timeouts, and escalates on loops",
      "CORE Circuit Recovery Engine provides graduated health probing with exponential backoff and auto-reset",
      "ENCODE Error-Pattern Library fingerprints failures, clusters by category, and prevents repeat errors",
      "All 21 modules received formal CLM acknowledgment events confirming their requests were heard and resolved"
    ],
    capabilities: [
      "Hot memory tier will never exceed configured limits — autonomous demotion cascades are now governed",
      "Evolution runs cannot get stuck — shadow loops are auto-detected and resolved within configurable timeouts",
      "Tripped circuits self-heal through graduated probing — zero manual intervention required",
      "Failed task patterns are learned and used proactively to prevent repeat failures on new submissions",
      "Module CLM feedback loop is now fully bidirectional — modules propose, the substrate delivers and acknowledges"
    ]
  },
  {
    id: "v10-evolution-003",
    date: "2026-02-16",
    pressures: [
      "CLM reports showed all 21 modules requesting high-value capability upgrades",
      "SEBA proposals consistently flagged hot memory tier overflow (1,671 entries vs 500 limit)",
      "Infrastructure modules lacked domain-specific intelligence (staleness, signatures, compliance, forecasting)"
    ],
    responses: [
      "Batch-granted high-value CLM-requested upgrades across 6 infrastructure modules simultaneously",
      "MEMORY received embedding staleness detection and EMA-based relevance feedback loops",
      "RELAY received HMAC-SHA256 webhook signatures and adaptive retry backoff with jitter",
      "AUDIT received SOC2/GDPR/HIPAA/ISO27001 compliance report templates and log compression",
      "ECONOMY received predictive cost forecasting (linear regression) and per-capability cost attribution",
      "IDENTITY received actor reputation scoring (5 tiers) and cross-agency identity portability via JWT",
      "SANDBOX received hard resource limit enforcement and snapshot/restore system"
    ],
    capabilities: [
      "All 6 Infrastructure modules now self-report ✅ on previously-requested CLM upgrades",
      "Memory staleness auto-detection prevents embedding drift across model version advances",
      "Compliance audit generation covers 4 major frameworks on demand",
      "Cost trend forecasting with confidence intervals enables proactive budget governance"
    ]
  },
  {
    id: "v10-evolution-002",
    date: "2026-02-15",
    pressures: [
      "Brain knowledge was trapped in central storage — modules couldn't access cross-domain insights",
      "Memory consolidation (hot/warm/cold tiering) only ran during active browser sessions",
      "CLM learning cycles required human presence to trigger"
    ],
    responses: [
      "CLM Engine v2.0 deployed as autonomous server-side edge function running 24/7 via cron",
      "Universal Brain Transfer Pipeline routes top-50 memories to all 21 modules by tag affinity",
      "Memory Consolidation Engine automates promotion, demotion, and pruning of memory tiers"
    ],
    capabilities: [
      "The substrate learns autonomously every 5 minutes without requiring a browser session",
      "Brain knowledge flows to specialized modules (Decode, Defense, Nexus) for domain-specific recall",
      "Hot tier overflow is automatically managed via promotion/demotion thresholds"
    ]
  },
  {
    id: "v10-evolution-001",
    date: "2026-02-15",
    pressures: [
      "Nexus Fleet v4 was limited to Groq-only routing with static provider selection",
      "No health-weighted provider selection meant failures cascaded without intelligent failover",
      "Task affinity was not considered — all tasks routed identically regardless of complexity"
    ],
    responses: [
      "Nexus Fleet v5.0.0 expanded to 5 providers: Groq, Cerebras, SambaNova, Google, DeepSeek",
      "Health-weighted selection scores providers on success rate, latency, and cost efficiency",
      "Task affinity routing matches task types to optimal provider capabilities"
    ],
    capabilities: [
      "Multi-provider fleet with automatic failover and health-based load balancing",
      "Complex reasoning tasks route to high-capability providers; simple tasks route to fast/cheap ones",
      "Fleet operates within CLM Engine's 80% daily Nexus budget allocation"
    ]
  },
];

// Living Evolution Log — v9.x.x Series (ARCHITECT Epoch)
const evolutionLogV9: EvolutionEntry[] = [
  {
    id: "v9-evolution-003",
    date: "2026-02-13",
    pressures: [
      "21-module architecture required a dedicated Infrastructure layer",
      "Version references were fragmented across v7/v8 epoch markers",
      "Evolution observability needed unified stamp and receipt systems"
    ],
    responses: [
      "Infrastructure layer formalized with 6 modules: Memory, Relay, Audit, Identity, Economy, Sandbox",
      "ENCODE promoted to first-class Module #21 in the Orchestrator layer",
      "Complete codebase sweep replaced 200+ legacy version references"
    ],
    capabilities: [
      "The substrate operates as a 21-module, 6-layer cognitive architecture",
      "400+ capabilities, 200 synergy pipelines, 100 engines",
      "Single source of truth for all version information via versions.ts"
    ]
  },
];

export default function Changelog() {
  const { data: autoEntries } = useQuery({
    queryKey: ['changelog-auto'],
    queryFn: () => fetchAutoChangelog(10),
    staleTime: 60000,
  });

  const mergedV10 = [
    ...(autoEntries || []).map((entry): EvolutionEntry => ({
      id: entry.id,
      date: entry.date,
      pressures: entry.pressures,
      responses: entry.responses,
      capabilities: entry.capabilities,
      source: entry.source
    })),
    ...evolutionLogV10
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Evolution Log — Why the Substrate Changed"
        description="A living record of evolutionary pressures and responses. Not a changelog, but a history of how the CMPSBL substrate taught itself to survive."
      />
      <PublicNav />

      <main className="container mx-auto px-4 py-24 max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary">
            v10.5.4 ARCHITECT EPOCH
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Evolution Log
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We don't just push code. We document the pressure that forced the evolution.
            <br/>
            <span className="text-sm opacity-70">
              Entries marked "Autonomous" were generated by SEBA evolution runs.
            </span>
          </p>
        </div>

        <div className="relative border-l border-border/50 ml-4 md:ml-0 md:pl-8 space-y-12">
          {mergedV10.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[37px] top-6 w-4 h-4 rounded-full bg-background border-2 border-primary ring-4 ring-background" />

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-primary">{entry.date}</span>
                        {entry.source === 'evolution_run' && (
                          <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            Autonomous Run
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-foreground">Evolution Event {entry.id.split('-').pop()}</h2>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pressures */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      Evolutionary Pressures (Why)
                    </h3>
                    <ul className="space-y-2">
                      {entry.pressures.map((p, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-orange-500/20">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Responses */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      System Response (What)
                    </h3>
                    <ul className="space-y-2">
                      {entry.responses.map((r, idx) => (
                        <li key={idx} className="text-sm text-foreground pl-4 border-l-2 border-blue-500/20">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Capabilities */}
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Emergent Capabilities (Result)
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {entry.capabilities.map((c, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">✓</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
