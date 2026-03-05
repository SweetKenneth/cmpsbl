/**
 * Substrate Intelligence Page
 * For investors, acquirers, and enterprise buyers
 * Proof of technology, acquisition info, and CTAs
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQ } from "@/components/FAQ";
import { 
  Brain, Shield, Eye, Zap, Cpu, Moon, 
  CheckCircle2, ExternalLink, Mail, Phone, 
  Award, TrendingUp, Lock, Layers, Code2,
  Network, Activity, Settings, ArrowRight,
  FileText, Building2, Sparkles, BadgeCheck
} from "lucide-react";

// JSON-LD for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CMPSBL OS Substrate",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Cloud-Native",
  "description": "The world's first cognitive orchestration substrate solving AI chatbot behavioral drift through persistent memory, self-improvement, and autonomous learning cycles.",
  "author": {
    "@type": "Organization",
    "name": "CMPSBL Research Team"
  },
  "offers": {
    "@type": "Offer",
    "price": "2999",
    "priceCurrency": "USD",
    "description": "Developer License - Annual"
  },
  "featureList": [
    "Layered cognitive kernel architecture",
    "Persistent memory (3-tier system)",
    "Self-improvement engine",
    "Autonomous dream cycles",
    "Multi-provider AI routing",
    "Real-time observability"
  ]
};

const systems = [
  { name: "CORE", desc: "Kernel orchestration, scheduling, lifecycle", icon: Cpu, layer: "Kernel" },
  { name: "RIPPLE", desc: "Event-driven message bus, pub/sub", icon: Activity, layer: "Kernel" },
  { name: "ACCESS", desc: "Identity, API keys, entitlements", icon: Lock, layer: "Kernel" },
  { name: "BRAIN", desc: "Three-tier memory, knowledge graph", icon: Brain, layer: "Cognitive" },
  { name: "DECODE", desc: "Intent parsing, NL interface", icon: Code2, layer: "Cognitive" },
  { name: "DREAM", desc: "Autonomous evolution & synthesis", icon: Moon, layer: "Cognitive" },
  { name: "DEFENSE", desc: "Security perimeter, threat detection", icon: Shield, layer: "Operational" },
  { name: "NEXUS", desc: "Multi-provider AI routing (8+)", icon: Network, layer: "Operational" },
  { name: "VISION", desc: "Observability, telemetry, alerting", icon: Eye, layer: "Operational" },
  { name: "INTEGRATION", desc: "Enterprise adapter framework", icon: Building2, layer: "Operational" },
  { name: "SYSTEM", desc: "Admin operations, backup/restore", icon: Settings, layer: "CCR Zone" },
  { name: "EVOLUTION", desc: "Self-improvement lifecycle", icon: TrendingUp, layer: "Overlay" },
  { name: "INCLUSIVE", desc: "Human compatibility, WCAG pipeline", icon: BadgeCheck, layer: "Surface" },
  { name: "CORTEX", desc: "Agency-class autonomous orchestration", icon: Sparkles, layer: "Surface" },
  { name: "ENCODE", desc: "Code execution & generation intelligence", icon: Code2, layer: "Surface" },
];

const metrics = [
  { label: "Lines of Code", value: "175,000+", detail: "Production codebase" },
  { label: "Entities", value: "24", detail: "10 + 5 + 9 layered architecture" },
  { label: "Commands", value: "360+", detail: "Terminal-accessible operations" },
  { label: "AI Providers", value: "8+", detail: "With auto-failover" },
  { label: "Memory Tiers", value: "3", detail: "Hot, Warm, Cold architecture" },
  { label: "Uptime Target", value: "99.9%", detail: "With auto-heal mechanisms" },
];

const faqItems = [
  {
    question: "What problem does CMPSBL solve?",
    answer: "CMPSBL solves AI chatbot behavioral drift—the phenomenon where AI systems lose consistency, forget context, and degrade in quality over time. Through persistent memory, autonomous learning cycles (Dream), and self-improvement engines, CMPSBL ensures AI systems remain stable, learn from interactions, and improve without manual intervention."
  },
  {
    question: "How is this different from other AI frameworks?",
    answer: "Unlike traditional frameworks that focus on model training or inference, CMPSBL operates as a complete 'operating system' layer. It provides memory persistence (3-tier architecture), multi-provider routing (8+ providers with auto-failover), security perimeter, observability, and autonomous self-improvement—all in one integrated substrate."
  },
  {
    question: "Is this production-ready?",
    answer: "Yes. CMPSBL is a live, operational system with 175,000+ lines of production code, 50+ database tables, and 360+ terminal commands. The system boots in ~109ms and maintains 100% system health with circuit breakers for fault isolation."
  },
  {
    question: "What's included in a license?",
    answer: "Developer License ($2,999/yr) includes: complete layered cognitive kernel (10 Matrix Nodes, 5 mesh overlays, 9 convergence zones), persistent memory system, Dream evolution engine, multi-provider AI routing, security perimeter, observability dashboard, 360+ terminal commands, and deployment bundle. Team, Research, Enterprise, and Strategic licenses available for larger deployments."
  },
  {
    question: "Can the entire IP be acquired?",
    answer: "Yes. For exclusive acquisition of the entire CMPSBL intellectual property, including all source code, patents pending, trademarks, and documentation, contact us directly at Dev@CMPSBL.com or (760) FLUID-AI."
  },
  {
    question: "What technology stack is used?",
    answer: "Frontend: React 18 + TypeScript + Vite + Tailwind CSS. Backend: Edge Functions (Deno) + PostgreSQL + WebSocket Realtime. The substrate is cloud-native and runs on commodity hardware."
  },
];

export default function SubstrateIntelligence() {
  return (
    <>
      <SEO 
        title="Substrate Intelligence | CMPSBL - AI Drift Prevention Technology"
        description="The world's first cognitive orchestration substrate. Layered kernel architecture solving AI chatbot behavioral drift through persistent memory, self-improvement, and autonomous learning. Developer License available or acquire the IP."
        keywords={['AI behavioral drift', 'chatbot consistency', 'persistent memory AI', 'self-improving AI', 'cognitive orchestration', 'AI substrate', 'CMPSBL', 'autonomous AI', 'enterprise AI']}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <PublicNav />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
                <BadgeCheck className="w-4 h-4" />
                First to Market — Production Live
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Stop AI Chatbot Drift. The Only Production Solution.
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                CMPSBL prevents AI chatbots from losing context, forgetting users, and drifting from their purpose. <strong className="text-foreground">Specialized Matrix Nodes with full documentation.</strong> Research published on Zenodo.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/substrate/licensing">
                    <Zap className="w-5 h-5" />
                    View Licensing Options
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="gap-2">
                  <a href="mailto:Dev@CMPSBL.com">
                    <Mail className="w-5 h-5" />
                    Acquire Exclusive IP Rights
                  </a>
                </Button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  24 Matrix Nodes — Fully Documented
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Academic Research on Zenodo
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Complete Source Code
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">The Problem We Solve</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive">❌ Without CMPSBL</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>• <strong>Loses context</strong> every session - users repeat themselves</p>
                    <p>• <strong>Personality drift</strong> - inconsistent responses</p>
                    <p>• <strong>Vendor lock-in</strong> - stuck with one provider</p>
                    <p>• <strong>Black box</strong> - can't see what AI is doing</p>
                    <p>• <strong>Manual updates</strong> - doesn't learn or improve</p>
                    <p>• <strong>Security risk</strong> - vulnerable to prompt injection</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">✅ With CMPSBL</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>• <strong>Remembers everything</strong> - 3-tier memory system (hot/warm/cold)</p>
                    <p>• <strong>Personality locked</strong> - consistent tone & behavior</p>
                    <p>• <strong>8+ AI providers</strong> - auto-failover, no lock-in</p>
                    <p>• <strong>Full visibility</strong> - every decision traced & logged</p>
                    <p>• <strong>Self-improves</strong> - learns overnight via dream cycles</p>
                    <p>• <strong>Security hardened</strong> - injection detection & blocking</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Live System Evidence */}
        <section className="py-16 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Live System Evidence</h2>
                <p className="text-muted-foreground"><strong className="text-foreground">Not slides. Not promises. Real code.</strong> CMPSBL is live and operational—you can verify every metric below.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                {metrics.map((m) => (
                  <Card key={m.label} className="text-center">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-primary">{m.value}</div>
                      <div className="text-sm font-medium">{m.label}</div>
                      <div className="text-xs text-muted-foreground">{m.detail}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Boot Signature */}
              <Card className="bg-background/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    System Boot Signature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted/50 p-4 rounded-lg text-xs md:text-sm overflow-x-auto font-mono">
{`CMPSBL Substrate
─────────────────────────────────
[CORE]       ████████████ READY      12ms
[DECODE]     ████████████ READY       5ms
[ENCODE]     ████████████ READY       6ms
[VISION]     ████████████ READY       4ms
[CORTEX]     ████████████ READY      14ms
[NEXUS]      ████████████ READY      15ms
[ECONOMY]    ████████████ READY       7ms
[SANDBOX]    ████████████ READY       8ms
[INCLUSIVE]  ████████████ READY       8ms
[INTEGRATION]████████████ READY      10ms
─────────────────────────────────
+ 5 Mesh Overlays | + 9 Zones
Boot complete in 109ms`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Layered Architecture */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Layered Cognitive Kernel</h2>
                <p className="text-muted-foreground">Matrix Nodes, mesh overlays, and convergence zones</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systems.map((mod) => (
                  <Card key={mod.name} className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <mod.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{mod.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{mod.layer}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{mod.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Acquisition & Licensing */}
        <section className="py-16 bg-muted/30 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Acquisition & Licensing</h2>
              <p className="text-muted-foreground mb-12">Multiple pathways to own this technology</p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary" />
                  <CardHeader>
                    <CardTitle className="text-xl">Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold">$27–$499</div>
                    <p className="text-sm text-muted-foreground">Pre-built drift prevention engines. Drop-in solutions for <strong className="text-foreground">memory persistence, self-correction, and behavioral anchoring.</strong></p>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/explore">Browse Templates</Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden border-primary">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">🔥 Developer License</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">Developer License</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold text-primary">$2,999<span className="text-lg font-normal text-muted-foreground">/year</span></div>
                    <p className="text-sm text-muted-foreground">Complete layered cognitive kernel. <strong className="text-foreground">Self-host on your infrastructure. BYOK architecture.</strong> Team, Research, Enterprise, and Strategic licenses also available.</p>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Instant checkout • Developer access in minutes</span>
                    </div>
                    <Button asChild className="w-full">
                      <Link to="/substrate/licensing">View All Licensing Options</Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
                  <CardHeader>
                    <CardTitle className="text-xl">Full IP Acquisition</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold">Contact Us</div>
                    <p className="text-sm text-muted-foreground"><strong className="text-foreground">Exclusive IP rights.</strong> All source code, patents pending, trademarks, documentation. First-to-market positioning.</p>
                    <Button variant="outline" asChild className="w-full">
                      <a href="mailto:Dev@CMPSBL.com">Email for Details</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              <FAQ items={faqItems} />
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-primary/5 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Ready to Eliminate AI Drift?</h2>
              <p className="text-muted-foreground mb-8">Contact us for licensing, acquisition, or partnership inquiries.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" asChild className="gap-2">
                  <a href="mailto:Dev@CMPSBL.com">
                    <Mail className="w-5 h-5" />
                    Dev@CMPSBL.com
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="gap-2">
                  <a href="tel:+17603584324">
                    <Phone className="w-5 h-5" />
                    (760) FLUID-AI
                  </a>
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Built by the <strong>CMPSBL Team</strong> • © 2025-2026
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <EnhancedFooter />
    </>
  );
}
