import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle, Clock } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import heroImage from "@/assets/blog/product-roadmap-2025.jpg";

const ProductRoadmap2025 = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="PromptFluid Product Roadmap 2025-2026"
        description="Upcoming features, release timelines, and innovations in adaptive AI, security, accessibility, and automation."
        canonical="https://www.promptfluid.com/blog/product-roadmap-2025"
        keywords={["AI product roadmap", "PromptFluid features", "AI platform development", "AI innovation timeline"]}
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
            Product Roadmap 2025-2026
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            A transparent look at what we're building and when.
          </p>

          <AuthorBio publishDate="2025-11-01" readTime="18 min read" />
        </div>
      </section>

      {/* Hero Image */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Product roadmap timeline"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </section>

      {/* Content */}
      <article className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          
          <section className="mb-16">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h3 className="font-bold text-foreground mb-2">Roadmap Philosophy</h3>
              <p className="text-muted-foreground">
                Features prioritized by customer impact, technical feasibility, and strategic positioning. Timelines are estimates that may shift. We believe in transparency.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              Q1 2025: Foundation
            </h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-primary bg-card rounded-r-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">RCKBL WordPress Plugin</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>Private Beta (February 2025)</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Behavioral bot detection, real-time threat intelligence, adaptive challenge systems.
                </p>
              </div>

              <div className="border-l-4 border-primary bg-card rounded-r-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">Multi-Model Orchestration Core</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>Internal Testing (March 2025)</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Dynamic provider selection across Groq, Cerebras, Together AI, DeepSeek, Hyperbolic—all free-tier.
                </p>
              </div>

              <div className="border-l-4 border-primary bg-card rounded-r-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">Brain Learning Core</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>Active Development (March 2025)</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Autonomous learning from every AI interaction. Pattern recognition, prompt optimization.
                </p>
              </div>
            </div>
          </section>

          {/* Quote Break */}
          <section className="my-16 py-12 border-y border-border">
            <blockquote className="text-2xl md:text-3xl font-light text-center text-foreground">
              "We prioritize by impact, not hype."
            </blockquote>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              Q2 2025: Expansion
            </h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-amber-500 bg-card rounded-r-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-foreground">Studio MVP</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>April-May 2025</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Natural language to React component generation. One-click deployment.
                </p>
              </div>

              <div className="border-l-4 border-amber-500 bg-card rounded-r-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-foreground">Universal Defense SDK</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>May 2025</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Defense capabilities beyond WordPress. React, Vue, Next.js, Express middleware.
                </p>
              </div>

              <div className="border-l-4 border-green-500 bg-card rounded-r-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-bold text-foreground">PTCHBL - Free Accessibility</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>LIVE</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  AI-driven WCAG 2.2 scanning and fixes—completely free. 86+ automated checks.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              Q3-Q4 2025: Marketing & Enterprise
            </h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-muted bg-card rounded-r-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-bold text-foreground">Marketing Studio</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>July-August 2025</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Multi-channel campaign generation, SEO content, audience analysis.
                </p>
              </div>

              <div className="border-l-4 border-muted bg-card rounded-r-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-bold text-foreground">Creative Pipeline</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>September 2025</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Image and video generation across Stability.ai, Replicate, RunwayML.
                </p>
              </div>

              <div className="border-l-4 border-muted bg-card rounded-r-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-bold text-foreground">Vision Dashboard</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  <span>October 2025</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Centralized command center. Usage analytics, team collaboration, audit logging.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              2026: Autonomous Operations
            </h2>
            
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Advanced autonomous agents, vertical market solutions, enterprise self-serve deployment, and Cascade enhancements including simulated dream cycles for strategic planning.
              </p>
              
              <p>
                We update this roadmap quarterly as priorities evolve and customer feedback shapes direction.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-card border border-border rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold mb-4 text-foreground">Get Early Access</h3>
            <p className="text-muted-foreground mb-6">
              Join our beta program for upcoming features.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Request Access →
            </Link>
          </section>

        </div>
      </article>

      <EnhancedFooter />
    </div>
  );
};

export default ProductRoadmap2025;
