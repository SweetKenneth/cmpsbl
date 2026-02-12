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
      name: "CMPSBL Substrate",
      tagline: "Cognitive Infrastructure OS",
      description: "The 20-module cognitive operating system. Persistent memory, self-learning, multi-provider routing, and self-evolution — all in one platform.",
      features: ["20 integrated modules", "Persistent memory system", "Self-learning Dream Cycles", "Multi-provider AI routing", "Self-evolution capabilities", "175,000+ lines production code"],
      metrics: ["v9.0.0 ARCHITECT", "Live", "Enterprise Ready"],
      link: "/substrate"
    },
    {
      icon: Shield,
      name: "DEFENSE Module",
      tagline: "Enterprise Security Layer",
      description: "AI-powered threat detection and bot defense. Behavioral analysis, real-time blocking, and adaptive protection for web applications.",
      features: ["AI-powered bot detection", "Behavioral fingerprinting", "Real-time threat blocking", "WordPress integration", "Adaptive CAPTCHA system", "Device reputation scoring"],
      metrics: ["Live", "WordPress Ready", "Enterprise Grade"],
      link: "/projects/defense"
    },
    {
      icon: Zap,
      name: "Engine Marketplace",
      tagline: "Production-Ready Orchestrations",
      description: "70 engines and 22 meta-engines. Governed, versioned, enterprise-grade cognitive orchestrations with subscription access.",
      features: ["70 production engines", "22 meta-engines", "Governed & versioned", "Enterprise support", "Real-time monitoring", "SLA guarantees"],
      metrics: ["92 Total Engines", "OEM Licensed", "Production Ready"],
      link: "/engines"
    },
    {
      icon: Brain,
      name: "Persistent Memory",
      tagline: "AI Memory That Lasts",
      description: "Add persistent memory to any agent in under an hour. No rewrites, no new frameworks — your AI just stops forgetting.",
      features: ["Drop-in integration", "Multi-scope memory", "Automatic compression", "Cross-session context", "Developer-friendly API", "Free tier available"],
      metrics: ["FREE", "1-Hour Setup", "Any Agent"],
      link: "/persistent-memory"
    },
    {
      icon: Globe,
      name: "Multi-Provider Routing",
      tagline: "Zero Vendor Lock-In",
      description: "Intelligent routing across 6+ AI providers. Automatic failover, cost optimization, and quality-based selection.",
      features: ["6+ AI providers", "Automatic failbacks", "Cost optimization", "Smart routing", "Load balancing", "Zero-downtime switching"],
      metrics: ["6+ Providers", "Running", "Optimized"],
      link: "/blog/ai-triad-intelligent-routing"
    },
    {
      icon: Code,
      name: "CodeLab",
      tagline: "Interactive Development Environment",
      description: "Execute and test capabilities in real-time. Live REPL, template remixing, and instant feedback for rapid development.",
      features: ["Live code execution", "Template remixing", "Real-time preview", "API testing", "Export capabilities", "Free for all users"],
      metrics: ["FREE", "Real-Time", "Developer Tool"],
      link: "/codelab"
    },
    {
      icon: Lock,
      name: "Enterprise Substrate",
      tagline: "Self-Hosted Control",
      description: "Full enterprise deployment with governance, compliance, and dedicated support. Your infrastructure, our cognitive layer.",
      features: ["Self-hosted option", "Full governance", "Compliance ready", "Dedicated support", "Custom SLAs", "White-label available"],
      metrics: ["Enterprise", "Self-Hosted", "Compliant"],
      link: "/substrate/licensing"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Solutions — CMPSBL Cognitive Infrastructure Products"
        description="Explore CMPSBL's v8.0.0 product suite: Cognitive Substrate, Defense Module, Engine Marketplace, Persistent Memory, and Enterprise solutions."
        canonical="https://cmpsbl.com/solutions"
        keywords={['cognitive infrastructure', 'AI memory', 'enterprise AI', 'engine marketplace', 'persistent memory', 'CMPSBL']}
      />
      
      <PublicNav />
      
      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <img 
          src={heroImage}
          alt="Modern data center infrastructure with server racks and blue lighting representing PromptFluid's enterprise-grade systems"
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
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            Solutions That Ship
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Real products. Real infrastructure. Built to work without supervision. 100+ projects shipped over 15 years.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-8">
            {solutions.map((solution, index) => (
              <div 
                key={solution.name}
                className="bg-card border border-border rounded-lg p-8 md:p-10 hover:border-primary/30 transition-all"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <solution.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-foreground">{solution.name}</h2>
                    <p className="text-lg text-primary font-medium mb-4">{solution.tagline}</p>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {solution.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {solution.metrics.map((metric) => (
                        <Badge key={metric} variant="outline" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                    <Link to={solution.link}>
                      <Button className="bg-primary hover:bg-primary/90">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Key Features</h3>
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
      <section className="relative w-full h-[50vh] overflow-hidden">
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
            <p className="text-2xl md:text-4xl font-light text-foreground drop-shadow-lg">
              "We're closers. We ship real systems."
            </p>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Build Together?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            100+ projects shipped over 15 years. Let's add yours to the list.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/investors">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Investor Information
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Contact Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
