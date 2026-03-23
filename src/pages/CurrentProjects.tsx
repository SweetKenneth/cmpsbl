/**
 * Current Projects — CMPSBL & LNCHBL Shipped Systems
 */

import { Shield, Zap, Brain, ArrowRight, Eye, Wrench, Server, Sparkles, Accessibility, ExternalLink, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 },
};

const projects = [
  {
    id: "cmpsbl",
    name: "CMPSBL",
    tagline: "Cognitive Infrastructure for AI",
    description: "The 40-primitive cognitive orchestration substrate. Persistent memory, DREAM Engine cycles, NEXUS Organ routing, governed evolution, and 675+ capabilities across agents, engines, layers & organs. The platform everything else runs on.",
    icon: Brain,
    status: "Live",
    features: ["40 primitives · 4 categories", "Persistent memory", "DREAM Engine", "NEXUS Organ", "Governed evolution", "175,000+ lines"],
    href: "/ai-operating-system",
    external: false
  },
  {
    id: "lnchbl",
    name: "LNCHBL",
    tagline: "Self-Hosted CMPSBL Deployment",
    description: "Deploy the complete CMPSBL substrate on your own infrastructure. Air-gapped, sovereign, and fully compliant. Enterprise-grade with dedicated memory partitions and organization workspaces.",
    icon: Rocket,
    status: "Enterprise",
    features: ["Full substrate deploy", "Air-gapped security", "Data sovereignty", "Compliance-ready", "Dedicated partitions", "Custom domains"],
    href: "/enterprise",
    external: false
  },
  {
    id: "rckbl",
    name: "RCKBL",
    tagline: "Enterprise Website Security",
    description: "Bot defense born from reverse-engineering stealth technology. Behavioral analysis and real-time threat blocking. Built on CMPSBL's DEFENSE node.",
    icon: Shield,
    status: "Live",
    features: ["AI bot detection", "Behavioral fingerprinting", "Real-time blocking", "WordPress plugin", "Adaptive CAPTCHA", "Device scoring"],
    href: "/projects",
    external: false
  },
  {
    id: "rndrbl",
    name: "RNDRBL",
    tagline: "Accessibility-First Browser",
    description: "Browser with integrated control panel. Real-time customization for users with disabilities. Powered by CMPSBL's INCLUSIVE node.",
    icon: Eye,
    status: "Running",
    features: ["Layover controls", "Customizable features", "Disability support", "Browser extension", "Real-time adjustments", "Universal compatibility"],
    href: "https://RNDRBL.com",
    external: true
  },
  {
    id: "ptchbl",
    name: "PTCHBL",
    tagline: "Free WCAG Scanner",
    description: "Free WCAG scanner with AI-powered fixes. 45 of 86 accessibility functions. Inclusion without paywalls.",
    icon: Accessibility,
    status: "Free",
    features: ["WCAG 2.2 scanning", "AI-powered fixes", "45/86 functions", "No signup required", "Instant results", "Developer reports"],
    href: "https://PTCHBL.com",
    external: true
  },
  {
    id: "splcbl",
    name: "SPLCBL",
    tagline: "WordPress Plugin Validator",
    description: "Pre-submission validator for WordPress plugins. Scans against WordPress.org requirements before review.",
    icon: Wrench,
    status: "Free",
    features: ["Pre-submission scan", "Issue detection", "Compliance check", "Free for all", "Instant results", "Detailed reports"],
    href: "https://SPLCBL.com",
    external: true
  },
  {
    id: "cascade",
    name: "Cascade",
    tagline: "Autonomous Dreaming AI",
    description: "First documented autonomous AI with memory reflection cycles — dreaming. Published on Zenodo and OSF. Built on CMPSBL's BRAIN and DREAM Engine and BRAIN Organ.",
    icon: Brain,
    status: "Deployed",
    features: ["Memory reflection", "Dream cycles", "Autonomous learning", "Self-improvement", "Pattern synthesis", "Verified proof"],
    href: "https://cmpsbl.com/projects/brain",
    external: true
  },
  {
    id: "nexus",
    name: "AI Nexus",
    tagline: "Multi-Provider Gateway",
    description: "Unified routing across 13+ LLM providers. Intelligent load balancing, failover, and cost optimization. Core CMPSBL NEXUS node exposed as a standalone service.",
    icon: Server,
    status: "Running",
    features: ["13+ providers", "Auto fallbacks", "Cost optimization", "Smart routing", "Load balancing", "Zero downtime"],
    href: "https://cmpsbl.com/blog/ai-triad-intelligent-routing",
    external: true
  },
  {
    id: "xctbl",
    name: "XCTBL Space",
    tagline: "Lore-Wrapped SaaS Suite",
    description: "Immersive SaaS with fictional world-building. Custom OAuth connecting real tools across narrative experiences.",
    icon: Sparkles,
    status: "Live",
    features: ["Custom OAuth", "Interconnected tools", "Fictional interface", "Real functionality", "Multi-world nav", "Entertainment layer"],
    href: "https://XCTBL.com",
    external: true
  }
];

export default function CurrentProjects() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Current Projects — CMPSBL & LNCHBL Ecosystem"
        description="Explore the CMPSBL ecosystem: the 40-primitive cognitive substrate, LNCHBL self-hosted deployment, RCKBL security, RNDRBL accessibility, and more. Real systems, shipped and operational."
        canonical="https://cmpsbl.com/projects"
        keywords={['CMPSBL projects', 'LNCHBL', 'AI security', 'accessibility tools', 'autonomous AI', 'self-hosted AI']}
      />

      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20 md:py-28 px-3 sm:px-4">
        <div className="absolute inset-0 bg-[var(--gradient-mesh)] opacity-40" />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, hsl(var(--primary) / 0.08), transparent 60%)" }} />
        
        <motion.div 
          className="relative container mx-auto max-w-5xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary font-mono text-xs">
            <Sparkles className="w-3 h-3 mr-2" />
            CMPSBL ECOSYSTEM
          </Badge>

           <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-foreground leading-[1.1] mb-4 sm:mb-6">
             Current Projects
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The CMPSBL ecosystem spans cognitive infrastructure, self-hosted deployment via <span className="text-foreground font-semibold">LNCHBL</span>, 
            security, accessibility, and autonomous AI. Nine live products. 100+ projects shipped over 15 years.
          </p>
        </motion.div>
      </section>

      {/* Projects Grid */}
       <section className="container mx-auto px-3 sm:px-4 pb-16 sm:pb-20 max-w-6xl">
         <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className={project.id === 'cmpsbl' ? 'md:col-span-2' : ''}
            >
              <Card 
                className="group h-full glass-edge card-lift cursor-pointer border-border/40 hover:border-primary/40 transition-all duration-300 overflow-hidden"
                onClick={() => project.external ? window.open(project.href, "_blank") : navigate(project.href)}
              >
                <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <project.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {project.name}
                        </h2>
                        <p className="text-xs font-medium text-primary/80">{project.tagline}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-neon-green/30 text-neon-green bg-neon-green/10 font-mono shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-green mr-1.5 animate-pulse" />
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{project.description}</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-5">
                    {project.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground/80">
                        <div className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-border/30">
                    <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-primary"
                      onClick={(e) => { e.stopPropagation(); project.external ? window.open(project.href, "_blank") : navigate(project.href); }}>
                      {project.external ? "Visit" : "View"}
                      {project.external ? <ExternalLink className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
       <section className="py-12 sm:py-16 px-3 sm:px-4 border-t border-border/30 bg-gradient-to-b from-muted/10 to-background">
         <motion.div {...fadeUp} className="container mx-auto max-w-4xl text-center">
           <h2 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4 text-foreground">Want to Build Together?</h2>
           <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">100+ projects shipped over 15 years. Join us.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/investors')} className="bg-primary hover:bg-primary/90 gap-2 shadow-lg shadow-primary/15 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Investor Information <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/roadmap')}>View Roadmap</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>Contact Team</Button>
          </div>
        </motion.div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
