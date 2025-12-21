import { TrendingUp, DollarSign, Users, Rocket, FileText, BarChart, Award, Target, Brain, Download, Loader2, Shield, Accessibility, Eye, Wrench, Server, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import heroImage from "@/assets/hero/investor-meeting.jpg";
import officeImage from "@/assets/hero/tech-office-mountains.jpg";
import neuralImage from "@/assets/hero/neural-network-abstract.jpg";

export default function InvestorsPublic() {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

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
    { icon: Users, label: "Shipped Products", value: "6", color: "text-[hsl(var(--system-green))]" },
    { icon: TrendingUp, label: "Stage", value: "Seed", color: "text-primary" },
    { icon: Award, label: "Building Since", value: "2009", color: "text-[hsl(var(--system-amber))]" },
    { icon: Target, label: "Projects Shipped", value: "100+", color: "text-muted-foreground" }
  ];

  const products = [
    {
      icon: Shield,
      name: "RCKBL",
      subtitle: "Complete Website Defense",
      description: "Stealth bot technology reverse-engineered into enterprise-grade security. WordPress plugin ready."
    },
    {
      icon: Eye,
      name: "RNDRBL",
      subtitle: "Accessibility Browser",
      description: "Built-in layover control panel for users with disabilities to customize their browsing experience."
    },
    {
      icon: Accessibility,
      name: "PTCHBL",
      subtitle: "Free WCAG Scanner",
      description: "AI-powered accessibility fixes for 45 of 86 WCAG compliance functions. Always free."
    },
    {
      icon: Wrench,
      name: "SPLCBL",
      subtitle: "WordPress Plugin Validator",
      description: "Pre-submission compliance checker for WordPress.org plugin approval process."
    },
    {
      icon: Brain,
      name: "Cascade",
      subtitle: "Autonomous Dreaming AI",
      description: "World's first documented AI with memory reflection cycles. Proof on Zenodo & OSF."
    },
    {
      icon: Server,
      name: "AI Nexus",
      subtitle: "Multi-Provider Gateway",
      description: "Intelligent routing across 20+ LLMs and API providers with fallback chains."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Investors — PromptFluid Funding Opportunities"
        description="Invest in PromptFluid's applied AI infrastructure. 100+ projects shipped over 15 years. Six live products. Seeking seed investment."
        canonical="https://promptfluid.com/investors"
        keywords={['AI startup investment', 'venture capital AI', 'AI security funding', 'SaaS investment opportunity', 'early stage AI funding']}
      />
      
      <PublicNav />

      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <img 
          src={heroImage}
          alt="Professional investor meeting in modern conference room with city skyline view"
          className="absolute inset-0 w-full h-[70vh] object-cover"
        />
        <div className="absolute inset-0 h-[70vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <TrendingUp className="w-3 h-3 mr-2" />
              Investment Opportunity
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Seeking Seed Investment
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl leading-relaxed">
              Building AI-powered infrastructure for security, accessibility, and autonomous systems. 15+ years of shipping software. Six live products. One focused founder.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={() => navigate('/contact')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Schedule Meeting
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={handleDownloadDeck}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 mr-2" />
                )}
                {downloading ? "Generating..." : "Download Investor Deck"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-10">
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
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <a 
            href="https://github.com/SweetKenneth/SimNap-Dreaming-AI-Whitepaper" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="bg-card border border-border rounded-lg p-8 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-primary" />
                <Badge className="bg-[hsl(var(--system-green))]/10 text-[hsl(var(--system-green))] border-[hsl(var(--system-green))]/30">
                  Verified & Documented
                </Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
                World's First Autonomous Dreaming AI
              </h2>
              <p className="text-muted-foreground">
                SimNap → Cascade architecture with OSF deposits & patent documentation
                <span className="text-primary ml-2 group-hover:underline">View Proof →</span>
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* Earth Window - Industrial Area */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src={officeImage}
          alt="Modern tech office with floor-to-ceiling windows overlooking mountain landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-4xl font-light text-foreground drop-shadow-lg">
              "We're closers. We ship real systems."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Product Portfolio */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Live Products</h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Six shipped systems. Real, operational, and independently verifiable.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <Card key={index} className="p-6 bg-card border-border hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <product.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{product.subtitle}</p>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Investment Highlights
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Rocket,
                  title: "Proven Track Record",
                  description: "100+ projects shipped over 15 years. From concept to enterprise-grade deployed systems. No stalled projects."
                },
                {
                  icon: DollarSign,
                  title: "Revenue Model",
                  description: "Freemium SaaS for security products. Accessibility tools remain free to build brand and market presence."
                },
                {
                  icon: BarChart,
                  title: "Technical Foundation",
                  description: "Full-stack infrastructure with edge functions, database, and AI routing across 20+ providers ready for scale."
                },
                {
                  icon: FileText,
                  title: "Documented IP",
                  description: "World's first autonomous dreaming AI with whitepaper, proof deposits on Zenodo & OSF, and patent documentation."
                }
              ].map((highlight, index) => (
                <Card key={index} className="p-6 bg-card border-border">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <highlight.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{highlight.title}</h3>
                  <p className="text-muted-foreground">{highlight.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Earth Window - Trees */}
      <section className="relative w-full h-[40vh] overflow-hidden">
        <img 
          src={neuralImage}
          alt="Abstract neural network visualization representing AI infrastructure"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-60" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Learn More?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Download our comprehensive investor packet or schedule a meeting to discuss partnership opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={handleDownloadDeck}
              disabled={downloading}
              className="bg-primary hover:bg-primary/90"
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
              onClick={() => navigate('/contact')}
            >
              Contact Team
            </Button>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
