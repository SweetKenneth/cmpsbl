import { ArrowRight, Layers, Brain, Shield, Zap, Eye, Network, ChevronRight, Sparkles, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

export default function Index() {
  const navigate = useNavigate();

  const substrateModules = [
    {
      id: "brain",
      name: "Brain",
      tagline: "Memory & Learning",
      description: "Persistent memory graphs, learning cycles, and dream-state reflection. The first documented AI system with autonomous internal simulation.",
      icon: Brain,
      color: "system-green",
      metrics: ["Memory Persistence", "Dream Cycles", "Pattern Learning"]
    },
    {
      id: "decode",
      name: "Decode",
      tagline: "Cognitive Interface",
      description: "Natural language interface that decodes intent and routes through the substrate. Context-aware responses powered by memory and real-time learning.",
      icon: Sparkles,
      color: "primary",
      metrics: ["Intent Decoding", "Context Routing", "Session Memory"]
    },
    {
      id: "defense",
      name: "Defense",
      tagline: "Security Layer",
      description: "Bot detection, behavioral fingerprinting, and threat neutralization. Protects the substrate and all connected applications.",
      icon: Shield,
      color: "system-amber",
      metrics: ["Bot Detection", "Threat Blocking", "Behavioral Analysis"]
    },
    {
      id: "nexus",
      name: "Nexus",
      tagline: "AI Routing",
      description: "Multi-provider AI gateway with intelligent load balancing. 20+ LLM providers, automatic failover, cost optimization.",
      icon: Network,
      color: "primary",
      metrics: ["20+ Providers", "Auto-Failover", "Cost Optimization"]
    },
    {
      id: "vision",
      name: "Vision",
      tagline: "Observability",
      description: "Real-time metrics, anomaly detection, and system health monitoring. Complete visibility into substrate operations.",
      icon: Eye,
      color: "primary-variant",
      metrics: ["Real-time Metrics", "Anomaly Detection", "Health Monitoring"]
    }
  ];

  const acquisitionHighlights = [
    { metric: "First", label: "AI Substrate Architecture", detail: "Category-defining" },
    { metric: "5", label: "Integrated Modules", detail: "Brain • Decode • Defense • Nexus • Vision" },
    { metric: "100+", label: "Projects Shipped", detail: "15 years experience" },
    { metric: "Live", label: "Production Systems", detail: "Running infrastructure" },
  ];

  const differentiators = [
    {
      title: "Not a Wrapper—A Substrate",
      description: "Most AI platforms are API wrappers. promptfluid is a cognitive layer that provides memory, learning, defense, and orchestration as infrastructure."
    },
    {
      title: "Dream-State Architecture",
      description: "The first documented AI system with internal simulation cycles. The brain module runs reflection loops to improve without user input."
    },
    {
      title: "Model & Provider Agnostic",
      description: "Route between 20+ LLM providers with automatic failover. No vendor lock-in. Runs on commodity cloud infrastructure."
    },
    {
      title: "Security-First Design",
      description: "Defense module protects all substrate operations. Behavioral fingerprinting, bot detection, and threat neutralization built-in."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      <SEO 
        title="promptfluid® | The AI Orchestration Substrate"
        description="The first cognitive orchestration substrate. Memory, learning, defense, routing, and observability as infrastructure. Model-agnostic. Provider-agnostic. Category-defining."
        canonical="https://promptfluid.com"
        keywords={['AI substrate', 'cognitive orchestration', 'AI infrastructure', 'autonomous AI', 'AI memory', 'AI routing', 'AI defense']}
        breadcrumbs={[{ name: 'Home', url: 'https://promptfluid.com' }]}
      />
      
      <header role="banner">
        <PublicNav />
      </header>

      <main id="main-content" role="main">
        
        {/* ═══════════════════════════════════════════════════════════════
            HERO - The Defining Statement
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[90vh] flex items-center" aria-labelledby="hero-heading">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
          <div className="absolute inset-0 bg-grid-white/5 opacity-50" />
          <div className="absolute inset-0 gradient-mesh" />
          
          {/* Floating Substrate Visualization */}
          <div className="absolute top-1/4 right-0 w-1/2 h-1/2 opacity-20 pointer-events-none hidden lg:block">
            <div className="relative w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/30 blur-3xl animate-float" />
              <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-[hsl(var(--system-green))]/20 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/3 left-1/3 w-24 h-24 rounded-full bg-[hsl(var(--system-amber))]/25 blur-2xl animate-float" style={{ animationDelay: '2s' }} />
            </div>
          </div>
          
          <div className="relative container mx-auto px-4 py-20">
            <div className="max-w-4xl">
              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-8 animate-fade-in">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">First-of-its-Kind AI Infrastructure</span>
              </div>
              
              {/* Main Headline */}
              <h1 id="hero-heading" className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight leading-[1.05] animate-slide-up">
                <span className="block text-foreground">The AI</span>
                <span className="block glow-text">Orchestration</span>
                <span className="block text-foreground">Substrate</span>
              </h1>
              
              {/* Sub-headline */}
              <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-2xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Memory. Learning. Defense. Routing. Observability.
                <span className="block mt-2 text-foreground font-medium">All as infrastructure.</span>
              </p>
              
              {/* Tagline */}
              <p className="text-lg text-muted-foreground mb-10 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                promptfluid<sup>®</sup> is a cognitive orchestration substrate—not another AI wrapper.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-wrap gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/substrate')}
                  className="group text-lg px-8 py-6"
                >
                  Explore the Substrate
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/investors">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/30 hover:border-primary hover:bg-primary/5">
                    Acquisition Inquiry
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[hsl(var(--system-green))]" />
                  Live Production Systems
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Model Agnostic
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Provider Agnostic
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            ACQUISITION METRICS BAR
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 border-y border-border bg-card/50 backdrop-blur-sm" aria-label="Key metrics">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {acquisitionHighlights.map((item, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{item.metric}</p>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            WHAT IS A SUBSTRATE - Category Definition
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-24" aria-labelledby="definition-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
                Category Definition
              </Badge>
              
              <h2 id="definition-heading" className="text-3xl md:text-4xl font-bold mb-8 text-foreground">
                What is an AI Substrate?
              </h2>
              
              <div className="bg-card border border-border rounded-2xl p-8 mb-8">
                <p className="text-xl text-foreground leading-relaxed mb-6">
                  A <span className="font-semibold text-primary">substrate</span> is a foundational layer upon which other things are built. In biology, it's the surface enzymes act upon. In technology, it's the infrastructure that enables everything above it.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  promptfluid® is the substrate for AI systems—providing memory, learning, defense, routing, and observability as infrastructure that any AI application can build upon. It's not a product you integrate. It's the layer your products run on.
                </p>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Zap className="w-6 h-6 text-primary flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-semibold">First mover advantage:</span> No other system provides cognitive orchestration as infrastructure. This is category-defining technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            THE FIVE MODULES
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-24 bg-muted/30" aria-labelledby="modules-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge variant="outline" className="mb-6 border-[hsl(var(--system-green))]/30 text-[hsl(var(--system-green))]">
                  Unified Architecture
                </Badge>
                <h2 id="modules-heading" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Five Modules. One Substrate.
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Each module is purpose-built. Together, they form a complete cognitive infrastructure layer.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {substrateModules.map((module) => (
                  <div
                    key={module.id}
                    className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-elegant"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-[hsl(var(--${module.color}))]/10 flex items-center justify-center`}>
                        <module.icon className={`w-7 h-7 text-[hsl(var(--${module.color}))]`} />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Module
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-sm text-primary mb-3">{module.tagline}</p>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {module.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {module.metrics.map((metric, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Unified Endpoint Card */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-2xl p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <Layers className="w-8 h-8 text-primary" />
                    <span className="text-lg font-semibold text-foreground">Single Endpoint</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    All five modules accessible through one unified API. Route to any module with a single call.
                  </p>
                  <code className="text-xs bg-background/50 rounded-lg p-3 font-mono text-primary">
                    POST /pf-substrate<br/>
                    {"{"} module: "brain", action: "learn" {"}"}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            DIFFERENTIATORS
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-24" aria-labelledby="diff-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <Badge variant="outline" className="mb-6 border-[hsl(var(--system-amber))]/30 text-[hsl(var(--system-amber))]">
                  Competitive Moat
                </Badge>
                <h2 id="diff-heading" className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Why This Is Different
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {differentiators.map((item, index) => (
                  <div key={index} className="bg-card border border-border rounded-2xl p-8">
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            ACQUISITION CTA
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-24 bg-muted/30" aria-labelledby="acquisition-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card border border-border rounded-2xl p-10 md:p-16 text-center">
                <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
                  Strategic Opportunity
                </Badge>
                
                <h2 id="acquisition-heading" className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Acquisition-Ready Infrastructure
                </h2>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  promptfluid® represents a unique opportunity to own the defining AI orchestration substrate. 
                  First-mover advantage in a category we created.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold text-primary">100%</p>
                    <p className="text-sm text-muted-foreground">Proprietary Technology</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold text-[hsl(var(--system-green))]">Live</p>
                    <p className="text-sm text-muted-foreground">Production Systems</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold text-[hsl(var(--system-amber))]">Clear</p>
                    <p className="text-sm text-muted-foreground">IP & Documentation</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                  <Link to="/investors">
                    <Button size="lg" className="text-lg px-8 py-6">
                      View Investor Materials
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                      Schedule Discussion
                    </Button>
                  </Link>
                </div>

                <p className="mt-8 text-sm text-muted-foreground">
                  For acquisition inquiries: promptfluid@gmail.com
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            LIVE SYSTEMS PROOF
        ═══════════════════════════════════════════════════════════════ */}
        <section className="relative z-10 py-24" aria-labelledby="proof-heading">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 border-[hsl(var(--system-green))]/30 text-[hsl(var(--system-green))]">
                Verified & Running
              </Badge>
              
              <h2 id="proof-heading" className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Real Systems. Grounded Infrastructure.
              </h2>
              
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Every system listed is live, reachable, and independently verifiable.
                We ship real infrastructure, not demos.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/substrate">
                  <Button variant="outline" className="gap-2">
                    <Activity className="w-4 h-4" />
                    Substrate Dashboard
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button variant="outline" className="gap-2">
                    View All Modules
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="https://PTCHBL.com" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    Try PTCHBL Free
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <EnhancedFooter />
    </div>
  );
}
