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
    stimulus: "Publishing cadence was disconnected from content readiness — the system published on schedule regardless of quality signals",
    adaptations: [
      "Introduced an adaptive publish governor that gates every publish decision on a composite readiness assessment",
      "The substrate now evaluates content confidence, review quality, and historical success before approving publication",
      "Cooldown periods activate automatically when the system detects degraded conditions",
      "Every publish decision — approve or defer — is logged with a traceable reason chain",
    ],
    phenotype: [
      "The substrate decides when to publish based on epistemic readiness, not arbitrary schedules",
      "Publish frequency self-adjusts: more when quality is strong, less when the system detects uncertainty",
      "Full decision transparency — every defer and every publish has an auditable rationale",
    ],
    affectedNodes: ["AUTOBLOG", "GOVERNANCE"],
  },
  {
    id: "IRNC-004",
    fossilized: "2026-03-03",
    origin: "cognition",
    stimulus: "Content quality pipeline had no drift awareness — posts could slowly diverge from the substrate's domain without detection",
    adaptations: [
      "Introduced a semantic drift engine that compares every draft against recent published content for topical coherence",
      "Drift scoring and directional analysis applied to every draft before publication",
      "High-drift content receives calibrated confidence adjustments — the system informs but never censors",
      "Confidence parameters now evolve dynamically based on actual publishing outcomes over time",
    ],
    phenotype: [
      "The substrate detects when content is drifting from its domain and self-corrects through confidence recalibration",
      "Quality parameters evolve over time based on real outcomes — no manual tuning required",
      "Epistemic calibration without censorship: drift awareness informs but never vetoes",
    ],
    affectedNodes: ["AUTOBLOG", "MEMORY", "BRAIN"],
  },
  {
    id: "IRNC-003",
    fossilized: "2026-03-03",
    origin: "architecture",
    stimulus: "Published content lacked structural density — no contextual interlinking, insufficient visual richness, and inconsistent length",
    adaptations: [
      "Contextual interlinking now weaves relevant internal references into every published post",
      "Visual density improved with contextual image placement and generated descriptions",
      "Content length follows a governed cadence to maintain reader engagement across posts",
      "Passive topic scanning absorbs domain signals without premature action",
    ],
    phenotype: [
      "Every published post is structurally dense: interlinked, visually rich, and length-governed",
      "Topic discovery is slow and deliberate — the substrate absorbs before it acts",
      "Content quality is architecturally enforced, not editorially negotiated",
    ],
    affectedNodes: ["AUTOBLOG", "INTEGRATION"],
  },
  {
    id: "IRNC-002",
    fossilized: "2026-03-03",
    origin: "survival",
    stimulus: "Content quality pipeline was effective but lacked adversarial depth — no contradiction testing or assumption tracking",
    adaptations: [
      "Multi-factor confidence scoring now drives tone and depth modifiers for every draft",
      "Adversarial contradiction testing challenges content credibility before publication",
      "Dual-perspective review evaluates both reader clarity and skeptic credibility",
      "Assumption tracking monitors implicit claims across posts, detecting when future content contradicts prior premises",
      "Periodic memory compression consolidates lessons learned and adjusts confidence posture",
    ],
    phenotype: [
      "The substrate subjects every draft to adversarial testing before publication",
      "Content assumptions are tracked over time — broken assumptions trigger recalibration",
      "The system develops institutional memory about its own publishing quality",
    ],
    affectedNodes: ["AUTOBLOG", "BRAIN", "MEMORY"],
  },
  {
    id: "IRNC-001",
    fossilized: "2026-03-01",
    origin: "survival",
    stimulus: "Modules ran without containment — a single fault could cascade through the entire cognitive mesh",
    adaptations: [
      "Every module grew a hardened containment shell with enterprise-grade fault isolation",
      "Circuit breakers, rate limiters, anomaly detectors, and integrity validators installed across all nodes",
      "The control plane gained new operational capabilities for maintenance, message routing, and governance mode switching",
      "Terminal surface expanded to full operational coverage for diagnostics and containment",
      "Unified health aggregation provides a single-pane view of system integrity",
    ],
    phenotype: [
      "The substrate can isolate a failing module without affecting its neighbors — surgical fault containment",
      "Every node is independently observable, rate-limited, and self-healing",
      "Governance modes allow the entire system to shift posture: from fully autonomous to total lockdown",
      "Operators can diagnose any module from the terminal without touching code",
    ],
    affectedNodes: ["ALL MODULES"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STRATUM II — SPARTA / CONTRACT
// The substrate learned to learn, learned to distribute, and learned to govern itself.
// ═══════════════════════════════════════════════════════════════════════════════

const stratumSparta: Specimen[] = [
  {
    id: "SPRT-007",
    fossilized: "2026-02-26",
    origin: "distribution",
    stimulus: "Downstream distributions lacked neural parity — no embedding engine, no vector recall, no drift detection",
    adaptations: [
      "Full neural substrate layer dispatched to downstream distributions with core capabilities unlocked",
      "Topology aligned across all distributions for architectural uniformity",
      "Automated maintenance tasks now run on scheduled cycles — zero manual operations required",
    ],
    phenotype: [
      "Downstream nodes have full neural parity: embedding, recall, confidence classification, and drift detection",
      "Architecture is uniform regardless of deployment location",
      "All cognitive maintenance is fully autonomous across distributions",
    ],
    affectedNodes: ["BRAIN", "SYSTEM", "INTEGRATION"],
  },
  {
    id: "SPRT-006",
    fossilized: "2026-02-25",
    origin: "cognition",
    stimulus: "The substrate was generating significant learning volume but downstream nodes couldn't access any of it",
    adaptations: [
      "Knowledge transfer pipeline created: the parent learns, downstream nodes receive synthesized learnings automatically",
      "Periodic brain sync harvests high-value memories and distributes them to child nodes",
      "On-demand knowledge dumps available for initial bootstrapping of new nodes",
    ],
    phenotype: [
      "Downstream nodes receive brain learnings automatically without running their own learning cycles",
      "Knowledge flows downhill — the parent learns, the children absorb",
    ],
    affectedNodes: ["BRAIN", "MEMORY", "INTEGRATION"],
  },
  {
    id: "SPRT-005",
    fossilized: "2026-02-25",
    origin: "cognition",
    stimulus: "Dozens of high-value enhancement requests from modules sat at 'pending' — the system was asking to improve but nothing was granted",
    adaptations: [
      "Mass enhancement grant: all modules received their top requested improvements simultaneously",
      "Security capabilities strengthened across behavioral analysis, verification, and anomaly detection",
      "Resilience capabilities improved with predictive failure analysis and automated recovery patterns",
      "Performance capabilities enhanced with boot optimization, memory management, and routing acceleration",
    ],
    phenotype: [
      "Largest single enhancement grant in substrate history — capabilities activated simultaneously across all modules",
      "The substrate's own modules requested improvements, and the substrate delivered",
      "Bidirectional feedback loop: modules propose → substrate delivers → modules acknowledge",
    ],
    affectedNodes: ["ALL MODULES"],
  },
  {
    id: "SPRT-004",
    fossilized: "2026-02-25",
    origin: "cognition",
    stimulus: "Learning engine was throttled by artificial limits — cognition cycles sat idle despite available capacity",
    adaptations: [
      "Learning engine upgraded to full-intensity continuous operation — artificial throttling removed",
      "Distribution pipeline verified end-to-end with live synchronization",
    ],
    phenotype: [
      "Continuous learning runs at full intensity with no artificial throttling",
      "Version synchronization confirmed operational across all distribution nodes",
    ],
    affectedNodes: ["BRAIN", "SYSTEM"],
  },
  {
    id: "SPRT-003",
    fossilized: "2026-02-24",
    origin: "architecture",
    stimulus: "Consumed modules lost individual identity — faults were ambiguous within convergence layers, no way to hot-swap individual zones",
    adaptations: [
      "Zone architecture introduced: consumed modules became individually addressable zones with independent fault isolation",
      "Convergence layers split into clearly delineated zones with individual circuit breakers",
      "Hot-swap capability enabled for surgical zone replacement without affecting siblings",
    ],
    phenotype: [
      "Each zone can be surgically hot-swapped without affecting siblings or parent layers",
      "Fault isolation identifies the exact zone at fault — no more blaming entire layers",
      "Architecture correctly reflects a multi-node cognitive mesh across defined sectors",
    ],
    affectedNodes: ["SYSTEM", "BRAIN", "MEMORY", "DREAM"],
  },
  {
    id: "SPRT-002",
    fossilized: "2026-02-22",
    origin: "governance",
    stimulus: "Upgrades had no governed path to production — users could skip validation and apply directly",
    adaptations: [
      "Multi-gate promotion pipeline: validation → shadow testing → application — all gates enforced sequentially",
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
    stimulus: "Version references scattered across many surfaces — every update required a full sweep; admin access had redirect issues",
    adaptations: [
      "Version references consolidated to a single source of truth",
      "Admin authentication fixed with proper access controls",
      "SEO made version-free across all indexed pages",
    ],
    phenotype: [
      "Version updates require minimal changes — single source of truth achieved",
      "Admin pages accessible without redirect issues",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STRATUM III — INFRASTRUCTURE
// The substrate grew organs.
// ═══════════════════════════════════════════════════════════════════════════════

const stratumInfra: Specimen[] = [
  {
    id: "INFR-013",
    fossilized: "2026-02-22",
    origin: "architecture",
    stimulus: "SEO assets referenced deleted pages — stale content created phantom signals",
    adaptations: [
      "All phantom page references purged from SEO assets",
      "Evergreen content strategy adopted for all public-facing documents",
    ],
    phenotype: [
      "All SEO assets reflect current site architecture — zero broken references",
      "Structured data carries accurate information",
    ],
  },
  {
    id: "INFR-010",
    fossilized: "2026-02-17",
    origin: "governance",
    stimulus: "Responses sometimes presented illustrative examples as measured facts — epistemic integrity needed strengthening",
    adaptations: [
      "Claim provenance tagging introduced: the system now labels what is measured vs. what is inferred or illustrative",
      "Deterministic authority precedence ensures governance decisions resolve without ambiguity",
      "Advisory modules cannot trigger executive actions without governance approval",
    ],
    phenotype: [
      "The substrate can no longer conflate what it knows with what it infers",
      "Authority conflicts resolve deterministically — no ambiguity in governance decisions",
      "Advisory capabilities are bounded — they inform but cannot act unilaterally",
    ],
    affectedNodes: ["DECODE", "GOVERNANCE"],
  },
  {
    id: "INFR-008",
    fossilized: "2026-02-17",
    origin: "survival",
    stimulus: "Analytics dashboard blended external traffic with internal telemetry — the system was misreporting its own usage",
    adaptations: [
      "Third-party analytics removed — all observability now sources from internal telemetry only",
      "Dashboard established as single source of truth for all system metrics",
    ],
    phenotype: [
      "Analytics reflect actual substrate operations — no fabricated or blended metrics",
      "Page performance improved without third-party overhead",
    ],
  },
  {
    id: "INFR-006",
    fossilized: "2026-02-16",
    origin: "governance",
    stimulus: "High-value capabilities were ungoverned — competitive moat at risk across modules",
    adaptations: [
      "Comprehensive capability audit identified and classified crown jewel capabilities across all tiers",
      "All high-value capabilities crystallized as permanently governed resources",
      "Tier-gated access ensures capabilities are discoverable but access-controlled",
    ],
    phenotype: [
      "Every module has governed crown jewel capabilities — full competitive coverage",
      "Capabilities are tiered: discoverable by all, accessible by entitlement",
      "Significant increase in governed capabilities in a single cycle",
    ],
    affectedNodes: ["ALL MODULES", "GOVERNANCE"],
  },
  {
    id: "INFR-004",
    fossilized: "2026-02-16",
    origin: "cognition",
    stimulus: "Modules were requesting improvements through internal learning but nothing was being delivered",
    adaptations: [
      "BRAIN improved its memory tier management with autonomous capacity governance",
      "EVOLUTION gained the ability to detect and resolve stalled improvement cycles",
      "CORE improved its circuit recovery with graduated self-healing",
      "ENCODE learned to fingerprint failure patterns and prevent repeat errors",
    ],
    phenotype: [
      "Memory tiers self-regulate — the BRAIN manages its own capacity autonomously",
      "Evolution cycles cannot get stuck — stalled runs are detected and resolved automatically",
      "Tripped circuits self-heal — zero manual intervention required",
      "The substrate learns from its own failures and avoids repeating them",
    ],
    affectedNodes: ["BRAIN", "EVOLUTION", "CORE", "ENCODE"],
  },
  {
    id: "INFR-003",
    fossilized: "2026-02-16",
    origin: "cognition",
    stimulus: "Infrastructure modules lacked domain-specific intelligence — key operational blind spots existed",
    adaptations: [
      "MEMORY improved its ability to detect and manage stale knowledge",
      "RELAY strengthened its webhook delivery with secure signatures and adaptive retry",
      "AUDIT gained compliance report generation across major governance frameworks",
      "ECONOMY developed predictive cost forecasting capabilities",
      "IDENTITY introduced reputation scoring with cross-context portability",
      "SANDBOX enforced hard resource boundaries with state preservation",
    ],
    phenotype: [
      "All infrastructure modules now self-report healthy on previously-requested improvements",
      "Compliance audits generate on-demand across multiple governance frameworks",
      "Cost trend forecasting enables proactive budget governance",
    ],
    affectedNodes: ["MEMORY", "RELAY", "AUDIT", "ECONOMY", "IDENTITY", "SANDBOX"],
  },
  {
    id: "INFR-002",
    fossilized: "2026-02-15",
    origin: "cognition",
    stimulus: "Brain knowledge was trapped in central storage — modules couldn't access cross-domain insights, and learning required active sessions",
    adaptations: [
      "Continuous learning engine now runs autonomously — no active session required",
      "Knowledge transfer pipeline routes high-value learnings to specialized modules",
      "Memory tier management automated across all storage layers",
    ],
    phenotype: [
      "The substrate learns autonomously and continuously — perpetual cognition without human presence",
      "Brain knowledge flows to specialized modules for domain-specific recall",
      "Memory tiers self-manage — no manual intervention for promotion or pruning",
    ],
    affectedNodes: ["BRAIN", "MEMORY", "NEXUS"],
  },
  {
    id: "INFR-001",
    fossilized: "2026-02-15",
    origin: "survival",
    stimulus: "AI operations depended on a single provider — a single outage would take down all cognitive functions",
    adaptations: [
      "Multi-provider fleet established with health-weighted provider selection",
      "Task affinity routing matches task complexity to optimal provider capabilities",
      "Automatic failover ensures continuity during provider outages",
    ],
    phenotype: [
      "Multi-provider fleet with automatic failover — no single point of AI failure",
      "Complex tasks route to high-capability providers; simple tasks route to efficient ones",
    ],
    affectedNodes: ["NEXUS", "CORTEX"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STRATUM IV — FORMATION
// The substrate took shape.
// ═══════════════════════════════════════════════════════════════════════════════

const stratumFormation: Specimen[] = [
  {
    id: "FORM-001",
    fossilized: "2026-02-13",
    origin: "architecture",
    stimulus: "The system needed formal infrastructure separation — modules existed without a named organizational layer",
    adaptations: [
      "Infrastructure layer formalized with dedicated modules for memory, messaging, auditing, identity, economics, and sandboxing",
      "Orchestration layer gained a dedicated encoding module",
      "Legacy version references consolidated and unified",
    ],
    phenotype: [
      "The substrate is a multi-node cognitive architecture organized across defined sectors",
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
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight">
            The Fossil Record
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
