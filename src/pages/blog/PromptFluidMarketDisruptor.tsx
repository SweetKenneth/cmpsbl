import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Shield, TrendingUp } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import heroImage from "@/assets/blog/promptfluid-market-disruptor.jpg";

const PromptFluidMarketDisruptor = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="CMPSBL: A Different Approach to AI Infrastructure"
        description="How CMPSBL's cognitive substrate disrupts AI platforms with adaptive intelligence, security-first architecture, and autonomous self-improvement."
        canonical="https://cmpsbl.com/blog/promptfluid-market-disruptor"
        keywords={['AI infrastructure disruption', 'cognitive substrate', 'adaptive AI platform', 'CMPSBL market position']}
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
            A Different Approach to AI Platforms
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Adaptive intelligence, security-first architecture, and autonomous learning—designed into the foundation.
          </p>

          <AuthorBio publishDate="2025-10-24" readTime="14 min read" />
        </div>
      </section>

      {/* Hero Image */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src={heroImage} 
          alt="CMPSBL platform vision"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </section>

      {/* Content */}
      <article className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          
          <section className="mb-16">
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p className="text-xl">
                Not just another API wrapper or specialized tool. A comprehensive platform that rethinks how organizations should leverage artificial intelligence.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              The Problem with Today's Platforms
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Organizations face fragmented landscapes where no single solution addresses full requirements. Complex integrations and vendor dependencies limit agility and increase costs.
              </p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-destructive pl-6">
                  <h3 className="font-bold text-foreground mb-2">Paid API Lock-In</h3>
                  <p className="text-sm">Monthly costs spiral. Outages halt operations. Model limitations become your limitations.</p>
                </div>
                <div className="border-l-4 border-destructive pl-6">
                  <h3 className="font-bold text-foreground mb-2">Security as Afterthought</h3>
                  <p className="text-sm">Capability first, protection later. Fundamental vulnerabilities that can't be patched easily.</p>
                </div>
                <div className="border-l-4 border-destructive pl-6">
                  <h3 className="font-bold text-foreground mb-2">Learning Outside the System</h3>
                  <p className="text-sm">Valuable interaction data evaporates. Same mistakes repeated. Knowledge trapped in individual heads.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quote Break */}
          <section className="my-16 py-12 border-y border-border">
            <blockquote className="text-2xl md:text-3xl font-light text-center text-foreground">
              "Three innovations that work synergistically to create capabilities impossible in traditional platforms."
            </blockquote>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              Our Approach
            </h2>
            
            <div className="space-y-8">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Zap className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Multi-Model Orchestration</h3>
                    <p className="text-muted-foreground">
                      No single AI model is optimal for all tasks. We route each request to the best-suited provider based on real-time performance, cost, and availability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Security-First Architecture</h3>
                    <p className="text-muted-foreground">
                      AI threat detection integrated directly into the platform. Protection against bot attacks, adversarial inputs, and exploitation attempts before they reach applications.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <TrendingUp className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Autonomous Learning</h3>
                    <p className="text-muted-foreground">
                      Continuous learning from every interaction. Improving recommendations, optimizing routing, accumulating organizational knowledge automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Breaking Provider Lock-In
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Rather than forcing expensive API costs, we route tasks across free-tier providers:
              </p>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <ul className="space-y-2">
                  <li><strong className="text-primary">Groq:</strong> Primary inference with Llama 3.3-70B</li>
                  <li><strong className="text-primary">Cerebras:</strong> High-performance fallback</li>
                  <li><strong className="text-primary">Together AI:</strong> Llama 3.1-70B for complex reasoning</li>
                  <li><strong className="text-primary">DeepSeek:</strong> Extended coverage</li>
                  <li><strong className="text-primary">Hyperbolic:</strong> Final fallback</li>
                </ul>
              </div>
              
              <p>
                Excellent results at zero cost. Organizations eliminate AI operational costs entirely while ensuring continuous operation through automatic failover.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Why Competitors Can't Replicate This
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Paid providers want your money.</strong> OpenAI, Anthropic, and Google have no incentive to enable free-tier alternatives. Their business models depend on per-token pricing.
              </p>
              
              <p>
                <strong className="text-foreground">Security isn't their core competency.</strong> AI research companies excel at building models, not defending against sophisticated threats. True security requires building it into the foundation.
              </p>
              
              <p>
                <strong className="text-foreground">Learning conflicts with their business model.</strong> For external providers, your data represents training material for their models—benefiting them and their other customers.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-card border border-border rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold mb-4 text-foreground">Explore the Platform</h3>
            <p className="text-muted-foreground mb-6">
              See how CMPSBL's architecture delivers on these principles.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              View Systems →
            </Link>
          </section>

        </div>
      </article>

      <EnhancedFooter />
    </div>
  );
};

export default PromptFluidMarketDisruptor;
