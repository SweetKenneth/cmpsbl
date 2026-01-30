/**
 * CMPSBL v6.x.x — Living Evolution Log
 * A continuous record of why the system evolved during the v6 series.
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

// Living Evolution Log — v6.x.x Series
// Each entry documents WHY the system changed, never HOW
const evolutionLog: EvolutionEntry[] = [
  {
    id: "v6-evolution-014",
    date: "2026-01-30",
    pressures: [
      "Operators needed visibility into emergent cross-module behaviors",
      "Evolution proposals lacked context for informed human decisions",
      "System resilience required hypothetical threat analysis"
    ],
    responses: [
      "The substrate began documenting its own synergy patterns",
      "Proposals became self-descriptive with reversibility and impact metadata",
      "A simulation channel emerged for exploring what-if scenarios safely"
    ],
    capabilities: [
      "Synergy pipelines are now observable as first-class artifacts",
      "Human operators can assess evolution proposals with full context",
      "The system can explore failure modes without risking stability"
    ]
  },
  {
    id: "v6-evolution-013",
    date: "2026-01-29",
    pressures: [
      "Terminal interfaces needed to adapt to all screen sizes",
      "Learning systems required sustainable resource governance",
      "Module boundaries needed stronger isolation guarantees"
    ],
    responses: [
      "Rendering contracts evolved to respect device constraints",
      "Budget governance became integral to continuous learning",
      "Circuit breakers crystallized around every module boundary"
    ],
    capabilities: [
      "Terminal output adapts gracefully from mobile to desktop",
      "Learning activities operate within defined resource envelopes",
      "Module failures remain contained without cascade effects"
    ]
  },
  {
    id: "v6-evolution-012",
    date: "2026-01-28",
    pressures: [
      "Documentation sprawl obscured the substrate's true structure",
      "Intelligence systems duplicated reasoning patterns",
      "Governance rules existed but lacked formal specification"
    ],
    responses: [
      "Documentation compressed into canonical reference surfaces",
      "Reasoning patterns consolidated into shared foundations",
      "Governance became explicit and queryable"
    ],
    capabilities: [
      "System architecture is now fully documented and indexed",
      "Intelligence operations share optimized common pathways",
      "Governance rules can be inspected and audited programmatically"
    ]
  },
  {
    id: "v6-evolution-011",
    date: "2026-01-27",
    pressures: [
      "Human users with diverse abilities needed equal system access",
      "Interface outputs varied in accessibility compliance",
      "No unified pipeline existed for compatibility validation"
    ],
    responses: [
      "A dedicated compatibility layer emerged as the 14th module",
      "All output surfaces became scannable and repairable",
      "Validation gates integrated into the template pipeline"
    ],
    capabilities: [
      "The substrate adapts its interfaces to human needs",
      "Accessibility issues are detected and addressed automatically",
      "Templates cannot publish without passing compatibility checks"
    ]
  },
  {
    id: "v6-evolution-010",
    date: "2026-01-26",
    pressures: [
      "System evolution lacked sufficient introspection depth",
      "Module health required real-time aggregate visibility",
      "Command surface needed expansion for full coverage"
    ],
    responses: [
      "Introspection surfaces deepened across all modules",
      "Health aggregation became a first-class observable",
      "The command vocabulary expanded to match system capabilities"
    ],
    capabilities: [
      "Every module can report its internal state on demand",
      "System health is visible as a unified, real-time metric",
      "260+ commands provide complete operational control"
    ]
  },
  {
    id: "v6-foundation",
    date: "2026-01-25",
    pressures: [
      "The substrate had grown organically without architectural coherence",
      "Module interactions lacked formal communication contracts",
      "Evolution happened but was not governed"
    ],
    responses: [
      "Architecture crystallized into 14 modules across 4 layers",
      "A central message bus became the sole inter-module pathway",
      "Evolution became proposal-driven with human approval gates"
    ],
    capabilities: [
      "The substrate operates as a unified cognitive system",
      "All module communication is observable and traceable",
      "System changes require deliberate human authorization"
    ]
  }
];

// Archived major versions (frozen historical records)
const archivedVersions = [
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
        title="Evolution Log | CMPSBL v6.x.x — promptfluid®"
        description="A continuous record of why the CMPSBL substrate evolved during the v6 series. Observed pressures, learned responses, and resulting capabilities."
        canonical="https://promptfluid.com/changelog"
      />
      <PublicNav />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            v6.x.x — Living Log
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            CMPSBL v6.x.x — Living Evolution Log
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            A continuous record of why the system evolved during the v6 series
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
            v6.x.x — Human Compatibility Era
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
