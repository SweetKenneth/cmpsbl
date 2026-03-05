/**
 * CLUSTER POST: Inside the Modules — What Makes Each One Special
 * ~1000+ words, links back to pillar post
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Brain, Shield, Route, Activity, Scale, Dna, Fingerprint, Radio, Lightbulb, Workflow, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import heroImg from "@/assets/blog/clockless-modules-deep-dive.jpg";

const MODULES = [
  { icon: Brain, name: "MEMORY", tagline: "Three-Tier Persistent Memory", description: "MEMORY is the substrate's recall engine. It provides hot, warm, and cold memory layers with adaptive salience scoring. Every interaction is retained, tiered by relevance, and retrievable on demand. Unlike vector databases that store embeddings in isolation, MEMORY integrates contradiction detection across stored facts and uses SM-2 spaced repetition for reinforcement. This is why Clockless agents don't suffer from the context amnesia that plagues stateless platforms.", link: "/persistent-memory", linkLabel: "Explore MEMORY" },
  { icon: Route, name: "NEXUS", tagline: "Intelligent Multi-Provider Routing", description: "NEXUS is the routing brain. It matches every request to the optimal model, provider, and pipeline — automatically. Cost, latency, and quality are balanced in real time using a response quality feedback loop. When a provider goes down, NEXUS fails over instantly. When costs spike, it reroutes to cheaper alternatives without quality loss. This is the same routing technology that powers the Clockless free tier.", link: "/blog/ai-triad-intelligent-routing", linkLabel: "Read about routing" },
  { icon: Shield, name: "DEFENSE", tagline: "Always-On Runtime Security", description: "DEFENSE doesn't wait for threats — it hunts them. Behavioral anomaly detection profiles every request pattern. IP reputation scoring filters malicious actors at the edge. Prompt injection shielding catches adversarial inputs before they reach your models. Rate limiting prevents abuse. All of this runs on every request, for every tier, with zero configuration required.", link: "/blog/adversarial-ai-defense-module-response-2026", linkLabel: "Security deep dive" },
  { icon: Workflow, name: "ORCHESTRATOR", tagline: "DAG-Based Pipeline Execution", description: "ORCHESTRATOR composes multi-step operations into governed pipelines. Capabilities chain automatically with DAG coordination, supporting both cascading and parallel execution modes. Dependency resolution is automatic — if Step 3 needs the output of Step 1 and Step 2, ORCHESTRATOR runs 1 and 2 in parallel, then feeds their results to Step 3. Every invocation is wrapped in governance checks.", link: "/engines", linkLabel: "Browse engines" },
  { icon: Activity, name: "PULSE", tagline: "System-Wide Observability", description: "PULSE is the substrate's nervous system. It provides real-time health scoring for every module, anomaly detection alerts, usage analytics, and performance snapshots. When something drifts — a module's latency increases, error rates spike, or memory usage grows — PULSE catches it before it becomes a problem. The System Feed is powered by PULSE.", link: "/system-feed", linkLabel: "View system feed" },
  { icon: Scale, name: "GOVERNOR", tagline: "Bounded Authority & Audit Trails", description: "GOVERNOR ensures the substrate operates within defined limits. Role-based access control determines who can invoke what. Every operation is audit-logged with actor attribution, timestamp, and outcome. Governance modes (permissive, standard, strict) let you dial security to match your compliance requirements. Capability risk classification prevents high-risk operations from executing without explicit approval.", link: "/blog/autonomous-ai-governance-runtime-enforcement", linkLabel: "Governance in action" },
  { icon: Dna, name: "EVOLUTION", tagline: "Self-Improvement with Human Oversight", description: "EVOLUTION is what makes Clockless genuinely different from static platforms. The system proposes its own improvements, validates them in shadow mode against regression benchmarks, and — with governor approval — applies them to production. A shadow-to-production phased rollout means improvements are tested before they're live. You get a system that gets better autonomously while remaining under human control.", link: "/blog/evolving-software-v6-breakthrough", linkLabel: "Read about evolution" },
  { icon: Fingerprint, name: "IDENTITY", tagline: "Unified Authentication & Entitlements", description: "IDENTITY handles everything related to who you are and what you can do. Passkey and credential management, API key lifecycle, tier-based entitlements, and developer identity registry — all unified. No separate auth service, no third-party identity provider required.", link: "/blog/cmpsbl-access-identity-billing", linkLabel: "Identity & access" },
  { icon: Radio, name: "RELAY", tagline: "Event-Driven Module Communication", description: "RELAY is the substrate's event bus. Module-to-module communication, webhook lifecycle management, real-time subscription channels, and cross-system relay encryption — all handled natively. When DEFENSE detects a threat, RELAY broadcasts the event to GOVERNOR, PULSE, and MEMORY simultaneously. This is how the substrate thinks as a unified system rather than isolated services.", link: "/blog/cmpsbl-ripple-network-integration", linkLabel: "Network architecture" },
  { icon: Lightbulb, name: "BRAIN", tagline: "The Cognitive Stack", description: "BRAIN is the thinking layer. Intent classification extracts what users actually want. Contextual response generation produces outputs that account for history, preference, and situational context. Creative synthesis through dream cycles generates novel approaches. Meta-learning and self-reflection let the system evaluate and improve its own reasoning patterns.", link: "/blog/cmpsbl-brain-adaptive-learning-core", linkLabel: "Adaptive learning" },
];

export default function ClocklessModulesDeepDive() {
  return (
    <>
      <SEO
        title="Inside the Modules — CMPSBL Substrate Architecture Deep Dive"
        description="A deep dive into every CMPSBL substrate module — from MEMORY's three-tier persistence to EVOLUTION's autonomous self-improvement. Understand each module's role in the Clockless Cognitive Reality engine."
        type="article"
        publishedTime="2026-02-27"
        keywords={['CMPSBL modules', 'substrate architecture', 'MEMORY module', 'DEFENSE module', 'AI module deep dive', 'cognitive infrastructure modules', 'BRAIN module', 'Clockless Cognitive Reality']}
      />
      <PublicNav />

      <main className="min-h-screen bg-background">
        <section className="pt-24 pb-12 border-b border-border/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button variant="ghost" size="sm" asChild className="mb-6">
              <Link to="/blog"><ArrowLeft className="w-4 h-4 mr-2" />Back to Blog</Link>
            </Button>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">Technology</Badge>
              <Badge variant="outline">Cluster Post</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Inside the Modules: What Makes Each One Special
            </h1>

            <p className="text-xl text-muted-foreground mb-6">
              The Clockless substrate isn't a monolith — it's a composable system of specialized modules, each with unique capabilities that emerge from the unified runtime. Here's what each one does and why it matters.
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />February 27, 2026</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />12 min read</span>
            </div>

            <img src={heroImg} alt="Grid of glowing AI substrate modules each with unique visual identity" className="w-full rounded-xl border border-border/50 shadow-xl" />
          </div>
        </section>

        <article className="container mx-auto px-4 max-w-4xl py-12 prose prose-invert prose-lg max-w-none">
          <p className="text-xl leading-relaxed">
            When you provision a <Link to="/blog/clockless-account-setup-artifact-packs" className="text-primary hover:underline font-semibold">Clockless account and choose your artifact pack</Link>, you're getting access to a substrate built from specialized modules. Each module is a first-class citizen in the architecture — independently deployable, but designed to amplify every other module through the shared runtime. Here's what makes each one irreplaceable.
          </p>

          <p>
            For context on how these modules fit into the bigger picture, see <Link to="/blog/clockless-what-makes-it-different" className="text-primary hover:underline">what makes Clockless different</Link> and our <Link to="/blog/sparta-epoch-rebuild-from-scratch" className="text-primary hover:underline">full substrate rebuild story</Link>.
          </p>

          <div className="space-y-8 mt-12">
            {MODULES.map((mod, i) => (
              <Card key={mod.name} className="border-border/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                      <mod.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold">{mod.name}</h2>
                        <Badge variant="outline" className="text-xs">{mod.tagline}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">{mod.description}</p>
                      <Link to={mod.link} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3 font-medium">
                        {mod.linkLabel} →
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">The Sum Is Greater Than the Parts</h2>
          <p>
            Individually, each module is capable. Together, they create something no fragmented stack can replicate. When DEFENSE detects a threat, RELAY broadcasts it to GOVERNOR for policy enforcement, MEMORY for pattern storage, and PULSE for alerting — all within milliseconds, all sharing the same context. This is what <a href="https://en.wikipedia.org/wiki/Emergence" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">emergent behavior <ExternalLink className="w-3 h-3 inline" /></a> looks like in production AI systems.
          </p>
          <p>
            To see all modules organized by architectural layer, visit the <Link to="/modules" className="text-primary hover:underline">Module Atlas</Link>. To start building with them, read the <Link to="/blog/clockless-account-setup-artifact-packs" className="text-primary hover:underline font-semibold">complete setup and artifact pack guide</Link>.
          </p>

          {/* Related Posts */}
          <div className="border-t border-border/50 mt-16 pt-12">
            <h2 className="text-2xl font-bold mb-6">Related Reading</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/blog/clockless-account-setup-artifact-packs" className="group p-5 rounded-xl border border-primary/20 bg-primary/5 hover:border-primary/40 transition-all">
                <Badge className="mb-2 text-xs bg-primary/10 text-primary border-primary/20">Pillar Guide</Badge>
                <h3 className="font-bold group-hover:text-primary transition-colors">Account Setup & Artifact Packs</h3>
                <p className="text-sm text-muted-foreground mt-1">Everything you need to get started on Clockless.</p>
              </Link>
              <Link to="/blog/clockless-what-makes-it-different" className="group p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                <Badge variant="outline" className="mb-2 text-xs">Cluster</Badge>
                <h3 className="font-bold group-hover:text-primary transition-colors">What Makes Clockless Different</h3>
                <p className="text-sm text-muted-foreground mt-1">Why developers and enterprises choose composable cognitive infrastructure.</p>
              </Link>
              <Link to="/blog/building-agents-that-learn" className="group p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                <Badge variant="outline" className="mb-2 text-xs">Development</Badge>
                <h3 className="font-bold group-hover:text-primary transition-colors">Building Agents That Learn</h3>
                <p className="text-sm text-muted-foreground mt-1">Architectural patterns for AI systems that improve through experience.</p>
              </Link>
              <Link to="/blog/agent-memory-anti-patterns" className="group p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                <Badge variant="outline" className="mb-2 text-xs">Development</Badge>
                <h3 className="font-bold group-hover:text-primary transition-colors">Agent Memory Anti-Patterns</h3>
                <p className="text-sm text-muted-foreground mt-1">Common mistakes that cause AI agents to lose context.</p>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
