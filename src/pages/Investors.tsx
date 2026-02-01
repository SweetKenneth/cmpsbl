import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Download, FileText, ArrowRight, 
  Layers, Brain, Shield, Network, Eye, Sparkles,
  CheckCircle2, Building2, Mail, Phone
} from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";

export default function Investors() {
  const acquisitionMetrics = [
    { label: "Substrate Modules", value: "12", detail: "Brain • Decode • Defense • Nexus • Vision • Dream • Core • Ripple • Access • System • Modernizer • Integration" },
    { label: "Technology Status", value: "Live", detail: "Production systems running" },
    { label: "IP Status", value: "100%", detail: "Proprietary & documented" },
    { label: "Track Record", value: "100+", detail: "Projects shipped over 15 years" },
  ];

  const whyAcquire = [
    {
      icon: Layers,
      title: "Category-Defining Technology",
      description: "First AI orchestration substrate. Not a wrapper, not an integration—a foundational infrastructure layer."
    },
    {
      icon: Brain,
      title: "Unique Capabilities",
      description: "First documented AI with dream-state reflection cycles. Memory persistence and learning as infrastructure."
    },
    {
      icon: Shield,
      title: "Integrated Security",
      description: "Defense module provides bot detection, behavioral fingerprinting, and threat neutralization built-in."
    },
    {
      icon: Network,
      title: "Provider Agnostic",
      description: "Routes across 20+ LLM providers with automatic failover. No vendor lock-in."
    }
  ];

  const documents = [
    { name: "Executive Summary", description: "One-page overview of the substrate and acquisition opportunity", type: "PDF" },
    { name: "Technical Architecture", description: "Detailed system design and module documentation", type: "PDF" },
    { name: "IP Documentation", description: "Proprietary technology and intellectual property details", type: "PDF" },
    { name: "Financial Overview", description: "Revenue model, projections, and operational costs", type: "PDF" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Acquisition Opportunity — promptfluid® AI Substrate"
        description="Strategic acquisition opportunity. First-of-its-kind AI orchestration substrate with live production systems, 100% proprietary technology, and 15 years of shipping experience."
        canonical="https://promptfluid.com/investors"
        keywords={['AI acquisition', 'AI infrastructure', 'strategic acquisition', 'AI substrate']}
      />

      <PublicNav />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-24 border-b border-border">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        
        <div className="relative container mx-auto px-4">
          <nav className="mb-6 sm:mb-8 md:mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors touch-target tap-highlight-none">
              ← Back to Home
            </Link>
          </nav>
          
          <div className="max-w-4xl">
            <Badge variant="outline" className="mb-4 sm:mb-6 border-primary/30 text-primary text-xs sm:text-sm">
              <Layers className="w-3 h-3 mr-1.5 sm:mr-2" />
              Strategic Acquisition
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-foreground tracking-tight leading-tight">
              Own the AI Substrate
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              promptfluid® is a unique acquisition opportunity—the first cognitive orchestration substrate 
              with live production systems and category-defining technology.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8 max-w-5xl mx-auto">
            {acquisitionMetrics.map((metric, index) => (
              <div key={index} className="text-center p-3 sm:p-4 rounded-xl bg-background/50">
                <p className="text-2xl sm:text-3xl font-bold text-primary mb-0.5 sm:mb-1">{metric.value}</p>
                <p className="text-xs sm:text-sm font-medium text-foreground">{metric.label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Acquire */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4 sm:mb-6 border-[hsl(var(--system-green))]/30 text-[hsl(var(--system-green))] text-xs sm:text-sm">
              Strategic Value
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
              Why Acquire promptfluid®?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              This isn't another AI startup. This is foundational infrastructure with first-mover advantage.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {whyAcquire.map((item, index) => (
              <Card key={index} className="p-5 sm:p-6 md:p-8 bg-card border-border hover:border-primary/30 transition-all active:scale-[0.99]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">{item.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-muted/30 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
                What's Included
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {[
                { icon: Layers, title: "Complete Substrate", desc: "All five modules with unified architecture" },
                { icon: Brain, title: "Brain Module", desc: "Memory, learning, and dream-state reflection" },
                { icon: Sparkles, title: "Cascade Interface", desc: "Natural language user interface layer" },
                { icon: Shield, title: "Defense System", desc: "Bot detection and threat neutralization" },
                { icon: Network, title: "Nexus Router", desc: "Multi-provider AI gateway (20+ providers)" },
                { icon: Eye, title: "Vision Observability", desc: "Metrics, monitoring, and anomaly detection" },
                { icon: FileText, title: "Full Documentation", desc: "Technical architecture and API docs" },
                { icon: Building2, title: "IP & Trademarks", desc: "All intellectual property and brand assets" },
                { icon: CheckCircle2, title: "Live Infrastructure", desc: "Running production systems" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-xl border border-border active:scale-[0.99] transition-transform">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base text-foreground mb-0.5 sm:mb-1">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-8 text-foreground">Available Materials</h2>
          <div className="space-y-3 sm:space-y-4">
            {documents.map((doc) => (
              <Card key={doc.name} className="p-4 sm:p-6 bg-card border-border hover:border-primary/40 transition-all active:scale-[0.995]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-primary/10 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-foreground">{doc.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{doc.description}</p>
                    </div>
                  </div>
                  <Link to="/contact" className="self-end sm:self-center">
                    <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 touch-target">
                      Request
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-foreground">Begin the Conversation</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8">
              Serious inquiries only. We're looking for the right strategic partner.
            </p>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center mb-8 sm:mb-10">
              <Link to="/contact" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 w-full sm:w-auto h-12 sm:h-11 touch-target">
                  <Mail className="w-4 h-4" />
                  Schedule Discussion
                </Button>
              </Link>
              <a href="tel:7603584324" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto h-12 sm:h-11 touch-target">
                  <Phone className="w-4 h-4" />
                  (760) FLUID-AI
                </Button>
              </a>
            </div>

            <div className="p-4 sm:p-6 bg-card rounded-xl border border-border text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">Direct Contact</p>
              <p className="font-semibold text-sm sm:text-base text-foreground">Kenneth E Sweet Jr — Founder & CEO</p>
              <a href="mailto:promptfluid@gmail.com" className="text-primary hover:underline text-sm sm:text-base">
                promptfluid@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
