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
    "@type": "Person",
    "name": "Kenneth E Sweet Jr"
  },
  "offers": {
    "@type": "Offer",
    "price": "3999",
    "priceCurrency": "USD"
  },
  "featureList": [
    "13-module kernel architecture",
    "Persistent memory (3-tier system)",
    "Self-improvement engine",
    "Autonomous dream cycles",
    "Multi-provider AI routing",
    "Real-time observability"
  ]
};

const modules = [
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
  { name: "SYSTEM", desc: "Admin operations, backup/restore", icon: Settings, layer: "Admin" },
  { name: "MODERNIZER", desc: "Self-improvement engine", icon: TrendingUp, layer: "Admin" },
  { name: "CORTEX", desc: "Agency-class autonomous orchestration", icon: Sparkles, layer: "Orchestrator" },
];

const metrics = [
  { label: "Lines of Code", value: "131,000+", detail: "Production codebase" },
  { label: "Modules", value: "13", detail: "Complete kernel architecture" },
  { label: "Commands", value: "250+", detail: "Terminal-accessible operations" },
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
    answer: "Yes. CMPSBL is a live, operational system with 131,000+ lines of production code, 50+ database tables, and 250+ terminal commands. The system boots in ~109ms and maintains 100% module health with circuit breakers for fault isolation."
  },
  {
    question: "What's included in a license?",
    answer: "The Substrate OS License ($3,999) includes: the complete 13-module kernel, persistent memory system, Dream evolution engine, multi-provider AI routing, security perimeter, observability dashboard, 250+ terminal commands, and the Install Wizard for deployment."
  },
  {
    question: "Can the entire IP be acquired?",
    answer: "Yes. For exclusive acquisition of the entire CMPSBL intellectual property, including all source code, patents pending, trademarks, and documentation, contact us directly at promptfluid@gmail.com or (214) 548-0883."
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
        description="The world's first cognitive orchestration substrate. 13-module kernel solving AI chatbot behavioral drift through persistent memory, self-improvement, and autonomous learning. License from $3,999 or acquire the IP."
        keywords={["AI behavioral drift", "chatbot consistency", "persistent memory AI", "self-improving AI", "cognitive orchestration", "AI substrate", "CMPSBL", "promptfluid", "autonomous AI", "enterprise AI"]}
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
                  The Solution to AI Behavioral Drift
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                CMPSBL is the world's first cognitive orchestration substrate—a 13-module kernel that prevents AI chatbots from losing context, forgetting preferences, and degrading over time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" asChild className="gap-2">
                  <Link to="/marketplace">
                    <Zap className="w-5 h-5" />
                    License the OS — $3,999
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="gap-2">
                  <a href="mailto:promptfluid@gmail.com">
                    <Mail className="w-5 h-5" />
                    Acquire the IP
                  </a>
                </Button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  131,000+ Lines of Code
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  13-Module Architecture
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Production Live
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
                    <CardTitle className="text-lg text-destructive">Without CMPSBL</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>• AI loses context between sessions</p>
                    <p>• Personality and tone drift over time</p>
                    <p>• Single provider lock-in = single point of failure</p>
                    <p>• No visibility into AI decision-making</p>
                    <p>• Manual updates required for improvement</p>
                    <p>• Security gaps from adversarial inputs</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">With CMPSBL</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>• <strong>BRAIN</strong>: 3-tier persistent memory</p>
                    <p>• <strong>DREAM</strong>: Autonomous learning cycles</p>
                    <p>• <strong>NEXUS</strong>: 8+ provider failover</p>
                    <p>• <strong>VISION</strong>: Real-time observability</p>
                    <p>• <strong>MODERNIZER</strong>: Self-improvement engine</p>
                    <p>• <strong>DEFENSE</strong>: Security perimeter</p>
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
                <p className="text-muted-foreground">This is not vaporware. CMPSBL is a production system you can verify.</p>
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
{`CMPSBL OS Substrate v5.5.0
─────────────────────────────────
[CORE]       ████████████ READY      12ms
[RIPPLE]     ████████████ READY       3ms
[ACCESS]     ████████████ READY       9ms
[BRAIN]      ████████████ READY       8ms
[DECODE]     ████████████ READY       5ms
[DREAM]      ████████████ READY       6ms
[DEFENSE]    ████████████ READY       7ms
[NEXUS]      ████████████ READY      15ms
[VISION]     ████████████ READY       4ms
[INTEGRATION]████████████ READY      10ms
[SYSTEM]     ████████████ READY       5ms
[MODERNIZER] ████████████ READY      11ms
[CORTEX]     ████████████ READY      14ms
─────────────────────────────────
13 modules loaded | Health: 100%
Boot complete in 109ms`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 13-Module Architecture */}
        <section className="py-16 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">13-Module Kernel Architecture</h2>
                <p className="text-muted-foreground">Five-layer design for cognitive orchestration</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((mod) => (
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
                    <p className="text-sm text-muted-foreground">Pre-built cognitives for specific use cases like drift prevention, memory persistence, and self-healing chatbots.</p>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/marketplace">Browse Templates</Link>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden border-primary">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                  <CardHeader>
                    <CardTitle className="text-xl">Substrate OS License</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold text-primary">$3,999</div>
                    <p className="text-sm text-muted-foreground">Complete 13-module kernel, Install Wizard, documentation, and single-domain deployment rights.</p>
                    <Button asChild className="w-full">
                      <Link to="/marketplace">Purchase License</Link>
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
                    <p className="text-sm text-muted-foreground">Exclusive ownership of all source code, patents pending, trademarks, and documentation.</p>
                    <Button variant="outline" asChild className="w-full">
                      <a href="mailto:promptfluid@gmail.com">Email for Details</a>
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
                  <a href="mailto:promptfluid@gmail.com">
                    <Mail className="w-5 h-5" />
                    promptfluid@gmail.com
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="gap-2">
                  <a href="tel:+12145480883">
                    <Phone className="w-5 h-5" />
                    (214) 548-0883
                  </a>
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Created by <strong>Kenneth E Sweet Jr</strong> • PromptFluid® • © 2025-2026
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <EnhancedFooter />
    </>
  );
}
