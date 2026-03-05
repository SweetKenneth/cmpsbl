import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Link } from "react-router-dom";
import { Code, Zap, Brain, Rocket, ArrowLeft } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import heroImage from "@/assets/blog/studio-app-builder.jpg";

const PromptFluidStudioGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="STUDIO: Build Apps That Think"
        description="AI-assisted development generating production-ready code with cognitive pipelines, design intelligence, and real-time deployment."
        type="article"
        publishedTime="2025-10-10"
        keywords={['STUDIO system', 'AI app development', 'cognitive code generation', 'composable AI', 'agentic development']}
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
            STUDIO: Build Apps That Think
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Discover how STUDIO leverages the CMPSBL cognitive engine to transform ideas into deployable applications with autonomous architecture decisions and continuous learning.
          </p>

          <AuthorBio publishDate="2025-08-10" readTime="14 min read" />
        </div>
      </section>

      {/* Hero Image */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Autonomous AI building applications with code flowing from ideas to deployed React apps"
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
                CMPSBL Studio isn't just another code generator—it's an autonomous application builder that understands intent, makes architectural decisions, handles deployment complexity, and learns from every project.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <Brain className="h-8 w-8 text-primary" />
              How Studio Works
            </h2>
            
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-primary">1.</span>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Intent Understanding</h3>
                    <p className="text-muted-foreground">
                      Cascade analyzes your natural language description, identifying core requirements, implied features, and architectural patterns from its accumulated knowledge base.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-primary">2.</span>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Architecture Planning</h3>
                    <p className="text-muted-foreground">
                      Studio determines optimal component structure, state management approach, API integrations, and deployment strategy based on project complexity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-primary">3.</span>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Autonomous Generation</h3>
                    <p className="text-muted-foreground">
                      Complete React application built with TypeScript, Tailwind CSS, proper component hierarchy, and deployment-ready structure—all generated automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-primary">4.</span>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Deployment and Learning</h3>
                    <p className="text-muted-foreground">
                      Studio deploys to production, monitors outcome metrics, and feeds learnings back to Cascade—making future builds faster and better architected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quote Break */}
          <section className="my-16 py-12 border-y border-border">
            <blockquote className="text-2xl md:text-3xl font-light text-center text-foreground">
              "From idea to deployment in hours, not weeks."
            </blockquote>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Key Capabilities
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <Code className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-foreground">Full-Stack Generation</h3>
                <p className="text-muted-foreground">
                  Frontend components, API routes, database schemas, authentication flows—all generated as cohesive, production-ready applications.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <Brain className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-foreground">Intelligent Integration</h3>
                <p className="text-muted-foreground">
                  Automatically integrates Defense for security, Access for authentication, and routes tasks through appropriate AI providers via Nexus.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <Zap className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-foreground">Continuous Improvement</h3>
                <p className="text-muted-foreground">
                  Cascade observes which patterns work best, learning from successful projects to generate better code structures over time.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <Rocket className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-foreground">Instant Deployment</h3>
                <p className="text-muted-foreground">
                  One-click deployment to production environments with proper configuration and scaling setup—no DevOps expertise required.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Real-World Applications
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Studio is designed for building e-commerce platforms, SaaS applications, content management systems, dashboards, marketing sites, and internal tools.
              </p>
              
              <p>
                Each project category benefits from Cascade's learned patterns, ensuring new builds leverage optimized architectural decisions and best practices.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-card border border-border rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold mb-4 text-foreground">Build Your First App with Studio</h3>
            <p className="text-muted-foreground mb-6">
              Transform your ideas into deployable applications in hours, not weeks—powered by Cascade AI.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Try Studio Free →
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
                  Understand the complete ecosystem that powers Studio's autonomous capabilities.
                </p>
              </Link>

              <Link 
                to="/blog/cascade-ai-adaptive-intelligence-brain" 
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2 text-foreground">Cascade AI Deep Dive</h3>
                <p className="text-sm text-muted-foreground">
                  Explore the learning mechanisms that make Studio increasingly capable over time.
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

export default PromptFluidStudioGuide;