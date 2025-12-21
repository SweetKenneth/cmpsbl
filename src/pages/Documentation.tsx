import { Link } from "react-router-dom";
import { BookOpen, Code, Zap, Shield, Database, FileText, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Documentation — PromptFluid Developer Guides"
        description="Complete developer documentation for the PromptFluid ecosystem. API references, integration guides, and technical resources."
        canonical="https://promptfluid.com/docs"
        keywords={['PromptFluid documentation', 'API reference', 'developer guides', 'AI integration']}
      />

      <PublicNav />

      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 h-[50vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')`,
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
              <BookOpen className="w-3 h-3 mr-2" />
              Developer Resources
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Documentation
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Complete guide to the PromptFluid ecosystem. Everything you need to integrate, build, and scale.
            </p>
          </div>
        </div>
      </section>

      {/* Documentation Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="brain">Brain</TabsTrigger>
              <TabsTrigger value="defense">Defense</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-bold mb-4 text-foreground">PromptFluid Ecosystem</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  PromptFluid is a comprehensive AI orchestration platform that combines adaptive intelligence,
                  security, and creativity into a seamless ecosystem.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: Zap, title: "Brain", desc: "Adaptive AI learning core" },
                    { icon: Shield, title: "Defense", desc: "Bot protection system" },
                    { icon: Database, title: "Nexus", desc: "API orchestration mesh" },
                    { icon: FileText, title: "Studio", desc: "App builder platform" },
                  ].map((item) => (
                    <div key={item.title} className="p-6 bg-muted/30 rounded-lg border border-border">
                      <item.icon className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-semibold mb-1 text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="brain" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-bold mb-4 text-foreground">PromptFluid Brain</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The Brain is the adaptive intelligence core that learns, evolves, and optimizes system behavior.
                </p>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                    <h4 className="font-semibold mb-1 text-foreground">Training</h4>
                    <p className="text-sm text-muted-foreground">
                      The Brain automatically trains on system events every 4 hours via cron job.
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                    <h4 className="font-semibold mb-1 text-foreground">Memory</h4>
                    <p className="text-sm text-muted-foreground">
                      Vector embeddings store learned patterns for instant recall and pattern matching.
                    </p>
                  </div>
                  <div className="p-4 border-l-4 border-primary bg-muted/30 rounded-r-lg">
                    <h4 className="font-semibold mb-1 text-foreground">Reinforcement</h4>
                    <p className="text-sm text-muted-foreground">
                      Successful patterns are reinforced hourly to improve accuracy over time.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="defense" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-bold mb-4 text-foreground">PromptFluid Defense</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Advanced bot protection with behavioral analysis and device fingerprinting.
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2 text-foreground">Bot Detection</h4>
                    <code className="text-xs block bg-background p-3 rounded border border-border">
                      POST /functions/v1/bot-detection
                    </code>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2 text-foreground">Behavioral Analysis</h4>
                    <code className="text-xs block bg-background p-3 rounded border border-border">
                      POST /functions/v1/behavioral-analysis
                    </code>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-bold mb-4 text-foreground">API Reference</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      All API requests require authentication via API key header.
                    </p>
                    <code className="block bg-muted/30 p-4 rounded-lg text-xs border border-border">
                      X-API-Key: pfdef_your_api_key_here
                    </code>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Base URL</h3>
                    <code className="block bg-muted/30 p-4 rounded-lg text-xs border border-border">
                      https://bxodolqqczjuahwdrswy.supabase.co/functions/v1
                    </code>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Integrations</h2>
                <div className="grid gap-4">
                  {[
                    { name: "Groq", desc: "Primary inference with Llama 3.3-70B" },
                    { name: "Cerebras", desc: "High-performance secondary fallback" },
                    { name: "Together AI", desc: "Llama 3.1-70B turbo for complex tasks" },
                    { name: "DeepSeek", desc: "Extended coverage and redundancy" },
                  ].map((integration) => (
                    <div key={integration.name} className="p-4 bg-muted/30 rounded-lg border border-border">
                      <h4 className="font-semibold text-foreground">{integration.name}</h4>
                      <p className="text-sm text-muted-foreground">{integration.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
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
              "Built for developers who ship."
            </p>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Need Help?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our team is ready to help you integrate and scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Contact Support
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
