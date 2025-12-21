import { Shield, Zap, Brain, ArrowRight, Eye, Wrench, Server, Sparkles, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

export default function CurrentProjects() {
  const navigate = useNavigate();

  const projects = [
    {
      id: "rckbl",
      name: "RCKBL",
      tagline: "Complete Website Defense",
      description: "Born from reverse-engineering our own stealth bot technology into enterprise-grade security. Complete protection against hackers, viruses, and bots. WordPress plugin ready.",
      icon: Shield,
      status: "Live",
      statusColor: "bg-[hsl(var(--system-green))]",
      features: ["AI bot detection", "Behavioral fingerprinting", "Real-time blocking", "WordPress plugin", "Adaptive CAPTCHA", "Device scoring"],
      href: "/projects/defense"
    },
    {
      id: "rndrbl",
      name: "RNDRBL",
      tagline: "Accessibility Browser",
      description: "Web accessibility browser with built-in layover control panel. Enables people with disabilities to browse their favorite sites with the features they require.",
      icon: Eye,
      status: "Running",
      statusColor: "bg-[hsl(var(--system-green))]",
      features: ["Layover controls", "Customizable features", "Disability support", "Browser extension", "Real-time adjustments", "Universal compatibility"],
      href: "/projects/renderable"
    },
    {
      id: "ptchbl",
      name: "PTCHBL",
      tagline: "Free WCAG Scanner",
      description: "Free WCAG scanner that tests websites for accessibility issues, then applies AI to fix 45 of 86 WCAG compliance functions. Inclusion should never be behind a paywall.",
      icon: Accessibility,
      status: "Free",
      statusColor: "bg-[hsl(var(--system-green))]",
      features: ["WCAG 2.2 scanning", "AI-powered fixes", "45/86 functions", "No signup required", "Instant results", "Developer reports"],
      href: "https://PTCHBL.com",
      external: true
    },
    {
      id: "splcbl",
      name: "SPLCBL",
      tagline: "WordPress Plugin Validator",
      description: "Upload your WordPress plugin and scan for common WordPress.org submission issues before the official review process. Free for all developers.",
      icon: Wrench,
      status: "Free",
      statusColor: "bg-[hsl(var(--system-green))]",
      features: ["Pre-submission scan", "Issue detection", "Compliance check", "Free for all", "Instant results", "Detailed reports"],
      href: "/projects/spliceable"
    },
    {
      id: "cascade",
      name: "Cascade",
      tagline: "Autonomous Dreaming AI",
      description: "The first autonomous AI that reflects on memories through internal simulation cycles we call dreaming. World first documented with proof on Zenodo and OSF.",
      icon: Brain,
      status: "Deployed",
      statusColor: "bg-primary",
      features: ["Memory reflection", "Dream cycles", "Autonomous learning", "Self-improvement", "Pattern synthesis", "Verified proof"],
      href: "/projects/brain"
    },
    {
      id: "nexus",
      name: "AI Nexus",
      tagline: "Multi-Provider Gateway",
      description: "Intelligent AI routing across 20+ LLMs and API providers with automatic fallback chains and cost optimization.",
      icon: Server,
      status: "Running",
      statusColor: "bg-primary",
      features: ["20+ providers", "Auto fallbacks", "Cost optimization", "Smart routing", "Load balancing", "Zero downtime"],
      href: "/projects/nexus"
    },
    {
      id: "xctbl",
      name: "XCTBL Space",
      tagline: "Lore-Wrapped SaaS Suite",
      description: "Software suite wrapped in fictional lore. Custom OAuth login system connecting tools across interconnected worlds. Fiction-framed, but every tool is 100% real and functional.",
      icon: Sparkles,
      status: "Live",
      statusColor: "bg-[hsl(var(--system-amber))]",
      features: ["Custom OAuth", "Interconnected tools", "Fictional interface", "Real functionality", "Multi-world nav", "Entertainment layer"],
      href: "https://XCTBL.com",
      external: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Current Projects — PromptFluid Shipped Systems"
        description="Explore PromptFluid's ecosystem of shipped products: RCKBL, RNDRBL, PTCHBL, SPLCBL, Cascade, AI Nexus, and XCTBL Space. Real systems that work."
        canonical="https://promptfluid.com/projects"
        keywords={['PromptFluid projects', 'AI security', 'accessibility tools', 'WordPress plugins', 'autonomous AI']}
      />

      <PublicNav />

      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 h-[50vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 h-[50vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-16">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>

          <div className="max-w-4xl">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <Sparkles className="w-3 h-3 mr-2" />
              Shipped Systems
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Current Projects
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Seven live products. 100+ projects shipped over 15 years. Real, operational, and independently verifiable.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-6">
          {projects.map((project) => (
            <Card 
              key={project.id}
              className="group p-8 bg-card border-border hover:border-primary/40 transition-all cursor-pointer"
              onClick={() => project.external ? window.open(project.href, "_blank") : navigate(project.href)}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Icon & Status */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <project.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${project.statusColor}`} />
                    <span className="text-sm font-medium text-muted-foreground">{project.status}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1 text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                  </h2>
                  <p className="text-primary font-medium mb-3">{project.tagline}</p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Features Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {project.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex-shrink-0 flex items-center">
                  <Button 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      project.external ? window.open(project.href, "_blank") : navigate(project.href);
                    }}
                  >
                    <span>{project.external ? 'Visit' : 'View'}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Earth Window */}
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
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-4xl font-light text-white drop-shadow-lg">
              "From concept to deployed system—every time."
            </p>
          </blockquote>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Want to Build Together?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            100+ projects shipped over 15 years. Join us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/investors')} className="bg-primary hover:bg-primary/90">
              Investor Information
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
              Contact Team
            </Button>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
