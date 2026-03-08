import { Link } from "react-router-dom";
import { Shield, Globe, Zap, Brain, ArrowRight, CheckCircle, Code, Lock, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImage from "@/assets/hero/neon-data-center.jpg";
import securityImage from "@/assets/hero/neon-defense-shield.jpg";
export default function Solutions() {
  const solutions = [
    {
      icon: Brain,
      name: "Persistent Memory",
      tagline: "AI Memory That Lasts Forever",
      description: "Add persistent memory to any AI agent in under an hour. Multi-tier recall across sessions — your AI never forgets a user, a preference, or a context.",
      features: ["Drop-in integration — no rewrites", "Multi-scope memory (user, project, global)", "Automatic compression & retrieval", "Cross-session context recall", "Works with any framework", "Free tier available"],
      metrics: ["FREE", "< 1 Hour Setup", "Any Agent"],
      link: "/persistent-memory"
    },
    {
      icon: Zap,
      name: "NEXUS Router",
      tagline: "Intelligent Multi-Provider Routing",
      description: "Routes every AI request to the optimal provider based on task complexity, cost, and latency. Automatic failover, zero vendor lock-in.",
      features: ["13+ AI providers supported", "Automatic failover & load balancing", "Cost optimization per request", "Task-aware model selection", "Zero-downtime provider switching", "Latency-optimized routing"],
      metrics: ["13+ Providers", "< 100ms Routing", "Zero Lock-In"],
      link: "/upgrade"
    },
    {
      icon: Shield,
      name: "DEFENSE Shell",
      tagline: "Adaptive Security Layer",
      description: "Behavioral threat detection, intelligent rate limiting, and governance rules that learn from attack patterns. Security that adapts in real-time.",
      features: ["AI-powered bot detection", "Behavioral fingerprinting", "Real-time threat blocking", "Adaptive rate limiting", "Governance rule enforcement", "Enterprise audit logging"],
      metrics: ["Adaptive", "Real-Time", "Enterprise Grade"],
      link: "/upgrade"
    },
    {
      icon: Brain,
      name: "Artifact Packs",
      tagline: "Modular Capability Upgrades",
      description: "24 activatable packs across 6 strategic domains. Each pack = 1 slot. Choose the exact capabilities your AI needs — swap anytime.",
      features: ["24 packs across 6 domains", "Equal-weight slot system", "Activate and swap instantly", "All packs visible to all tiers", "Domain-organized catalog", "Builder to Architect scaling"],
      metrics: ["24 Packs", "6 Domains", "1 Slot Each"],
      link: "/packs"
    },
    {
      icon: Globe,
      name: "LNCHBL (Self-Hosted)",
      tagline: "Your Infrastructure, Full Control",
      description: "Deploy the complete CMPSBL substrate on your own servers. Air-gapped, sovereign, and fully compliant. Architect tier includes deployment rights.",
      features: ["Full substrate deployment", "Air-gapped security option", "Data sovereignty guaranteed", "Compliance-ready configuration", "Dedicated memory partitions", "Organization workspaces"],
      metrics: ["Self-Hosted", "Sovereign", "Compliant"],
      link: "/enterprise"
    },
    {
      icon: Code,
      name: "CodeLab",
      tagline: "Interactive Development Environment",
      description: "Execute capabilities, remix templates, and test pipelines in real-time. The fastest way to prototype with CMPSBL's infrastructure.",
      features: ["Live code execution", "30 free templates", "Real-time preview", "API testing sandbox", "Export to production", "Free for all users"],
      metrics: ["FREE", "30 Templates", "Real-Time"],
      link: "/codelab"
    },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute bottom-40 left-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-3" style={{ background: "radial-gradient(circle, hsl(var(--neon-purple) / 0.04) 0%, transparent 60%)" }} />
      </div>
      <SEO 
        title="Enterprise AI Solutions | CMPSBL"
        description="Governed cognitive infrastructure for healthcare, finance, legal, and manufacturing. SOC 2 compliant with on-premises deployment options."
        canonical="https://cmpsbl.com/solutions"
        image="https://cmpsbl.com/og/solutions.jpg"
        keywords={['enterprise AI solutions', 'cognitive infrastructure', 'AI for healthcare', 'AI compliance', 'governed AI', 'on-premises AI']}
      />
      
      <PublicNav />
      
      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <img 
          src={heroImage}
          alt="Modern data center infrastructure with server racks and blue lighting representing CMPSBL's enterprise-grade systems"
          className="absolute inset-0 w-full h-[50vh] object-cover"
        />
        <div className="absolute inset-0 h-[50vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-16 max-w-4xl">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>
          
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
            <Gauge className="w-3 h-3 mr-2" />
            Product Suite
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-foreground">
            Everything Your AI{" "}
            <span style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-cyan)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Needs</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl leading-relaxed">
            Build on the substrate — persistent memory, intelligent routing, DREAM cycles, governed evolution, and deployment tools. All production-ready.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            {solutions.map((solution, index) => (
              <div 
                key={solution.name}
                className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 sm:p-8 md:p-10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 shimmer-on-hover card-lift gradient-border-reveal group"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center mb-4 transition-colors">
                      <solution.icon className="w-7 h-7 text-primary" />
                    </div>
                     <h2 className="text-xl sm:text-2xl font-black mb-2 text-foreground">{solution.name}</h2>
                    <p className="text-base sm:text-lg text-primary font-medium mb-4">{solution.tagline}</p>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {solution.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {solution.metrics.map((metric) => (
                        <Badge key={metric} variant="outline" className="text-xs font-mono">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                    <Link to={solution.link}>
                      <Button className="bg-primary hover:bg-primary/90 min-h-[44px] gap-2 shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all">
                        Learn More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[35vh] sm:h-[50vh] overflow-hidden">
        <img 
          src={securityImage}
          alt="Security operations center with monitoring displays representing real-time threat detection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
             <p className="text-xl sm:text-2xl md:text-4xl font-light text-foreground drop-shadow-lg">
                "Infrastructure that dreams, adapts, and compounds — the best kind is the kind that improves itself."
              </p>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/20 via-muted/30 to-muted/20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4 text-foreground">Start Building Today</h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">
            Free tier. No credit card. Persistent memory in under an hour.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/start-here">
              <Button size="lg" className="bg-primary hover:bg-primary/90 min-h-[44px]">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/upgrade">
              <Button size="lg" variant="outline">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
