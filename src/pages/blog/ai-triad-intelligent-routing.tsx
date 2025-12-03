import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Network, Zap, Brain, Sparkles, Search } from "lucide-react";
import { AuthorBio } from "@/components/AuthorBio";
import heroImage from "@/assets/blog/ai-triad-routing.jpg";

const AITriadExplained = () => {
  return (
    <>
      <Helmet>
        <title>The AI Triad: Understanding PromptFluid's Intelligent Routing System</title>
        <meta 
          name="description" 
          content="Learn how PromptFluid's Cascade AI intelligently routes tasks across Groq, OpenAI, Anthropic, and Perplexity for optimal results and cost efficiency." 
        />
        <meta name="keywords" content="AI Triad, intelligent routing, Groq, OpenAI, Anthropic, Perplexity, AI orchestration, Cascade AI" />
        <link rel="canonical" href="https://www.promptfluid.com/blog/ai-triad-intelligent-routing" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": "The AI Triad: Understanding PromptFluid's Intelligent Routing System",
            "description": "Learn how PromptFluid's Cascade AI intelligently routes tasks across Groq, OpenAI, Anthropic, and Perplexity for optimal results and cost efficiency.",
            "author": {
              "@type": "Person",
              "name": "Kenneth E Sweet Jr",
              "jobTitle": "Founder & Security Engineer"
            },
            "publisher": {
              "@type": "Organization",
              "name": "PromptFluid",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.promptfluid.com/logo.png"
              }
            },
            "datePublished": "2025-08-20",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://www.promptfluid.com/blog/ai-triad-intelligent-routing"
            }
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
        <article className="container mx-auto px-4 py-16 max-w-4xl">
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">AI Triad</span>
          </nav>

          <header className="mb-12">
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-8">
              <img 
                src={heroImage} 
                alt="Three interconnected AI nodes with intelligent data routing streams flowing between Groq, OpenAI, and Anthropic providers with glowing network connections"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              The AI Triad: Understanding Intelligent Routing
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Discover how Cascade AI orchestrates specialized AI providers—Groq, OpenAI, Anthropic, and Perplexity—to deliver optimal results while maximizing cost efficiency.
            </p>
            
            <AuthorBio publishDate="2025-08-20" readTime="11 min read" />
          </header>

          <section className="prose prose-lg max-w-none mb-16">
            <p className="text-lg leading-relaxed">
              Most AI platforms lock you into a single provider, forcing you to use premium models for everything regardless of task complexity. PromptFluid's <Link to="/blog/cascade-ai-adaptive-intelligence-brain" className="text-primary hover:underline">Cascade AI</Link> takes a fundamentally different approach: intelligent routing across specialized providers, ensuring each task goes to the most appropriate model based on requirements, performance, and cost.
            </p>

            <h2 className="text-3xl font-bold mb-6 mt-12">The Four Pillars of the Triad</h2>

            <div className="space-y-8 my-12">
              <div className="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary p-6 rounded-r-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold m-0">Groq: Lightning-Fast Reasoning</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  <strong>Specialty:</strong> Logical reasoning, structured problem-solving, rapid inference
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Groq's custom LPU (Language Processing Unit) architecture delivers inference speeds orders of magnitude faster than traditional GPU-based systems. Cascade routes to Groq when speed is critical—real-time classification, rapid decision trees, and logical analysis where milliseconds matter. Perfect for Studio's code analysis, Defense's threat detection, and any workflow requiring immediate intelligent responses.
                </p>
              </div>

              <div className="bg-gradient-to-r from-accent/10 to-transparent border-l-4 border-accent p-6 rounded-r-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-8 h-8 text-accent" />
                  <h3 className="text-2xl font-bold m-0">OpenAI: Creative Synthesis</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  <strong>Specialty:</strong> Creative generation, complex synthesis, nuanced understanding
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  When tasks require creativity, OpenAI takes the lead. Complex content generation, open-ended problem solving, and nuanced language understanding all leverage OpenAI's models. Cascade routes creative writing, architectural decisions in Studio, and any workflow requiring synthesis of diverse concepts to OpenAI. It's the creative heart of the Triad.
                </p>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary p-6 rounded-r-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold m-0">Anthropic: Ethical Structure</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  <strong>Specialty:</strong> Ethical reasoning, structured thinking, safety-conscious outputs
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Anthropic's Claude brings constitutional AI principles to PromptFluid, ensuring outputs align with ethical guidelines while maintaining strong structure. Cascade routes to Anthropic for policy enforcement in Access, threat assessment nuance in Defense, and any task requiring careful consideration of implications and adherence to safety principles.
                </p>
              </div>

              <div className="bg-gradient-to-r from-accent/10 to-transparent border-l-4 border-accent p-6 rounded-r-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-8 h-8 text-accent" />
                  <h3 className="text-2xl font-bold m-0">Perplexity: Grounded Research</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  <strong>Specialty:</strong> Real-time research, cited information, factual grounding
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  When accuracy matters and current information is essential, Perplexity provides the research layer. Rather than generating potentially incorrect information, Perplexity searches real sources and provides citations. Cascade uses Perplexity for technical documentation research in Studio, expanding Brain's knowledge base with verified information, and any workflow requiring factual accuracy with provenance.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4">How Cascade Decides</h2>
            <p className="text-lg leading-relaxed mb-6">
              Routing decisions happen in milliseconds through multi-factor analysis. Cascade evaluates task characteristics (creative vs. logical, time-sensitive vs. quality-focused), historical performance data (which provider handled similar tasks most effectively), current API availability and rate limits, and cost considerations balanced against quality requirements.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              This isn't static configuration—Cascade continuously learns which routing strategies produce the best outcomes. If Groq performs exceptionally well on a specific task category, future similar tasks route to Groq more frequently. If OpenAI delivers superior results despite higher costs for certain workflows, Cascade adjusts routing to prioritize quality where it matters most.
            </p>

            <h2 className="text-3xl font-bold mb-4">Cost Optimization Through Intelligence</h2>
            <p className="text-lg leading-relaxed">
              The Triad's most significant advantage is cost optimization without quality sacrifice. By routing simple tasks to faster, cheaper providers and reserving premium models for complex work, Cascade typically reduces AI spending by 40-60% compared to using top-tier models universally. Smart caching through Nexus prevents redundant API calls, and batching similar requests maximizes efficiency. You get enterprise-grade capabilities at startup-friendly costs—all managed transparently by Cascade.
            </p>
          </section>

          <section className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30 rounded-lg p-8 text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Experience Intelligent Routing</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              See how the AI Triad delivers optimal results while optimizing costs automatically through Cascade's intelligent orchestration.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Start Free Trial
              <span>→</span>
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 border-t border-border pt-8">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link 
                to="/blog/how-promptfluid-works-cascade-ai-ecosystem" 
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2">How PromptFluid Works</h3>
                <p className="text-sm text-muted-foreground">
                  Discover the complete ecosystem that leverages the AI Triad for seamless intelligence delivery.
                </p>
              </Link>

              <Link 
                to="/blog/cascade-ai-adaptive-intelligence-brain" 
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2">Cascade AI Deep Dive</h3>
                <p className="text-sm text-muted-foreground">
                  Explore the learning mechanisms that enable intelligent routing decisions.
                </p>
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
};

export default AITriadExplained;