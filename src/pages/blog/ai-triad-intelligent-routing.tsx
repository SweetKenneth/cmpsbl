import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Link } from "react-router-dom";
import { Network, Zap, Brain, Sparkles, Search, ArrowLeft } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import heroImage from "@/assets/blog/ai-triad-routing.jpg";

const AITriadExplained = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Free-Tier AI Routing: Triad Architecture"
        description="Multi-provider AI gateway optimized for cost and performance — intelligent routing across free-tier models with minimal API spend."
        type="article"
        publishedTime="2025-10-05"
        keywords={['AI triad routing', 'free-tier AI gateway', 'multi-provider routing', 'AI cost optimization', 'AI model routing']}
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
            Free-Tier Provider Network
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            How Cascade AI orchestrates free-tier providers—Groq, Together AI, Hyperbolic, DeepSeek, Cerebras, and Google AI Studio—for optimal results at zero cost.
          </p>

          <AuthorBio publishDate="2025-08-20" readTime="11 min read" />
        </div>
      </section>

      {/* Hero Image */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src={heroImage} 
          alt="AI nodes with intelligent data routing streams"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </section>

      {/* Content */}
      <article className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          
          <section className="mb-16">
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Most AI platforms lock you into a single provider, forcing premium models for everything regardless of task complexity.
              </p>
              
              <p>
                Cascade AI takes a different approach: intelligent routing across specialized providers. Each task goes to the most appropriate model based on requirements, performance, and cost.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              The Six Pillars of Free-Tier Routing
            </h2>
            
            <div className="space-y-8">
              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-foreground">
                  <Zap className="h-5 w-5 text-primary" />
                  Groq — Lightning-Fast Reasoning
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Custom LPU architecture delivers inference speeds orders of magnitude faster than GPU-based systems. Cascade routes here when speed is critical.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-foreground">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Together AI — Complex Reasoning
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Deep reasoning, creative synthesis, nuanced understanding. Cascade routes architectural decisions and complex problem solving here.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-foreground">
                  <Brain className="h-5 w-5 text-primary" />
                  Hyperbolic — Creative Tasks
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Content generation, brainstorming, exploratory thinking. Tasks requiring imagination and novelty route here.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-foreground">
                  <Network className="h-5 w-5 text-primary" />
                  DeepSeek — Technical Analysis
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Code analysis, technical documentation, structured outputs. Specialized models for engineering workflows.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-foreground">
                  <Zap className="h-5 w-5 text-primary" />
                  Cerebras — High-Throughput Operations
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Batch processing, bulk analysis, parallel task execution. Maximum efficiency at volume.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-foreground">
                  <Search className="h-5 w-5 text-primary" />
                  Google AI Studio — Multimodal Intelligence
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gemini models for vision tasks, complex document analysis, and reasoning across multiple input types.
                </p>
              </div>
            </div>
          </section>

          {/* Quote Break */}
          <section className="my-16 py-12 border-y border-border">
            <blockquote className="text-2xl md:text-3xl font-light text-center text-foreground">
              "You interact with one system. Cascade handles the complexity."
            </blockquote>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              How Cascade Decides
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Routing decisions happen in milliseconds through multi-factor analysis: task characteristics, historical performance data, current API availability, and cost considerations balanced against quality requirements.
              </p>
              
              <p>
                This isn't static configuration. Cascade continuously learns which routing strategies produce the best outcomes. If Groq performs exceptionally well on a specific task category, future similar tasks route there more frequently.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Zero-Cost Through Intelligence
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                By intelligently routing tasks to free-tier providers based on their strengths, Cascade eliminates AI spending entirely while maintaining quality.
              </p>
              
              <p>
                Smart caching prevents redundant API calls. Batching similar requests maximizes efficiency. Enterprise-grade capabilities at zero cost—all managed transparently.
              </p>
            </div>
          </section>

          {/* Related */}
          <section className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-xl font-bold mb-6 text-foreground">Related Research</h3>
            <div className="grid gap-4">
              <Link 
                to="/blog/how-promptfluid-works-cascade-ai-ecosystem" 
                className="block p-4 border border-border rounded-lg hover:border-primary/40 transition-colors"
              >
                <h4 className="font-semibold text-foreground mb-1">How PromptFluid Works</h4>
                <p className="text-sm text-muted-foreground">The complete ecosystem leveraging the free-tier network.</p>
              </Link>

              <Link 
                to="/blog/cascade-ai-adaptive-intelligence-brain" 
                className="block p-4 border border-border rounded-lg hover:border-primary/40 transition-colors"
              >
                <h4 className="font-semibold text-foreground mb-1">Cascade AI Deep Dive</h4>
                <p className="text-sm text-muted-foreground">The learning mechanisms enabling intelligent routing.</p>
              </Link>
            </div>
          </section>

        </div>
      </article>

      <EnhancedFooter />
    </div>
  );
};

export default AITriadExplained;
