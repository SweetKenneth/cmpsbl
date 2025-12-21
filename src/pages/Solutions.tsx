import { Link } from "react-router-dom";
import { Shield, Globe, Zap, Brain, ArrowRight, CheckCircle, Code, Lock, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";

export default function Solutions() {
  const solutions = [
    {
      icon: Shield,
      name: "RCKBL Defense",
      tagline: "Enterprise Website Security",
      description: "Bot defense born from reverse-engineering stealth technology. Behavioral analysis and real-time threat blocking for WordPress and enterprise sites.",
      features: ["AI-powered bot detection", "Behavioral fingerprinting", "Real-time threat blocking", "WordPress plugin ready", "Adaptive CAPTCHA system", "Device reputation scoring"],
      metrics: ["Live", "WordPress Ready", "Enterprise Grade"],
      link: "https://promptfluid.com/projects/defense"
    },
    {
      icon: Globe,
      name: "RNDRBL Browser",
      tagline: "Accessibility-First Technology",
      description: "Browser technology with integrated control panel. Enables users with disabilities to customize their experience in real-time.",
      features: ["Real-time layover controls", "Disability-specific features", "Universal compatibility", "Browser extension", "Customizable interface", "Instant adjustments"],
      metrics: ["Running", "Inclusive", "Universal"],
      link: "https://RNDRBL.com"
    },
    {
      icon: Globe,
      name: "PTCHBL Accessibility",
      tagline: "Free WCAG Scanner",
      description: "Free WCAG scanner with AI-powered fixes. Detects and repairs 45 of 86 accessibility functions. Inclusion without paywalls.",
      features: ["Free WCAG 2.2 scanning", "AI-powered auto-fixes", "45/86 compliance functions", "No signup required", "Instant results", "Developer-friendly reports"],
      metrics: ["100% Free", "AI-Powered", "WCAG 2.2"],
      link: "https://PTCHBL.com"
    },
    {
      icon: Brain,
      name: "Cascade AI",
      tagline: "Autonomous Dreaming AI",
      description: "First documented autonomous AI with memory reflection cycles—dreaming. Published and verified on Zenodo and OSF.",
      features: ["Memory reflection cycles", "Autonomous learning", "Internal simulation", "Pattern synthesis", "Self-improvement loops", "Documented & verified"],
      metrics: ["World First", "Documented", "Deployed"],
      link: "https://promptfluid.com/projects/brain"
    },
    {
      icon: Zap,
      name: "AI Nexus",
      tagline: "Multi-Provider Gateway",
      description: "Unified routing across 20+ LLM providers. Intelligent load balancing, automatic failover, and cost optimization.",
      features: ["20+ AI providers", "Automatic fallbacks", "Cost optimization", "Smart routing", "Load balancing", "Zero-downtime switching"],
      metrics: ["20+ Providers", "Running", "Optimized"],
      link: "https://promptfluid.com/blog/ai-triad-intelligent-routing"
    },
    {
      icon: Code,
      name: "SPLCBL Validator",
      tagline: "WordPress Plugin Checker",
      description: "Pre-submission validator for WordPress plugins. Scans against WordPress.org requirements before official review.",
      features: ["Pre-submission scanning", "Common issue detection", "Compliance checking", "Free for developers", "Instant results", "Detailed reports"],
      metrics: ["Free", "Developer Tool", "Pre-Launch"],
      link: "https://SPLCBL.com"
    },
    {
      icon: Lock,
      name: "XCTBL Space",
      tagline: "Lore-Wrapped SaaS Suite",
      description: "Immersive SaaS with fictional world-building. Custom OAuth connecting real tools across narrative experiences.",
      features: ["Custom OAuth system", "Interconnected tools", "Fictional interface", "Real functionality", "Multi-world navigation", "Entertainment layer"],
      metrics: ["Live", "Experimental", "Functional"],
      link: "https://XCTBL.com"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Solutions — PromptFluid Products & Services"
        description="Explore PromptFluid's product suite: RCKBL security, PTCHBL accessibility, Cascade AI, AI Nexus, and more. Real systems that ship."
        canonical="https://promptfluid.com/solutions"
        keywords={['AI solutions', 'WordPress security', 'accessibility tools', 'AI gateway', 'autonomous AI']}
      />
      
      <PublicNav />
      
      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 h-[50vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80')`,
          }}
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
                    {solution.link.startsWith('http') ? (
                      <a href={solution.link} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-primary hover:bg-primary/90">
                          Visit Site
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    ) : (
                      <Link to={solution.link}>
                        <Button className="bg-primary hover:bg-primary/90">
                          Learn More
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    )}
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
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-4xl font-light text-white drop-shadow-lg">
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
