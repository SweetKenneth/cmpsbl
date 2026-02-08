import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, CheckCircle, Clock, ExternalLink, ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";

export default function Partnerships() {
  const partners = [
    { name: "Railway", status: "active", type: "Infrastructure", integration: "Complete", logo: "🚂" },
    { name: "Supabase", status: "active", type: "Database", integration: "Complete", logo: "⚡" },
    { name: "Groq", status: "active", type: "AI Provider", integration: "Complete", logo: "🧠" },
    { name: "Cerebras", status: "active", type: "AI Provider", integration: "Complete", logo: "🤖" },
    { name: "Together AI", status: "active", type: "AI Provider", integration: "Complete", logo: "🎯" },
    { name: "DeepSeek", status: "active", type: "AI Provider", integration: "Complete", logo: "💡" },
  ];

  const opportunities = [
    { name: "Content Management Platform", value: "$50K ARR", stage: "Negotiation" },
    { name: "E-commerce Integration", value: "$120K ARR", stage: "Proposal" },
    { name: "Enterprise SaaS Provider", value: "$200K ARR", stage: "Discovery" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Partnerships — CMPSBL Ecosystem & Integrations"
        description="Strategic partnerships and integrations powering the CMPSBL cognitive infrastructure. Join our network of AI providers and infrastructure partners."
        canonical="https://cmpsbl.com/partnerships"
        keywords={['CMPSBL partnerships', 'AI integrations', 'technology partners', 'ecosystem']}
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
              <Handshake className="w-3 h-3 mr-2" />
              Ecosystem
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Strategic Partnerships
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Ecosystem integrations and collaborations powering the next generation of AI infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">
                {partners.filter(p => p.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active Partners</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-[hsl(var(--system-amber))] mb-2">
                {partners.filter(p => p.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-[hsl(var(--system-green))] mb-2">$370K</p>
              <p className="text-sm text-muted-foreground">Pipeline Value</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Current Partners</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {partners.map((partner) => (
              <Card key={partner.name} className="p-6 bg-card border-border hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{partner.logo}</div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{partner.name}</h3>
                      <p className="text-sm text-muted-foreground">{partner.type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                      {partner.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {partner.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {partner.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{partner.integration}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[40vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-4xl font-light text-white drop-shadow-lg">
              "Building the future together."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Partnership Opportunities */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Partnership Opportunities</h2>
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <Card key={opp.name} className="p-6 bg-card border-border hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{opp.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">
                        Potential Value: <span className="text-[hsl(var(--system-green))] font-semibold">{opp.value}</span>
                      </span>
                      <Badge variant="outline">{opp.stage}</Badge>
                    </div>
                  </div>
                  <Button variant="outline">
                    View Details
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Become a Partner</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join the PromptFluid ecosystem and integrate AI-powered intelligence into your platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Contact Partnership Team
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
