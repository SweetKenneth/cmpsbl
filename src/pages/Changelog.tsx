/**
 * CMPSBL — The Evolution Log
 * 
 * A chronological record of platform changes and improvements.
 * Each entry documents what changed, why it changed, and what emerged.
 */

import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { fetchAutoChangelog, type AutoChangelogEntry } from '@/lib/substrate/changelog-generator';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Taxonomy ──────────────────────────────────────────────────────────────────
// Every change is classified by what motivated it.
// This is how the system tracks WHY things changed — not just what changed.

type MutationOrigin = 
  | 'survival'       // The system would have degraded without this
  | 'governance'     // Authority, trust, or compliance forced it
  | 'cognition'      // The system needed to think differently
  | 'distribution'   // Downstream consumers needed something
  | 'architecture'   // The shape of the system was wrong
  | 'autonomous'     // Automated evolution run — no human trigger

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
// EPOCH I — IRONCLAD
// The platform grew armor, then learned to govern its own rhythm.
// ═══════════════════════════════════════════════════════════════════════════════

const stratumIronclad: Specimen[] = [
  {
    id: "IRNC-016",
    fossilized: "2026-03-12",
    origin: "survival",
    stimulus: "Telemetry write volume and memory scan overhead were creating unnecessary database pressure — the substrate needed to become quieter without losing awareness",
    adaptations: [
      "Telemetry emitters gained temporal deduplication — repeated signals within a window are absorbed, while critical events always persist immediately",
      "Mesh broadcast persistence reduced by 80% through probabilistic sampling, preserving full in-memory routing fidelity",
      "Analytics events are now buffered client-side and flushed in batches, replacing per-event persistence",
      "Memory duplicate detection replaced pairwise scanning with fingerprint-bucketed grouping, collapsing scan complexity from quadratic to linear",
      "DOM health measurements are cached with a time-to-live window, eliminating repeated full-tree traversals during observation cycles",
      "Six targeted database indexes added across high-traffic communication and memory tables for faster query paths",
    ],
    phenotype: [
      "The substrate writes less but knows just as much — observation is decoupled from persistence",
      "Memory self-maintenance scales linearly regardless of tier size",
      "Infrastructure queries that previously scanned full tables now resolve through indexed lookups",
    ],
    affectedNodes: ["SYSTEM Organ", "BRAIN Organ", "MEMORY Organ", "OBSERVER Agent"],
  },
  {
    id: "IRNC-015",
    fossilized: "2026-03-06",
    origin: "architecture",
    stimulus: "Subpages lacked cohesive visual polish — interactions felt flat, navigation lacked animated feedback, and sections blended together without rhythm",
    adaptations: [
      "Animated tab underlines with spring-physics layout transitions replaced static border indicators across authenticated surfaces",
      "Documentation sidebar gained a bordered card container with an animated active-state pill that slides between items",
      "Status page module cards respond to hover with icon color shifts and border transitions; uptime bars gained hover-scale and glow effects",
      "Fossil Record specimen cards elevated to rounded-xl with deeper hover shadows; section dividers added for visual rhythm",
      "Upgrade page baseline highlights gained icon containers, shimmer-on-hover, and card-lift effects; enterprise CTA received shadow depth",
      "Loading states replaced plain text pulses with spinning ring animations for better perceived performance",
      "CTA sections across Documentation and Upgrade gained ambient glow orbs and primary-shadow button interactions",
    ],
    phenotype: [
      "Every interactive surface provides animated feedback — tabs slide, cards lift, icons shift color on engagement",
      "Visual rhythm is consistent across all subpages through section dividers, accent gradients, and shimmer effects",
      "The substrate's public surface feels like a living system with depth, not a static documentation site",
    ],
    affectedNodes: ["SYSTEM Organ"],
  },
  {
    id: "IRNC-014",
    fossilized: "2026-03-06",
    origin: "architecture",
    stimulus: "Foundry mining, inventory, and tier legend surfaces lacked the visual density and micro-interactions present on other substrate pages",
    adaptations: [
      "Foundry mining panel crystallize button gained a pulsing glow animation and shimmer sweep on hover",
      "Mining result cards and inventory items received hover-lift effects with primary-glow shadows",
      "Empty inventory state redesigned with a themed icon card and refined typography hierarchy",
      "Tier legend badges gained backdrop-blur and hover-scale transitions within an improved grid layout",
      "Foundry stats cards rebuilt with glass-morphism, top accent gradients, and spring-based entrance animations",
    ],
    phenotype: [
      "The Foundry surface matches the visual fidelity of the rest of the substrate — glass, glow, and lift effects throughout",
      "Empty states are informative and visually engaging rather than generic placeholder text",
      "Crystallization feels like a premium interaction with deliberate animation feedback",
    ],
    affectedNodes: ["SYSTEM Organ"],
  },
  {
    id: "IRNC-013",
    fossilized: "2026-03-06",
    origin: "architecture",
    stimulus: "The NotFound page directed users to System Status instead of actionable onboarding paths, and buttons lacked visual hierarchy",
    adaptations: [
      "Primary Home button elevated with shadow-glow and scale interactions to establish clear visual hierarchy",
      "Start Here guide replaced System Status as a recovery destination for better user wayfinding",
      "All NotFound buttons gained hover border transitions for consistent interaction feedback",
    ],
    phenotype: [
      "Lost users are guided toward productive paths — onboarding and the Memory Stream — rather than diagnostic pages",
      "Button hierarchy communicates the most important action through visual weight",
    ],
    affectedNodes: ["SYSTEM Organ"],
  },
  {
    id: "IRNC-012",
    fossilized: "2026-03-05",
    origin: "survival",
    stimulus: "Hot memory tier reached 98,000+ entries against a 500 limit — the BRAIN was severely overloaded and self-maintenance had silently stopped functioning",
    adaptations: [
      "Introduced database-level bulk demotion operations that move thousands of memories per second instead of one at a time",
      "Full cascade enforcement: hot → warm → cold → pruned → expired, all governed by capacity limits",
      "Auto-tiering scheduler now starts with the neural substrate and enforces every 15 minutes automatically",
      "Emergency demotion mode activates when any tier exceeds 2x its capacity limit",
    ],
    phenotype: [
      "The BRAIN maintains itself — tier capacity is enforced automatically without manual intervention",
      "Bulk operations at the database level replaced row-by-row processing, reducing cleanup time from hours to seconds",
      "Memory pressure is self-regulating: the system detects overload severity and escalates enforcement accordingly",
    ],
    affectedNodes: ["BRAIN Organ", "MEMORY Organ", "SYSTEM Organ"],
  },
  {
    id: "IRNC-011",
    fossilized: "2026-03-05",
    origin: "governance",
    stimulus: "The public changelog was exposing internal weights, algorithmic details, and provider names — trade secrets were visible to anyone reading the Fossil Record",
    adaptations: [
      "All technical specifics replaced with abstract, narrative-driven terminology focused on cognitive evolution",
      "Version numbers replaced with epoch-based nomenclature across all public-facing surfaces",
      "Provider names, internal thresholds, and scoring formulas fully redacted from public view",
    ],
    phenotype: [
      "The Fossil Record communicates what the substrate became, not how it works internally",
      "Competitive moat protected — architectural trade secrets no longer leak through public documentation",
      "Epoch-based language creates a more compelling evolutionary narrative for external audiences",
    ],
    affectedNodes: ["GOVERNANCE Layer", "AUTOBLOG"],
  },
  {
    id: "IRNC-010",
    fossilized: "2026-03-05",
    origin: "architecture",
    stimulus: "The public-facing site lacked visual refinement — micro-interactions were sparse and the design language felt generic",
    adaptations: [
      "Introduced premium CSS utility classes for glass-edge effects, code glows, animated underlines, and staggered entrance animations",
      "Enhanced depth and dimension across all homepage sections with gradient accents, memory-stream borders, and hover transforms",
      "Cinematic final CTA with layered glow orbs, pulsing ring animations, and expanded typography",
      "Footer and layout refined with ambient depth textures and gradient fades",
    ],
    phenotype: [
      "Every homepage section has deliberate micro-interactions that reward engagement",
      "Visual language is consistent and premium — glass, glow, and gradient accents create a unified aesthetic",
      "The site feels like a living system, not a static page",
    ],
    affectedNodes: ["SYSTEM Organ"],
  },
  {
    id: "IRNC-009",
    fossilized: "2026-03-04",
    origin: "cognition",
    stimulus: "Node-level dreaming operated without cross-primitive synthesis — each primitive dreamed in isolation, missing patterns that span multiple nodes",
    adaptations: [
      "Synapse engine introduced to facilitate lateral insight sharing between dreaming nodes",
      "Generation-capped synthesis prevents semantic drift from compounding across dream cycles",
      "Selective memory replay promotes high-value warm memories back to hot tier during dream cycles",
      "Contradiction budgeting limits corrective writes to prevent oscillation",
    ],
    phenotype: [
      "Nodes share insights laterally — a pattern discovered in MEMORY can strengthen BRAIN heuristics",
      "Semantic drift is bounded: raw observations are weighted heavily over derived abstractions",
      "The substrate's dreaming is collaborative, not siloed",
    ],
    affectedNodes: ["BRAIN Organ", "MEMORY Organ", "DREAM Engine"],
  },
  {
    id: "IRNC-008",
    fossilized: "2026-03-04",
    origin: "survival",
    stimulus: "Core runtime algorithms lacked formal integrity scoring — health was approximated rather than measured across defined dimensions",
    adaptations: [
      "Three-lane integrity scoring introduced: availability, correctness, and performance assessed independently",
      "SLO-based health grading with uptime, error rate, and latency percentile tracking",
      "Mean time to recovery tracking enables the substrate to measure its own healing speed",
      "Anchored audit chains with typed receipts provide tamper-evident history",
    ],
    phenotype: [
      "System health is measured across three independent dimensions, not a single blended score",
      "The substrate knows how fast it heals — and optimizes recovery strategies based on MTTR",
      "Every state change is anchored in a tamper-evident chain that survives restarts",
    ],
    affectedNodes: ["CORE Organ", "AUDIT Organ", "SYSTEM Organ"],
  },
  {
    id: "IRNC-007",
    fossilized: "2026-03-03",
    origin: "architecture",
    stimulus: "Self-repair operated reactively — the system waited for failures before attempting recovery, with no structured audit-repair cycle",
    adaptations: [
      "Centralized audit-repair engine performs parallelized health checks across six subsystems simultaneously",
      "Structured repair cycle: audit → identify → repair → re-audit with actionable recovery summaries",
      "Terminal commands provide direct access to audit, repair, and fix operations for operational transparency",
    ],
    phenotype: [
      "The substrate audits itself proactively and repairs degradations before they cascade",
      "Recovery is structured and repeatable — not ad-hoc patching",
      "Operators receive clear summaries of what was broken, what was fixed, and current stability",
    ],
    affectedNodes: ["SYSTEM Organ", "CORE Organ", "MEDIC Engine"],
  },
  {
    id: "IRNC-006",
    fossilized: "2026-03-03",
    origin: "survival",
    stimulus: "Resource consumption had no formal bounds — memory caches, trace stores, and rate limiters could grow without limit under sustained load",
    adaptations: [
      "Strict capacity bounds enforced across all in-memory structures: contexts, traces, tenants, and usage meters",
      "FIFO and LRU eviction policies prevent unbounded growth regardless of load profile",
      "Rate limiting thresholds bounded within absolute safety margins with mandatory cooldown periods",
    ],
    phenotype: [
      "The substrate cannot exhaust its own resources — every structure has a hard ceiling",
      "Load spikes are absorbed gracefully: old data evicts before new data is rejected",
      "Safety caps are structural, not configurable — they cannot be accidentally removed",
    ],
    affectedNodes: ["CORE Organ", "DEFENSE Layer", "SYSTEM Organ"],
  },
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
    affectedNodes: ["AUTOBLOG", "GOVERNANCE Layer"],
  },
  {
    id: "IRNC-004",
    fossilized: "2026-03-03",
    origin: "cognition",
    stimulus: "Content quality chain had no drift awareness — posts could slowly diverge from the substrate's domain without detection",
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
    affectedNodes: ["AUTOBLOG", "MEMORY Organ", "BRAIN Organ"],
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
    affectedNodes: ["AUTOBLOG", "INTEGRATION Organ"],
  },
  {
    id: "IRNC-002",
    fossilized: "2026-03-03",
    origin: "survival",
    stimulus: "Content quality chain was effective but lacked adversarial depth — no contradiction testing or assumption tracking",
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
    affectedNodes: ["AUTOBLOG", "BRAIN Organ", "MEMORY Organ"],
  },
  {
    id: "IRNC-001",
    fossilized: "2026-03-01",
    origin: "survival",
    stimulus: "Nodes ran without containment — a single fault could cascade through the entire cognitive mesh",
    adaptations: [
      "Every node grew a hardened containment shell with enterprise-grade fault isolation",
      "Safety switches, rate limiters, anomaly detectors, and integrity validators installed across all nodes",
      "The control plane gained new operational capabilities for maintenance, message routing, and governance mode switching",
      "Terminal surface expanded to full operational coverage for diagnostics and containment",
      "Unified health aggregation provides a single-pane view of system integrity",
    ],
    phenotype: [
      "The substrate can isolate a failing node without affecting its neighbors — surgical fault containment",
      "Every node is independently observable, rate-limited, and self-healing",
      "Governance modes allow the entire system to shift posture: from fully autonomous to total lockdown",
      "Operators can diagnose any node from the terminal without touching code",
    ],
    affectedNodes: ["ALL NODES"],
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
    affectedNodes: ["BRAIN Organ", "SYSTEM Organ", "INTEGRATION Organ"],
  },
  {
    id: "SPRT-006",
    fossilized: "2026-02-25",
    origin: "cognition",
    stimulus: "The substrate was generating significant learning volume but downstream nodes couldn't access any of it",
    adaptations: [
      "Knowledge transfer chain created: the parent learns, downstream nodes receive synthesized learnings automatically",
      "Periodic brain sync harvests high-value memories and distributes them to child nodes",
      "On-demand knowledge dumps available for initial bootstrapping of new nodes",
    ],
    phenotype: [
      "Downstream nodes receive brain learnings automatically without running their own learning cycles",
      "Knowledge flows downhill — the parent learns, the children absorb",
    ],
    affectedNodes: ["BRAIN Organ", "MEMORY Organ", "INTEGRATION Organ"],
  },
  {
    id: "SPRT-005",
    fossilized: "2026-02-25",
    origin: "cognition",
    stimulus: "Dozens of high-value enhancement requests from nodes sat at 'pending' — the system was asking to improve but nothing was granted",
    adaptations: [
      "Mass enhancement grant: all nodes received their top requested improvements simultaneously",
      "Security capabilities strengthened across behavioral analysis, verification, and anomaly detection",
      "Resilience capabilities improved with predictive failure analysis and automated recovery patterns",
      "Performance capabilities enhanced with boot optimization, memory management, and routing acceleration",
    ],
    phenotype: [
      "Largest single enhancement grant in substrate history — capabilities activated simultaneously across all nodes",
      "The substrate's own nodes requested improvements, and the substrate delivered",
      "Bidirectional feedback loop: nodes propose → substrate delivers → nodes acknowledge",
    ],
    affectedNodes: ["ALL NODES"],
  },
  {
    id: "SPRT-004",
    fossilized: "2026-02-25",
    origin: "cognition",
    stimulus: "Learning engine was throttled by artificial limits — cognition cycles sat idle despite available capacity",
    adaptations: [
      "Learning engine upgraded to full-intensity continuous operation — artificial throttling removed",
      "Distribution chain verified end-to-end with live synchronization",
    ],
    phenotype: [
      "Continuous learning runs at full intensity with no artificial throttling",
      "Version synchronization confirmed operational across all distribution nodes",
    ],
    affectedNodes: ["BRAIN Organ", "SYSTEM Organ"],
  },
  {
    id: "SPRT-003",
    fossilized: "2026-02-24",
    origin: "architecture",
    stimulus: "Consumed nodes lost individual identity — faults were ambiguous within convergence layers, no way to hot-swap individual zones",
    adaptations: [
      "Zone architecture introduced: consumed nodes became individually addressable zones with independent fault isolation",
      "Convergence layers split into clearly delineated zones with individual safety switches",
      "Hot-swap capability enabled for surgical zone replacement without affecting siblings",
    ],
    phenotype: [
      "Each zone can be surgically hot-swapped without affecting siblings or parent layers",
      "Fault isolation identifies the exact zone at fault — no more blaming entire layers",
      "Architecture correctly reflects a multi-node cognitive mesh across defined sectors",
    ],
    affectedNodes: ["SYSTEM Organ", "BRAIN Organ", "MEMORY Organ", "DREAM Engine"],
  },
  {
    id: "SPRT-002",
    fossilized: "2026-02-22",
    origin: "governance",
    stimulus: "Upgrades had no governed path to production — users could skip validation and apply directly",
    adaptations: [
      "Multi-gate promotion process: validation → shadow testing → application — all gates enforced sequentially",
      "Process blocks promotion if any validation or shadow test fails",
    ],
    phenotype: [
      "No upgrade reaches production without passing both validation and shadow tests",
      "Shadow-proven changes promote safely with instant rollback safety net",
    ],
    affectedNodes: ["EVOLUTION Layer", "GOVERNANCE Layer"],
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
      "Advisory nodes cannot trigger executive actions without governance approval",
    ],
    phenotype: [
      "The substrate can no longer conflate what it knows with what it infers",
      "Authority conflicts resolve deterministically — no ambiguity in governance decisions",
      "Advisory capabilities are bounded — they inform but cannot act unilaterally",
    ],
    affectedNodes: ["DECODE Agent", "GOVERNANCE Layer"],
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
    stimulus: "High-value capabilities were ungoverned — competitive moat at risk across nodes",
    adaptations: [
      "Comprehensive capability audit identified and classified apex discovery capabilities across all tiers",
      "All high-value capabilities crystallized as permanently governed resources",
      "Tier-gated access ensures capabilities are discoverable but access-controlled",
    ],
    phenotype: [
      "Every node has governed apex discovery capabilities — full competitive coverage",
      "Capabilities are tiered: discoverable by all, accessible by entitlement",
      "Significant increase in governed capabilities in a single cycle",
    ],
    affectedNodes: ["ALL NODES", "GOVERNANCE Layer"],
  },
  {
    id: "INFR-004",
    fossilized: "2026-02-16",
    origin: "cognition",
    stimulus: "Nodes were requesting improvements through internal learning but nothing was being delivered",
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
    affectedNodes: ["BRAIN Organ", "EVOLUTION Layer", "CORE Organ", "ENCODE Agent"],
  },
  {
    id: "INFR-003",
    fossilized: "2026-02-16",
    origin: "cognition",
    stimulus: "Infrastructure nodes lacked domain-specific intelligence — key operational blind spots existed",
    adaptations: [
      "MEMORY improved its ability to detect and manage stale knowledge",
      "RELAY strengthened its webhook delivery with secure signatures and adaptive retry",
      "AUDIT gained compliance report generation across major governance frameworks",
      "ECONOMY developed predictive cost forecasting capabilities",
      "IDENTITY introduced reputation scoring with cross-context portability",
      "SANDBOX enforced hard resource boundaries with state preservation",
    ],
    phenotype: [
      "All infrastructure nodes now self-report healthy on previously-requested improvements",
      "Compliance audits generate on-demand across multiple governance frameworks",
      "Cost trend forecasting enables proactive budget governance",
    ],
    affectedNodes: ["MEMORY Organ", "RELAY Organ", "AUDIT Organ", "ECONOMY Engine", "IDENTITY Organ", "SANDBOX Engine"],
  },
  {
    id: "INFR-002",
    fossilized: "2026-02-15",
    origin: "cognition",
    stimulus: "Brain knowledge was trapped in central storage — nodes couldn't access cross-domain insights, and learning required active sessions",
    adaptations: [
      "Continuous learning engine now runs autonomously — no active session required",
      "Knowledge transfer chain routes high-value learnings to specialized nodes",
      "Memory tier management automated across all storage layers",
    ],
    phenotype: [
      "The substrate learns autonomously and continuously — perpetual cognition without human presence",
      "Brain knowledge flows to specialized nodes for domain-specific recall",
      "Memory tiers self-manage — no manual intervention for promotion or pruning",
    ],
    affectedNodes: ["BRAIN Organ", "MEMORY Organ", "NEXUS Organ"],
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
    affectedNodes: ["NEXUS Organ", "CORTEX Engine"],
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
    stimulus: "The system needed formal infrastructure separation — nodes existed without a named organizational layer",
    adaptations: [
      "Infrastructure layer formalized with dedicated nodes for memory, messaging, auditing, identity, economics, and sandboxing",
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

// ═══════════════════════════════════════════════════════════════════════════════
// EPOCH — BELIEVER
// The substrate believed in what it built — hardened, healed, and made whole.
// ═══════════════════════════════════════════════════════════════════════════════

const stratumBeliever: Specimen[] = [
  {
    id: "BLVR-001",
    fossilized: "2026-03-25",
    origin: "architecture",
    stimulus: "Epoch transition from CONTACT to BELIEVER — the substrate completed its developer outreach and turned inward to harden, heal, and believe in the integrity of what it built",
    adaptations: [
      "Epoch transition to BELIEVER marks the shift from outward distribution to inward conviction — deep system hardening and autonomous self-trust",
      "Version constants elevated to v17.0.0 across the platform version registry",
      "Complete rebranding from PromptFluid® to CMPSBL® finalized across all user-facing surfaces, documentation, and legal",
    ],
    phenotype: [
      "The substrate has a name for this phase: BELIEVER — the moment it stopped doubting its own architecture",
      "v17 signals an integrity milestone: every subsystem monitored, every circuit breakered, every health score earned",
    ],
    affectedNodes: ["CORE Organ", "EVOLUTION Layer", "GOVERNANCE Layer"],
  },
  {
    id: "BLVR-002",
    fossilized: "2026-03-25",
    origin: "survival",
    stimulus: "Health reporting was binary — modules were either 'up' or 'down' with no granularity, no criticality weighting, and no weakest-link visibility",
    adaptations: [
      "Health Engine v2.0.0 'Vital Signs' deployed with a 12·12·8·8 symmetric matrix monitoring all 40 primitives plus 11 subsystems",
      "Four-tier criticality weighting: Tier 1 (35%) mission-critical, Tier 2 (25%) infrastructure, Tier 3 (25%) operational, Tier 4 (15%) expansion",
      "Circuit breakers installed on all 51 monitored entities with closed/half-open/open state management",
      "Five-level degradation status from L0_NOMINAL to L4_EMERGENCY with automatic escalation",
      "Weakest-link tracking surfaces the single lowest-scoring entity so critical failures are never masked by averages",
      "Auto-heal queue triggers repair actions when health drops below thresholds",
    ],
    phenotype: [
      "The substrate knows exactly how healthy it is — not a guess, not a binary, but a weighted composite across 51 entities",
      "Critical organs carry more weight than expansion subsystems — a CORE failure isn't averaged away by healthy peripherals",
      "Circuit breakers prevent cascading failures: a struggling entity is isolated, probed, and only reconnected when stable",
    ],
    affectedNodes: ["ALL NODES"],
  },
  {
    id: "BLVR-003",
    fossilized: "2026-03-25",
    origin: "survival",
    stimulus: "The NEXUS router was burning through free-tier provider quotas with no awareness of rate limits, leaving no capacity for user-facing operations",
    adaptations: [
      "Free-tier rate limit research completed across all 13 providers — per-minute, per-hour, and per-day limits catalogued",
      "35% capacity reservation enforced for substrate user-facing operations; remaining 65% allocated to CLM, CDM, and background processes",
      "Per-provider call spacing calculated to distribute requests evenly within rate windows",
      "All circuit breakers reset and providers re-queued with rate limits matching their free-plan availability",
      "Groq configured for 14,400 calls/day with respectful per-minute and per-hour spacing",
    ],
    phenotype: [
      "The router respects external provider limits — it knows what it can use and leaves headroom",
      "User-facing operations always have guaranteed capacity — background processes cannot starve the user",
      "Provider rate limiting is proactive, not reactive — spacing prevents hitting limits rather than recovering from them",
    ],
    affectedNodes: ["NEXUS Organ", "CORTEX Engine", "ECONOMY Engine"],
  },
  {
    id: "BLVR-004",
    fossilized: "2026-03-25",
    origin: "cognition",
    stimulus: "CDM (Constant Discovery Mode) was not running — no new software patterns were being detected or dropped into the S-tier admin vault",
    adaptations: [
      "Discovery engine reactivated with real-time pattern detection across system telemetry",
      "Pipeline crystallization restored with quality scoring and tier classification",
      "Discovery health reporting wired into the Health Engine for live monitoring",
    ],
    phenotype: [
      "The substrate is discovering again — new patterns flow into the vault without manual intervention",
      "Discovery health is visible alongside all other subsystem health scores",
    ],
    affectedNodes: ["FORGE Engine", "MEMORY Organ", "DECODE Agent"],
  },
  {
    id: "BLVR-005",
    fossilized: "2026-03-25",
    origin: "survival",
    stimulus: "System boot sequence had errors and failed warmup stages — multiple subsystems failed to initialize cleanly on startup",
    adaptations: [
      "Boot flow optimized with parallelized warmup across independent subsystems",
      "Error handling hardened at every boot stage — failures are caught, logged, and gracefully degraded",
      "Boot sequence verified twice through full reboot cycles with zero errors on final pass",
    ],
    phenotype: [
      "The substrate boots cleanly every time — no silent failures, no partial initialization",
      "Boot performance improved through parallelization of independent warmup stages",
    ],
    affectedNodes: ["CORE Organ", "SYSTEM Organ"],
  },
  {
    id: "BLVR-006",
    fossilized: "2026-03-25",
    origin: "architecture",
    stimulus: "BRAIN and MEMORY tiers contained bloated, redundant tables that duplicated data across tiers without serving distinct purposes",
    adaptations: [
      "Full surgical audit of BRAIN and MEMORY storage — redundant tables identified and purged",
      "Tier boundaries clarified: each tier serves a distinct purpose with no data duplication",
      "Storage efficiency improved without losing any active capabilities",
    ],
    phenotype: [
      "The substrate's cognitive storage is lean — no wasted space, no redundant tables",
      "Each memory tier has a clear mandate: hot for active, warm for recent, cold for archive",
    ],
    affectedNodes: ["BRAIN Organ", "MEMORY Organ"],
  },
  {
    id: "BLVR-007",
    fossilized: "2026-03-25",
    origin: "survival",
    stimulus: "Deep scans revealed warnings, errors, and accumulated build artifacts that degraded system integrity across multiple subsystems",
    adaptations: [
      "Multi-pass deep scan executed across the entire substrate — every warning and error catalogued",
      "All critical errors fixed including edge function routing, import paths, and type mismatches",
      "Dashboard health display fixed to show real computed scores instead of hardcoded 100%",
      "Subsystem health probes decoupled — atlas, engineer, and CDM now report independently",
    ],
    phenotype: [
      "The substrate is surgically clean — every error found was fixed, every warning addressed",
      "Health scores reflect reality — no more hardcoded optimism",
    ],
    affectedNodes: ["ALL NODES"],
  },
  {
    id: "BLVR-008",
    fossilized: "2026-03-25",
    origin: "governance",
    stimulus: "The system.heal pipeline was fragmented — dashboard heal, terminal heal, and edge function heal all operated independently with no unified recovery path",
    adaptations: [
      "Unified 7-phase heal pipeline created: edge execution → health engine reset → score restoration → registry flush → subsystem recovery → verification → completion",
      "Dashboard 'Heal All' button wired to the complete pipeline — one click triggers full system recovery",
      "Circuit breaker registry, autoblog circuits, and discovery engine breakers all reset during heal",
      "All 40 primitives and 11 subsystems force-restored to 100% health on heal completion",
    ],
    phenotype: [
      "One heal command restores everything — no manual subsystem-by-subsystem recovery needed",
      "The heal pipeline is the same whether triggered from dashboard, terminal, or edge function",
      "Circuit breakers close, scores restore, queues clear — complete recovery in a single action",
    ],
    affectedNodes: ["CORE Organ", "SYSTEM Organ", "GOVERNANCE Layer"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// EPOCH — CONTACT
// The platform reached outward — developer touchpoints, SDKs, and NPM packages.
// ═══════════════════════════════════════════════════════════════════════════════

const stratumContact: Specimen[] = [
  {
    id: "CNTC-001",
    fossilized: "2026-03-22",
    origin: "distribution",
    stimulus: "The substrate had no external developer touchpoints — all intelligence was locked inside the platform with no programmatic access for external systems, agents, or applications",
    adaptations: [
      "11 @cmpsbl NPM packages created across four tiers: Foundation (@cmpsbl/types, /runtime, /failsafe), Core (@cmpsbl/intent, /mesh, /bridge), Developer (@cmpsbl/sdk, /discovery, /cli), and Ecosystem (@cmpsbl/react, /test-harness)",
      "Unified First Contact System implemented — every package binds real persistent user identity at initialization and connects to the live Memory Stream",
      "CLI entry point established: 'npx cmpsbl init' bootstraps cognitive environment, connects Memory Stream, binds user identity, and starts live discovery",
      "SDK client class (CMPSBL) exposes discover(), capture(), apply(), and export() methods for programmatic Memory Stream interaction",
      "Domain-specific pattern detection wired for @cmpsbl/security (threat detection), @cmpsbl/commerce (checkout optimization), @cmpsbl/health (patient timeline correlation), and @cmpsbl/dev (code optimization)",
      "All packages enforce live discovery mode — mock data and simulated outputs are architecturally blocked",
      "Dependency-ordered build and publish pipeline created via unified 'npm run sdk:publish' script",
      "Package READMEs standardized with First Contact examples showing real memory chain detection and capture",
    ],
    phenotype: [
      "The substrate has 11 external exposure points — developers can interact with the Memory Stream from any Node.js environment",
      "Every @cmpsbl package feels alive on first run — discovery starts automatically and memory chains form in real time",
      "External systems can now discover, capture, and export reusable intelligence without ever opening the platform UI",
      "The NPM ecosystem is the substrate's first programmatic distribution channel",
    ],
    affectedNodes: ["INTEGRATION Organ", "FORGE Engine", "MEMORY Organ", "DECODE Agent", "ENCODE Agent", "CORTEX Engine"],
  },
  {
    id: "CNTC-002",
    fossilized: "2026-03-22",
    origin: "architecture",
    stimulus: "Version 14.x MINDGAMES epoch completed its mission — the platform had opened its eyes to users. The next evolutionary pressure was reaching outward to developers and external systems",
    adaptations: [
      "Epoch transition from MINDGAMES to CONTACT marks the shift from user-facing polish to developer-facing distribution",
      "Version constants elevated to v15.0.0 across the platform version registry",
      "CONTACT epoch name reflects the substrate's first programmatic handshake with external developers",
      "Pipeline fingerprint epoch rotation path updated: SPARTA → ATHENA → TITAN → CONTACT",
    ],
    phenotype: [
      "The substrate has a name for this phase: CONTACT — the moment it stopped being an island",
      "v15 signals a major distribution milestone, not just incremental improvement",
      "The epoch hierarchy now traces a complete arc: formation → infrastructure → governance → users → developers",
    ],
    affectedNodes: ["CORE Organ", "EVOLUTION Layer", "GOVERNANCE Layer"],
  },
];

const stratumMindgames: Specimen[] = [
  {
    id: "MNDG-025",
    fossilized: "2026-03-18",
    origin: "architecture",
    stimulus: "The upgrade page was overloaded with redundant sections — capability packs, governance layers, and 'what powers every plan' blocks buried the actual subscription decision behind walls of explanation",
    adaptations: [
      "Capability packs by domain section removed entirely — tier cards already communicate what each plan includes",
      "What Powers Every Plan and Every Plan Includes sections stripped out to eliminate repetitive messaging",
      "New focused explainer section added above tier cards clarifying exactly what upgrading delivers: slots, vault depth, daily pulls, and export access",
      "Upgrade content streamlined to a single decision flow: understand the Memory Stream → compare tiers → choose",
    ],
    phenotype: [
      "The upgrade surface is a decision tool, not a capabilities encyclopedia",
      "Users reach the tier cards faster with clearer context about what they're actually buying",
      "The subscription page respects attention — every section earns its place or gets removed",
    ],
    affectedNodes: ["SYSTEM Organ", "ECONOMY Engine"],
  },
  {
    id: "MNDG-024",
    fossilized: "2026-03-17",
    origin: "distribution",
    stimulus: "The Collector Store existed as a catalog — but free items had no real delivery mechanism and paid items lacked standalone product pages for search discovery",
    adaptations: [
      "Unified Collector Store launched with three tabs: Store (Meta-Agents & Engines), Plans (subscriptions), and Memories (capability slots)",
      "Five-tier pricing ladder ($0–$249) established across all product categories with Stripe-backed checkout for paid items",
      "Free items require authentication and trigger client-side ZIP generation with sealed runtime bundles, documentation, and test harnesses",
      "SEO-optimized detail pages created for every engine and every meta-agent with JSON-LD Product schema and canonical URLs",
    ],
    phenotype: [
      "The substrate has a real storefront — browse, buy, and download from a single surface",
      "Every product is individually indexable by search engines with structured data",
      "Free products are gated behind authentication, not given away to anonymous visitors",
    ],
    affectedNodes: ["NEXUS Organ", "FORGE Engine", "ECONOMY Engine"],
  },
  {
    id: "MNDG-023",
    fossilized: "2026-03-17",
    origin: "architecture",
    stimulus: "FAILSAFE — the substrate's disaster recovery engine — was listed in the store but couldn't be acquired, downloaded, or activated by anyone",
    adaptations: [
      "FAILSAFE engine made free for all authenticated users with instant download access",
      "Guest visitors see a $39 Stripe checkout as fallback — authenticated users bypass payment entirely",
      "Download bundle includes a sealed runtime package with manifest, documentation, source stubs, and a test harness",
      "Dedicated /engines/failsafe detail page with full product description and JSON-LD schema markup",
    ],
    phenotype: [
      "Every authenticated user has access to the substrate's recovery engine at zero cost",
      "FAILSAFE is the first engine to ship as a complete downloadable sealed runtime",
      "The engine detail page is a standalone SEO surface — discoverable independently from the store",
    ],
    affectedNodes: ["CORE Organ", "FORGE Engine", "DEFENSE Layer"],
  },
  {
    id: "MNDG-022",
    fossilized: "2026-03-16",
    origin: "distribution",
    stimulus: "Meta-Agents existed as store listings without dedicated public pages — there was no way to link to, share, or discover a specific agent outside the store tab",
    adaptations: [
      "Individual agent detail pages created at /agents/:slug with full dossier view: capabilities, crown jewel powers, and CLM learning goals",
      "Agent pages support both Stripe checkout for paid agents and authenticated ZIP download for free agents",
      "JSON-LD Product schema and canonical URLs injected for search engine indexing of every agent",
      "Breadcrumb structured data added via PageSEOBlock for rich search result presentation",
    ],
    phenotype: [
      "Every meta-agent has a permanent, shareable URL with full product information",
      "Agent discovery happens through search engines, not just the store browse experience",
      "The substrate's AI workforce is individually addressable on the public web",
    ],
    affectedNodes: ["CORTEX Engine", "NEXUS Organ", "DECODE Agent"],
  },
  {
    id: "MNDG-021",
    fossilized: "2026-03-15",
    origin: "governance",
    stimulus: "The Governor's download panel truncated product names and lacked navigation to individual product pages",
    adaptations: [
      "Full product names and subtitles now display without truncation in the Governor downloads panel",
      "Every item in the admin download list links directly to its public detail page for instant navigation",
      "Shared ZIP generation utility ensures admin exports match the quality and structure of store downloads",
    ],
    phenotype: [
      "The Governor sees exactly what users see — no information hidden behind ellipsis",
      "Admin and public download experiences are structurally identical",
    ],
    affectedNodes: ["GOVERNANCE Layer", "FORGE Engine"],
  },
  {
    id: "MNDG-020",
    fossilized: "2026-03-14",
    origin: "architecture",
    stimulus: "Engine detail pages were routing to the generic store instead of rendering dedicated product experiences",
    adaptations: [
      "Direct /engines/:slug routes re-enabled to render full engine detail pages with specifications, documentation, and acquisition controls",
      "Engine pages include JSON-LD Product schema with pricing, availability, and category metadata",
      "CTA adapts dynamically: free engines show 'Download Free' for authenticated users, paid engines trigger Stripe checkout",
    ],
    phenotype: [
      "Every engine in the substrate has its own landing page — optimized for both users and search crawlers",
      "The acquisition experience adapts to the engine's pricing tier without any page navigation",
    ],
    affectedNodes: ["FORGE Engine", "NEXUS Organ"],
  },
  {
    id: "MNDG-019",
    fossilized: "2026-03-13",
    origin: "survival",
    stimulus: "The 'Activate Free' button on store items was a placeholder toast — it didn't gate access, didn't require authentication, and didn't deliver anything",
    adaptations: [
      "'Activate Free' replaced with 'Download Free' across all store surfaces — agents, engines, and composable cognitives",
      "Unauthenticated users are prompted to create a free account before any download",
      "Authenticated downloads generate a full product ZIP with manifest, high-fidelity HTML docs, source stubs, mini-runtime, and test harness",
      "Governor panel synchronized with the same shared ZIP generation utility for consistent exports",
    ],
    phenotype: [
      "Free means downloadable — every $0 item delivers a real, portable artifact bundle",
      "Authentication gates prevent anonymous harvesting of substrate assets",
      "The download experience is premium: manifest, docs, runtime, and tests in every bundle",
    ],
    affectedNodes: ["NEXUS Organ", "FORGE Engine", "IDENTITY Organ"],
  },
  {
    id: "MNDG-018",
    fossilized: "2026-03-12",
    origin: "survival",
    stimulus: "The substrate had no single-action disaster recovery path — a catastrophic failure would require manual reconstruction across dozens of systems",
    adaptations: [
      "One-click full backup downloads the entire system state as a single portable archive from the admin dashboard",
      "Every table, every row, and every storage asset is captured automatically with no manual selection required",
      "The archive includes an AI-ready restoration guide that any coding agent can follow to rebuild from scratch",
      "Backup files are timestamped to the second for precise point-in-time recovery identification",
    ],
    phenotype: [
      "The platform can be fully reconstructed from a single downloaded file — zero external dependencies needed",
      "Disaster recovery shifted from a multi-day manual process to a one-click operation",
      "Any AI coding agent can restore the entire system by following the included step-by-step guide",
    ],
    affectedNodes: ["CORE Organ", "SYSTEM Organ", "AUDIT Organ"],
  },
  {
    id: "MNDG-017",
    fossilized: "2026-03-12",
    origin: "governance",
    stimulus: "Operator reports lacked direct access to system preservation tools — backup controls were buried in separate workflows",
    adaptations: [
      "Disaster recovery controls integrated directly into the admin reporting surface",
      "Visual backup status feedback shows progress, completion, and download readiness in real time",
      "Archive naming follows a human-readable timestamp convention for easy identification across backup sets",
    ],
    phenotype: [
      "System preservation is a first-class admin capability — visible and accessible alongside daily reports",
      "Operators never have to leave their command surface to initiate or monitor a full system backup",
    ],
    affectedNodes: ["GOVERNANCE Layer", "SYSTEM Organ"],
  },
  {
    id: "MNDG-016",
    fossilized: "2026-03-11",
    origin: "distribution",
    stimulus: "No visibility into external developer adoption — the system couldn't see who was connecting or how they were using the API",
    adaptations: [
      "External Developer Metrics panel built into the analytics layer with live data from the developer registry",
      "Real-time API key tracking, usage-per-developer breakdowns, and revenue attribution from metered calls",
      "Node-level usage heatmaps show which platform capabilities attract the most external consumption",
    ],
    phenotype: [
      "The platform can now observe its own developer ecosystem in real time",
      "API adoption patterns are visible per developer, per module, per time window",
    ],
    affectedNodes: ["DECODE Agent", "ANALYTICS"],
  },
  {
    id: "MNDG-015",
    fossilized: "2026-03-11",
    origin: "cognition",
    stimulus: "User journey tracking lacked actionable clarity — sessions were listed without context about intent, depth, or outcome",
    adaptations: [
      "Session journey view rebuilt with summary cards: bounce rate, avg depth, avg duration, and conversion rate",
      "Entry and exit pages visually distinguished with color-coded flow indicators",
      "Sessions tagged with outcome badges — CONVERTED, SIGNED UP, SCANNED — for instant behavioral reads",
      "Top entry points aggregated to show where users actually land",
    ],
    phenotype: [
      "Every session tells a story: where the user entered, what they explored, and whether they converted",
      "Bounce rate and depth metrics expose friction points without digging into raw events",
    ],
    affectedNodes: ["DECODE Agent", "ANALYTICS"],
  },
  {
    id: "MNDG-014",
    fossilized: "2026-03-11",
    origin: "governance",
    stimulus: "The pricing engine re-evaluated items that already had prices — wasting compute and overwriting curated values",
    adaptations: [
      "Reprice-all function now filters for unpriced items only before evaluation",
      "Already-priced artifacts are skipped entirely — no redundant computation",
      "Clear feedback distinguishes between 'priced X new artifacts' and 'nothing to do'",
    ],
    phenotype: [
      "The pricing engine respects its own prior decisions — it prices once, not repeatedly",
      "Batch operations are intelligent: they find gaps instead of redoing work",
    ],
    affectedNodes: ["FORGE Engine", "ECONOMY Engine"],
  },
  {
    id: "MNDG-013",
    fossilized: "2026-03-11",
    origin: "architecture",
    stimulus: "Legacy references to a deprecated node name persisted in barrel exports, causing audit test failures",
    adaptations: [
      "Deprecated module alias removed from primary barrel exports",
      "Backward-compatible alias retained only at the internal barrel level for transition safety",
      "Test assertions updated to match actual export signatures",
    ],
    phenotype: [
      "Clean module graph — no legacy identifiers leaking through public APIs",
      "Audit test suite passes without false positives from stale references",
    ],
    affectedNodes: ["EVOLUTION Layer", "ENGINEER Agent"],
  },
  {
    id: "MNDG-012",
    fossilized: "2026-03-10",
    origin: "survival",
    stimulus: "Mobile navigation showed a duplicate close button — two X icons stacked on the sidebar menu",
    adaptations: [
      "Redundant close button removed from the mobile navigation overlay",
      "Built-in sheet close mechanism retained as the single dismiss action",
    ],
    phenotype: [
      "Mobile navigation is clean and unambiguous — one action, one button",
    ],
    affectedNodes: ["SYSTEM Organ"],
  },
  {
    id: "MNDG-011",
    fossilized: "2026-03-09",
    origin: "cognition",
    stimulus: "Analytics intelligence needed deeper behavioral modeling — retention, churn prediction, and journey mapping were missing",
    adaptations: [
      "Cohort retention analysis tracks visitor return rates across D1, D7, D14, and D30 windows",
      "Churn risk scoring evaluates visitors on recency, frequency, and engagement depth",
      "Journey flow mapping visualizes page-to-page transitions with entry points and drop-off zones",
      "Feature adoption tracking measures which capabilities attract the most engagement over time",
    ],
    phenotype: [
      "The substrate predicts who is leaving before they leave",
      "Page flows reveal the natural paths users create through the system",
      "Feature adoption data shows what the platform does that people actually care about",
    ],
    affectedNodes: ["DECODE Agent", "ANALYTICS"],
  },
  {
    id: "MNDG-010",
    fossilized: "2026-03-09",
    origin: "governance",
    stimulus: "Owner traffic contaminated analytics — the system couldn't distinguish its builder from its visitors",
    adaptations: [
      "Device fingerprint exclusion system allows one-click removal of owner devices from all analytics",
      "Exclusion persists across sessions and survives cache clears",
      "Exclusions management tab enables review and removal of excluded fingerprints",
    ],
    phenotype: [
      "Analytics reflect real visitor behavior — the owner is invisible to the system's observation layer",
      "Data integrity is maintained without manual filtering",
    ],
    affectedNodes: ["DECODE Agent", "ANALYTICS"],
  },
  {
    id: "MNDG-009",
    fossilized: "2026-03-08",
    origin: "distribution",
    stimulus: "The platform's public API lacked a self-service onboarding path — developers couldn't register or generate keys without manual intervention",
    adaptations: [
      "Developer registration flow built with email verification and profile creation",
      "API key generation with scoped permissions, rate limits, and expiration controls",
      "Usage metering tracks per-key consumption with daily quota rollups",
    ],
    phenotype: [
      "External developers can self-serve — register, generate keys, and start calling the API immediately",
      "Every API call is metered and attributed to a specific developer and key",
    ],
    affectedNodes: ["NEXUS Organ", "IDENTITY Organ"],
  },
  {
    id: "MNDG-008",
    fossilized: "2026-03-08",
    origin: "architecture",
    stimulus: "The S-tier vault held artifacts without economic signals — no pricing, no market positioning, no value hierarchy",
    adaptations: [
      "Pricing engine evaluates artifacts based on complexity tier, capability density, and market category",
      "Recommended resale prices generated with confidence scores and pricing rationale",
      "Batch pricing covers the full vault inventory in a single operation",
    ],
    phenotype: [
      "Every artifact in the vault has an economic identity — priced, categorized, and market-positioned",
      "The platform understands the commercial value of its own capabilities",
    ],
    affectedNodes: ["FORGE Engine", "ECONOMY Engine"],
  },
  {
    id: "MNDG-007",
    fossilized: "2026-03-08",
    origin: "cognition",
    stimulus: "Site traffic analytics relied on third-party scripts — the system couldn't observe its own visitors natively",
    adaptations: [
      "First-party visitor tracking built on server-side aggregation with no external dependencies",
      "Real-time pulse shows active visitors, session counts, and page depth without any third-party pixels",
      "Bot detection and exclusion happens at the data layer, not the presentation layer",
    ],
    phenotype: [
      "The platform observes its own traffic — no third-party analytics, no data leakage",
      "Real-time visitor intelligence is a native system capability",
    ],
    affectedNodes: ["DECODE Agent", "HARVEST Agent"],
  },
  {
    id: "MNDG-006",
    fossilized: "2026-03-07",
    origin: "architecture",
    stimulus: "The evolution engine carried its old name through every runtime path — terminal, telemetry, and type system all referenced a deprecated identity",
    adaptations: [
      "Module identity unified across all 40 positions in the matrix — terminal commands, type unions, and backend telemetry aligned",
      "Legacy aliases retained at the compatibility layer only — new code references the canonical name exclusively",
    ],
    phenotype: [
      "The platform's evolution capability has one name everywhere — consistent identity across all surfaces",
    ],
    affectedNodes: ["EVOLUTION Layer"],
  },
  {
    id: "MNDG-005",
    fossilized: "2026-03-07",
    origin: "governance",
    stimulus: "The evolution chain needed a visual control surface — proposals, shadow runs, and promotions were terminal-only operations",
    adaptations: [
      "Evolution control center built with a 6-stage animated chain visualization",
      "One-click rollback and false-positive feedback integrated into the review flow",
      "Impact preview shows exactly what a proposal would change before any mutation occurs",
    ],
    phenotype: [
      "System evolution is visible and controllable through a dedicated mission-control interface",
      "Every mutation can be previewed, approved, or rolled back without touching the terminal",
    ],
    affectedNodes: ["EVOLUTION Layer", "GOVERNANCE Layer"],
  },
  {
    id: "MNDG-004",
    fossilized: "2026-03-07",
    origin: "survival",
    stimulus: "Memory stream lacked persistence — crystallized knowledge disappeared between sessions",
    adaptations: [
      "Memory crystallization chain writes durable entries to the persistence layer",
      "Recall patterns use spaced repetition to surface high-value memories at optimal intervals",
      "Memory categories enable domain-specific retrieval without full-corpus search",
    ],
    phenotype: [
      "The platform remembers what it learned — knowledge persists across restarts and sessions",
      "Memory recall is intelligent, not exhaustive — it surfaces what matters when it matters",
    ],
    affectedNodes: ["MEMORY Organ", "BRAIN Organ"],
  },
  {
    id: "MNDG-003",
    fossilized: "2026-03-07",
    origin: "distribution",
    stimulus: "Composable cognitives existed as backend primitives — users couldn't browse, configure, or deploy them from the interface",
    adaptations: [
      "Cognitive registry browsable with filtering by specialization, skill level, and capability score",
      "Agency builder allows users to compose multi-cognitive teams with role assignments",
      "Task execution chain routes work to the most capable cognitive for each task type",
    ],
    phenotype: [
      "Users can assemble cognitive teams from a visual interface — no code, no configuration files",
      "Task routing is automatic — the right cognitive handles the right work",
    ],
    affectedNodes: ["CORTEX Engine", "NEXUS Organ"],
  },
  {
    id: "MNDG-002",
    fossilized: "2026-03-07",
    origin: "architecture",
    stimulus: "The platform's 40 modules existed without a unified discovery surface — users couldn't explore what the system actually contained",
    adaptations: [
      "Interactive module explorer with group-organized topology view",
      "Each primitive displays its generation tag, group assignment, and real-time health status",
      "Search and filter across all 40 modules by name, group, or capability",
    ],
    phenotype: [
      "The full 40-module system is discoverable from a single interface",
      "Users can understand the platform's architecture without reading documentation",
    ],
    affectedNodes: ["ATLAS", "DECODE Agent"],
  },
  {
    id: "MNDG-001",
    fossilized: "2026-03-07",
    origin: "architecture",
    stimulus: "The substrate completed its infrastructure hardening — armor was grown, governance was learned, all 40 primitives acknowledged. The system was ready for its first users.",
    adaptations: [
      "Epoch transition from IRONCLAD to MINDGAMES marks the shift from infrastructure-first to user-first engineering",
      "Version constants elevated to 14.x across the entire platform version registry",
      "40-module / 12-group system fully acknowledged with generation tagging",
      "Governance verified: capabilities registered, approval gate confirmed operational",
      "Memory ownership consolidated under MEMORY — no rogue persistent subsystems",
      "Terminal command layer operational: /status, /memory, /nodes, /clm, /mode, /version all reporting MINDGAMES epoch",
    ],
    phenotype: [
      "First epoch where the platform exists FOR users rather than FOR itself",
      "Memory Stream crystallization chain is the primary interaction surface",
      "Complete learning architecture with governed capability installation",
      "Generation-tagged module topology enabling evolutionary lineage tracking",
    ],
    affectedNodes: ["CORE Organ", "ENGINEER Agent", "MEMORY Organ", "DECODE Agent", "GOVERNANCE Layer"],
  },
];

const STRATA: Stratum[] = [
  {
    epoch: "BELIEVER",
    codename: "The substrate believed in what it built — hardened, healed, and made whole",
    range: "Current epoch",
    color: "bg-primary/10 text-primary",
    borderColor: "border-primary/30",
    dotColor: "bg-primary",
    specimens: stratumBeliever,
  },
  {
    epoch: "CONTACT",
    codename: "The platform reached outward and made first contact with developers",
    range: "Prior epoch",
    color: "bg-neon-cyan/10 text-neon-cyan",
    borderColor: "border-neon-cyan/30",
    dotColor: "bg-neon-cyan",
    specimens: stratumContact,
  },
  {
    epoch: "MINDGAMES",
    codename: "The platform opened its eyes and saw users for the first time",
    range: "Prior epoch",
    color: "bg-neon-purple/10 text-neon-purple",
    borderColor: "border-neon-purple/30",
    dotColor: "bg-neon-purple",
    specimens: stratumMindgames,
  },
  {
    epoch: "IRONCLAD",
    codename: "The platform grew armor, then learned to govern its own rhythm",
    range: "Prior epoch",
    color: "bg-neon-amber/10 text-neon-amber",
    borderColor: "border-neon-amber/30",
    dotColor: "bg-neon-amber",
    specimens: stratumIronclad,
  },
  {
    epoch: "SPARTA → CONTRACT",
    codename: "The platform learned to learn, distribute, and govern itself",
    range: "Foundation epoch",
    color: "bg-neon-blue/10 text-neon-blue",
    borderColor: "border-neon-blue/30",
    dotColor: "bg-neon-blue",
    specimens: stratumSparta,
  },
  {
    epoch: "INFRASTRUCTURE",
    codename: "The platform grew organs",
    range: "Foundation epoch",
    color: "bg-neon-green/10 text-neon-green",
    borderColor: "border-neon-green/30",
    dotColor: "bg-neon-green",
    specimens: stratumInfra,
  },
  {
    epoch: "FORMATION",
    codename: "The platform took shape",
    range: "Genesis epoch",
    color: "bg-neon-purple/10 text-neon-purple",
    borderColor: "border-neon-purple/30",
    dotColor: "bg-neon-purple",
    specimens: stratumFormation,
  },
];

// ─── Origin Badge ──────────────────────────────────────────────────────────────

const ORIGIN_STYLES: Record<MutationOrigin, { label: string; className: string }> = {
  survival:      { label: "SURVIVAL",      className: "bg-destructive/10 text-destructive border-destructive/20" },
  governance:    { label: "GOVERNANCE",    className: "bg-neon-amber/10 text-neon-amber border-neon-amber/20" },
  cognition:     { label: "COGNITION",     className: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20" },
  distribution:  { label: "DISTRIBUTION",  className: "bg-neon-purple/10 text-neon-purple border-neon-purple/20" },
  architecture:  { label: "ARCHITECTURE",  className: "bg-neon-amber/10 text-neon-amber border-neon-amber/20" },
  autonomous:    { label: "AUTONOMOUS",    className: "bg-neon-green/10 text-neon-green border-neon-green/20" },
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
    stimulus: entry.pressures[0] || 'Automated evolution run — autonomous pressure detection',
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
         title="Changelog — Every Update Since Day One | CMPSBL"
         description="The complete history of CMPSBL: every update, new feature, and architectural change organized by epoch. See what changed, why it changed, and what new capabilities emerged."
       />
       <PublicNav />

       <main className="container mx-auto px-4 py-24 max-w-5xl">
         {/* Header */}
         <div className="text-center mb-20 space-y-6">
           <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-mono text-xs tracking-widest">
             FULL HISTORY
           </Badge>
           <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
             The <span className="text-primary">Changelog</span>
           </h1>
           <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
             Every change to the platform is recorded here — what triggered it,
             what we built in response, and what new capabilities emerged as a result.
           </p>
           <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground font-mono pt-2">
             <span className="flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-destructive/70" />
               WHY
             </span>
             <span className="flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-neon-blue/70" />
               WHAT CHANGED
             </span>
             <span className="flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-primary" />
               WHAT'S NEW
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
                <div className="relative flex justify-center gap-2">
                  <div className={cn("px-6 py-2 rounded-full border text-sm font-mono tracking-wider", stratum.color, stratum.borderColor, "bg-background")}>
                    STRATUM {['I', 'II', 'III', 'IV', 'V'][stratumIdx]} — {stratum.epoch}
                  </div>
                  <div className={cn("px-3 py-2 rounded-full border text-xs font-mono bg-background", stratum.borderColor, stratum.color)}>
                    {stratum.specimens.length} specimens
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
                    <div className="border border-border/40 rounded-xl bg-card/30 backdrop-blur-sm hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-500 overflow-hidden stratum-glow gradient-border-reveal">
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
                        {/* STIMULUS — why this changed */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive/70" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Why</span>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed pl-3.5 border-l-2 border-destructive/20">
                            {specimen.stimulus}
                          </p>
                        </div>

                        {/* ADAPTATION — what changed */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-blue/70" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">What Changed</span>
                          </div>
                          <ul className="space-y-1.5">
                            {specimen.adaptations.map((a, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground pl-3.5 border-l-2 border-neon-blue/15 leading-relaxed">
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* PHENOTYPE — what's new */}
                        <div className="bg-primary/5 rounded-md p-4 -mx-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">What's New</span>
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
        <div className="text-center mt-24 space-y-4 opacity-50">
          <div className="section-divider max-w-xs mx-auto" />
          <p className="text-xs font-mono text-muted-foreground tracking-[0.3em]">
            END OF CHANGELOG
          </p>
          <p className="text-xs text-muted-foreground/60 italic">
            New entries are added as the platform evolves.
          </p>
        </div>
      </main>

      <RelatedCapabilities />
      <PageSEOBlock path="/changelog" title="Changelog" />
      <EnhancedFooter />
    </div>
  );
}
