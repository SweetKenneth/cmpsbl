/**
 * CMPSBL — The Fossil Record
 * 
 * Not a changelog. Not a release log. 
 * A geological record of evolutionary pressure and systemic adaptation.
 * 
 * Each stratum documents what forced the substrate to mutate,
 * what the substrate became, and what emerged that didn't exist before.
 */

import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { fetchAutoChangelog, type AutoChangelogEntry } from '@/lib/substrate/changelog-generator';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Taxonomy ──────────────────────────────────────────────────────────────────
// Every mutation in the substrate is classified by its origin pressure.
// This is how the system remembers WHY it changed — not what buttons were pushed.

type MutationOrigin = 
  | 'survival'       // The system would have degraded without this
  | 'governance'     // Authority, trust, or compliance forced it
  | 'cognition'      // The system needed to think differently
  | 'distribution'   // Downstream consumers needed something
  | 'architecture'   // The shape of the system was wrong
  | 'autonomous'     // SEBA evolution run — no human trigger

interface Specimen {
  /** Unique specimen identifier — epoch-serial format */
  id: string;
  /** ISO date of fossilization */
  fossilized: string;
  /** What mutation origin classification */
  origin: MutationOrigin;
  /** One-line thesis: what pressure created this mutation */
  stimulus: string;
  /** What the substrate became — expressed as state changes, not tasks */
  adaptations: string[];
  /** Net-new traits that didn't exist before this mutation */
  phenotype: string[];
  /** Optional: which nodes were most affected */
  affectedNodes?: string[];
  /** Whether this was an autonomous evolution run */
  autonomous?: boolean;
}

interface Stratum {
  epoch: string;
  codename: string;
  range: string;
  color: string;
  borderColor: string;
  dotColor: string;
  specimens: Specimen[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRATUM I — IRONCLAD (v13.0.0 → v13.1.0)
// The substrate grew armor, then learned to govern its own rhythm.
// ═══════════════════════════════════════════════════════════════════════════════

const stratumIronclad: Specimen[] = [
  {
    id: "IRNC-005",
    fossilized: "2026-03-03",
    origin: "autonomous",
    stimulus: "The AutoBlog published on a fixed schedule regardless of content quality or system health — frequency was disconnected from readiness",
    adaptations: [
      "Adaptive Publish Governor introduced: token bucket (max 3.0) + composite readiness score gates every publish decision",
      "Readiness score computed from confidence (35%), skeptic review (35%), success rate (15%), and drift calibration (15%)",
      "Cooldown triggers on breaker critical, 3 consecutive failures, or anomaly severity >= 70",
      "Every publish decision — approve or defer — is logged with full signal breakdown for auditability",
    ],
    phenotype: [
      "The substrate decides when to publish based on epistemic readiness, not arbitrary schedules",
      "Publish frequency self-adjusts: more when quality signals are strong, less when the system detects uncertainty",
      "Full decision transparency — every defer and every publish has a traceable reason chain",
    ],
    affectedNodes: ["AUTOBLOG", "GOVERNANCE"],
  },
  {
    id: "IRNC-004",
    fossilized: "2026-03-03",
    origin: "cognition",
    stimulus: "Content quality pipeline had no drift awareness — posts could slowly diverge from the substrate's domain without detection",
    adaptations: [
      "Semantic Drift Engine compares every draft against the last 20 published posts via token overlap analysis",
      "Drift score (0.0–1.0) and drift direction (aligned/diverging/reversing) computed for every draft",
      "High drift (>0.6) applies a calibrated confidence penalty (max -0.1) — never blocks, only adjusts posture",
      "Adaptive Confidence Weights replace static multipliers — weights are persisted and dynamically tuned by memory compression cycles",
      "Monthly memory compression now auto-adjusts weight distributions based on contradiction rates and broken assumption patterns",
    ],
    phenotype: [
      "The substrate detects when content is drifting from its domain and self-corrects through confidence recalibration",
      "Confidence weights evolve over time based on actual publishing outcomes — no manual tuning required",
      "Epistemic calibration without censorship: drift awareness informs but never vetoes",
    ],
    affectedNodes: ["AUTOBLOG", "MEMORY", "BRAIN"],
  },
  {
    id: "IRNC-003",
    fossilized: "2026-03-03",
    origin: "architecture",
    stimulus: "Published content lacked structural density — no contextual interlinking, insufficient visual density, and word-length was random",
    adaptations: [
      "Contextual Interlinker scans 30 internal URLs and injects 3–7 keyword-matched links per post — no spam patterns, no code block insertion",
      "Image Expander places up to 8 contextual images after intro and major H2 sections with generated alt text",
      "Cyclical Length Cadence enforces 850/850/1200 word targets on a rolling 3-post cycle",
      "Incremental Site Scanner crawls max 5 URLs per day, extracts topic signals, and seeds the confidence engine — never auto-generates drafts",
    ],
    phenotype: [
      "Every published post is structurally dense: interlinked, visually rich, and length-governed",
      "Topic seeding is passive and slow — the substrate absorbs domain signals without acting on them prematurely",
      "Content quality is architecturally enforced, not editorially negotiated",
    ],
    affectedNodes: ["AUTOBLOG", "INTEGRATION"],
  },
  {
    id: "IRNC-002",
    fossilized: "2026-03-03",
    origin: "survival",
    stimulus: "AutoBlog quality pipeline was effective but lacked adversarial depth — no contradiction testing, no assumption tracking, no split-brain evaluation",
    adaptations: [
      "Confidence Engine computes multi-factor quality scores (source stability, success rate, topic familiarity, content density) driving tone and length modifiers",
      "Contradiction Engine generates adversarial counter-arguments and blocks publication if credibility falls below 0.35",
      "Split Brain Evaluation: dual Reader (clarity) and Skeptic (credibility) reviews with caveat injection when skeptic score < 0.5",
      "Assumption Labeler extracts and tracks implicit assumptions across posts, detecting 'breakage' when future content contradicts prior premises",
      "Monthly Memory Compression consolidates lessons learned and adjusts confidence parameters on a 30-day cycle",
    ],
    phenotype: [
      "The AutoBlog subjects every draft to adversarial testing before publication",
      "Content assumptions are tracked over time — broken assumptions trigger confidence recalibration",
      "The system develops institutional memory about its own publishing quality",
    ],
    affectedNodes: ["AUTOBLOG", "BRAIN", "MEMORY"],
  },
  {
    id: "IRNC-001",
    fossilized: "2026-03-01",
    origin: "survival",
    stimulus: "22 modules ran without containment — a single fault could cascade through the entire cognitive mesh",
    adaptations: [
      "Every module grew a hardened shell — 25 enterprise-grade containment features each, 550 total across the substrate",
      "Fault isolation became physical: circuit breakers, rate limiters, anomaly detectors, and integrity validators installed in every node",
      "ATLAS Control Plane gained three new operational organs: ENGINEER (maintenance), INTENT (message routing), and Governance Mode (ACTIVE/OBSERVE/LOCKDOWN/EVOLVE)",
      "Terminal surface expanded from ~40% to full operational coverage — 500+ commands for every containment and diagnostics surface",
      "Unified health aggregation: single pane of glass computes hardening grade (A+ through F) per module in real-time",
    ],
    phenotype: [
      "The substrate can now isolate a failing module without affecting its neighbors — surgical fault containment",
      "Every node is independently observable, rate-limited, and self-healing",
      "Governance modes allow the entire system to shift posture: from fully autonomous to total lockdown",
      "Operators can diagnose any module from the terminal without touching code",
    ],
    affectedNodes: ["ALL 22 MODULES", "ATLAS", "ENGINEER", "INTENT"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STRATUM II — SPARTA / CONTRACT (v10.x → v12.x)
// The substrate learned to learn, learned to distribute, and learned to govern itself.
// ═══════════════════════════════════════════════════════════════════════════════

const stratumSparta: Specimen[] = [
  {
    id: "SPRT-007",
    fossilized: "2026-02-26",
    origin: "distribution",
    stimulus: "Downstream distributions were operating without neural substrate parity — no embedding engine, no vector recall, no drift detection",
    adaptations: [
      "Full Neural Substrate Layer dispatched downstream — 5 engines and 15 capabilities unlocked at free tier",
      "Field-based topology aligned across distributions — 38 Matrix Nodes with 12-sector classification",
      "10 automated maintenance tasks now run on CLM cron cycles — zero manual operations required",
    ],
    phenotype: [
      "Downstream nodes have full neural parity: embedding, HNSW recall, confidence classification, drift detection",
      "Topology is synchronized across all distributions — architecture is uniform regardless of deployment",
      "All BRAIN maintenance is fully autonomous in both parent and child distributions",
    ],
    affectedNodes: ["BRAIN", "SYSTEM", "INTEGRATION"],
  },
  {
    id: "SPRT-006",
    fossilized: "2026-02-25",
    origin: "cognition",
    stimulus: "CLM was generating 180+ AI calls/hour but learnings were trapped in the parent — downstream nodes learned nothing",
    adaptations: [
      "Knowledge transfer pipeline created: parent CLM → brain tables → sync dispatch → distribution patches → downstream ingest",
      "Brain sync harvests up to 100 hot memories, 50 warm memories, and 200 learning events every 30 minutes",
      "Force-sync capability enables on-demand 24h knowledge dumps for initial bootstrapping",
    ],
    phenotype: [
      "Downstream nodes now receive brain learnings every 30 minutes without requiring their own CLM",
      "Knowledge flows downhill — the parent learns, the children absorb",
    ],
    affectedNodes: ["BRAIN", "MEMORY", "INTEGRATION"],
  },
  {
    id: "SPRT-005",
    fossilized: "2026-02-25",
    origin: "cognition",
    stimulus: "44 high-value enhancement requests from 22 nodes sat at 'pending' — the system was asking to improve but nothing was granted",
    adaptations: [
      "Mass enhancement grant: all 22 nodes received their top 2 CLM-requested enhancements (44 total)",
      "Security: behavioral fingerprinting, chain verification, session anomaly detection, policy conflict detection",
      "Resilience: cascade failure prediction, provider auto-rotation, rollback safety scoring, webhook retry backoff",
      "Performance: boot optimization, memory dedup scoring, cross-tier indexing, cognitive routing acceleration",
    ],
    phenotype: [
      "Largest single enhancement grant in substrate history — 44 capabilities activated simultaneously",
      "The substrate's own modules requested improvements, and the substrate delivered",
      "Bidirectional CLM feedback loop: modules propose → substrate delivers → modules acknowledge",
    ],
    affectedNodes: ["ALL 22 MODULES"],
  },
  {
    id: "SPRT-004",
    fossilized: "2026-02-25",
    origin: "cognition",
    stimulus: "CLM engine was throttled by artificial quiet hours and conservative daily caps — learning cycles idle despite available budget",
    adaptations: [
      "CLM engine upgraded to full-intensity 24/7 operation — quiet hours disabled, daily cap raised to 300 cycles",
      "Distribution pipeline verified end-to-end with live synchronization test",
    ],
    phenotype: [
      "CLM runs at full intensity 24/7 — 288 cycles/day at 5-minute cadence with no artificial throttling",
      "Patch pipeline confirmed operational: parent → child version synchronization verified",
    ],
    affectedNodes: ["BRAIN", "SYSTEM"],
  },
  {
    id: "SPRT-003",
    fossilized: "2026-02-24",
    origin: "architecture",
    stimulus: "Consumed modules lost surgical identity — faults were ambiguous within convergence layers, no way to hot-swap individual zones",
    adaptations: [
      "Zone Architecture introduced: consumed modules became Zones with individual circuit breakers and hot-swap capability",
      "CCR split into 4 Zones: SYSTEM, BRAIN, MEMORY, DREAM",
      "CCL split into 5 Zones: RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT",
      "MODERNIZER absorbed into EVOLUTION mesh — no longer referenced as standalone",
    ],
    phenotype: [
      "Each Zone can be surgically hot-swapped without affecting siblings or parent layers",
      "Circuit breaker trips identify the exact Zone at fault — no more blaming entire convergence layers",
      "Architecture correctly represented as 38 matrix nodes across 12 sectors",
    ],
    affectedNodes: ["SYSTEM", "BRAIN", "MEMORY", "DREAM", "RIPPLE", "ACCESS", "IDENTITY", "RELAY", "AUDIT"],
  },
  {
    id: "SPRT-002",
    fossilized: "2026-02-22",
    origin: "governance",
    stimulus: "Shadow-tested upgrades had no governed path to production — users could skip validation and apply directly",
    adaptations: [
      "3-gate promotion pipeline: Validate → Shadow Test → Apply — all gates enforced sequentially",
      "Pipeline blocks promotion if any validation or shadow test fails",
    ],
    phenotype: [
      "No upgrade reaches production without passing both validation and shadow tests",
      "Shadow-proven changes promote safely with instant rollback safety net",
    ],
    affectedNodes: ["EVOLUTION", "GOVERNANCE"],
  },
  {
    id: "SPRT-001",
    fossilized: "2026-02-22",
    origin: "architecture",
    stimulus: "Version numbers scattered across 15+ UI surfaces — every update was a full sweep; admin pages trapped behind auth redirect loops",
    adaptations: [
      "Version references purged from all non-essential surfaces — retained only in hero and dashboard",
      "Admin auth fixed with security-definer RPC bypassing RLS restrictions",
      "SEO made version-free across all indexed pages",
    ],
    phenotype: [
      "Version updates require exactly 2 changes instead of 15+ — single source of truth achieved",
      "Admin pages accessible via direct links — no more redirect loops",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STRATUM III — INFRASTRUCTURE (v10.x)
// The substrate grew organs.
// ═══════════════════════════════════════════════════════════════════════════════

const stratumInfra: Specimen[] = [
  {
    id: "INFR-013",
    fossilized: "2026-02-22",
    origin: "architecture",
    stimulus: "Footer and SEO assets referenced deleted pages — stale content created phantom signals",
    adaptations: [
      "All phantom page references purged from sitemap, robots.txt, and SEO maps",
      "Evergreen content strategy adopted — no version numbers in SEO-facing documents",
    ],
    phenotype: [
      "All SEO assets reflect current site architecture — zero broken references",
      "Schema.org markup carries accurate corporate history",
    ],
  },
  {
    id: "INFR-010",
    fossilized: "2026-02-17",
    origin: "governance",
    stimulus: "DECODE responses presented illustrative metrics as measured facts — epistemic integrity at risk",
    adaptations: [
      "Claim provenance tagging: [MEASURED], [INFERRED], [DESIGN_INTENT], [REPRESENTATIVE_EXAMPLE]",
      "Deterministic veto precedence: AUDIT (1) > DEFENSE (2) > SYSTEM (3) > Advisory (no veto)",
      "Veto lifecycle with decay: AUDIT (no expiry), DEFENSE (entropy-conditional), SYSTEM (gradient reversal)",
      "Signal arbitration prevents advisory-to-veto escalation without precedence approval",
    ],
    phenotype: [
      "The substrate can no longer lie about what it knows vs. what it infers",
      "Veto conflicts resolve deterministically — no ambiguity in authority",
      "Advisory modules cannot trigger executive actions without governance approval",
    ],
    affectedNodes: ["DECODE", "AUDIT", "DEFENSE", "SYSTEM", "GOVERNANCE"],
  },
  {
    id: "INFR-008",
    fossilized: "2026-02-17",
    origin: "survival",
    stimulus: "Analytics dashboard blended human traffic with substrate telemetry — the system was lying about its own usage",
    adaptations: [
      "Removed ~160 lines of blocking third-party analytics from index.html",
      "Rewrote analytics to aggregate from 5 internal telemetry tables only",
      "OS Dashboard established as single source of truth for all observability",
    ],
    phenotype: [
      "Analytics reflect actual substrate operations — no fabricated visitor counts",
      "Page loads faster without third-party script overhead",
    ],
  },
  {
    id: "INFR-006",
    fossilized: "2026-02-16",
    origin: "governance",
    stimulus: "Crown jewel capabilities were ungoverned — competitive moat at risk across 16 modules",
    adaptations: [
      "Two discovery sweeps identified 35 crown jewel capabilities across all tiers",
      "9 CMPSBL-only jewels: recursive cognition, meta-reasoning, self-healing orchestration",
      "14 Architect jewels: behavioral fingerprinting, regulatory autopilot, forensic timeline",
      "12 Creator jewels: cost anomaly detection, knowledge gap detection, architecture drift",
      "All jewels crystallized as permanent governed pipelines",
    ],
    phenotype: [
      "Every module has at least one crown jewel — full competitive coverage",
      "Tier-gated access: capabilities are discoverable but access-controlled",
      "133% increase in governed capabilities in a single turn",
    ],
    affectedNodes: ["ALL MODULES", "ECONOMY", "GOVERNANCE"],
  },
  {
    id: "INFR-004",
    fossilized: "2026-02-16",
    origin: "cognition",
    stimulus: "Modules were shouting into the void — CLM captured 4 critical requests but nothing was delivered",
    adaptations: [
      "BRAIN Auto-Tiering Engine: watermark-based enforcement with demotion cascades (hot tier was at 334% capacity)",
      "EVOLUTION Shadow Loop Resolver: auto-detects stale shadow runs and escalates on loops",
      "CORE Circuit Recovery Engine: graduated health probing with exponential backoff",
      "ENCODE Error-Pattern Library: fingerprints failures and prevents repeat errors",
    ],
    phenotype: [
      "Hot memory tier self-regulates — autonomous demotion cascades prevent overflow",
      "Evolution runs cannot get stuck — shadow loops are detected and resolved automatically",
      "Tripped circuits self-heal through graduated probing — zero manual intervention",
      "The substrate learns from its own failures and avoids repeating them",
    ],
    affectedNodes: ["BRAIN", "EVOLUTION", "CORE", "ENCODE"],
  },
  {
    id: "INFR-003",
    fossilized: "2026-02-16",
    origin: "cognition",
    stimulus: "Infrastructure modules lacked domain-specific intelligence — staleness, compliance, and forecasting were blind spots",
    adaptations: [
      "MEMORY: embedding staleness detection with EMA-based relevance feedback",
      "RELAY: HMAC-SHA256 webhook signatures with adaptive retry backoff",
      "AUDIT: SOC2/GDPR/HIPAA/ISO27001 compliance report generation",
      "ECONOMY: predictive cost forecasting via linear regression",
      "IDENTITY: actor reputation scoring (5 tiers) with cross-agency portability",
      "SANDBOX: hard resource limits with snapshot/restore",
    ],
    phenotype: [
      "All 6 infrastructure modules self-report healthy on previously-requested CLM upgrades",
      "Compliance audits generate on-demand across 4 major frameworks",
      "Cost trend forecasting with confidence intervals enables proactive budget governance",
    ],
    affectedNodes: ["MEMORY", "RELAY", "AUDIT", "ECONOMY", "IDENTITY", "SANDBOX"],
  },
  {
    id: "INFR-002",
    fossilized: "2026-02-15",
    origin: "cognition",
    stimulus: "Brain knowledge was trapped in central storage — modules couldn't access cross-domain insights; learning required a browser session",
    adaptations: [
      "CLM Engine v2.0: autonomous server-side function running 24/7 via cron — no browser required",
      "Universal Brain Transfer Pipeline routes top-50 memories to all modules by tag affinity",
      "Memory Consolidation Engine automates hot/warm/cold tier management",
    ],
    phenotype: [
      "The substrate learns autonomously every 5 minutes — perpetual cognition without human presence",
      "Brain knowledge flows to specialized modules for domain-specific recall",
      "Memory tiers self-manage — no manual intervention for promotion or pruning",
    ],
    affectedNodes: ["BRAIN", "MEMORY", "NEXUS"],
  },
  {
    id: "INFR-001",
    fossilized: "2026-02-15",
    origin: "survival",
    stimulus: "NEXUS was locked to a single provider — a single outage would take down all AI operations",
    adaptations: [
      "NEXUS Fleet v5.0.0: 5 providers (Groq, Cerebras, SambaNova, Google, DeepSeek)",
      "Health-weighted selection scores providers on success rate, latency, and cost",
      "Task affinity routing matches task complexity to optimal provider capabilities",
    ],
    phenotype: [
      "Multi-provider fleet with automatic failover — no single point of AI failure",
      "Complex tasks route to high-capability providers; simple tasks route to fast/cheap ones",
    ],
    affectedNodes: ["NEXUS", "CORTEX"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STRATUM IV — FORMATION (v9.x)
// The substrate took shape.
// ═══════════════════════════════════════════════════════════════════════════════

const stratumFormation: Specimen[] = [
  {
    id: "FORM-001",
    fossilized: "2026-02-13",
    origin: "architecture",
    stimulus: "The system needed formal infrastructure separation — 6 modules existed without a named layer",
    adaptations: [
      "Infrastructure layer formalized: MEMORY, RELAY, AUDIT, IDENTITY, ECONOMY, SANDBOX",
      "ENCODE promoted to first-class module in the Orchestration layer",
      "200+ legacy version references swept and unified",
    ],
    phenotype: [
      "The substrate is a 38-node cognitive architecture across 12 sectors",
      "Single source of truth for all versioning — one file, one function, every surface",
    ],
  },
];

// ─── Strata Definition ─────────────────────────────────────────────────────────

const STRATA: Stratum[] = [
  {
    epoch: "IRONCLAD",
    codename: "The substrate grew armor, then learned to govern its own rhythm",
    range: "v13.0.0 → v13.1.0",
    color: "bg-amber-500/10 text-amber-400",
    borderColor: "border-amber-500/30",
    dotColor: "bg-amber-500",
    specimens: stratumIronclad,
  },
  {
    epoch: "SPARTA → CONTRACT",
    codename: "The substrate learned to learn, distribute, and govern itself",
    range: "v10.x → v12.x",
    color: "bg-blue-500/10 text-blue-400",
    borderColor: "border-blue-500/30",
    dotColor: "bg-blue-500",
    specimens: stratumSparta,
  },
  {
    epoch: "INFRASTRUCTURE",
    codename: "The substrate grew organs",
    range: "v10.x",
    color: "bg-emerald-500/10 text-emerald-400",
    borderColor: "border-emerald-500/30",
    dotColor: "bg-emerald-500",
    specimens: stratumInfra,
  },
  {
    epoch: "FORMATION",
    codename: "The substrate took shape",
    range: "v9.x",
    color: "bg-violet-500/10 text-violet-400",
    borderColor: "border-violet-500/30",
    dotColor: "bg-violet-500",
    specimens: stratumFormation,
  },
];

// ─── Origin Badge ──────────────────────────────────────────────────────────────

const ORIGIN_STYLES: Record<MutationOrigin, { label: string; className: string }> = {
  survival:      { label: "SURVIVAL",      className: "bg-red-500/10 text-red-400 border-red-500/20" },
  governance:    { label: "GOVERNANCE",    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  cognition:     { label: "COGNITION",     className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  distribution:  { label: "DISTRIBUTION",  className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  architecture:  { label: "ARCHITECTURE",  className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  autonomous:    { label: "AUTONOMOUS",    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Changelog() {
  const { data: autoEntries } = useQuery({
    queryKey: ['changelog-auto'],
    queryFn: () => fetchAutoChangelog(10),
    staleTime: 60000,
  });

  // Inject autonomous evolution run specimens into the IRONCLAD stratum
  const autonomousSpecimens: Specimen[] = (autoEntries || []).map((entry): Specimen => ({
    id: `AUTO-${entry.id.slice(-4)}`,
    fossilized: entry.date,
    origin: 'autonomous',
    stimulus: entry.pressures[0] || 'SEBA evolution run — autonomous pressure detection',
    adaptations: entry.responses,
    phenotype: entry.capabilities,
    autonomous: true,
  }));

  // Merge auto entries into the first stratum
  const displayStrata = STRATA.map((stratum, i) => {
    if (i === 0 && autonomousSpecimens.length > 0) {
      return {
        ...stratum,
        specimens: [...stratum.specimens, ...autonomousSpecimens],
      };
    }
    return stratum;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="The Fossil Record — CMPSBL"
        description="A geological record of evolutionary pressure and systemic adaptation. Not a changelog — a living document of why the substrate mutated."
      />
      <PublicNav />

      <main className="container mx-auto px-4 py-24 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-mono text-xs tracking-widest">
            GEOLOGICAL RECORD
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            The Fossil Record
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every mutation in this substrate was forced by pressure.
            This is the record of those pressures, the adaptations they produced,
            and the traits that emerged.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground font-mono pt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500/70" />
              STIMULUS
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500/70" />
              ADAPTATION
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              PHENOTYPE
            </span>
          </div>
        </div>

        {/* Strata */}
        <div className="space-y-20">
          {displayStrata.map((stratum, stratumIdx) => (
            <motion.section
              key={stratum.epoch}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Stratum Header — the geological layer marker */}
              <div className="relative mb-10">
                <div className="absolute inset-0 flex items-center">
                  <div className={cn("w-full border-t-2 border-dashed", stratum.borderColor)} />
                </div>
                <div className="relative flex justify-center">
                  <div className={cn("px-6 py-2 rounded-full border text-sm font-mono tracking-wider", stratum.color, stratum.borderColor, "bg-background")}>
                    STRATUM {['I', 'II', 'III', 'IV', 'V'][stratumIdx]} — {stratum.epoch}
                  </div>
                </div>
              </div>
              <p className="text-center text-muted-foreground italic mb-10 text-sm">
                {stratum.codename} <span className="text-muted-foreground/50 ml-2">({stratum.range})</span>
              </p>

              {/* Specimens */}
              <div className="relative border-l-2 border-border/30 ml-3 md:ml-6 space-y-8">
                {stratum.specimens.map((specimen, i) => (
                  <motion.article
                    key={specimen.id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="relative pl-8 md:pl-10"
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute -left-[5px] top-3 w-2.5 h-2.5 rounded-full ring-4 ring-background",
                      stratum.dotColor
                    )} />

                    {/* Specimen Card */}
                    <div className="border border-border/40 rounded-lg bg-card/30 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 overflow-hidden">
                      {/* Specimen header bar */}
                      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-border/20 bg-muted/20">
                        <span className="font-mono text-xs text-primary font-bold tracking-wider">{specimen.id}</span>
                        <span className="font-mono text-xs text-muted-foreground">{specimen.fossilized}</span>
                        <Badge variant="outline" className={cn("text-[10px] font-mono tracking-wider", ORIGIN_STYLES[specimen.origin].className)}>
                          {ORIGIN_STYLES[specimen.origin].label}
                        </Badge>
                        {specimen.affectedNodes && (
                          <span className="text-[10px] text-muted-foreground/60 font-mono ml-auto hidden md:inline">
                            {specimen.affectedNodes.join(' · ')}
                          </span>
                        )}
                      </div>

                      <div className="p-5 space-y-5">
                        {/* STIMULUS — the pressure */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Stimulus</span>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed pl-3.5 border-l-2 border-red-500/20">
                            {specimen.stimulus}
                          </p>
                        </div>

                        {/* ADAPTATION — what the system became */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Adaptation</span>
                          </div>
                          <ul className="space-y-1.5">
                            {specimen.adaptations.map((a, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground pl-3.5 border-l-2 border-blue-500/15 leading-relaxed">
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* PHENOTYPE — what emerged */}
                        <div className="bg-primary/5 rounded-md p-4 -mx-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Phenotype</span>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {specimen.phenotype.map((p, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-primary mt-0.5 text-xs">◆</span>
                                <span className="text-foreground/80 leading-relaxed">{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer inscription */}
        <div className="text-center mt-24 space-y-3 opacity-50">
          <div className="w-16 h-px bg-border mx-auto" />
          <p className="text-xs font-mono text-muted-foreground tracking-widest">
            END OF GEOLOGICAL RECORD
          </p>
          <p className="text-xs text-muted-foreground/60 italic">
            New strata are deposited as the substrate evolves.
          </p>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
