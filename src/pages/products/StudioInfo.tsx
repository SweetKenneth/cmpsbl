/**
 * Studio Info — Creative Module Product Page  
 * v8.0.0 SYNERGY+ Epoch — Part of 14-module substrate
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, Rocket, Sparkles, Zap, Globe, GitBranch, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudioInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Studio Module — AI Website Creation & Deployment | CMPSBL"
        description="Build production-ready websites in minutes with AI. Part of CMPSBL's 14-module cognitive substrate for intelligent web development and deployment."
        canonical="https://cmpsbl.com/products/studio"
        keywords={[
          'AI website builder',
          'CMPSBL Studio',
          'cognitive web development',
          'instant website deployment',
          'no-code website creation',
          'automated website design',
          'AI web development platform',
          'rapid website deployment',
          'website generation AI',
          'professional website creator'
        ]}
      />

      <PublicNav />

      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Studio Module</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Build Websites.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Deploy Instantly.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create production-ready websites in minutes with AI-powered design. Part of CMPSBL's 
            14-module cognitive substrate for intelligent web development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="group">
              Start Building Free
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
              View Examples
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 flex-1">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: Sparkles,
              title: "AI-Powered Design",
              description: "Describe your vision and watch AI generate beautiful, responsive designs tailored to your brand."
            },
            {
              icon: Rocket,
              title: "Instant Deployment",
              description: "Deploy to production in seconds with automatic SSL, CDN, and global edge distribution."
            },
            {
              icon: Code2,
              title: "Clean Code Output",
              description: "Export production-ready React code you can customize, version control, and own forever."
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Built on modern frameworks with automatic optimization for speed and performance."
            },
            {
              icon: Globe,
              title: "Custom Domains",
              description: "Connect your own domain or use our free subdomains—SSL certificates included."
            },
            {
              icon: GitBranch,
              title: "Version Control",
              description: "Track changes, rollback updates, and collaborate with your team seamlessly."
            }
          ].map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            From Idea to Live Site in 3 Steps
          </h2>
          <div className="space-y-8">
            {[
              { step: "1", title: "Describe Your Vision", description: "Tell the AI what kind of website you need—landing page, portfolio, e-commerce, or anything else." },
              { step: "2", title: "AI Generates Design", description: "Watch as Studio creates a complete, responsive website with your branding, content, and features." },
              { step: "3", title: "Deploy & Launch", description: "Review, customize if needed, and deploy to production with one click. Your site is live in seconds." }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 glass p-6 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center font-bold text-primary-foreground">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent mb-2">
                3 min
              </div>
              <div className="text-muted-foreground">Average Build Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary-variant to-accent bg-clip-text text-transparent mb-2">
                14
              </div>
              <div className="text-muted-foreground">Module Synergies</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                $0
              </div>
              <div className="text-muted-foreground">Setup Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Businesses Choose Studio
          </h2>
          <div className="space-y-6">
            {[
              "Launch websites 10x faster than traditional development",
              "Save thousands on design and development costs",
              "Get professional results without hiring developers",
              "Maintain full control with exportable, clean code",
              "Scale effortlessly with automatic performance optimization",
              "Ensure accessibility compliance with built-in WCAG standards"
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 glass p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center glass p-12 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Website?</h2>
          <p className="text-muted-foreground mb-6">
            Start creating professional websites with CMPSBL's Studio module today—no credit card required.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="group">
            Start Building Free
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
