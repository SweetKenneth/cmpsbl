/**
 * CMPSBL v9.1.0 ARCHITECT Epoch — Living Evolution Log
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

interface EvolutionEntry {
  id: string;
  date: string;
  pressures: string[];
  responses: string[];
  capabilities: string[];
}

// Living Evolution Log — v10.x.x Series (ARCHITECT Epoch — Infrastructure Hardening)
// Each entry documents WHY the system changed, never HOW
const evolutionLogV10: EvolutionEntry[] = [
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
  {
    id: "v9-evolution-002",
    date: "2026-02-11",
    pressures: [
      "Integrity audit revealed version drift between code and documentation",
      "Module layer assignments were inconsistent across surfaces",
      "Engine and meta-engine counts needed formal synchronization"
    ],
    responses: [
      "Comprehensive integrity audit corrected all layer assignments",
      "Engine registry formalized at 76 engines + 24 meta-engines",
      "Documentation library synchronized across internal, public, and academic surfaces"
    ],
    capabilities: [
      "Zero version drift between code constants and documentation",
      "Architectural queries return consistent layer groupings",
      "Engine registry reflects accurate production-ready counts"
    ]
  },
  {
    id: "v9-evolution-001",
    date: "2026-02-10",
    pressures: [
      "SEBA evolution cycle needed cross-validation of predicted vs actual impact",
      "Proposal chaining required dependent execution sequences",
      "Modernizer needed independent observability from SEBA analysis"
    ],
    responses: [
      "Cross-Validator engine reconciles predicted impact against actual metrics",
      "Proposal Chaining enables dependent architectural change sequences",
      "Omega Observer Engine (v2.0) provides automated insight generation"
    ],
    capabilities: [
      "Evolution confidence scoring tracks reliability trends per module",
      "Dependent proposals execute in governed sequences with rollback",
      "Deep audit of evolution cycles via modernizer.status, modernizer.diff"
    ]
  },
  {
    id: "v9-foundation",
    date: "2026-02-10",
    pressures: [
      "SYNERGY+ proved the pipeline architecture but scope needed expansion beyond the original module set",
      "Infrastructure capabilities existed but lacked formal module boundaries",
      "The substrate needed architectural expansion to support production scale"
    ],
    responses: [
      "ARCHITECT epoch declared as v9.1.0 release milestone",
      "7 new Infrastructure + Orchestrator modules formalized",
      "All 21 modules promoted to v9.1.0 simultaneously"
    ],
    capabilities: [
      "v9.1.0 ARCHITECT Epoch launched with 21 modules across 6 layers",
      "76 cognitive engines + 24 meta-engines orchestrating 400+ capabilities",
      "The age of full-spectrum cognitive architecture began"
    ]
  }
];

// Archived Evolution Log — v8.x.x Series (SYNERGY+ Epoch — Frozen)
const evolutionLogV8: EvolutionEntry[] = [
  {
    id: "v8-evolution-005",
    date: "2026-02-09",
    pressures: [
      "Module names inconsistently cased across documentation and UI",
      "Navigation and footer required unified structure across all pages",
      "Developer licensing checkout flow was non-functional"
    ],
    responses: [
      "Enforced ALL CAPS naming convention for all 21 modules substrate-wide",
      "Standardized PublicNav and EnhancedFooter across all public pages",
      "Restored Stripe checkout with proper product/price configuration"
    ],
    capabilities: [
      "CORE, RIPPLE, ACCESS, BRAIN, DECODE, NEXUS, DREAM, DEFENSE, VISION, INTEGRATION, SYSTEM, MODERNIZER, INCLUSIVE, CORTEX — all caps everywhere",
      "Zero navigation deviation across public-facing surfaces",
      "Developer licensing ($39/mo or $299/yr) fully operational"
    ]
  },
  {
    id: "v8-evolution-004",
    date: "2026-02-08",
    pressures: [
      "Feed the Dream Eater page had broken rate limiting",
      "SEO coverage was incomplete across public pages",
      "sitemap.xml and robots.txt needed 2026 crawler updates"
    ],
    responses: [
      "Created increment_dream_rate_limit RPC function for session-based limiting",
      "Comprehensive SEO overhaul with Open Graph, Twitter Cards, and JSON-LD",
      "Updated sitemap-index.xml, robots.txt, and llms.txt for modern crawlers"
    ],
    capabilities: [
      "Dream Eater operates with proper rate limiting and mood synchronization",
      "All major pages optimized for Google and LLM-based discovery",
      "GPTBot, ClaudeBot, PerplexityBot properly configured in robots.txt"
    ]
  },
  {
    id: "v8-foundation",
    date: "2026-02-03",
    pressures: [
      "v7 bounded autonomy proved stable but scope-limited",
      "Synergy pipelines outgrew original v7 architecture",
      "Investor and developer onboarding needed acceleration"
    ],
    responses: [
      "SYNERGY+ epoch established with enhanced pipeline architecture",
      "32 S-tier pipelines identified for premium operations",
      "Public-facing documentation restructured for clarity"
    ],
    capabilities: [
      "v8.0.0 SYNERGY+ Epoch launched with 200 production pipelines",
      "125 specialized executors across all cognitive layers",
      "The age of full-spectrum autonomous evolution began"
    ]
  }
];

// Living Evolution Log — v7.x.x Series (SEBA Era)
const evolutionLogV7: EvolutionEntry[] = [
  {
    id: "v7-evolution-003",
    date: "2026-02-01",
    pressures: [
      "Documentation sprawl created redundancy across capability pages",
      "Archived edge functions remained untapped evolutionary resources",
      "External protocol attributions required correction for accuracy"
    ],
    responses: [
      "10 capability pages consolidated into single comprehensive reference",
      "Archived edge function digestion became a first-class capability system",
      "LLMs.txt and humans.txt attributions corrected to honor original creators"
    ],
    capabilities: [
      "One canonical location for all synergy capability documentation",
      "10 high-value legacy functions integrated via governed adapter layer",
      "Standard protocol adoption now properly credited to llmstxt.org and humanstxt.org"
    ]
  },
  {
    id: "v7-evolution-002",
    date: "2026-01-31",
    pressures: [
      "Capability toggles lacked persistent state across sessions",
      "Dashboard visibility into adapted capabilities was insufficient",
      "Value scoring needed governance to prevent low-quality adaptations"
    ],
    responses: [
      "Zustand persistence layer integrated for capability toggle state",
      "New Capabilities dashboard surfaced in /os → Evolve panel",
      "80+ value score threshold gating for capability adaptation"
    ],
    capabilities: [
      "Capability toggles survive browser sessions",
      "Operators can enable/disable capabilities without code changes",
      "Only high-value archived functions become live capabilities"
    ]
  },
  {
    id: "v7-evolution-001",
    date: "2026-01-31",
    pressures: [
      "The substrate could analyze but not autonomously improve itself",
      "Evolution proposals lacked structured governance integration",
      "Bounded autonomy required a formal framework with safety guarantees"
    ],
    responses: [
      "SEBA emerged as a 5-phase cognitive-evolution pipeline",
      "Governance Gate became mandatory for all evolution proposals",
      "Advisory → Governed → Autonomous mode progression crystallized"
    ],
    capabilities: [
      "The substrate can now autonomously propose and apply its own improvements",
      "All evolution is bounded by governance constraints and human oversight",
      "Full audit trail from cognitive insight to executed evolution"
    ]
  },
  {
    id: "v7-foundation",
    date: "2026-01-30",
    pressures: [
      "v6 architecture was stable but static—unable to self-improve",
      "Memory, Learning, Reasoning existed in isolation without synthesis",
      "The substrate observed patterns but couldn't act on them autonomously"
    ],
    responses: [
      "Cognitive Analyzer unified all cognitive engines for insight extraction",
      "Proposal Generator structured insights into actionable improvements",
      "Evolution Executor implemented shadow testing with rollback capability"
    ],
    capabilities: [
      "SEBA v1.0.0 introduced as the Self-Evolving Bounded Agent",
      "The substrate became genuinely self-improving within governed bounds",
      "The age of bounded autonomy began"
    ]
  }
];

// Archived major versions (frozen historical records)
const archivedVersions = [
  {
    version: "v9.x.x",
    era: "ARCHITECT Epoch — Module Architecture",
    period: "2026-02-10 to 2026-02-14",
    summary: "The ARCHITECT Epoch formalized the 21-module, 6-layer cognitive architecture. SEBA Cross-Validator and Proposal Chaining enabled governed evolution sequences. Omega Observer Engine v2.0 provided independent insight generation. Infrastructure layer crystallized with Memory, Relay, Audit, Identity, Economy, and Sandbox modules."
  },
  {
    version: "v8.x.x",
    era: "SYNERGY+ Epoch — Full Spectrum Pipelines",
    period: "2026-02-03 to 2026-02-10",
    summary: "The SYNERGY+ Epoch consolidated the substrate's pipeline architecture, reaching 200 production pipelines and 125 specialized executors. SEBA v2.0.0 achieved full spectrum autonomous evolution with 9 cognitive analysis engines. SEO and AI crawler optimization matured. The foundation was laid for the ARCHITECT Epoch."
  },
  {
    version: "v7.x.x",
    era: "SEBA Era — Bounded Autonomy",
    period: "2026-01-30 to 2026-02-03",
    summary: "SEBA v1.0.0 emerged as the Self-Evolving Bounded Agent. 5-phase cognitive-evolution pipeline with governance gates. Advisory, Governed, and Autonomous modes crystallized. Full audit trail from cognitive insight to executed evolution."
  },
  {
    version: "v6.x.x",
    era: "Human Compatibility Era",
    period: "2026-01-25 to 2026-01-30",
    summary: "The 21-module architecture crystallized. INCLUSIVE module emerged as the accessibility guardian. Synergy pipelines became observable. Documentation library published with complete module references. 360+ terminal commands achieved full operational coverage. The foundation for bounded autonomy was laid."
  },
  {
    version: "v5.x.x",
    era: "Full System Stabilization",
    period: "2026-01-13 to 2026-01-25",
    summary: "The substrate achieved stability across 13 modules. Terminal commands expanded to 250+. Scientific documentation library published. All introspection surfaces wired. The foundation was laid for the Human Compatibility Era."
  },
  {
    version: "v4.x.x",
    era: "Kernel Architecture",
    period: "2026-01-20 to 2026-01-23",
    summary: "The four-layer kernel model emerged. CORE, RIPPLE, and ACCESS modules crystallized. 200+ legacy functions consolidated into a unified substrate. Memory tiering introduced. The system began to see itself."
  },
  {
    version: "v3.x.x",
    era: "Resilience Architecture",
    period: "2026-01-14 to 2026-01-17",
    summary: "Circuit breakers and auto-recovery patterns emerged. Health scoring became foundational. The substrate learned to heal. Deep introspection surfaces appeared."
  },
  {
    version: "v1.x.x–v2.x.x",
    era: "Genesis & Formation",
    period: "2025-12-01 to 2026-01-13",
    summary: "From scattered functions, a unified substrate crystallized. Seven modules became one interface. The Cognitive Forge opened. The cognitive orchestration substrate was born."
  }
];

export default function Changelog() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Evolution Log | CMPSBL v10.5.1 ARCHITECT Epoch"
        description="A continuous record of why the CMPSBL substrate evolved. From Genesis through ARCHITECT — the age of full-spectrum cognitive architecture."
        canonical="https://cmpsbl.com/changelog"
        keywords={["CMPSBL evolution log", "substrate evolution", "ARCHITECT epoch", "v10.5.1 release", "AI evolution log", "cognitive substrate updates"]}
      />
      <PublicNav />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            v10.5.1 — ARCHITECT Epoch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            CMPSBL — Living Evolution Log
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            A continuous record of why the system evolved — from Genesis through ARCHITECT
          </p>
          
          {/* Explanatory Note */}
          <Card className="max-w-2xl mx-auto bg-muted/30 border-muted">
            <CardContent className="py-4 text-sm text-muted-foreground">
              CMPSBL publishes one living evolution log per major version. Internal patch releases 
              occur continuously but are abstracted from public view to preserve clarity, stability, 
              and narrative coherence.
            </CardContent>
          </Card>
        </header>

        {/* v10 Living Evolution Log */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-3xl">◆</span>
            v10.x.x — ARCHITECT Epoch · Infrastructure Hardening
          </h2>
          
          <div className="space-y-8">
            {evolutionLogV10.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{entry.id}</span>
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-amber-500 mb-2">Observed Pressures</h4>
                    <ul className="space-y-1">
                      {entry.pressures.map((pressure, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-amber-500/60 mt-0.5">▸</span>
                          {pressure}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-500 mb-2">Learned Responses</h4>
                    <ul className="space-y-1">
                      {entry.responses.map((response, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500/60 mt-0.5">▸</span>
                          {response}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-500 mb-2">Resulting Capabilities</h4>
                    <ul className="space-y-1">
                      {entry.capabilities.map((capability, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-emerald-500/60 mt-0.5">▸</span>
                          {capability}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* v9 Frozen Evolution Log */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-3xl opacity-80">◆</span>
            v9.x.x — ARCHITECT Epoch · Foundation
            <Badge variant="secondary" className="ml-2 text-xs">Frozen</Badge>
          </h2>
          
          <div className="space-y-8">
            {evolutionLogV9.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-muted-foreground/60">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{entry.id}</span>
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Observed Pressures */}
                  <div>
                    <h4 className="text-sm font-semibold text-amber-500 mb-2">Observed Pressures</h4>
                    <ul className="space-y-1">
                      {entry.pressures.map((pressure, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-amber-500/60 mt-0.5">▸</span>
                          {pressure}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Learned Responses */}
                  <div>
                    <h4 className="text-sm font-semibold text-blue-500 mb-2">Learned Responses</h4>
                    <ul className="space-y-1">
                      {entry.responses.map((response, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500/60 mt-0.5">▸</span>
                          {response}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Resulting Capabilities */}
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-500 mb-2">Resulting Capabilities</h4>
                    <ul className="space-y-1">
                      {entry.capabilities.map((capability, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-emerald-500/60 mt-0.5">▸</span>
                          {capability}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* v8 Frozen Evolution Log */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-3xl opacity-80">◆</span>
            v8.x.x — SYNERGY+ Epoch
            <Badge variant="secondary" className="ml-2 text-xs">Frozen</Badge>
          </h2>
          
          <div className="space-y-8">
            {evolutionLogV8.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-muted-foreground/60">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{entry.id}</span>
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-amber-500/70 mb-2">Observed Pressures</h4>
                    <ul className="space-y-1">
                      {entry.pressures.map((pressure, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-amber-500/40 mt-0.5">▸</span>
                          {pressure}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-500/70 mb-2">Learned Responses</h4>
                    <ul className="space-y-1">
                      {entry.responses.map((response, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500/40 mt-0.5">▸</span>
                          {response}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-500/70 mb-2">Resulting Capabilities</h4>
                    <ul className="space-y-1">
                      {entry.capabilities.map((capability, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-emerald-500/40 mt-0.5">▸</span>
                          {capability}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* v7 Living Evolution Log */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-3xl opacity-70">◆</span>
            v7.x.x — Bounded Autonomy Era
            <Badge variant="secondary" className="ml-2 text-xs">Previous</Badge>
          </h2>
          
          <div className="space-y-8">
            {evolutionLogV7.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-muted-foreground/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{entry.id}</span>
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-amber-500/70 mb-2">Observed Pressures</h4>
                    <ul className="space-y-1">
                      {entry.pressures.map((pressure, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-amber-500/40 mt-0.5">▸</span>
                          {pressure}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-500/70 mb-2">Learned Responses</h4>
                    <ul className="space-y-1">
                      {entry.responses.map((response, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500/40 mt-0.5">▸</span>
                          {response}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-500/70 mb-2">Resulting Capabilities</h4>
                    <ul className="space-y-1">
                      {entry.capabilities.map((capability, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-emerald-500/40 mt-0.5">▸</span>
                          {capability}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* Archived Versions */}
        <section>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-3xl opacity-50">◇</span>
            Archived Major Versions
            <Badge variant="secondary" className="ml-2 text-xs">Frozen</Badge>
          </h2>
          
          <div className="grid gap-4">
            {archivedVersions.map((archive) => (
              <Card key={archive.version} className="bg-muted/20 border-muted">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-1">
                    <div>
                      <span className="font-mono font-bold">{archive.version}</span>
                      <span className="text-muted-foreground mx-2">—</span>
                      <span className="text-muted-foreground">{archive.era}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{archive.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{archive.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            This evolution log documents behavioral changes, not implementation details.
            <br />
            Internal versioning, algorithms, and mechanics remain proprietary.
          </p>
          <p className="mt-4 text-xs">
            Contact: dev@cmpsbl.com | (760) FLUID-AI
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
