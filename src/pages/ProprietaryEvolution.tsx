/**
 * Ascension — /x
 * PIN-gated software evolution lifecycle within the CMPSBL cognitive substrate.
 * INGEST → ASCENSION → CRYSTALLIZATION → ASCENDED MEMORY
 */

import { useState } from 'react';
import { PinGate } from '@/components/gates/PinGate';
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

        {/* ═══ PHASE ENGINE SECTION ═══ */}
        <section className="relative">
          {/* Subtle gradient transition from hero */}
          <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/[0.02] via-background to-background pointer-events-none" />

          {/* Phase Navigation */}
          <div className="relative border-b border-border/10 sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex items-center gap-1 min-w-max">
                  {PHASES.map((phase, i) => (
                    <div key={phase.id} className="flex items-center">
                      <button
                        onClick={() => setActivePhase(phase.id)}
                        className={cn(
                          "flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap min-h-[44px]",
                          activePhase === phase.id
                            ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        )}
                      >
                        <phase.icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{phase.label}</span>
                      </button>
                      {i < PHASES.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-primary/20 mx-1 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Phase Content */}
          <main className="relative flex-1">
            <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 lg:py-10">
              {activePhase === 'ingest' && <IngestPhase />}
              {activePhase === 'ascension' && <DiscoveryPhase />}
              {activePhase === 'crystallize' && <CrystallizationPhase />}
              {activePhase === 'export' && <ExportPhase />}
            </div>
          </main>
        </section>

        <EnhancedFooter />
      </div>
    </PinGate>
  );
}
