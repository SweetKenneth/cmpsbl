/**
 * Ascension — /x
 * PIN-gated software evolution lifecycle within the CMPSBL cognitive substrate.
 * INGEST → ASCENSION → CRYSTALLIZATION → ASCENDED MEMORY
 */

import { useState } from 'react';
import { PinGate } from '@/components/gates/PinGate';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowRight, Upload, Zap, Diamond, Package, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      <div className="min-h-screen bg-background">
        {/* ═══ HERO SECTION ═══ */}
        <div className="border-b border-border/10">
          <div className="max-w-6xl mx-auto px-4 pt-12 pb-10">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                CMPSBL Cognitive Substrate
              </span>
            </div>

            {/* H1 */}
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-3">
              Ascension
            </h1>

            {/* Supporting line */}
            <p className="text-lg text-muted-foreground max-w-2xl mb-6">
              Bring your software into the substrate. New capabilities emerge from interaction.
            </p>

            {/* Explanatory paragraph */}
            <p className="text-sm text-muted-foreground/80 max-w-2xl leading-relaxed">
              During an Ascension cycle, your existing software is introduced into the CMPSBL cognitive substrate as a candidate node. 
              The discovery engine runs interaction cycles between your code and the substrate's 40-node system, 
              exploring capability chains that neither could produce alone. When a successful chain is found, 
              it is crystallized into an <strong className="text-foreground/90">Ascended Memory</strong> — a deterministic, 
              reusable capability that can be exported back into your environment as a portable artifact.
            </p>

            {/* ═══ LIFECYCLE FLOW ═══ */}
            <div className="mt-10 grid sm:grid-cols-4 gap-3">
              {[
                {
                  step: '01',
                  title: 'Ingest',
                  desc: 'Your software is introduced into the substrate as a candidate node.',
                  icon: Upload,
                },
                {
                  step: '02',
                  title: 'Ascension',
                  desc: 'The discovery engine runs interaction cycles between your software and substrate nodes.',
                  icon: Zap,
                },
                {
                  step: '03',
                  title: 'Crystallization',
                  desc: 'Successful capability chains are locked into deterministic memories.',
                  icon: Diamond,
                },
                {
                  step: '04',
                  title: 'Ascended Memory',
                  desc: 'The crystallized result becomes a portable artifact you can export to your stack.',
                  icon: Package,
                },
              ].map((item, i) => (
                <div key={item.step} className="relative group">
                  <div className="rounded-xl border border-border/20 bg-card/20 p-4 h-full transition-colors hover:border-border/40 hover:bg-card/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono text-primary/60">{item.step}</span>
                      <item.icon className="w-3.5 h-3.5 text-primary/70" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  {i < 3 && (
                    <ArrowRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/30 z-10" />
                  )}
                </div>
              ))}
            </div>

            {/* ═══ ASCENDED MEMORY DEFINITION ═══ */}
            <div className="mt-8 flex items-start gap-3 rounded-lg border border-primary/15 bg-primary/[0.03] px-4 py-3 max-w-2xl">
              <Sparkles className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary/80 font-semibold">Ascended Memory</span> — A crystallized capability chain discovered through substrate interaction. 
                It encodes a deterministic software behavior that emerges only when your code interacts with the substrate's node matrix. 
                Once crystallized, it is fully portable: export it as source code, tests, documentation, and the embedded Mini-Runtime™ engine.
              </p>
            </div>
          </div>
        </div>

        {/* ═══ PHASE NAVIGATION ═══ */}
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

        {/* ═══ PHASE CONTENT ═══ */}
        <div className="max-w-6xl mx-auto px-4 pb-12">
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
      </div>
    </PinGate>
  );
}
