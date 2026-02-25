/**
 * Encode Info — Execution & Generation Module Product Page
 * SPARTA Epoch — ENCODE entity
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, Zap, Brain, ArrowRight, CheckCircle, MessageSquare, Database, Shield, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EncodeInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="ENCODE Module — Substrate Execution & Generation Engine | CMPSBL"
        description="ENCODE is the execution spine of the CMPSBL cognitive substrate. Structured task packets from DECODE, BRAIN recall/writeback, CLM self-improvement, and governed output."
        canonical="https://cmpsbl.com/products/encode"
        keywords={[
          'AI code execution',
          'CMPSBL ENCODE',
          'substrate execution engine',
          'intent-driven generation',
          'DECODE routing',
          'BRAIN recall',
          'CLM learning',
          'governed AI output',
          'task packet execution',
          'autonomous code generation'
        ]}
      />

      <PublicNav />

      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Code2 className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">ENCODE Module</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Execution Spine.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              System-Aware.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            ENCODE is the substrate's dedicated execution and generation engine. It receives structured intent packets from DECODE, 
            recalls context from BRAIN, produces governed output, and writes back learnings — all within a safety-first framework.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/os')}>
              Open Substrate <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/modules')}>
              All Modules
            </Button>
          </div>
        </div>
      </section>

      {/* Architecture Flow */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How ENCODE Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: MessageSquare, title: "DECODE Routes", desc: "Human intent is parsed by DECODE and structured into EncodeTaskPackets with constraints, context refs, and acceptance criteria.", color: "text-cyan-400" },
              { icon: Brain, title: "BRAIN Recalls", desc: "ENCODE pulls relevant prior decisions, code context, and artifacts from BRAIN's memory tiers before execution.", color: "text-violet-400" },
              { icon: Code2, title: "ENCODE Executes", desc: "The task is executed against the target surface (code, UI, docs, DB, edge, tests) with full governance controls.", color: "text-primary" },
              { icon: Database, title: "Writeback", desc: "Completion receipts, learnings, and summaries are written back to BRAIN for future recall and CLM improvement.", color: "text-emerald-400" },
            ].map((step, i) => (
              <Card key={i} className="p-6 text-center border-border/50 bg-card/50 backdrop-blur-sm">
                <step.icon className={`w-10 h-10 ${step.color} mx-auto mb-4`} />
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Core Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Structured Task Packets", desc: "Every execution starts with a typed EncodeTaskPacket — no freeform prompts. Intent, constraints, context refs, and acceptance criteria are all explicit." },
              { title: "BRAIN Bidirectional Pipeline", desc: "Recall prior context before execution. Write back receipts, artifacts, and learning signals after. Full knowledge loop." },
              { title: "CLM Self-Improvement", desc: "Continuous Learning Mode cycles analyze success rates, failure patterns, and execution metrics to generate upgrade proposals." },
              { title: "Governed Output", desc: "All destructive changes require explicit approval gates. CLM proposals are insights only — never self-applying." },
              { title: "Six Target Surfaces", desc: "Code, UI, docs, database, edge functions, and tests — ENCODE routes execution to the right surface automatically." },
              { title: "DECODE-Only Routing", desc: "ENCODE accepts packets only from DECODE's intent router. No direct human interaction — talk to DECODE to direct ENCODE." },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg border border-border/30 bg-muted/20">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal Commands */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Terminal Commands</h2>
          <Card className="p-6 bg-card/80 border-border/50 font-mono text-sm space-y-2">
            <div className="text-muted-foreground"># Check ENCODE module status</div>
            <div className="text-primary">$ encode.status</div>
            <div className="text-muted-foreground mt-4"># View queued task packets</div>
            <div className="text-primary">$ encode.queue</div>
            <div className="text-muted-foreground mt-4"># View completion receipts</div>
            <div className="text-primary">$ encode.receipts</div>
            <div className="text-muted-foreground mt-4"># Run CLM cycle for ENCODE</div>
            <div className="text-primary">$ clm.run encode</div>
            <div className="text-muted-foreground mt-4"># View all CLM reports in DECODE inbox</div>
            <div className="text-primary">$ decode.inbox</div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Part of the Cognitive Substrate</h2>
          <p className="text-muted-foreground mb-8">
            ENCODE sits in the Orchestrator layer alongside CORTEX, powered by DECODE's intent routing and BRAIN's memory pipeline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/modules')}>
              <Workflow className="w-4 h-4 mr-2" /> Explore All Modules
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/explore')}>
              Explore Artifacts
            </Button>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
