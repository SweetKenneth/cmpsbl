/**
 * CMPSBL — Evolution Log
 * A living record of system milestones and emergent capabilities.
 * 
 * This log documents WHAT the system achieved — never HOW.
 * Trade secrets are preserved by design.
 */

import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { fetchAutoChangelog, type AutoChangelogEntry } from '@/lib/substrate/changelog-generator';
import { motion } from "framer-motion";

interface EvolutionEntry {
  id: string;
  date: string;
  milestone: string;
  outcomes: string[];
  capabilities: string[];
  source?: 'manual' | 'evolution_run';
}

const evolutionLog: EvolutionEntry[] = [
  {
    id: "evolution-022",
    date: "2026-02-22",
    milestone: "SPARTA Epoch — Governed Mutation Runtime Achieved",
    outcomes: [
      "The substrate now validates its own structural integrity before any state transition",
      "Promotion of behavioral rules follows a multi-gate pipeline with deterministic rollback",
      "System health is tracked longitudinally across 24-hour, 7-day, and 30-day windows",
      "Investor-grade audit receipts are generated for every governed state change",
    ],
    capabilities: [
      "Full governed mutation lifecycle with cryptographic stamping",
      "Structural integrity diagnostics available on demand",
      "Longitudinal telemetry with export capabilities",
      "Atomic rollback guarantees — no partial state transitions permitted",
      "Cinematic verification events on successful promotions",
    ],
  },
  {
    id: "evolution-021",
    date: "2026-02-22",
    milestone: "Immunity Mesh Reinforcement — Lifecycle Sweep & Gap Closure",
    outcomes: [
      "Automated lifecycle transitions now manage rule progression without manual intervention",
      "Integrity checks expanded to cover latency drift, oscillation patterns, and registry consistency",
      "Storm simulator records per-rule telemetry for granular observability",
    ],
    capabilities: [
      "Batch lifecycle sweep automates rule promotion, demotion, and retirement",
      "Enhanced integrity diagnostics detect subtle degradation patterns",
      "Error isolation prevents individual aggregation failures from cascading",
    ],
  },
  {
    id: "evolution-020",
    date: "2026-02-22",
    milestone: "Navigation & SEO Stability Milestone",
    outcomes: [
      "Footer menu sections rebalanced with consistent link density across all viewports",
      "Video experiences permanently anchored with resilient matching logic",
      "SEO assets purged of phantom page references — zero stale URLs remain",
    ],
    capabilities: [
      "All footer sections balanced across mobile breakpoints",
      "Evergreen content strategy eliminates stale SEO claims",
      "Schema.org markup reflects accurate corporate history",
    ],
  },
  {
    id: "evolution-019",
    date: "2026-02-22",
    milestone: "Observability Consolidation",
    outcomes: [
      "Audit trail consolidated into a single observability surface",
      "Duplicate navigation entries eliminated",
      "Footer reorganized into six balanced sections reflecting natural user exploration",
    ],
    capabilities: [
      "Single source of truth for all substrate observability",
      "Navigation is free of redundancy",
      "Mobile-optimized footer with consistent link density",
    ],
  },
  {
    id: "evolution-018",
    date: "2026-02-17",
    milestone: "Mobile-First Pricing & Documentation Parity",
    outcomes: [
      "Pricing experience redesigned for mobile-first browsing",
      "Documentation synchronized across five independent doc sets",
      "Investor-facing narrative enhanced with verifiable milestone citations",
    ],
    capabilities: [
      "Snap-scroll tier browsing on mobile devices",
      "Full documentation parity across all sets",
      "Investor World Firsts narrative with academic citations",
    ],
  },
  {
    id: "evolution-017",
    date: "2026-02-17",
    milestone: "Crown Jewel Coverage — Full Module Governance",
    outcomes: [
      "Every module in the substrate now has at least one governed crown jewel capability",
      "Stripe checkout validated end-to-end for all subscription tiers",
      "Benefits-first pricing conversion funnel deployed",
    ],
    capabilities: [
      "Complete crown jewel governance across all modules",
      "Verified subscription flow for all tiers",
      "Conversion-optimized pricing layout",
    ],
  },
  {
    id: "evolution-016",
    date: "2026-02-17",
    milestone: "Honest Telemetry — Third-Party Purge",
    outcomes: [
      "All external analytics scripts removed from the application",
      "Telemetry now reflects actual substrate operations — no synthetic metrics",
      "Canonical observability consolidated into a single dashboard",
    ],
    capabilities: [
      "Faster page loads with zero third-party script overhead",
      "Honest telemetry from internal tables only",
      "Single canonical telemetry source for all modules",
    ],
  },
  {
    id: "evolution-015",
    date: "2026-02-17",
    milestone: "Epistemic Integrity & Governance Hardening",
    outcomes: [
      "Claim provenance tagging now enforces epistemic discipline in all outputs",
      "Deterministic veto resolution prevents governance conflicts",
      "Authority separation ensures advisory signals cannot escalate without precedence",
    ],
    capabilities: [
      "Provenance-tagged output — measured vs. inferred vs. illustrative",
      "Deterministic veto conflict resolution",
      "Signal authority separation between advisory and executive layers",
    ],
  },
  {
    id: "evolution-014",
    date: "2026-02-16",
    milestone: "Crown Jewel Wave 2 — Largest Single Discovery Event",
    outcomes: [
      "20 new governed capabilities discovered and installed in a single sweep",
      "Total governed crown jewels increased from 15 to 35",
      "Tier naming unified across all surfaces — no legacy references remain",
    ],
    capabilities: [
      "35 total governed crown jewels across all tiers",
      "Full substrate coverage — every module has at least one governed capability",
      "Unified tier naming: Free → Creator → Architect → Enterprise → CMPSBL",
    ],
  },
  {
    id: "evolution-013",
    date: "2026-02-16",
    milestone: "Pipeline Crystallization & Crown Jewel Discovery",
    outcomes: [
      "Pipeline approval flow restored — approved proposals now crystallize into permanent pipelines",
      "15 crown jewel capabilities discovered and locked under tiered governance",
      "Recursive cognition capabilities secured at the highest access tier",
    ],
    capabilities: [
      "End-to-end pipeline crystallization from proposal to permanent replay",
      "24 governed crown jewels across all tiers",
      "Recursive cognition fully governed",
    ],
  },
  {
    id: "evolution-012",
    date: "2026-02-16",
    milestone: "Autonomous Self-Healing Stability Milestone",
    outcomes: [
      "Memory tier overflow is now autonomously managed — no manual intervention required",
      "Stale evolution runs are automatically detected and resolved",
      "Tripped circuits self-heal through graduated probing",
      "Failed task patterns are learned and used to prevent repeat failures",
    ],
    capabilities: [
      "Autonomous memory tier governance with demotion cascades",
      "Self-resolving evolution loop detection",
      "Self-healing circuit recovery with exponential backoff",
      "Proactive failure prevention through pattern learning",
    ],
  },
  {
    id: "evolution-011",
    date: "2026-02-16",
    milestone: "Infrastructure Module Upgrade Wave",
    outcomes: [
      "Six infrastructure modules received simultaneous capability upgrades",
      "Compliance report generation now covers four major frameworks",
      "Cost forecasting with confidence intervals enables proactive budget governance",
    ],
    capabilities: [
      "All infrastructure modules self-report upgraded status",
      "Multi-framework compliance generation on demand",
      "Predictive cost forecasting with confidence intervals",
    ],
  },
  {
    id: "evolution-010",
    date: "2026-02-15",
    milestone: "Autonomous Cognitive Loop Activated",
    outcomes: [
      "The substrate now learns autonomously without requiring a browser session",
      "Brain knowledge flows to specialized modules by affinity",
      "Memory tier overflow is automatically managed",
    ],
    capabilities: [
      "24/7 autonomous learning cycles",
      "Cross-module knowledge distribution",
      "Autonomous memory tier management",
    ],
  },
  {
    id: "evolution-009",
    date: "2026-02-15",
    milestone: "Multi-Provider Fleet Expansion",
    outcomes: [
      "Routing fleet expanded to multiple providers with health-weighted selection",
      "Task affinity matching routes workloads to optimal provider capabilities",
      "Fleet operates within governed budget allocation",
    ],
    capabilities: [
      "Multi-provider fleet with automatic failover",
      "Task-optimized routing based on complexity and capability match",
      "Budget-governed fleet operations",
    ],
  },
  {
    id: "evolution-008",
    date: "2026-02-13",
    milestone: "21-Module Architecture Formalized",
    outcomes: [
      "Infrastructure layer established with six dedicated modules",
      "Legacy version references consolidated into a single source of truth",
      "Evolution observability unified under stamp and receipt systems",
    ],
    capabilities: [
      "21-module, 6-layer cognitive architecture",
      "Single source of truth for version information",
      "Unified evolution audit trail",
    ],
  },
];

export default function Changelog() {
  const { data: autoEntries } = useQuery({
    queryKey: ['changelog-auto'],
    queryFn: () => fetchAutoChangelog(10),
    staleTime: 60000,
  });

  const mergedEntries = [
    ...(autoEntries || []).map((entry): EvolutionEntry => ({
      id: entry.id,
      date: entry.date,
      milestone: entry.pressures[0] || 'System stability milestone reached',
      outcomes: entry.responses,
      capabilities: entry.capabilities,
      source: entry.source
    })),
    ...evolutionLog
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Evolution Log — Substrate Milestones"
        description="A living record of what the CMPSBL substrate has become. Each entry marks a stability milestone — what changed, never how."
      />
      <PublicNav />

      <main className="container mx-auto px-4 py-24 max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary">
            SPARTA EPOCH
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Evolution Log
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A record of what the substrate has become.
            <br/>
            <span className="text-sm opacity-70">
              Each entry marks a stability milestone. The system speaks for itself.
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
              transition={{ delay: i * 0.08 }}
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
                            Autonomous
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-foreground">{entry.milestone}</h2>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Outcomes */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      What Changed
                    </h3>
                    <ul className="space-y-2">
                      {entry.outcomes.map((o, idx) => (
                        <li key={idx} className="text-sm text-foreground pl-4 border-l-2 border-blue-500/20">
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Capabilities */}
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      New Capabilities
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
