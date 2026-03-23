/**
 * Intent Mesh — Public Website Documentation Page
 * /intent-mesh — SEO-optimized public doc about the mesh architecture
 */

import { SEO } from "@/components/SEO";
import { ArrowRight, Brain, Network, Shield, Zap, Eye, BarChart3, Layers, RefreshCw, GitBranch, Target, Lightbulb, Activity, Radar, Route } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { IntentMeshGraph } from "@/components/substrate/IntentMeshGraph";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const CAPABILITY_STATS = {
  totalCapabilities: 34,
  discoveryMethods: 7,
  dashboardViews: 6,
  terminalCommands: 26,
};

const ARCHITECTURE_LAYERS = [
  { icon: Layers, name: "Advertisement", desc: "Nodes declare capabilities for autonomous composition" },
  { icon: GitBranch, name: "Routing", desc: "Intelligent domain-based matching with composite resolution" },
  { icon: Shield, name: "Governance", desc: "Kill-switch and risk gating — safe by default" },
  { icon: BarChart3, name: "Learning", desc: "Continuous improvement through interaction feedback" },
  { icon: Lightbulb, name: "Discovery", desc: "Autonomous capability gap detection and proposal" },
  { icon: RefreshCw, name: "Refinement", desc: "Multi-turn resolution with quality scoring" },
  { icon: Activity, name: "Live Analysis", desc: "Real-time gap detection with auto-proposals" },
  { icon: Route, name: "Pattern Intelligence", desc: "Sequential pattern detection with memory optimization" },
];

const NODE_GROUPS = [
  {
    layer: "Kernel",
    nodes: [
      { name: "BRAIN", capabilities: 3, desc: "Reasoning, prediction, cross-primitive insight" },
      { name: "MEMORY", capabilities: 4, desc: "Semantic search, pattern matching, learning context" },
      { name: "CORTEX", capabilities: 3, desc: "Orchestration, bottleneck analysis, workflow coordination" },
    ],
  },
  {
    layer: "Cognitive",
    nodes: [
      { name: "DECODE", capabilities: 2, desc: "Intent analysis, context enrichment" },
      { name: "ENCODE", capabilities: 2, desc: "Code analysis, generation context" },
      { name: "DREAM", capabilities: 2, desc: "Synthesis context, exploration insights" },
    ],
  },
  {
    layer: "Operational",
    nodes: [
      { name: "DEFENSE", capabilities: 7, desc: "Threat scoring, IP reputation, anomaly detection, geo analysis" },
      { name: "IDENTITY", capabilities: 4, desc: "Actor resolution, trust scoring, auth strength" },
      { name: "VISION", capabilities: 4, desc: "Session analytics, usage patterns, anomaly scoring" },
    ],
  },
  {
    layer: "Administrative",
    nodes: [
      { name: "ECONOMY", capabilities: 4, desc: "Cost forecasting, budget checks, quota status" },
      { name: "AUDIT", capabilities: 3, desc: "Compliance scoring, change velocity, forensics" },
      { name: "ACCESS", capabilities: 2, desc: "Developer profiles, permission auditing" },
    ],
  },
  {
    layer: "Orchestrator",
    nodes: [
      { name: "NEXUS", capabilities: 2, desc: "Provider health, optimal AI model routing" },
      { name: "RELAY", capabilities: 3, desc: "Email resolution, delivery history, engagement scoring" },
      { name: "SANDBOX", capabilities: 2, desc: "Safe evaluation, safety assessment" },
    ],
  },
  {
    layer: "Infrastructure",
    nodes: [
      { name: "SYSTEM", capabilities: 2, desc: "Health checks, incident analysis" },
      { name: "EVOLUTION", capabilities: 2, desc: "Evolution status, upgrade readiness" },
      { name: "INCLUSIVE", capabilities: 2, desc: "Accessibility scoring, usability assessment" },
      { name: "RIPPLE", capabilities: 2, desc: "Webhook health, event propagation" },
      { name: "INTEGRATION", capabilities: 2, desc: "Connector status, schema mapping" },
    ],
  },
];

const SELF_IMPROVEMENT_FEATURES = [
  {
    icon: Target,
    title: "Node Self-Discovery",
    desc: "All execution surfaces autonomously detect capability gaps and propose new features for human approval — the mesh grows smarter over time.",
  },
  {
    icon: BarChart3,
    title: "Intent Quality Scoring",
    desc: "Every interaction is quality-scored and tracked, enabling continuous improvement across all node capabilities.",
  },
  {
    icon: RefreshCw,
    title: "Continuous Learning",
    desc: "Insights from every resolution automatically feed back into the system, making each node progressively more capable.",
  },
  {
    icon: Zap,
    title: "Autonomous Expansion",
    desc: "Scheduled cycles discover gaps, propose improvements, and expand capabilities — all governed by a global safety switch.",
  },
  {
    icon: Activity,
    title: "Live Gap Detection",
    desc: "Real-time analysis surfaces unresolved intents and capability gaps, auto-generating improvement proposals.",
  },
  {
    icon: Radar,
    title: "Cross-Primitive Affinity",
    desc: "The mesh learns which primitives work best together, discovering collaboration clusters and optimizing routing over time.",
  },
  {
    icon: Route,
    title: "Pattern Recognition",
    desc: "Detects recurring interaction patterns and crystallizes them into optimized memories for faster future resolution.",
  },
];

export default function IntentMeshPublic() {
  return (
    <>
      <SEO
        title="Intent Mesh — Cross-Primitive Signal Routing | CMPSBL"
        description="CMPSBL's Intent Mesh routes signals across 40 primitives autonomously. Self-learning capability discovery, resolver composition, Memory Stream crystallization, and governed orchestration."
        image="https://cmpsbl.com/og/intent-mesh.jpg"
        keywords={['intent mesh', 'cross-primitive discovery', 'AI capability composition', 'autonomous AI routing', 'emergent intelligence']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Architecture', url: 'https://cmpsbl.com/architecture' },
          { name: 'Intent Mesh', url: 'https://cmpsbl.com/intent-mesh' },
        ]}
      />

      <PublicNav />
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
            <motion.div {...fadeUp} className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Network className="w-5 h-5 text-primary" />
                <span className="text-sm font-mono text-muted-foreground tracking-wider uppercase">
                  CMPSBL OS Substrate
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Intent Mesh
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
                Emergent cross-primitive intelligence. Execution surfaces broadcast intents, discover capabilities autonomously, and learn from every interaction.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(CAPABILITY_STATS).map(([key, value]) => (
                  <div key={key} className="bg-card border border-border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                      {key === "totalCapabilities" ? "Capabilities" : key === "discoveryMethods" ? "Discovery Methods" : key === "dashboardViews" ? "Dashboard Views" : key === "terminalCommands" ? "Terminal Commands" : key}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Interactive Mesh Visualization */}
        <section className="max-w-6xl mx-auto px-6 py-8">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-bold mb-2">Live Mesh Topology</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Hover nodes to see capability connections. Node size reflects capability count.
            </p>
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden" style={{ height: 480 }}>
              <IntentMeshGraph className="h-full" />
            </div>
          </motion.div>
        </section>

        {/* Architecture */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold mb-4">Eight-Layer Architecture</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              The mesh operates across eight distinct layers, each providing a specific capability class — from capability advertisement through autonomous self-improvement.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ARCHITECTURE_LAYERS.map((layer) => (
                <div key={layer.name} className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-colors">
                  <layer.icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-2">{layer.name}</h3>
                  <p className="text-sm text-muted-foreground">{layer.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Resolution Flow */}
        <section className="border-y border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-bold mb-4">Seamless Intent Resolution</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl">
                When a node needs enriched data, it broadcasts an intent. The mesh autonomously discovers capable responders, composes results from multiple nodes, and learns from every interaction.
              </p>
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 font-mono text-sm overflow-x-auto">
                <pre className="text-muted-foreground whitespace-pre leading-relaxed">{`Node broadcasts intent
  ▼
Mesh discovers capable responders
  ▼
Parallel resolution across primitives
  ▼
Composed enriched result
  ▼
Auditable receipt + quality score
  ▼
Learning feedback → improved future routing`}</pre>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Self-Improvement */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold mb-4">Self-Improving Intelligence</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              The mesh doesn't just route — it learns. Every interaction feeds back into the system, making it smarter over time.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {SELF_IMPROVEMENT_FEATURES.map((feat) => (
                <div key={feat.title} className="bg-card border border-border rounded-xl p-6">
                  <feat.icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Node Registry */}
        <section className="border-y border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <motion.div {...fadeUp}>
              <h2 className="text-3xl font-bold mb-4">Execution Surface Capability Registry</h2>
              <p className="text-muted-foreground mb-10 max-w-2xl">
                Every node in the substrate participates in the mesh, advertising capabilities that other nodes can discover and compose dynamically.
              </p>
              <div className="space-y-8">
                {NODE_GROUPS.map((group) => (
                  <div key={group.layer}>
                    <h3 className="text-sm font-mono text-primary tracking-wider uppercase mb-3">{group.layer} Layer</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.nodes.map((node) => (
                        <div key={node.name} className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold font-mono text-sm">{node.name}</span>
                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              {node.capabilities} capabilities
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{node.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Governance */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold mb-4">Governance & Safety</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <Shield className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Kill Switch</h3>
                <p className="text-sm text-muted-foreground">OFF by default. When disabled, all broadcasts return immediately with no execution.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <Eye className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Read-Only Default</h3>
                <p className="text-sm text-muted-foreground">All capabilities default to read risk. Mutations blocked unless governance mode is explicitly escalated.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <Brain className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Human Approval</h3>
                <p className="text-sm text-muted-foreground">Self-discovered capabilities require human approval before entering the live manifest.</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="border-t border-border">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Explore the Substrate</h2>
            <p className="text-muted-foreground mb-8">
              The Intent Mesh is one layer of the CMPSBL Substrate — a cognitive orchestration system with nodes, mesh overlays, and convergence zones.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/modules"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                All Nodes <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/documentation"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
              >
                Documentation
              </Link>
            </div>
          </div>
        </section>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Intent Mesh",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Cloud",
              description: "Emergent cross-primitive intelligence layer for autonomous capability discovery across AI substrate execution surfaces.",
              author: {
                "@type": "Organization",
                name: "CMPSBL Research Team",
              },
              publisher: {
                "@type": "Organization",
                name: "CMPSBL",
              },
            }),
          }}
        />
      </div>
      <EnhancedFooter />
    </>
  );
}
