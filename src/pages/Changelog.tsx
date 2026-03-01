/**
 * CMPSBL — Living Evolution Log
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

// Living Evolution Log
// Each entry documents WHY the system changed, never HOW

// ─── IRONCLAD Epoch (v13.0.0) ─────────────────────────────────────────────────
const evolutionLogIRONCLAD: EvolutionEntry[] = [
  {
    id: "ironclad-evolution-001",
    date: "2026-03-01",
    pressures: [
      "All 22 modules operated at v1.0.0 baseline — no enterprise-grade hardening, containment, or fault-isolation primitives",
      "Terminal command surface covered only ~40% of operational needs — critical hardening commands for DEFENSE, IMMUNITY, EVOLUTION, and other modules were missing",
      "Documentation library had grown to 12+ subject folders with overlapping content across epochs — cognitive overhead for contributors and AI agents",
      "Version 12.0.0 CONTRACT epoch completed its mandate — system needed a major version bump to reflect the hardened architecture",
    ],
    responses: [
      "Hardened all 22 modules to v2.0.0 — each received 25 enterprise-grade features: CORE (Ironclad), DECODE (Cipher), ENCODE (Forge), VISION (Aperture), CORTEX (Nexion), NEXUS (Router), ECONOMY (Treasury), SANDBOX (Crucible), INCLUSIVE (Clarity), DEFENSE (Bastion), IMMUNITY (Sentinel), EVOLUTION (Phoenix), INTENT (Compass), GOVERNANCE (Arbiter), SYSTEM (Citadel), BRAIN (Synapse), MEMORY (Vault), DREAM (Nocturne), RIPPLE (Tsunami), RELAY (Conduit), AUDIT (Ironclad), INTEGRATION (Bridge)",
      "Registered 500+ terminal commands across 22 hardening categories — full operational coverage for every module's containment, fault-isolation, and observability surface",
      "Wired unified health aggregation hook (useHardeningHealth) across all 22 modules — single pane of glass for hardening grade and score",
      "Installed ATLAS Control Plane nodes: ENGINEER (maintenance proposals), INTENT (message hub with approval/rejection), ATLAS Governance Mode Panel (ACTIVE/OBSERVE/LOCKDOWN/EVOLVE)",
      "Archived all 12 subject libraries into docs/archived/ — clean docs/ root ready for IRONCLAD epoch documentation",
      "Bumped substrate to v13.0.0 IRONCLAD — all entities, meshes, zones, and control planes synchronized",
    ],
    capabilities: [
      "550 hardening features across 22 modules — the largest single hardening grant in substrate history",
      "Every module has enterprise containment: circuit breakers, rate limiters, anomaly detectors, integrity validators, and recovery engines",
      "Full terminal operational surface: 500+ commands covering hardening diagnostics, threat analysis, resource isolation, and governance controls",
      "Unified observability: single health aggregation dashboard showing hardening grade (A+/A/B/C/D/F) per module",
      "ATLAS Control Plane fully operational with ENGINEER, INTENT, and Governance Mode subsystems",
      "Documentation archived and reset — IRONCLAD epoch starts with a clean canonical surface",
    ],
  },
];

// ─── SPARTA/CONTRACT Epoch (v10.x–v12.x) ─────────────────────────────────────
const evolutionLogSPARTA: EvolutionEntry[] = [
  {
    id: "sparta-evolution-007",
    date: "2026-02-26",
    pressures: [
      "LNCHBL distribution lacked the BRAIN Neural Substrate — no local embedding, vector recall, confidence gating, or drift detection",
      "Architecture changes (field-based topology, 24 Matrix Nodes, OCG rename, SYSTEM elevation) had not been dispatched downstream",
      "All maintenance tasks across the substrate required manual operational attention with no automated scheduling",
      "LNCHBL manifest was stale at v11.3.0 — missing topology definitions, new tables, and new edge functions",
    ],
    responses: [
      "Dispatched LNCHBL patch v11.5.0 — full Neural Substrate Layer with 5 engines and 15 capabilities unlocked at free tier",
      "Dispatched LNCHBL patch v11.5.1 — Field-Based Topology + 24 Matrix Node Architecture with weighted governance",
      "Added lnchbl-neural-bootstrap and lnchbl-maintenance-tick to the LNCHBL edge function manifest",
      "Expanded LNCHBL patch-writable tables to include brain_embeddings, brain_classifier_models, brain_drift_log, brain_maintenance_log",
      "10 automated maintenance tasks now run on CLM cron cycles — zero manual operations required",
      "Topology reclassification: Spine/Grid/Field/Plane/Shell with 24 nodes, Σ weight = 1.000",
    ],
    capabilities: [
      "LNCHBL now has full Neural Substrate parity: embedding engine, HNSW vector recall, confidence classifier, drift detector",
      "LNCHBL topology aligned with CMPSBL field-based architecture — 24 Matrix Nodes, Spine/Grid/Field/Plane/Shell",
      "All BRAIN maintenance is fully autonomous in both CMPSBL and LNCHBL distributions",
      "Two patches published and live in cmpsbl_patches (v11.5.0 neural, v11.5.1 topology) for downstream consumption",
    ],
  },
  {
    id: "sparta-evolution-006",
    date: "2026-02-25",
    pressures: [
      "LNCHBL distribution lacked access to CMPSBL's accelerated CLM learning — nodes were learning in isolation without shared brain activity",
      "CLM v3.0.0 was generating 180+ AI calls/hour with parallel topic study, but learnings were trapped in CMPSBL's brain tables",
      "Version drift between CMPSBL and LNCHBL distributions needed synchronization after multiple rapid CLM and NEXUS upgrades",
    ],
    responses: [
      "Bumped full substrate to v11.3.0 — all 10 entities, 5 mesh overlays, 9 zones, and control planes synchronized",
      "Created pf-brain-sync-dispatch edge function — packages brain memories (hot + warm) and learning events every 30 minutes",
      "Brain sync harvests up to 100 hot memories, 50 warm memories, and 200 learning events per cycle for LNCHBL consumption",
      "Added lnchbl-brain-ingest to LNCHBL edge function manifest — downstream nodes can now receive and inject CMPSBL learnings",
      "Knowledge digest includes per-module categorization, learning insights, and pre-formatted injectable memories with capped priority",
      "Sync state tracked via distribution_state table with full audit of items synced per window",
    ],
    capabilities: [
      "LNCHBL nodes now receive CMPSBL brain learnings every 30 minutes — no CLM required downstream",
      "Knowledge transfer pipeline: CMPSBL CLM → brain tables → pf-brain-sync-dispatch → distribution_patches → LNCHBL brain-ingest",
      "Full substrate aligned at v11.3.0 with brain sync architecture",
      "Force-sync capability allows on-demand 24h knowledge dumps for initial LNCHBL bootstrapping",
    ],
  },
  {
    id: "sparta-evolution-005",
    date: "2026-02-25",
    pressures: [
      "All 22 CLM-registered Matrix Nodes had pending enhancement requests — no node had received its top-priority improvements",
      "Enhancement catalog contained 44 high-value upgrades spanning security, resilience, performance, and capability categories, all blocked at 'pending' status",
      "CMPSBL Local distribution pipeline needed a second verification bump to confirm consistent patch synchronization",
    ],
    responses: [
      "Executed mass enhancement grant — all 22 nodes received their top 2 CLM-requested enhancements (44 total grants)",
      "Security enhancements granted: DEFENSE behavioral fingerprinting, AUDIT real-time chain verification, IDENTITY session anomaly detection, ACCESS key rotation reminders, GOVERNANCE policy conflict detection, SANDBOX execution isolation metrics",
      "Resilience enhancements granted: NEXUS provider auto-rotation, IMMUNITY cascade failure prediction, EVOLUTION rollback safety scoring, ENCODE patch verification hooks, INTEGRATION webhook retry backoff, RELAY message delivery guarantees",
      "Performance enhancements granted: CORE boot sequence optimization, BRAIN memory dedup scoring, MEMORY cross-tier search indexing, VISION trend velocity detection, CORTEX cognitive routing optimization",
      "Capability enhancements granted: DECODE source credibility scoring, DREAM chain correlation, ECONOMY cost anomaly alerts, INCLUSIVE accessibility scan scheduling, INTENT confidence scoring, RIPPLE event replay filtering",
      "Bumped substrate to v11.2.1 — dispatched CMPSBL Local patch verifying pipeline integrity",
    ],
    capabilities: [
      "44 enhancements activated across all 22 Matrix Nodes — largest single enhancement grant in substrate history",
      "Security posture hardened: behavioral fingerprinting, chain verification, session anomaly detection, policy conflict detection",
      "Resilience layer strengthened: cascade failure prediction, provider auto-rotation, rollback safety scoring, webhook retry backoff",
      "Performance baseline lifted: boot optimization, memory dedup, cross-tier indexing, cognitive routing acceleration",
      "CMPSBL Local patch pipeline confirmed operational for second consecutive bump",
    ],
  },
  {
    id: "sparta-evolution-004",
    date: "2026-02-25",
    pressures: [
      "Standalone software distribution lacked clear brand identity — 'LNCHBL' was conflated with both the website (lnchbl.com) and the downloadable product",
      "CLM engine was throttled by artificial quiet hours and conservative daily caps, leaving learning cycles idle despite available API budget",
      "Patch distribution pipeline between CMPSBL and LNCHBL needed a live verification bump to confirm synchronization integrity",
    ],
    responses: [
      "Bumped full substrate to v11.2.0 — all 10 entities, 5 mesh overlays, 9 zones, and control planes synchronized",
      "Established naming convention: LNCHBL.com is the website URL, CMPSBL Local is the standalone software product",
      "CLM engine upgraded to v2.1.0 — quiet hours disabled, daily cap raised to 300 cycles, 24/7 full-intensity learning",
      "Dispatched test version bump patch to LNCHBL to verify the patch synchronization pipeline end-to-end",
      "Updated all investor-facing materials and revenue model references to reflect CMPSBL Local branding",
    ],
    capabilities: [
      "CLM now runs at full intensity 24/7 with no artificial throttling — 288 cycles/day at 5-minute cadence",
      "Patch pipeline verified: CMPSBL → LNCHBL version synchronization confirmed operational",
      "Clear brand separation: LNCHBL.com (website) vs CMPSBL Local (standalone software) eliminates market confusion",
      "All 24 Matrix Nodes aligned at v11.2.0 with consistent version registry",
    ],
  },
  {
    id: "sparta-evolution-003",
    date: "2026-02-24",
    pressures: [
      "Consumed modules (SYSTEM, BRAIN, MEMORY, DREAM, RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT) lost surgical identity — faults were ambiguous within CCR/CCL",
      "No ability to hot-swap individual consumed modules without affecting the entire convergence layer",
      "Architecture documentation still referenced legacy module counts — misleading for new developers and investors",
      "MODERNIZER was still referenced as a standalone module despite being absorbed by the EVOLUTION mesh",
    ],
    responses: [
      "Introduced 'Zone Architecture' — consumed modules are now Zones with individual circuit breakers and hot-swap capability",
      "CCR contains 4 Zones: SYSTEM Zone, BRAIN Zone, MEMORY Zone, DREAM Zone",
      "CCL contains 5 Zones: RIPPLE Zone, ACCESS Zone, IDENTITY Zone, RELAY Zone, AUDIT Zone",
      "Bumped substrate to v11.1.0 with updated public metrics: 10 entities + 5 mesh overlays + 9 zones",
      "Rewrote all public-facing documentation as mobile-first HTML with Zone terminology",
      "Updated SubstrateDemo to visualize 10 entities + 5 mesh overlays (DEFENSE outermost → GOVERNANCE innermost) + 9 zones",
    ],
    capabilities: [
      "Each Zone can be surgically hot-swapped without affecting its parent convergence layer or sibling zones",
      "Circuit breaker trips now identify the exact Zone at fault (e.g., 'RIPPLE Zone circuit open') rather than blaming the entire CCL",
      "All backward compatibility preserved — legacy commands route through Zone dispatchers transparently",
      "Architecture is now correctly represented as 10 public entities + 5 mesh overlays + 9 internal zones",
      "Mesh overlays wrap modules in order: DEFENSE (outermost) → IMMUNITY → EVOLUTION → INTENT → GOVERNANCE (innermost)",
    ],
  },
  {
    id: "sparta-evolution-002",
    date: "2026-02-22",
    pressures: [
      "Shadow-tested upgrades had no governed path to production — users could skip validation and apply directly",
      "Apply button bypassed shadow test results, allowing untested changes to reach production",
    ],
    responses: [
      "Added governed 'Promote to Production' pipeline: Validate → Shadow Test → Apply with all three gates enforced sequentially",
      "Replaced direct apply buttons with promotion flow requiring 'PROMOTE' confirmation keyword",
      "Pipeline blocks promotion if any validation check or shadow test fails",
    ],
    capabilities: [
      "Shadow-proven changes can now be safely promoted to production through a 3-gate governed pipeline",
      "No upgrade can reach production without passing both validation and shadow tests",
      "Instant rollback safety net preserved — backup snapshot taken before every apply",
    ],
  },
  {
    id: "sparta-evolution-001",
    date: "2026-02-22",
    pressures: [
      "Version numbers were scattered across 15+ UI surfaces — every update required a full sweep",
      "Admin immunity mesh page was inaccessible due to auth redirect loop even for authenticated admins",
      "SEO assets contained version-specific claims creating maintenance burden",
      "Internal documentation lacked training mode reference material"
    ],
    responses: [
      "Purged version numbers from nav, sidebar, tabs, and all non-essential surfaces — retained only in homepage hero and dashboard",
      "Fixed admin auth to use security-definer RPC (has_role_text) bypassing RLS restrictions",
      "Added Immunity Mesh quick link in Governor section for direct access without route protection issues",
      "Created comprehensive Training Modes documentation (doc #22) covering all shadow build modes",
      "Set immunity mesh page to noindex for search engines"
    ],
    capabilities: [
      "Version updates now require exactly 2 changes instead of 15+ — single source of truth achieved",
      "Admin pages accessible via Governor quick links — no more auth redirect loops",
      "Training documentation covers Auto Training, Replay, Synthetic, ENCODE Practice, and Run All modes",
      "SEO is version-number-free across all indexed pages"
    ],
  },
];

// Living Evolution Log — v10.x.x Series (Pre-SPARTA — Infrastructure Hardening)
const evolutionLogV10: EvolutionEntry[] = [
  {
    id: "v10-evolution-013",
    date: "2026-02-22",
    pressures: [
      "Footer menu sections were unbalanced — some had 5 links, others lacked high-value entry points",
      "Video modals (Evolution Video, XCTBL) were silently dropped from footer due to section title mismatch after reorganization",
      "Footer section ordering didn't reflect user journey priority — Ecosystem buried below Create"
    ],
    responses: [
      "Restored Evolution Video and XCTBL modal triggers in footer by fixing section title matching logic",
      "Added 6 high-value links across all footer sections: Documentation, API Access, Composable Cognitives, Enterprise, Changelog, Careers",
      "Reordered footer sections to prioritize discovery: The Substrate → Ecosystem → Discover → Create → Framework → Connect"
    ],
    capabilities: [
      "All footer sections now have 6 links plus video triggers — fully balanced across mobile breakpoints",
      "Footer section ordering reflects natural user exploration path from substrate core to ecosystem to creation tools",
      "Video experiences are permanently anchored in footer with resilient title matching"
    ],
  },
  {
    id: "v10-evolution-012",
    date: "2026-02-22",
    pressures: [
      "SEO assets (sitemap, robots.txt, llms.txt, humans.txt) referenced deleted pages (/forge, /agency, /audit)",
      "Schema generator had incorrect founding date (2024 instead of 2009)",
      "Version-specific claims in llms.txt and humans.txt created maintenance burden and stale content risk",
      "Multiple new pages were missing from sitemap and robots.txt Allow rules"
    ],
    responses: [
      "Purged all references to /forge, /agency, and /audit from sitemap.xml, robots.txt, and seoMap.ts",
      "Added missing pages to sitemap: /modules, /status, /composable-cognitives, and others",
      "Rewrote llms.txt and humans.txt with evergreen authority strategy — no version numbers or specific counts",
      "Corrected foundingDate in schema-generator.ts from 2024 to 2009"
    ],
    capabilities: [
      "All SEO assets reflect current site architecture — zero broken or phantom page references",
      "Evergreen content strategy eliminates stale claims across SEO-facing documents",
      "Schema.org markup now carries accurate corporate history"
    ],
  },
  {
    id: "v10-evolution-011",
    date: "2026-02-22",
    pressures: [
      "Audit Trail page appeared twice in navigation — duplicate menu entries caused confusion",
      "The audit trail page was redundant with OS Dashboard observability capabilities",
      "Footer had 5 unbalanced sections with inconsistent link counts across mobile viewports"
    ],
    responses: [
      "Removed both duplicate Audit Trail entries from navigation menu",
      "Redirected /audit route to home page — page remains in codebase but is no longer routable",
      "Reorganized footer into 6 balanced sections with creative naming: The Substrate, Create, Discover, Ecosystem, Framework, Connect",
      "Updated grid layout to grid-cols-2 mobile, grid-cols-3 tablet, lg:grid-cols-7 desktop"
    ],
    capabilities: [
      "Navigation is free of duplicate entries — every menu item is unique",
      "Footer is mobile-optimized with 6 balanced columns and consistent link density",
      "Audit observability is consolidated into OS Dashboard — single source of truth"
    ],
  },
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
      "Only 15 crown jewels governed — execution surfaces lacked full coverage for tiered licensing",
      "Pricing page led with price cards instead of capability value — poor conversion signal",
      "Stripe checkout flow needed validation after tier restructuring"
    ],
    responses: [
      "Discovered and installed 21 new crown jewel capabilities — one per execution surface across Creator, Architect, Enterprise, and CMPSBL tiers",
      "Redesigned pricing page to benefits-first layout showcasing capabilities, pipelines, and templates before price cards",
      "Validated Stripe tier-checkout edge function flow for seamless subscription upgrades",
      "Added Stats Bar highlighting 525+ capabilities, 300 crystallized pipelines, and 24 execution surfaces"
    ],
    capabilities: [
      "Every execution surface now has a designated crown jewel capability — full coverage",
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
      "Module self-discovery revealed 100+ latent capabilities across all execution surfaces — most ungoverned and untiered",
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
      "EVOLUTION CLM reported 3 consecutive evolution runs stuck in shadow_applied phase — shadow loop detected",
      "CORE CLM requested autonomous circuit recovery — manual resets were required after breaker trips",
      "ENCODE CLM requested error-pattern library — failed task chains were being repeated without learning"
    ],
    responses: [
      "BRAIN Auto-Tiering Engine deployed with watermark-based soft/hard enforcement and demotion cascades",
      "EVOLUTION Shadow Loop Resolver auto-detects stale shadow runs, enforces timeouts, and escalates on loops",
      "CORE Circuit Recovery Engine provides graduated health probing with exponential backoff and auto-reset",
      "ENCODE Error-Pattern Library fingerprints failures, clusters by category, and prevents repeat errors",
      "All execution surfaces received formal CLM acknowledgment events confirming their requests were heard and resolved"
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
      "CLM reports showed all execution surfaces requesting high-value capability upgrades",
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
      "Universal Brain Transfer Pipeline routes top-50 memories to all modules by tag affinity",
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

// Living Evolution Log — v9.x.x Series (Pre-SPARTA)
const evolutionLogV9: EvolutionEntry[] = [
  {
    id: "v9-evolution-003",
    date: "2026-02-13",
    pressures: [
      "Architecture required a dedicated Infrastructure layer",
      "Version references were fragmented across v7/v8 epoch markers",
      "Evolution observability needed unified stamp and receipt systems"
    ],
    responses: [
      "Infrastructure layer formalized with 6 modules: Memory, Relay, Audit, Identity, Economy, Sandbox",
      "ENCODE promoted to first-class Module #21 in the Orchestrator layer",
      "Complete codebase sweep replaced 200+ legacy version references"
    ],
    capabilities: [
      "The substrate operates as a 24-module cognitive architecture (10 entities + 5 mesh + 9 zones)",
      "525+ capabilities across 24 modules",
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

  const mergedEntries = [
    ...evolutionLogIRONCLAD,
    ...evolutionLogSPARTA,
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
        title="Evolution Log — CMPSBL"
        description="A living record of how CMPSBL evolved. Not a changelog — a history of pressures, responses, and the capabilities they produced."
      />
      <PublicNav />

      <main className="container mx-auto px-4 py-24 max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary">
            EVOLUTION LOG
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
          {mergedEntries.map((entry, i) => (
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
