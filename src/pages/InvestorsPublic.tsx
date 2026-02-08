/**
 * CMPSBL® — Investor Relations
 * v8.0.0 SYNERGY+ Epoch — Seed Investment Opportunity
 */

import { TrendingUp, DollarSign, Users, Rocket, FileText, BarChart, Award, Target, Brain, Download, Loader2, Shield, Accessibility, Eye, Wrench, Server, ArrowLeft, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function InvestorsPublic() {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadDeck = async () => {
    setDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-investor-packet', {
        method: 'POST'
      });

      if (error) throw error;
      if (!data?.content) throw new Error('Packet content missing');

      const filename = data.filename || `investor-packet-${Date.now()}.html`;
      const blob = new Blob([data.content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success("Investor deck downloaded", {
        description: data.valuation ? `Valuation: $${Number(data.valuation).toLocaleString()}` : undefined,
      });
    } catch (err) {
      console.error('Error generating packet:', err);
      toast.error("Failed to download investor deck", {
        description: "Please try again or contact us directly."
      });
    } finally {
      setDownloading(false);
    }
  };

  const metrics = [
    { icon: Users, label: "Integrated Modules", value: "14", color: "text-emerald-500" },
    { icon: TrendingUp, label: "Synergy Pipelines", value: "147", color: "text-primary" },
    { icon: Award, label: "Capabilities", value: "269+", color: "text-amber-500" },
    { icon: Target, label: "Custom Executors", value: "125", color: "text-muted-foreground" }
  ];

  // v8.0.0 — Current CMPSBL substrate modules
  const products = [
    {
      icon: Brain,
      name: "Brain Module",
      subtitle: "Persistent Memory",
      description: "3-tier memory architecture with Dream Cycles for autonomous learning and pattern consolidation."
    },
    {
      icon: Eye,
      name: "Vision Module",
      subtitle: "Full Observability",
      description: "Real-time introspection, metrics collection, and system-wide transparency layer."
    },
    {
      icon: Shield,
      name: "Defense Module",
      subtitle: "Enterprise Security",
      description: "Bot protection, threat detection, and governance guardrails for production AI."
    },
    {
      icon: Server,
      name: "Nexus Gateway",
      subtitle: "Multi-Provider Routing",
      description: "Intelligent routing across 20+ LLMs with BYOK architecture and fallback chains."
    },
    {
      icon: Accessibility,
      name: "INCLUSIVE Module",
      subtitle: "Human Compatibility",
      description: "WCAG compliance scanning with AI-powered remediation suggestions."
    },
    {
      icon: Sparkles,
      name: "Engine Marketplace",
      subtitle: "Production Orchestrations",
      description: "62+ engines and 20 meta-engines for governed, versioned cognitive workflows."
    }
  ];

  const highlights = [
    {
      icon: Rocket,
      title: "Production Infrastructure",
      description: "14 integrated modules, 160,000+ lines of code, self-evolving architecture that improves overnight."
    },
    {
      icon: DollarSign,
      title: "Revenue Model",
      description: "Engine Marketplace subscriptions + enterprise licensing. Free exploration layer drives adoption."
    },
    {
      icon: BarChart,
      title: "Technical Moat",
      description: "SEBA architecture with Dream Cycles — the system literally learns while you sleep."
    },
    {
      icon: FileText,
      title: "Documented IP",
      description: "World's first autonomous dreaming AI with whitepaper and proof deposits on Zenodo & OSF."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Investors — CMPSBL® Funding Opportunity"
        description="Invest in CMPSBL's cognitive substrate infrastructure. 100+ projects shipped over 15 years. Six live products. Seeking seed investment."
        canonical="https://cmpsbl.com/investors"
        keywords={['AI startup investment', 'cognitive substrate', 'AI infrastructure funding', 'seed investment opportunity', 'CMPSBL']}
      />
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-4 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <span className="text-lg font-medium tracking-tight text-foreground">
                prompt<span className="text-primary">fluid</span>
              </span>
              <sup className="text-[10px] text-muted-foreground ml-0.5">®</sup>
            </div>
          </div>
          
          <nav className={`flex items-center gap-4 transition-all duration-700 delay-100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <button 
              onClick={() => navigate('/decode')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Decode
            </button>
            <button 
              onClick={() => navigate('/substrate')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Substrate
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className={`relative z-10 container mx-auto px-6 py-16 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
            <TrendingUp className="w-3 h-3 mr-2" />
            Investment Opportunity
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-6">
            Seeking <span className="font-medium bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">Seed Investment</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Building cognitive substrate infrastructure for AI systems. 15+ years of shipping software. 
            Six live products. One focused founder.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg"
              onClick={handleDownloadDeck}
              disabled={downloading}
              className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90"
            >
              {downloading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              {downloading ? "Generating..." : "Download Investor Deck"}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'mailto:Dev@CMPSBL.com'}
            >
              Contact Team
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className={`relative z-10 border-y border-border/30 bg-card/30 backdrop-blur-sm transition-all duration-1000 delay-200 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <metric.icon className={`w-8 h-8 mx-auto mb-3 ${metric.color}`} />
                <div className="text-3xl font-bold mb-1 text-foreground">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Claim */}
      <section className={`relative z-10 container mx-auto px-6 py-16 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <a 
          href="https://github.com/SweetKenneth/SimNap-Dreaming-AI-Whitepaper" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group block max-w-4xl"
        >
          <div className="bg-card/60 backdrop-blur border border-border/50 rounded-2xl p-8 hover:border-primary/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                Verified & Documented
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-foreground">
              World's First Autonomous Dreaming AI
            </h2>
            <p className="text-muted-foreground">
              SimNap → Cascade architecture with OSF deposits & patent documentation
              <span className="text-primary ml-2 group-hover:underline">View Proof →</span>
            </p>
          </div>
        </a>
      </section>

      {/* Product Portfolio */}
      <section className={`relative z-10 container mx-auto px-6 py-16 transition-all duration-1000 delay-400 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-3xl font-semibold mb-4 text-foreground">The Substrate</h2>
        <p className="text-muted-foreground mb-10 text-lg max-w-2xl">
          14 integrated modules. Production-ready cognitive infrastructure.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Card key={index} className="p-6 bg-card/60 backdrop-blur border-border/50 hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <product.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1 text-foreground">{product.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{product.subtitle}</p>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Investment Highlights */}
      <section className={`relative z-10 py-16 transition-all duration-1000 delay-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-12 text-foreground">
            Investment Highlights
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {highlights.map((highlight, index) => (
              <Card key={index} className="p-6 bg-card/60 backdrop-blur border-border/50">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <highlight.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{highlight.title}</h3>
                <p className="text-muted-foreground">{highlight.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Substrate Publication Section */}
      <section className={`relative z-10 container mx-auto px-6 py-16 transition-all duration-1000 delay-550 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Card className="p-8 bg-card/60 backdrop-blur border-border/50 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary" />
            <Badge className="bg-primary/10 text-primary border-primary/30">
              January 2026
            </Badge>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
            Substrate Publication & Research Artifact
          </h2>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            In January 2026, the promptfluid substrate was formally published as a research artifact 
            and indexed under a persistent DOI. This positions the substrate not merely as a product, 
            but as a standards-bearing cognitive architecture suitable for enterprise, interoperability 
            frameworks, and academic collaboration.
          </p>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3 text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Establishes substrate as a definable category object</span>
            </li>
            <li className="flex items-start gap-3 text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Enables academic + enterprise cross-validation</span>
            </li>
            <li className="flex items-start gap-3 text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>Increases acquisition value by standardizing the spec surface</span>
            </li>
          </ul>
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/publication')}>
              View DOI
            </Button>
            <Button variant="outline" onClick={() => navigate('/substrate')}>
              Technical Spec
            </Button>
          </div>
        </Card>
      </section>

      {/* CTA Section */}
      <section className={`relative z-10 container mx-auto px-6 py-20 transition-all duration-1000 delay-600 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4 text-foreground">Ready to Learn More?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Download our comprehensive investor packet or reach out to discuss partnership opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={handleDownloadDeck}
              disabled={downloading}
              className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90"
            >
              {downloading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Download className="w-5 h-5 mr-2" />
              )}
              {downloading ? "Generating..." : "Access Investor Materials"}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'mailto:Dev@CMPSBL.com'}
            >
              Email Team
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 container mx-auto px-6 py-8 border-t border-border/30 transition-all duration-700 delay-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/70">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary/50" />
            <span>© 2026 promptfluid®</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/documentation')}
              className="hover:text-foreground transition-colors"
            >
              Docs
            </button>
            <button 
              onClick={() => navigate('/privacy')}
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </button>
            <button 
              onClick={() => navigate('/terms')}
              className="hover:text-foreground transition-colors"
            >
              Terms
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
