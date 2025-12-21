import { ArrowRight, Shield, Accessibility, Activity, Server, Brain, Eye, Wrench, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

export default function Index() {
  const navigate = useNavigate();

  const shippedSystems = [
    {
      id: "rckbl",
      name: "RCKBL",
      subtitle: "Rockable Defense",
      description: "Enterprise bot defense born from reverse-engineering stealth technology. Behavioral analysis, credential protection, real-time threat blocking.",
      badge: "Live",
      badgeColor: "system-amber",
      icon: Shield,
      externalLink: "https://promptfluid.com/projects/defense"
    },
    {
      id: "rndrbl",
      name: "RNDRBL",
      subtitle: "Renderable",
      description: "Accessibility browser with integrated control panel. Real-time customization for users with disabilities.",
      badge: "Running",
      badgeColor: "system-green",
      icon: Eye,
      externalLink: "https://RNDRBL.com"
    },
    {
      id: "ptchbl",
      name: "PTCHBL",
      subtitle: "Patchable",
      description: "Free WCAG scanner with AI auto-fixes. 45 of 86 compliance functions. Inclusion without paywalls.",
      badge: "Free",
      badgeColor: "system-green",
      icon: Accessibility,
      externalLink: "https://PTCHBL.com"
    },
    {
      id: "splcbl",
      name: "SPLCBL",
      subtitle: "Spliceable",
      description: "WordPress plugin validator. Pre-submission compliance scanning against WordPress.org requirements.",
      badge: "Free",
      badgeColor: "system-green",
      icon: Wrench,
      externalLink: "https://SPLCBL.com"
    },
    {
      id: "cascade",
      name: "Cascade",
      subtitle: "Autonomous AI",
      description: "First documented autonomous AI with memory reflection cycles—dreaming. Published on Zenodo and OSF.",
      badge: "Deployed",
      badgeColor: "primary",
      icon: Brain,
      externalLink: "https://promptfluid.com/projects/brain"
    },
    {
      id: "nexus",
      name: "AI Nexus",
      subtitle: "Multi-Provider Gateway",
      description: "Unified routing across 20+ LLM providers. Intelligent load balancing, failover, and cost optimization.",
      badge: "Running",
      badgeColor: "primary",
      icon: Server,
      externalLink: "https://promptfluid.com/blog/ai-triad-intelligent-routing"
    },
    {
      id: "xctbl",
      name: "XCTBL Space",
      subtitle: "Lore-Wrapped SaaS Suite",
      description: "Immersive SaaS with fictional world-building. Custom OAuth connecting real tools across narrative experiences.",
      badge: "Live",
      badgeColor: "system-amber",
      icon: Sparkles,
      externalLink: "https://XCTBL.com"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      <SEO 
        title="PromptFluid | Applied AI Infrastructure"
        description="PromptFluid is an applied AI company focused on autonomous systems, infrastructure tooling, and experimental interfaces that scale."
        canonical="https://promptfluid.com"
        keywords={['AI infrastructure', 'autonomous systems', 'AI security', 'accessibility compliance', 'WordPress security', 'WCAG scanning']}
      />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "PromptFluid",
          "url": "https://promptfluid.com",
          "description": "Applied AI company focused on autonomous systems and infrastructure tooling",
          "foundingDate": "2009",
          "founders": [{ "@type": "Person", "name": "Kenneth E Sweet Jr", "jobTitle": "Founder" }]
        })}
      </script>
      
      <header role="banner">
        <PublicNav />
      </header>

      <main id="main-content" role="main">
        
        {/* ═══════════════════════════════════════════════════════════════
            HERO SECTION 
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 container mx-auto px-4 pt-20 md:pt-32 pb-16" aria-labelledby="hero-heading">
          <div className="max-w-4xl mx-auto">
            <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight">
              We build intelligence that keeps working.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl leading-relaxed">
              PromptFluid is an applied AI company focused on autonomous systems, infrastructure tooling, and experimental interfaces that scale.
            </p>

            <Button 
              size="lg" 
              onClick={() => document.getElementById('shipped-systems')?.scrollIntoView({ behavior: 'smooth' })}
              className="group bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
            >
              <span className="flex items-center gap-2">
                View Systems
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            EARTH WINDOW - CITY VIEW
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
          
          {/* Quote overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <blockquote className="text-center max-w-3xl px-8">
              <p className="text-2xl md:text-4xl font-light text-white drop-shadow-lg leading-relaxed">
                "Real systems. Grounded infrastructure. Built to last."
              </p>
            </blockquote>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            WHAT WE BUILD 
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 bg-muted/30 py-20" aria-labelledby="build-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 id="build-heading" className="text-3xl md:text-4xl font-bold mb-10 text-foreground">
                What We Build
              </h2>

              <ul className="space-y-4 mb-10">
                {[
                  { icon: Activity, text: "Autonomous system orchestration" },
                  { icon: Brain, text: "Internal simulation and evaluation cycles" },
                  { icon: Accessibility, text: "Accessibility and compliance engines" },
                  { icon: Shield, text: "Security, verification, and detection systems" },
                  { icon: Eye, text: "Experimental interfaces for complex tools" },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4 text-lg text-foreground/90">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-4">
                All systems listed here are live, running, or actively deployed.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            EARTH WINDOW - INDUSTRIAL TREES
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative w-full h-[50vh] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-80" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            INTERNAL SIMULATION CYCLES 
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-20" aria-labelledby="simulation-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--system-green))]/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-[hsl(var(--system-green))]" />
                </div>
                <h2 id="simulation-heading" className="text-3xl md:text-4xl font-bold text-foreground">
                  Internal Simulation Cycles
                </h2>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 md:p-8">
                <p className="text-lg text-foreground/90 leading-relaxed mb-4">
                  Some PromptFluid systems run continuous internal simulation loops to evaluate, refine, and stress-test decisions without user input.
                </p>
                <p className="text-muted-foreground">
                  Internally, we refer to these cycles as <span className="text-foreground font-medium">dream states</span>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            SHIPPED SYSTEMS 
        ═══════════════════════════════════════════════════════════════ */}
        <section id="shipped-systems" className="relative z-10 bg-muted/30 py-20" aria-labelledby="shipped-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 id="shipped-heading" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Shipped Systems
              </h2>
              <p className="text-muted-foreground mb-10 text-lg">
                These systems are real, operational, and independently verifiable.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shippedSystems.map((system) => (
                  <div
                    key={system.id}
                    onClick={() => window.open(system.externalLink, "_blank")}
                    className={`group bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-[hsl(var(--${system.badgeColor}))]/50 transition-all duration-200 hover:shadow-elegant`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-[hsl(var(--${system.badgeColor}))]/10 flex items-center justify-center`}>
                        <system.icon className={`w-6 h-6 text-[hsl(var(--${system.badgeColor}))]`} />
                      </div>
                      <Badge variant="outline" className={`text-xs border-[hsl(var(--${system.badgeColor}))]/30 text-[hsl(var(--${system.badgeColor}))]`}>
                        {system.badge}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
                      {system.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">{system.subtitle}</p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {system.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Visit</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Track Record */}
              <div className="mt-12 bg-card border border-border rounded-lg p-6 md:p-8">
                <p className="text-lg text-foreground/90 leading-relaxed">
                  <span className="font-semibold">100+ projects shipped</span> over 15 years—sites, apps, web apps, and enterprise software. Most for customers, some for growth and exploration. We design from concept to working software to polished enterprise-grade systems. <span className="text-muted-foreground">We're closers. We ship real systems.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            EARTH WINDOW - OFFICE VIEW
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative w-full h-[60vh] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-60" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <blockquote className="text-center max-w-3xl px-8">
              <p className="text-2xl md:text-4xl font-light text-white drop-shadow-lg leading-relaxed">
                "Building from concept to deployed system—every time."
              </p>
            </blockquote>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            ABOUT THE BUILDER 
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-20" aria-labelledby="about-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 id="about-heading" className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
                About
              </h2>

              <div className="bg-card border border-border rounded-lg p-6 md:p-8">
                <p className="text-lg text-foreground/90 leading-relaxed mb-4">
                  I build systems that start as abstract ideas and end up running on their own.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PromptFluid began as a solo project focused on making AI tools actually useful—security that adapts, accessibility that's free, and interfaces that handle complexity without exposing it.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Everything here is built to work without supervision. The goal is infrastructure that improves itself over time.
                </p>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Kenneth E Sweet Jr</span> — Founder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            EXPERIMENTAL INTERFACES 
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 bg-muted/30 py-20" aria-labelledby="experimental-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 id="experimental-heading" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Experimental Interfaces
              </h2>
              <p className="text-muted-foreground mb-10 text-lg">
                Some PromptFluid systems explore non-traditional interfaces for interacting with complex tools.
              </p>

              <div className="bg-card border border-border rounded-lg p-6 md:p-8">
                <Badge variant="outline" className="mb-4 text-xs border-[hsl(var(--system-amber))]/40 text-[hsl(var(--system-amber))] bg-[hsl(var(--system-amber))]/5">
                  Fictional Interface / Lore Experiment
                </Badge>
                
                <h3 className="text-2xl font-semibold mb-4 text-foreground">
                  The Settlers Story
                </h3>
                
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Settlers Story is a fictional narrative used to explore how users might navigate complex systems through metaphor and discovery.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  It exists to support the launch of Space, an experimental interface developed by PromptFluid.
                </p>
                
                <Button 
                  variant="outline"
                  onClick={() => window.open("https://XCTBL.com", "_blank")}
                  className="group border-border hover:border-primary hover:bg-primary/5"
                >
                  <span className="flex items-center gap-2">
                    Enter the Settlers Story
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            EARTH WINDOW - STREET TREES
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative w-full h-[50vh] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            INVESTOR CTA 
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-20" aria-labelledby="invest-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 id="invest-heading" className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Seeking Seed Investment
              </h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
                PromptFluid is actively raising seed funding to scale infrastructure and expand system capabilities.
              </p>
              
              <Button 
                size="lg"
                onClick={() => navigate('/investors')}
                className="group bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6"
              >
                <span className="flex items-center gap-2">
                  Investor Information
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <EnhancedFooter />
    </div>
  );
}
