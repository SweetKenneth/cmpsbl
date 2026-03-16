/**
 * Proprietary Evolution Lifecycle — /x
 * PIN-gated development page for the INGEST → Discovery → Crystallization → Export pipeline
 */

import { useState } from 'react';
import { PinGate } from '@/components/gates/PinGate';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowRight, Upload, Zap, Diamond, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IngestPhase } from '@/components/proprietary-evolution/IngestPhase';
import { DiscoveryPhase } from '@/components/proprietary-evolution/DiscoveryPhase';
import { CrystallizationPhase } from '@/components/proprietary-evolution/CrystallizationPhase';
import { ExportPhase } from '@/components/proprietary-evolution/ExportPhase';

const PHASES = [
  { id: 'ingest', label: 'INGEST', icon: Upload, description: 'Import & create Candidate Node #41' },
  { id: 'discovery', label: 'DISCOVERY', icon: Zap, description: 'Collision chamber permutations' },
  { id: 'crystallize', label: 'CRYSTALLIZE', icon: Diamond, description: 'Lock winning capabilities' },
  { id: 'export', label: 'EXPORT', icon: Package, description: 'Capability Pack generation' },
] as const;

export default function ProprietaryEvolution() {
  const [activePhase, setActivePhase] = useState<string>('ingest');

  return (
    <PinGate pin="041041" storageKey="gate-x-proprietary">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border/20 bg-card/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Proprietary Evolution Lifecycle
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Node #41 — Candidate Pipeline
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Import → Discover → Crystallize → Export
            </p>
          </div>
        </div>

        {/* Phase Progress Bar */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-1">
            {PHASES.map((phase, i) => (
              <div key={phase.id} className="flex items-center flex-1">
                <button
                  onClick={() => setActivePhase(phase.id)}
                  className={cn(
                    "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all",
                    activePhase === phase.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <phase.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{phase.label}</span>
                </button>
                {i < PHASES.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground/30 mx-1 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Phase Content */}
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <Tabs value={activePhase} onValueChange={setActivePhase}>
            <TabsList className="sr-only">
              {PHASES.map(p => <TabsTrigger key={p.id} value={p.id}>{p.label}</TabsTrigger>)}
            </TabsList>

            <TabsContent value="ingest" className="mt-0">
              <IngestPhase />
            </TabsContent>
            <TabsContent value="discovery" className="mt-0">
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
      </div>
    </PinGate>
  );
}
