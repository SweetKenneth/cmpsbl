import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Download, FileText, BarChart3, DollarSign, ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImage from "@/assets/hero/investor-meeting.jpg";
import autonomousImage from "@/assets/hero/autonomous-control.jpg";

export default function Investors() {
  const metrics = [
    { label: "Core Products", value: "6", trend: "Shipped" },
    { label: "Founded", value: "2024", trend: "Seed Stage" },
    { label: "AI Providers", value: "20+", trend: "Integrated" },
    { label: "Projects Shipped", value: "100+", trend: "15 Years" },
  ];

  const documents = [
    { name: "Pitch Deck", date: "Available on request", type: "PDF" },
    { name: "Product Roadmap", date: "Available on request", type: "PDF" },
    { name: "Technical Overview", date: "Available on request", type: "PDF" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Investor Relations — PromptFluid Seed Investment"
        description="Invest in PromptFluid's applied AI infrastructure. 100+ projects shipped over 15 years. Six live products. Seeking seed investment."
        canonical="https://promptfluid.com/investors"
        keywords={['AI startup investment', 'venture capital', 'seed funding', 'AI infrastructure']}
      />

      <PublicNav />

      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <img 
          src={heroImage}
          alt="Professional investor meeting in modern conference room with city skyline view"
          className="absolute inset-0 w-full h-[50vh] object-cover"
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
              <TrendingUp className="w-3 h-3 mr-2" />
              Investment Opportunity
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Investor Relations
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Seeking seed investment to scale AI-powered infrastructure for security, accessibility, and autonomous systems.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-foreground mb-1">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">{metric.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Opportunity */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 bg-card border-border">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Investment Opportunity</h2>
                <p className="text-muted-foreground">Seeking Seed Funding</p>
              </div>
              <Link to="/contact">
                <Button className="bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  Request Materials
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-muted/30 border border-border rounded-lg">
                <BarChart3 className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2 text-foreground">Market Opportunity</h3>
                <p className="text-sm text-muted-foreground">
                  WordPress security and web accessibility markets with significant growth potential
                </p>
              </div>
              <div className="p-6 bg-muted/30 border border-border rounded-lg">
                <DollarSign className="w-8 h-8 text-[hsl(var(--system-green))] mb-3" />
                <h3 className="font-semibold mb-2 text-foreground">Revenue Model</h3>
                <p className="text-sm text-muted-foreground">
                  Freemium SaaS with premium tiers for security; Accessibility tools remain free
                </p>
              </div>
              <div className="p-6 bg-muted/30 border border-border rounded-lg">
                <TrendingUp className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2 text-foreground">Product Status</h3>
                <p className="text-sm text-muted-foreground">
                  Six live products. WordPress plugin ready. Cascade deployed. AI Nexus operational.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[40vh] overflow-hidden">
        <img 
          src={autonomousImage}
          alt="Autonomous control systems with holographic interface displays"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-4xl font-light text-foreground drop-shadow-lg">
              "We ship real systems."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Investor Documents */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Investor Documents</h2>
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.name} className="p-6 bg-card border-border hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.type} • {doc.date}
                      </p>
                    </div>
                  </div>
                  <Link to="/contact">
                    <Button variant="outline" size="sm">
                      Request
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Learn More?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Schedule a meeting to discuss partnership opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Schedule Meeting
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/investors-public">
              <Button size="lg" variant="outline">
                View Public Materials
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
