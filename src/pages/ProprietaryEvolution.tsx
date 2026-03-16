/**
 * Ascension — /x
 * PIN-gated software evolution lifecycle within the CMPSBL cognitive substrate.
 * INGEST → ASCENSION → CRYSTALLIZATION → ASCENDED MEMORY
 */

import { useState } from 'react';
import { PinGate } from '@/components/gates/PinGate';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowRight, Upload, Zap, Diamond, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { AscensionHero } from '@/components/proprietary-evolution/AscensionHero';
import { IngestPhase } from '@/components/proprietary-evolution/IngestPhase';
import { DiscoveryPhase } from '@/components/proprietary-evolution/DiscoveryPhase';
import { CrystallizationPhase } from '@/components/proprietary-evolution/CrystallizationPhase';
import { ExportPhase } from '@/components/proprietary-evolution/ExportPhase';

const PHASES = [
  { id: 'ingest', label: 'INGEST', icon: Upload, description: 'Introduce software into the substrate' },
  { id: 'ascension', label: 'ASCENSION', icon: Zap, description: 'Discovery engine interaction cycles' },
  { id: 'crystallize', label: 'CRYSTALLIZE', icon: Diamond, description: 'Lock successful capability chains' },
  { id: 'export', label: 'ASCENDED MEMORY', icon: Package, description: 'Export portable capability artifacts' },
] as const;

export default function ProprietaryEvolution() {
  const [activePhase, setActivePhase] = useState<string>('ingest');

  return (
    <PinGate pin="041041" storageKey="gate-x-proprietary">
      <div className="min-h-screen bg-background flex flex-col">
        <SEO
          title="Ascension — Software Evolution | CMPSBL"
          description="Bring your software into the CMPSBL cognitive substrate. New capabilities emerge from interaction — crystallized into portable, exportable Ascended Memories."
          canonical="https://cmpsbl.com/x"
        />

        <PublicNav />

        {/* ═══ CINEMATIC HERO ═══ */}
        <AscensionHero />

        {/* ═══ PHASE NAVIGATION ═══ */}
        <div className="border-b border-border/10 bg-muted/5 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-3">
            {/* Mobile: horizontal scroll */}
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-1 min-w-max">
                {PHASES.map((phase, i) => (
                  <div key={phase.id} className="flex items-center">
                    <button
                      onClick={() => setActivePhase(phase.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap min-h-[44px]",
                        activePhase === phase.id
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      <phase.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{phase.label}</span>
                    </button>
                    {i < PHASES.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-muted-foreground/30 mx-1 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ PHASE CONTENT ═══ */}
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 lg:py-10">
            <Tabs value={activePhase} onValueChange={setActivePhase}>
              <TabsList className="sr-only">
                {PHASES.map(p => <TabsTrigger key={p.id} value={p.id}>{p.label}</TabsTrigger>)}
              </TabsList>

              <TabsContent value="ingest" className="mt-0">
                <IngestPhase />
              </TabsContent>
              <TabsContent value="ascension" className="mt-0">
                <DiscoveryPhase />
              </TabsContent>
              <TabsContent value="crystallize" className="mt-0">
                <CrystallizationPhase />
              </TabsContent>
              <TabsContent value="export" className="mt-0">
                <ExportPhase />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <EnhancedFooter />
      </div>
    </PinGate>
  );
}
