import { Check, Download, Sparkles, Shield, Zap, Brain, Globe, Code, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { SEO } from "@/components/SEO";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ClarityProduct() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleDownload = () => {
    // Trigger download of the WordPress plugin
    window.location.href = "/downloads/clarity";
    toast({
      title: "Download Started",
      description: "PromptFluid Clarity WordPress plugin is downloading..."
    });
  };

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Success!",
      description: "We'll notify you about Clarity Pro updates"
    });
    setEmail("");
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
    "First WordPress accessibility plugin with AI-powered auto-fix",
    "First to use multi-model AI (Groq + OpenAI + Anthropic) for WCAG compliance",
    "First real-time learning from accessibility patterns across installations",
    "First to generate contextual alt text using Cascade AI",
    "First unified accessibility + security monitoring platform"
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "/mo",
      description: "Perfect for small sites and personal projects",
      features: [
        "Up to 10 pages scanned",
        "Basic accessibility reports",
        "Manual fix suggestions",
        "WCAG 2.2 Level A compliance",
        "Email support"
      ],
      cta: "Download Free",
      highlighted: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "/mo",
      description: "For professionals and growing businesses",
      features: [
        "Unlimited page scanning",
        "AI-powered automated fixes",
        "WCAG 2.2 Level AA + AAA",
        "Scheduled scans (daily/weekly)",
        "Priority support",
        "API access",
        "Custom reporting"
      ],
      cta: "Coming Q2 2025",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For agencies and large organizations",
      features: [
        "Everything in Pro",
        "Multi-site management",
        "White-label options",
        "Dedicated accessibility specialist",
        "Custom AI training",
        "SLA guarantees",
        "24/7 priority support"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  const roadmapPhases = [
    {
      quarter: "Q4 2025",
      status: "Completed",
      features: [
        "✅ Core accessibility framework (WCAG 2.2)",
        "✅ WordPress plugin v3.0.0",
        "✅ AI-powered WCAG scanning engine",
        "✅ Manual remediation tools with AI suggestions",
        "✅ React admin dashboard",
        "✅ Stripe subscription integration",
        "✅ Complete WordPress.org submission package"
      ]
    },
    {
      quarter: "Q1 2026",
      status: "Awaiting WordPress.org Approval",
      features: [
        "🔄 WordPress.org submission (queued after Reflex approval)",
        "🔄 PromptFluid Brain AI integration for auto-fixes",
        "Automated fix engine (one-click remediation)",
        "Cascade AI-powered alt text generation",
        "Scheduled scanning (daily/weekly/monthly)",
        "Public API v1.0 access"
      ]
    },
    {
      quarter: "Q2 2026",
      status: "Planned",
      features: [
        "Multi-site management dashboard",
        "Custom AI model training per site",
        "Advanced analytics with compliance trends",
        "Multi-language accessibility support",
        "Email notification system",
        "PDF compliance reports"
      ]
    },
    {
      quarter: "Q3 2026",
      status: "Planned",
      features: [
        "White-label platform for agencies",
        "Agency dashboard with client management",
        "Automated compliance certification",
        "Integration marketplace (GA4, Slack, etc.)",
        "WordPress Gutenberg block scanner",
        "Mobile app for scan management"
      ]
    }
  ];

  return (
    <>
      <SEO
        title="PromptFluid Clarity — AI-Powered WordPress Accessibility | WCAG 2.2 Compliance"
        description="The first WordPress plugin with AI-powered automated accessibility fixes. Ensure WCAG 2.2 compliance with one-click remediation, continuous monitoring, and PromptFluid Brain intelligence."
        canonical="https://promptfluid.com/projects/clarity"
        keywords={[
          'wordpress accessibility',
          'wcag compliance',
          'accessibility automation',
          'ai accessibility',
          'wordpress wcag',
          'accessibility plugin',
          'automated accessibility fixes',
          'web accessibility',
          'accessibility scanner',
          'wcag 2.2'
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">WordPress Accessibility Plugin</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                    PromptFluid Clarity
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                  AI-Powered WordPress Accessibility
                </p>
                
                <p className="text-lg text-foreground/70 max-w-3xl mx-auto mb-8">
                  The first WordPress plugin with AI-powered automated accessibility fixes. Ensure WCAG 2.2 compliance with one-click remediation, continuous monitoring, and intelligent learning.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    onClick={handleDownload}
                    className="shadow-glow hover:shadow-glow-lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Free Plugin
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => window.location.href = '/downloads/clarity'}
                  >
                    View Documentation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-16">
                <div className="text-center p-4 rounded-xl glass border border-border/50">
                  <div className="text-3xl font-bold text-primary mb-1">100%</div>
                  <div className="text-xs text-muted-foreground leading-tight">WCAG 2.2<br/>Coverage</div>
                </div>
                <div className="text-center p-4 rounded-xl glass border border-border/50">
                  <div className="text-3xl font-bold text-primary mb-1">AI</div>
                  <div className="text-xs text-muted-foreground leading-tight">Automated<br/>Fixes</div>
                </div>
                <div className="text-center p-4 rounded-xl glass border border-border/50">
                  <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                  <div className="text-xs text-muted-foreground leading-tight">Monitoring</div>
                </div>
              </div>
            </div>
          </section>

          {/* Industry Firsts */}
          <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Industry Firsts</h2>
                <p className="text-lg text-muted-foreground">
                  Pioneering accessibility automation with AI
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
                <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
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

          {/* Pricing */}
          <section className="py-20 px-4 bg-gradient-to-b from-muted/20 to-background">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                <p className="text-lg text-muted-foreground">
                  Affordable accessibility for organizations of all sizes
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {pricingTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`p-8 rounded-xl border transition-all ${
                      tier.highlighted
                        ? 'border-primary bg-primary/5 shadow-glow scale-105'
                        : 'border-border/50 glass hover:border-primary/30'
                    }`}
                  >
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold text-primary">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={tier.highlighted ? "default" : "outline"}
                      onClick={tier.name === "Free" ? handleDownload : undefined}
                    >
                      {tier.cta}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Accessibility Roadmap</h2>
                <p className="text-lg text-muted-foreground">
                  Our journey to universal web accessibility
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {roadmapPhases.map((phase, idx) => (
                  <div key={idx} className="p-6 rounded-xl glass border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-primary">{phase.quarter}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        phase.status === 'Released' ? 'bg-green-500/20 text-green-500' :
                        phase.status === 'In Development' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {phase.status}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {phase.features.map((feature, fidx) => (
                        <li key={fidx} className="text-sm text-foreground/70 flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-primary-variant/10 to-accent/10">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-4xl font-bold mb-4">Make Your Site Accessible Today</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Download the free WordPress plugin and start ensuring WCAG 2.2 compliance with AI-powered automation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleDownload} className="shadow-glow hover:shadow-glow-lg">
                  <Download className="mr-2 h-5 w-5" />
                  Download Free Plugin
                </Button>
                <Button size="lg" variant="outline">
                  View Documentation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleNotify} className="mt-12 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground mb-4">
                  Get notified when Pro features launch in Q2 2025
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                    required
                  />
                  <Button type="submit">Notify Me</Button>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
