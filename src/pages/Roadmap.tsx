import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Brain, Zap, Globe, Accessibility, Store, Rocket, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero/neon-roadmap.jpg";
import neuralImage from "@/assets/hero/neon-data-center.jpg";
export default function Roadmap() {
  const quarters = [
    {
      period: "Q1 2026",
      status: "Completed",
      items: [
        {
          icon: Brain,
          title: "CMPSBL Production Launch",
          description: "Production-ready AI infrastructure with 9 core modules, persistent memory, intelligent routing, adaptive security, and 400+ capabilities. Builder, Creator, and Architect tiers live.",
          status: "Live",
          technologies: ["Supabase", "Edge Functions", "TypeScript", "React"]
        },
        {
          icon: Store,
          title: "Artifact Packs & Template Ecosystem",
          description: "24 artifact packs across 6 strategic domains, 30 free templates, and a full capability depot. Browse, activate, and build.",
          status: "Live",
          technologies: ["Templates", "SDK", "Developer Tools", "Artifacts"]
        }
      ]
    },
    {
      period: "Q2 2026",
      status: "In Progress",
      items: [
        {
          icon: Shield,
          title: "Enterprise Governance Layer",
          description: "Advanced LLM governance, audit trails, and compliance reporting for enterprise customers. SOC2 preparation.",
          status: "Active Development",
          technologies: ["Governance", "Audit", "Compliance", "Enterprise"]
        },
        {
          icon: Zap,
          title: "Multi-Provider Nexus Expansion",
          description: "Expanding AI provider support to 20+ models with intelligent cost/latency optimization and automatic failover.",
          status: "Active Development",
          technologies: ["OpenAI", "Anthropic", "Google", "Groq", "Cerebras"]
        }
      ]
    },
    {
      period: "Q3 2026",
      status: "Planned",
      items: [
        {
          icon: Globe,
          title: "Federation Protocol",
          description: "Connect multiple CMPSBL instances across organizations. Shared learning with privacy controls and governed data exchange.",
          status: "Planning",
          technologies: ["Federation", "Privacy", "Distributed Systems"]
        },
        {
          icon: Accessibility,
          title: "Vertical Minds",
          description: "Pre-trained AI Minds for specific verticals: Legal AI, Healthcare AI, Finance AI. Purchase and deploy in minutes.",
          status: "Concept",
          technologies: ["Minds", "Vertical AI", "One-click Deploy"]
        }
      ]
    },
    {
      period: "Q4 2026 - 2027",
      status: "Vision",
      items: [
        {
          icon: Rocket,
          title: "Cognitive Cloud",
          description: "Fully managed CMPSBL infrastructure. Multi-region deployment, automatic scaling, and 99.99% SLA.",
          status: "Roadmap",
          technologies: ["Managed Cloud", "Multi-region", "Auto-scaling", "Enterprise SLA"]
        },
        {
          icon: Brain,
          title: "Self-Evolving Substrate",
          description: "The OS that improves itself. Autonomous code modernization, performance optimization, and security hardening.",
          status: "Research",
          technologies: ["Self-improvement", "Meta-learning", "Autonomous Ops"]
        }
      ]
    }
  ];

  const statusColors = {
    "Live": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    "Pending Approval": "text-amber-500 bg-amber-500/10 border-amber-500/20",
    "Active Development": "text-blue-500 bg-blue-500/10 border-blue-500/20",
    "Design Phase": "text-purple-500 bg-purple-500/10 border-purple-500/20",
    "Research": "text-orange-500 bg-orange-500/10 border-orange-500/20",
    "Concept": "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    "Planning": "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    "Roadmap": "text-pink-500 bg-pink-500/10 border-pink-500/20",
    "Experimental": "text-purple-400 bg-purple-400/10 border-purple-400/20"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Product Roadmap | CMPSBL — AI Infrastructure"
        description="Explore CMPSBL's roadmap: persistent memory, artifact packs, enterprise governance, federation protocol, and managed cloud. See what's shipping next."
        canonical="https://cmpsbl.com/roadmap"
        keywords={[
          'CMPSBL roadmap',
          'AI governance OS',
          'cognitive infrastructure',
          'AI templates',
          'enterprise AI',
          'federated AI',
          'self-evolving AI',
          'technology roadmap 2026',
          'AI-powered tools',
          'developer productivity'
        ]}
      />

      <PublicNav />

      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <img 
          src={heroImage}
          alt="Product roadmap visualization with timeline and milestones representing CMPSBL's strategic direction"
          className="absolute inset-0 w-full h-[40vh] sm:h-[60vh] object-cover"
        />
        <div className="absolute inset-0 h-[40vh] sm:h-[60vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-20">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2">
              ← Back to Home
            </Link>
          </nav>

          <div className="max-w-4xl">
            <Badge variant="outline" className="mb-6 border-primary/30 bg-background/80 text-primary">
              <Sparkles className="w-3 h-3 mr-2" />
              Building the Future
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-foreground tracking-tight [text-shadow:_0_2px_20px_hsl(var(--background))]">
              2026-2027 Roadmap
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-foreground/90 mb-8 leading-relaxed [text-shadow:_0_2px_10px_hsl(var(--background))]">
              Persistent memory, intelligent routing, and governed orchestration — here's where we're building next.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--system-green))]" />
                <span>2 Projects Launching Q1</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>6 In Development</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[hsl(var(--system-amber))]" />
                <span>8 Planned for 2026-2027</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-16">
          {quarters.map((quarter, qIndex) => (
            <div key={quarter.period}>
              {/* Quarter Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="px-6 py-3 rounded-full bg-card border border-border">
                  <h2 className="text-2xl font-bold text-primary">
                    {quarter.period}
                  </h2>
                </div>
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground uppercase tracking-wider">{quarter.status}</span>
              </div>

              {/* Quarter Items */}
              <div className="grid md:grid-cols-2 gap-6">
                {quarter.items.map((item) => (
                  <article
                    key={item.title}
                    className="group p-5 sm:p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 shimmer-on-hover card-lift"
                  >
                    {/* Icon & Status */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <item.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium ${statusColors[item.status as keyof typeof statusColors]}`}>
                        {item.status}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[30vh] sm:h-[50vh] overflow-hidden">
        <img 
          src={neuralImage}
          alt="Abstract neural network visualization representing future AI capabilities"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-xl sm:text-2xl md:text-4xl font-light text-foreground drop-shadow-lg">
              "Ship today. Compound tomorrow."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-6 text-foreground tracking-tight">
            Our Development Philosophy
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 rounded-2xl card-lift">
              <h3 className="font-semibold mb-2 text-primary">AI-First</h3>
              <p className="text-sm text-muted-foreground">
                Every tool leverages cutting-edge AI to automate, optimize, and adapt to user needs.
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 rounded-2xl card-lift">
              <h3 className="font-semibold mb-2 text-primary">Accessible</h3>
              <p className="text-sm text-muted-foreground">
                Enterprise power with startup simplicity. Technology that works for everyone.
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 rounded-2xl card-lift">
              <h3 className="font-semibold mb-2 text-primary">Integrated</h3>
              <p className="text-sm text-muted-foreground">
                All our tools communicate seamlessly, creating a unified development experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-6 text-foreground tracking-tight">
            Be Part of the Journey
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join early adopters shaping the future of intelligent software. Get exclusive access to new tools as we build them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 min-h-[44px]">
                Get Early Access
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="min-h-[44px]">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
