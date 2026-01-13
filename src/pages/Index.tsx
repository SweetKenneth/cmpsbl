import { ArrowRight, Shield, Accessibility, Activity, Server, Brain, Eye, Wrench, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import heroImage from "@/assets/hero/zen-scientist-office.jpg";
import earthWindowImage from "@/assets/hero/earth-window-station-3.jpg";
import teamImage from "@/assets/hero/team-collaboration.jpg";

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
        title="promptfluid® | Cognitive Orchestration Substrate"
        description="promptfluid is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. Model-agnostic. Provider-agnostic. Runs on commodity cloud."
        canonical="https://promptfluid.com"
        keywords={['cognitive orchestration', 'AI substrate', 'autonomous systems', 'AI routing', 'AI memory', 'learning cycles', 'observability', 'defense intelligence']}
        breadcrumbs={[{ name: 'Home', url: 'https://promptfluid.com' }]}
      />
      
      <header role="banner">
        <PublicNav />
      </header>

      <main id="main-content" role="main">
        
        {/* ═══════════════════════════════════════════════════════════════
            HERO SECTION - Full Width Image
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative w-full h-[80vh] min-h-[600px]" aria-labelledby="hero-heading">
          <img 
            src={heroImage}
            alt="Serene scientist office in a modern skyscraper with floor-to-ceiling windows overlooking a beautiful mountain landscape, representing PromptFluid's zen approach to intelligent infrastructure"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
          
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight leading-[1.1]">
                  promptfluid<sup className="text-lg">®</sup> substrate
                </h1>
                
                <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl leading-relaxed">
                  A cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. Model-agnostic. Provider-agnostic. Runs on commodity cloud.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => document.getElementById('shipped-systems')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group"
                  >
                    View Systems
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Link to="/investors">
                    <Button size="lg" variant="outline" className="bg-background/50 backdrop-blur-sm border-foreground/20 text-foreground hover:bg-background/80">
                      For Investors
                    </Button>
                  </Link>
                </div>

                <p className="mt-6 text-foreground/70 text-base">
                  Start with a real system. Try <a href="https://PTCHBL.com" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">PTCHBL</a> or explore live infrastructure below.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            WHAT WE BUILD 
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 bg-muted/30 py-24" aria-labelledby="build-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 id="build-heading" className="text-3xl md:text-4xl font-bold mb-12 text-foreground">
                What We Build
              </h2>

              <ul className="space-y-5 mb-12">
                {[
                  { icon: Activity, text: "Autonomous system orchestration" },
                  { icon: Brain, text: "Internal simulation and evaluation cycles" },
                  { icon: Accessibility, text: "Accessibility and compliance engines" },
                  { icon: Shield, text: "Security, verification, and detection systems" },
                  { icon: Eye, text: "Experimental interfaces for complex tools" },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4 text-lg text-foreground">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="pt-2.5">{item.text}</span>
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
            EARTH WINDOW - Operations View
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative w-full h-[50vh] overflow-hidden">
          <img 
            src={earthWindowImage}
            alt="Space operations center with panoramic view of Earth from orbit"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <blockquote className="text-center max-w-3xl px-8">
              <p className="text-2xl md:text-5xl font-bold text-white [text-shadow:_0_4px_24px_rgba(0,0,0,0.8)] leading-relaxed">
                "Real systems. Grounded infrastructure. Built to last."
              </p>
            </blockquote>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            INTERNAL SIMULATION CYCLES 
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-24" aria-labelledby="simulation-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-[hsl(var(--system-green))]/10 flex items-center justify-center">
                  <Brain className="w-7 h-7 text-[hsl(var(--system-green))]" />
                </div>
                <h2 id="simulation-heading" className="text-3xl md:text-4xl font-bold text-foreground">
                  Internal Simulation Cycles
                </h2>
              </div>

              <div className="bg-card border border-border rounded-2xl p-8">
                <p className="text-lg text-foreground leading-relaxed mb-4">
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
        <section id="shipped-systems" className="relative z-10 bg-muted/30 py-24" aria-labelledby="shipped-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-sm text-muted-foreground mb-4">
                Everything below is live, reachable, and running in production.
              </p>
              <h2 id="shipped-heading" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Shipped Systems
              </h2>
              <p className="text-muted-foreground mb-12 text-lg">
                These systems are real, operational, and independently verifiable.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shippedSystems.map((system) => (
                  <a
                    key={system.id}
                    href={system.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group bg-card border border-border rounded-2xl p-6 hover:border-[hsl(var(--${system.badgeColor}))]/50 transition-all duration-200 hover:shadow-elegant block`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-[hsl(var(--${system.badgeColor}))]/10 flex items-center justify-center`}>
                        <system.icon className={`w-6 h-6 text-[hsl(var(--${system.badgeColor}))]`} />
                      </div>
                      <Badge variant="outline" className={`text-xs border-[hsl(var(--${system.badgeColor}))]/30 text-[hsl(var(--${system.badgeColor}))]`}>
                        {system.badge}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
                      {system.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">{system.subtitle}</p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {system.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Visit</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>

              {/* Track Record */}
              <div className="mt-16 bg-card border border-border rounded-2xl p-8">
                <p className="text-lg text-foreground leading-relaxed">
                  <span className="font-semibold">100+ projects shipped</span> over 15 years—sites, apps, web apps, and enterprise software. Most for customers, some for growth and exploration. We design from concept to working software to polished enterprise-grade systems. <span className="text-muted-foreground">We're closers. We ship real systems.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            EARTH WINDOW - Team
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative w-full h-[60vh] overflow-hidden">
          <img 
            src={teamImage}
            alt="Collaborative tech team working together in a modern open workspace with natural lighting"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <blockquote className="text-center max-w-3xl px-8">
              <p className="text-2xl md:text-5xl font-bold text-white [text-shadow:_0_4px_24px_rgba(0,0,0,0.8)] leading-relaxed">
                "Building from concept to deployed system—every time."
              </p>
            </blockquote>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            ABOUT THE BUILDER 
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-24" aria-labelledby="about-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 id="about-heading" className="text-3xl md:text-4xl font-bold mb-10 text-foreground">
                About
              </h2>

              <div className="bg-card border border-border rounded-2xl p-8">
                <p className="text-lg text-foreground leading-relaxed mb-6">
                  I build systems that start as abstract ideas and end up running on their own.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  After 15+ years in web and software development, I built PromptFluid as an ecosystem for exploring what AI can do when given real responsibilities—not just chat replies, but actual system control.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Based in Palm Springs, CA. Previously: freelance, startups, enterprise consulting.
                </p>
                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Kenneth E Sweet Jr</span> — Founder & CEO
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            INVESTOR CTA 
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-24 bg-muted/30" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Interested in What We're Building?
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                We're seeking seed investment to scale AI-powered infrastructure for security, accessibility, and autonomous systems.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/investors">
                  <Button size="lg" className="gap-2">
                    Investor Relations
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <EnhancedFooter />
    </div>
  );
}
