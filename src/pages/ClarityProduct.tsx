import { Check, Download, Sparkles, Shield, Zap, Brain, Globe, Code, ArrowRight, Heart, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";

export default function ClarityProduct() {
  const openCMPTBL = () => {
    window.open("https://cmptbl.promptfluid.com", "_blank");
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered WCAG 2.2 Scanning",
      description: "Automated accessibility audits powered by Cascade AI with real-time issue detection and compliance scoring."
    },
    {
      icon: Zap,
      title: "One-Click Automated Fixes",
      description: "Industry-first: AI automatically remediates accessibility issues including alt text generation, contrast adjustments, and heading hierarchy."
    },
    {
      icon: Shield,
      title: "Continuous Compliance Monitoring",
      description: "24/7 automated scans with scheduled checks and instant alerts when accessibility issues are detected on your site."
    },
    {
      icon: Globe,
      title: "Universal Design Validation",
      description: "Ensures all interactive elements are keyboard accessible with proper focus management and ARIA support."
    },
    {
      icon: Code,
      title: "Developer-Friendly Integration",
      description: "Simple WordPress plugin installation with REST API access for custom integrations and automated workflows."
    },
    {
      icon: Sparkles,
      title: "PromptFluid Ecosystem Integration",
      description: "Seamlessly connects with Cascade AI for learning, Vision for monitoring, and Nexus for AI model routing."
    }
  ];

  const industryFirsts = [
    "First 100% free accessibility scanning and fixing platform",
    "First WordPress accessibility plugin with AI-powered auto-fix",
    "First to use multi-model AI (Groq + Together + Hyperbolic + DeepSeek + Cerebras + Google AI Studio) for WCAG compliance",
    "First real-time learning from accessibility patterns across installations",
    "First to generate contextual alt text using Cascade AI"
  ];

  return (
    <>
      <SEO
        title="PromptFluid Clarity — Free AI-Powered WordPress Accessibility | WCAG 2.2 Compliance"
        description="100% free accessibility scanning and AI-powered fixes. Ensure WCAG 2.2 compliance with one-click remediation, continuous monitoring, and intelligent learning. Accessibility should never be behind a paywall."
        canonical="https://promptfluid.com/projects/clarity"
        keywords={[
          'free wordpress accessibility',
          'free wcag compliance',
          'accessibility automation free',
          'free ai accessibility',
          'free wordpress wcag',
          'free accessibility plugin',
          'free automated accessibility fixes',
          'free web accessibility',
          'free accessibility scanner',
          'wcag 2.2 free'
        ]}
      />
      <div className="min-h-screen">
        <PublicNav />
        
        <main>
          {/* Hero Section */}
          <section className="relative py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
            
            <div className="container mx-auto max-w-6xl relative">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">100% Free — The Way It Should Be</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                    PromptFluid Clarity
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                  Free AI-Powered WordPress Accessibility
                </p>
                
                <p className="text-lg text-foreground/70 max-w-3xl mx-auto mb-8">
                  We believe accessibility should never be locked behind a paywall. 
                  Scan your website, get AI-powered fixes, and make the web work for everyone — 
                  completely free, forever.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    onClick={openCMPTBL}
                    className="shadow-glow hover:shadow-glow-lg"
                  >
                    <Accessibility className="mr-2 h-5 w-5" />
                    Free Accessibility Scan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    asChild
                  >
                    <Link to="/blog/accessibility-free-for-all">
                      Read Our Mission
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-16">
                <div className="text-center p-4 rounded-xl glass border border-border/50">
                  <div className="text-3xl font-bold text-primary mb-1">100%</div>
                  <div className="text-xs text-muted-foreground leading-tight">Free<br/>Forever</div>
                </div>
                <div className="text-center p-4 rounded-xl glass border border-border/50">
                  <div className="text-3xl font-bold text-primary mb-1">86+</div>
                  <div className="text-xs text-muted-foreground leading-tight">WCAG<br/>Checks</div>
                </div>
                <div className="text-center p-4 rounded-xl glass border border-border/50">
                  <div className="text-3xl font-bold text-primary mb-1">AI</div>
                  <div className="text-xs text-muted-foreground leading-tight">Automated<br/>Fixes</div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Quote */}
          <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container mx-auto max-w-3xl text-center">
              <Globe className="w-12 h-12 text-primary mx-auto mb-6" />
              <blockquote className="text-2xl md:text-3xl font-medium mb-6">
                "Accessibility is not a feature. It's a fundamental right. 
                And rights shouldn't have a price tag."
              </blockquote>
              <p className="text-muted-foreground mb-6">
                — Kenneth Sweet, Founder of PromptFluid
              </p>
            </div>
          </section>

          {/* Industry Firsts */}
          <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Industry Firsts</h2>
                <p className="text-lg text-muted-foreground">
                  Pioneering free accessibility automation with AI
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {industryFirsts.map((first, idx) => (
                  <div key={idx} className="p-6 rounded-xl glass border border-primary/20 hover:border-primary/40 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-sm text-foreground/80">{first}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Powerful Features — All Free</h2>
                <p className="text-lg text-muted-foreground">
                  Comprehensive tools to make your WordPress sites accessible to all users
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, idx) => (
                  <div key={idx} className="p-6 rounded-xl glass border border-border/50 hover:border-primary/50 transition-all group">
                    <feature.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Free for All CTA */}
          <section className="py-20 px-4 bg-gradient-to-b from-muted/20 to-background">
            <div className="container mx-auto max-w-4xl">
              <div className="text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary-variant/5 to-accent/10 border border-primary/20">
                <Heart className="w-16 h-16 text-red-500 mx-auto mb-6" />
                
                <h2 className="text-4xl font-bold mb-4">Accessibility is Free For All</h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  No signup. No credit card. No premium tiers. Just real accessibility tools that work.
                  Scan your website, fix issues with AI, and make the web work for everyone.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={openCMPTBL} className="shadow-glow hover:shadow-glow-lg">
                    <Accessibility className="mr-2 h-5 w-5" />
                    Start Free Scan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/downloads/clarity">
                      <Download className="mr-2 h-5 w-5" />
                      WordPress Plugin
                    </Link>
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mt-6">
                  No signup required • Unlimited scans • AI-powered fixes included
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}