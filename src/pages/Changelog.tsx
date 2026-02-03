/**
 * CMPSBL v7.x.x — Living Evolution Log
 * A continuous record of why the system evolved during the v7 series.
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

// Living Evolution Log — v7.x.x Series (SEBA Era)
// Each entry documents WHY the system changed, never HOW
const evolutionLog: EvolutionEntry[] = [
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
    version: "v6.x.x",
    era: "Human Compatibility Era",
    period: "2026-01-25 to 2026-01-30",
    summary: "The 14-module architecture crystallized. INCLUSIVE module emerged as the accessibility guardian. Synergy pipelines became observable. Documentation library published with complete module references. 260+ terminal commands achieved full operational coverage. The foundation for bounded autonomy was laid."
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
    summary: "The four-layer kernel model emerged. Core, Ripple, and Access modules crystallized. 200+ legacy functions consolidated into a unified substrate. Memory tiering introduced. The system began to see itself."
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
        title="Evolution Log | CMPSBL v7.x.x"
        description="A continuous record of why the CMPSBL substrate evolved during the v7 series. The age of bounded autonomy and self-evolution."
        canonical="https://cmpsbl.com/changelog"
      />
      <PublicNav />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            v7.x.x — SEBA Era
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            CMPSBL v7.x.x — Living Evolution Log
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            A continuous record of why the system evolved during the v7 series
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

        {/* Living Evolution Log */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-3xl">◆</span>
            v7.x.x — Bounded Autonomy Era
          </h2>
          
          <div className="space-y-8">
            {evolutionLog.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-primary">
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
                  <div className="flex items-start justify-between mb-2">
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
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
