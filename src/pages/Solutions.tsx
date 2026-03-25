/**
 * Solutions — CMPSBL Product Suite
 * Complete rewrite with updated 40-primitive architecture info
 */

import { Link } from "react-router-dom";
import { Shield, Globe, Zap, Brain, ArrowRight, CheckCircle, Code, Gauge, Moon, Layers, Terminal, Package, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { SEO } from "@/components/SEO";
// SEO props defined in JSX
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const solutions = [
  {
    icon: Brain,
    name: "Persistent Memory",
    tagline: "AI Memory That Lasts Forever",
    description: "Add persistent memory to any AI agent in under an hour. 4-tier recall (hot/warm/cold/legacy) across sessions — your AI never forgets a user, a preference, or a context. Free for all users.",
    features: ["Drop-in integration — no rewrites", "4-tier memory architecture", "Automatic compression & retrieval", "Cross-session context recall", "Works with any framework", "Free for all users"],
    metrics: ["FREE", "< 1 Hour Setup", "Any Agent"],
    link: "/persistent-memory",
    color: "from-neon-purple to-neon-purple",
  },
  {
    icon: Zap,
    name: "NEXUS — Smart Routing",
    tagline: "Intelligent Multi-Provider Routing",
    description: "Routes every AI request to the optimal provider based on task complexity, cost, and latency. Automatic failover across 13+ providers. Zero vendor lock-in.",
    features: ["13+ AI providers supported", "Automatic failover & load balancing", "Cost optimization per request", "Task-aware model selection", "Zero-downtime provider switching", "Latency-optimized routing"],
    metrics: ["13+ Providers", "< 100ms Routing", "Zero Lock-In"],
    link: "/upgrade",
    color: "from-neon-cyan to-neon-blue",
  },
  {
    icon: Moon,
    name: "Self-Improvement Cycles",
    tagline: "Background Learning & Pattern Extraction",
    description: "Your AI processes learnings between sessions — consolidating memory, extracting patterns, and improving capabilities. Runs automatically in the background.",
    features: ["Extract patterns from interactions", "Recognize emerging themes", "Encode into persistent memory", "Apply improvements automatically", "Measure performance gains", "Scheduled or on-demand"],
    metrics: ["5-Phase Loop", "Automatic", "Always Learning"],
    link: "/composable-cognitives",
    color: "from-primary to-neon-purple",
  },
  {
    icon: Shield,
    name: "Security Layer",
    tagline: "Adaptive Threat Detection",
    description: "Behavioral threat detection, intelligent rate limiting, and governance rules that learn from attack patterns. Security that adapts in real-time.",
    features: ["AI-powered bot detection", "Behavioral fingerprinting", "Real-time threat blocking", "Adaptive rate limiting", "Governance rule enforcement", "Enterprise audit logging"],
    metrics: ["Adaptive", "Real-Time", "Enterprise Grade"],
    link: "/store?tab=plans",
    color: "from-destructive to-neon-magenta",
  },
  {
    icon: Package,
    name: "Capability Packs",
    tagline: "Modular Feature Upgrades",
    description: "24 activatable packs across 6 categories. Each pack = 1 slot. Choose the exact capabilities your AI needs — swap anytime.",
    features: ["24 packs across 6 categories", "Equal-weight slot system", "Activate and swap instantly", "All packs visible to all tiers", "Category-organized catalog", "Builder to Architect scaling"],
    metrics: ["24 Packs", "6 Categories", "1 Slot Each"],
    link: "/packs",
    color: "from-neon-amber to-neon-amber",
  },
  {
    icon: Globe,
    name: "Self-Hosted Deployment",
    tagline: "Your Infrastructure, Full Control",
    description: "Deploy the complete CMPSBL platform on your own servers. Air-gapped, sovereign, and fully compliant. Contact enterprise@CMPSBL.com for pricing.",
    features: ["Full platform deployment", "Air-gapped security option", "Data sovereignty guaranteed", "Compliance-ready configuration", "Dedicated memory partitions", "Organization workspaces"],
    metrics: ["Self-Hosted", "Sovereign", "40 Primitives"],
    link: "/enterprise",
    color: "from-neon-green to-neon-green",
  },
  {
    icon: Terminal,
    name: "Developers Playground",
    tagline: "Interactive Development Sandbox",
    description: "Run primitives, remix templates, and test capabilities in real-time. The fastest way to prototype with CMPSBL.",
    features: ["Live code execution", "30 free templates", "Real-time preview", "API testing sandbox", "Export to production", "Free for all users"],
    metrics: ["FREE", "30 Templates", "Real-Time"],
    link: "/codelab",
    color: "from-neon-cyan to-neon-cyan",
  },
];

export default function Solutions() {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-80" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 55%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-3" style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.04) 0%, transparent 55%)" }} />
      </div>

      <SEO
        title="Solutions — Products & Deployment Options | CMPSBL"
        description="CMPSBL's full product suite: free persistent memory, capability packs, smart routing, self-improvement cycles, developer playground, and self-hosted deployment options."
        canonical="https://cmpsbl.com/solutions"
        keywords={['AI solutions', 'persistent memory', 'composable AI', 'self-hosted AI', 'capability packs']}
      />

      <PublicNav />

      {/* Hero */}
      <section className="relative py-20 sm:py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <Gauge className="w-3 h-3 mr-2" />
              40 Primitives · Agents · Engines · Layers · Organs
            </Badge>
            
             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-foreground leading-tight">
               Everything Your AI <span className="text-primary">Needs to Think</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              <Link to="/persistent-memory" className="text-primary hover:underline font-medium">Persistent memory</Link>.{" "}
              Intelligent routing. Offline learning. Governed evolution.{" "}
              <Link to="/enterprise" className="text-primary hover:underline font-medium">Self-hosted deployment</Link>.{" "}
              All production-ready. Built on the{" "}
              <Link to="/ai-operating-system" className="text-primary hover:underline font-medium">CMPSBL cognitive platform</Link>.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/15">
                <Link to="/auth">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/store?tab=plans">View Plans</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-12 sm:py-16 px-3 sm:px-4 relative z-10">
        <div className="container mx-auto max-w-6xl space-y-6">
          {solutions.map((solution, index) => (
            <motion.div key={solution.name} {...fadeUp} transition={{ duration: 0.5, delay: index * 0.05 }}>
               <Card className="bg-card/80 backdrop-blur-sm border border-border glass-edge card-lift hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group overflow-hidden">
                 <div className={`h-1 w-full bg-gradient-to-r ${solution.color} opacity-80`} />
                <CardContent className="p-4 sm:p-6 md:p-10">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                       <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${solution.color} flex items-center justify-center mb-3 sm:mb-4 shadow-lg`}>
                         <solution.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black mb-2 text-foreground">{solution.name}</h2>
                      <p className="text-base sm:text-lg text-primary font-medium mb-4">{solution.tagline}</p>
                      <p className="text-muted-foreground leading-relaxed mb-6">{solution.description}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {solution.metrics.map((metric) => (
                          <Badge key={metric} variant="outline" className="text-xs font-mono">{metric}</Badge>
                        ))}
                      </div>
                       <Link to={solution.link}>
                         <Button className="bg-primary hover:bg-primary/90 min-h-[44px] gap-2 shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                           Learn More <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-foreground">Key Features</h3>
                      <ul className="space-y-3">
                        {solution.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-[hsl(var(--system-green))] flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-20 px-4 relative z-10">
        <motion.div {...fadeUp} className="container mx-auto max-w-4xl">
          <Card className="border-primary/20 bg-primary/5 overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center">
              <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-black mb-4 text-foreground">Enterprise & Self-Hosted</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Need dedicated infrastructure, air-gapped deployment via LNCHBL,{" "}
                <a href="https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">SOC 2</a>{" "}
                compliance guarantees, or custom capacity?{" "}
                See <Link to="/use-cases" className="text-primary hover:underline font-medium">industry use cases</Link>{" "}
                or contact our enterprise team for tailored pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <a href="mailto:enterprise@CMPSBL.com">
                    <Mail className="w-4 h-4" />
                    enterprise@CMPSBL.com
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/enterprise">Enterprise Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/20 via-muted/30 to-muted/20 relative z-10">
        <motion.div {...fadeUp} className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4 text-foreground">Start Building Today</h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-8">
            Free tier. No credit card. <Link to="/persistent-memory" className="text-primary hover:underline font-medium">Persistent memory</Link>{" "}
            in under an hour. Explore the <Link to="/academy" className="text-primary hover:underline font-medium">Developer Academy</Link>{" "}
            or read the{" "}
            <a href="https://en.wikipedia.org/wiki/Large_language_model" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LLM routing</a> docs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/15">
              <Link to="/auth">Get Started Free <ArrowRight className="w-5 h-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/store?tab=plans">View Plans</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <RelatedCapabilities />
      <PageSEOBlock path="/solutions" title="Solutions" />
      <EnhancedFooter />
    </div>
  );
}
