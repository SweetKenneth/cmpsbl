import { ArrowRight, Monitor, Shield, Accessibility, Check, Activity, Server, Brain, Cpu, Lock, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <SEO 
        title="PromptFluid | Applied AI Infrastructure"
        description="PromptFluid is an applied AI company focused on autonomous systems, infrastructure tooling, and experimental interfaces that scale."
        canonical="https://promptfluid.com"
        keywords={[
          'AI infrastructure',
          'autonomous systems',
          'AI security',
          'accessibility compliance',
          'WordPress security',
          'WCAG scanning'
        ]}
      />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "PromptFluid",
          "url": "https://promptfluid.com",
          "description": "Applied AI company focused on autonomous systems and infrastructure tooling",
          "foundingDate": "2024",
          "founders": [{
            "@type": "Person",
            "name": "Kenneth E Sweet Jr",
            "jobTitle": "Founder"
          }]
        })}
      </script>
      
      <header role="banner">
        <PublicNav />
      </header>

      <main id="main-content" role="main">
        
        {/* ═══════════════════════════════════════════════════════════════
            HERO SECTION 
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 container mx-auto px-4 pt-20 md:pt-32 pb-20" aria-labelledby="hero-heading">
          <div className="max-w-4xl mx-auto">
            <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight">
              We build intelligence that keeps working.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl leading-relaxed">
              PromptFluid is an applied AI company focused on autonomous systems, infrastructure tooling, and experimental interfaces that scale.
            </p>

            <Button 
              size="lg" 
              onClick={() => {
                document.getElementById('shipped-systems')?.scrollIntoView({ behavior: 'smooth' });
              }}
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
                  { icon: Cpu, text: "Autonomous system orchestration" },
                  { icon: Activity, text: "Internal simulation and evaluation cycles" },
                  { icon: Accessibility, text: "Accessibility and compliance engines" },
                  { icon: Shield, text: "Security, verification, and detection systems" },
                  { icon: Monitor, text: "Experimental interfaces for complex tools" },
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
                {/* Reflex Bot Sniper */}
                <div
                  onClick={() => navigate('/projects/defense')}
                  className="group bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-[hsl(var(--system-amber))]/50 transition-all duration-200 hover:shadow-elegant"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[hsl(var(--system-amber))]/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-[hsl(var(--system-amber))]" />
                    </div>
                    <Badge variant="outline" className="text-xs border-[hsl(var(--system-amber))]/30 text-[hsl(var(--system-amber))]">
                      Live
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    Reflex Bot Sniper
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    WordPress security plugin with behavioral fingerprinting and real-time threat detection.
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Clarity */}
                <div
                  onClick={() => window.open("https://clarity.promptfluid.com", "_blank")}
                  className="group bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-[hsl(var(--system-green))]/50 transition-all duration-200 hover:shadow-elegant"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[hsl(var(--system-green))]/10 flex items-center justify-center">
                      <Accessibility className="w-6 h-6 text-[hsl(var(--system-green))]" />
                    </div>
                    <Badge variant="outline" className="text-xs border-[hsl(var(--system-green))]/30 text-[hsl(var(--system-green))]">
                      Running
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-[hsl(var(--system-green))] transition-colors">
                    Clarity
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Free WCAG 2.2 accessibility scanner with AI-powered fix suggestions. No signup required.
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-[hsl(var(--system-green))] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Try free scan</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>

                {/* Cascade */}
                <div
                  onClick={() => navigate('/projects/brain')}
                  className="group bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-elegant"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      Deployed
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    Cascade
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Autonomous orchestration engine with internal simulation cycles and memory consolidation.
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Modernizer */}
                <div
                  onClick={() => navigate('/projects/modernizer')}
                  className="group bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-elegant"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      Live
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    Modernizer
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI-powered website rebuilder. Extracts and transforms legacy sites into modern React applications.
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* AI Nexus */}
                <div
                  onClick={() => navigate('/projects/nexus')}
                  className="group bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-elegant"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Server className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      Running
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    AI Nexus
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Multi-provider AI routing system with fallback chains and cost optimization.
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Infrastructure Dashboard */}
                <div
                  onClick={() => navigate('/admin')}
                  className="group bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-elegant"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Monitor className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
                      Internal
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    Control Dashboard
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unified monitoring and control interface for all PromptFluid systems.
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Access</span>
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
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

              {/* The Settlers Story Card */}
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
                  onClick={() => window.open("https://castleintheair.site", "_blank")}
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
