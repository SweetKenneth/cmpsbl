import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Link } from "react-router-dom";
import { Layers, Zap, Network, TrendingUp, ArrowLeft } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

const PromptFluidNexus = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="NEXUS: AI Gateway & Multi-Model Routing"
        description="Intelligently route AI tasks to optimal model providers with caching, fallback logic, and cost optimization across the substrate."
        type="article"
        publishedTime="2025-09-25"
        keywords={['AI gateway', 'multi-model routing', 'NEXUS system', 'AI orchestration mesh', 'provider management']}
      />
      
      <PublicNav />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-20 md:pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Research
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            NEXUS: The AI Orchestration Gateway
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Explore NEXUS, the intelligent API gateway that routes AI tasks to optimal providers, manages caching strategies, and orchestrates the provider network for maximum performance at zero cost.
          </p>

          <AuthorBio publishDate="2025-09-25" readTime="10 min read" />
        </div>
      </section>

      {/* Hero Visual */}
      <section className="relative w-full py-20 bg-gradient-to-b from-primary/5 via-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <Layers className="w-24 h-24 text-primary mx-auto mb-6" />
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Intelligent routing. Zero cost. Maximum performance.
          </p>
        </div>
      </section>

      {/* Content */}
      <article className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <Layers className="h-8 w-8 text-primary" />
              What is the NEXUS Module?
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                NEXUS serves as the intelligent gateway orchestrating the substrate's cognitive decisions across the multi-provider 
                AI mesh. Every request from BRAIN's cognitive cycles flows through NEXUS.
              </p>
              
              <p>
                Unlike simple API proxies, NEXUS actively manages the autonomous AI lifecycle. It routes simple tasks to 
                fast inference providers and complex reasoning to specialized models across the provider network.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Core Capabilities
            </h2>
            
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Network className="w-10 h-10 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Intelligent Request Routing</h3>
                    <p className="text-muted-foreground">
                      NEXUS receives routing recommendations from BRAIN's cognitive engine and translates them into actual API calls, handling credential management, endpoint selection, and response normalization.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Zap className="w-10 h-10 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Multi-Layer Caching</h3>
                    <p className="text-muted-foreground">
                      Sophisticated caching strategies using Redis. Identical requests return cached results instantly. Semantic caching identifies similar requests and returns relevant cached responses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <TrendingUp className="w-10 h-10 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Automatic Failover & Retry</h3>
                    <p className="text-muted-foreground">
                      When API calls fail due to rate limits or provider outages, Nexus automatically retries with exponential backoff and routes to alternative providers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Layers className="w-10 h-10 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Unified Telemetry & Logging</h3>
                    <p className="text-muted-foreground">
                      Captures detailed metrics for every request—latency, token consumption, error rates, and quality scores. This data feeds into Vision dashboards and Brain's learning systems.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quote Break */}
          <section className="my-16 py-12 border-y border-border">
            <blockquote className="text-2xl md:text-3xl font-light text-center text-foreground">
              "Gateway abstraction enables rapid adaptation to the fast-moving AI landscape."
            </blockquote>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Efficiency Through Intelligent Caching
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">68%</div>
                <div className="text-sm text-muted-foreground">Reduction in external API calls through intelligent caching</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">92ms</div>
                <div className="text-sm text-muted-foreground">Average response time for cache hits vs 1.2s for API calls</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">$0</div>
                <div className="text-sm text-muted-foreground">Monthly AI costs through free-tier provider routing</div>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Implementation Status
            </h2>
            
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Multi-Provider Routing</span>
                  <span className="text-sm text-primary font-semibold">✓ Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Basic Caching Layer</span>
                  <span className="text-sm text-primary font-semibold">✓ Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Failover & Retry Logic</span>
                  <span className="text-sm text-primary font-semibold">✓ Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Telemetry Collection</span>
                  <span className="text-sm text-primary font-semibold">✓ Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Semantic Caching</span>
                  <span className="text-sm text-muted-foreground font-semibold">Beta</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-card border border-border rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold mb-4 text-foreground">Experience Intelligent AI Orchestration</h3>
            <p className="text-muted-foreground mb-6">
              See how Nexus delivers optimal AI performance and cost efficiency through intelligent gateway management.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Get Started →
            </Link>
          </section>

          {/* Related Articles */}
          <section className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link 
                to="/blog/how-cmpsbl-works-substrate-ecosystem" 
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2 text-foreground">How the CMPSBL Substrate Works</h3>
                <p className="text-sm text-muted-foreground">
                  Discover how NEXUS fits into the complete substrate architecture.
                </p>
              </Link>

              <Link 
                to="/blog/cascade-ai-adaptive-intelligence-brain" 
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2 text-foreground">Adaptive Intelligence Deep Dive</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how the cognitive engine determines optimal routing decisions for NEXUS.
                </p>
              </Link>
            </div>
          </section>

        </div>
      </article>

      <EnhancedFooter />
    </div>
  );
};

export default PromptFluidNexus;