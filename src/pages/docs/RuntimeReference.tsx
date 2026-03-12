/**
 * /docs/runtime — Developer Capability Reference
 * Substrate Capability Reference v3
 */
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BASELINE_PILLARS } from '@/lib/substrate/baseline-pillars';
import { ARTIFACT_PACKS, STRATEGIC_DOMAINS } from '@/lib/quarry/types';
import { motion } from 'framer-motion';
import {
  Brain, Route, ShieldCheck, Workflow, Activity, Scale,
  Dna, Fingerprint, Radio, Lightbulb, Download, BookOpen,
  Package, Layers, Code,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Brain, Route, ShieldCheck, Workflow, Activity, Scale,
  Dna, Fingerprint, Radio, Lightbulb,
};

export default function RuntimeReference() {
  const handleDownload = () => {
    // Generate a text-based reference document
    let content = `SUBSTRATE CAPABILITY REFERENCE v3\n`;
    content += `Generated: ${new Date().toISOString()}\n`;
    content += `${'='.repeat(60)}\n\n`;

    content += `BASELINE CAPABILITIES (Always Active)\n`;
    content += `${'─'.repeat(40)}\n\n`;
    BASELINE_PILLARS.forEach(p => {
      content += `■ ${p.name}\n`;
      content += `  ${p.summary}\n`;
      p.highlights.forEach(h => {
        content += `  • ${h}\n`;
      });
      content += `\n`;
    });

    content += `\nMEMORY PACKS (Pack-Enabled)\n`;
    content += `${'─'.repeat(40)}\n\n`;
    STRATEGIC_DOMAINS.forEach(domain => {
      const packs = ARTIFACT_PACKS.filter(p => domain.packIds.includes(p.id));
      if (packs.length === 0) return;
      content += `▸ ${domain.name}\n`;
      content += `  ${domain.thesis}\n\n`;
      packs.forEach(pack => {
        content += `  ◆ ${pack.name}\n`;
        content += `    ${pack.description}\n`;
                if (pack._emergenceClause) {
          content += `    Emergence: ${pack._emergenceClause}\n`;
        }
        content += `\n`;
      });
    });

    content += `\nRUNTIME CONCEPTS\n`;
    content += `${'─'.repeat(40)}\n\n`;
    content += `• Unified Runtime: Single substrate for all tiers. No system gating.\n`;
    content += `• Pipeline Slots: Each pack = 1 slot. Plans differ in slot capacity (3/6/12).\n`;
    content += `• Capability Registry: Internal registry tracks all capabilities with metadata.\n`;
    content += `• Governed Invocation: Every capability call passes through safety guards.\n`;
    content += `• Confidence Scoring: Exponential moving average tracks capability reliability.\n`;
    content += `• Pipeline Orchestration: DAG-based execution with cascade/parallel/adaptive modes.\n`;
    content += `• Memory Tiering: Hot → Warm → Cold → Archive with adaptive limits.\n`;
    content += `\n© ${new Date().getFullYear()} CMPSBL®. All rights reserved.\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'substrate-capability-reference-v3.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Developer Reference — Substrate Capabilities"
        description="Complete developer reference for baseline capabilities, pipeline packs, usage examples, and runtime concepts."
      />
      <PublicNav />

      <main className="pt-28 pb-20">
        {/* Header */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="px-3 py-1 text-xs border-primary/30">
                  <Code className="w-3 h-3 mr-1.5 inline" />
                  Developer Reference
                </Badge>
                <Badge variant="secondary" className="text-[10px]">v3</Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                Substrate Capability Reference
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Baseline capabilities, pack-enabled capabilities, usage patterns, and runtime concepts.
              </p>
              <Button onClick={handleDownload} variant="outline" className="mt-4">
                <Download className="w-4 h-4 mr-2" />
                Download Reference (.txt)
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <section className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="baseline" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="baseline" className="text-xs">
                  <Layers className="w-3.5 h-3.5 mr-1.5" />
                  Baseline
                </TabsTrigger>
                <TabsTrigger value="packs" className="text-xs">
                  <Package className="w-3.5 h-3.5 mr-1.5" />
                  Pack-Enabled
                </TabsTrigger>
                <TabsTrigger value="concepts" className="text-xs">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  Concepts
                </TabsTrigger>
              </TabsList>

              {/* Baseline Tab */}
              <TabsContent value="baseline" className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  These capabilities are always active for every user on every plan. They form the 
                  foundational runtime that pipeline packs build upon.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {BASELINE_PILLARS.map(pillar => {
                    const PIcon = ICON_MAP[pillar.icon] || Brain;
                    return (
                      <Card key={pillar.id} className="border-border/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <PIcon className="w-4.5 h-4.5 text-primary" />
                            </div>
                            <CardTitle className="text-base">{pillar.name}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <p className="text-sm text-muted-foreground">{pillar.summary}</p>
                          <ul className="space-y-1">
                            {pillar.highlights.map(h => (
                              <li key={h} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-1.5" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Pack-Enabled Tab */}
              <TabsContent value="packs" className="space-y-8">
                <p className="text-sm text-muted-foreground">
                  These capabilities are activated when their corresponding pipeline pack is enabled. 
                  Each pack consumes exactly 1 pipeline slot.
                </p>
                {STRATEGIC_DOMAINS.map(domain => {
                  const packs = ARTIFACT_PACKS.filter(p => domain.packIds.includes(p.id));
                  if (packs.length === 0) return null;
                  return (
                    <div key={domain.id} className="space-y-3">
                      <h3 className="font-bold text-lg">{domain.name}</h3>
                      <p className="text-sm text-muted-foreground">{domain.thesis}</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {packs.map(pack => (
                          <Card key={pack.id} className="border-border/40">
                            <CardContent className="p-4 space-y-2">
                              <h4 className="font-semibold text-sm">{pack.name}</h4>
                              <p className="text-xs text-muted-foreground">{pack.description}</p>
                              {pack._emergenceClause && (
                                <p className="text-[11px] text-primary/70 italic">
                                  Emergence: {pack._emergenceClause}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              {/* Concepts Tab */}
              <TabsContent value="concepts" className="space-y-6">
                <div className="prose prose-sm prose-invert max-w-none">
                  {[
                    {
                      title: 'Unified Runtime',
                      body: 'The substrate operates as a single coherent runtime for all users. There are no stripped-down versions. The free tier and the enterprise tier execute the same runtime. Systems compose freely without version fragmentation.',
                    },
                    {
                      title: 'Pipeline Slots',
                      body: 'Each pipeline pack consumes exactly 1 slot. Plans differ in slot capacity: Builder (3), Operator (6), Architect (12). All 24 packs are visible to all users — there is no tier-based gating on pack visibility.',
                    },
                    {
                      title: 'Capability Registry',
                      body: 'An internal registry tracks all capabilities with metadata including risk classification, reversibility, module assignment, confidence scores, and invocation counts. The registry is the single source of truth for system capability.',
                    },
                    {
                      title: 'Governed Invocation',
                      body: 'Every capability call passes through a safety guard layer that checks risk level, caller authorization, and input validation before execution. High-risk operations require additional governance approval.',
                    },
                    {
                      title: 'Confidence Scoring',
                      body: 'Each capability maintains a confidence score updated via exponential moving average after every invocation. Low-confidence capabilities may be flagged for review or temporarily demoted.',
                    },
                    {
                      title: 'Memory Tiering',
                      body: 'Memory is organized into Hot (active recall), Warm (recent context), Cold (archived), and Archive (permanent) tiers. Adaptive limits scale based on user activity patterns. SM-2 spaced repetition governs review scheduling.',
                    },
                    {
                      title: 'Pipeline Orchestration',
                      body: 'Capabilities compose into pipelines executed via DAG coordination. Execution modes include cascade (sequential), parallel, adaptive (runtime-determined), and staged (phased rollout). Meta-engines orchestrate multiple engines into compound workflows.',
                    },
                  ].map(concept => (
                    <Card key={concept.title} className="border-border/40 not-prose">
                      <CardContent className="p-5 space-y-2">
                        <h3 className="font-bold">{concept.title}</h3>
                        <p className="text-sm text-muted-foreground">{concept.body}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <EnhancedFooter />
    </div>
  );
}
