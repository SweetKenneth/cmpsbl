import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar, Share2, Bookmark, FileText, Network, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import llmsTxtImg from "@/assets/blog/llms-txt-protocol-standard.jpg";

export default function LLMsTxtProtocolAIContext() {
  const publishDate = "2026-01-30";
  const readTime = "14 min";

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="LLMs.txt: The Protocol for Machine-Readable AI Context Sharing | CMPSBL"
        description="How CMPSBL uses LLMs.txt to provide structured context to AI systems, and why we believe this should become a standard protocol for AI-human interaction across the web."
        canonical="https://promptfluid.com/blog/llms-txt-protocol-ai-context"
        keywords={[
          'LLMs.txt', 'AI context protocol', 'machine-readable context', 'AI interaction standard',
          'large language models', 'AI governance', 'context sharing protocol', 'AI communication',
          'structured AI data', 'LLM context files'
        ]}
        type="article"
        image={llmsTxtImg}
        publishedTime={publishDate}
        modifiedTime={publishDate}
        author="CMPSBL Research"
      />
      
      <PublicNav />

      {/* Hero */}
      <article className="relative">
        <div className="relative h-[50vh] overflow-hidden">
          <img 
            src={llmsTxtImg} 
            alt="Visualization of LLMs.txt protocol showing structured data flowing to AI agents"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-12">
              <div className="max-w-4xl">
                <Link 
                  to="/blog" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </Link>
                
                <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Cluster: Protocol Standards
                </Badge>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  LLMs.txt: The Protocol for Machine-Readable AI Context Sharing
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={publishDate}>{new Date(publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{readTime} read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                When we first started building CMPSBL, we faced a fundamental problem: how do you help an AI system understand the context it's operating in? Not just the immediate request, but the broader environment—the capabilities available, the constraints in place, the conventions being followed. The solution we developed internally has proven so useful that we're now advocating for its broader adoption: LLMs.txt.
              </p>

              <h2 className="text-2xl font-bold text-foreground mt-12 mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                The Problem: Context Without Structure
              </h2>
              
              <p>
                Large language models are remarkably capable at understanding natural language. But they struggle with the same problem humans struggle with: extracting relevant information from unstructured sources. When an AI agent needs to understand how to interact with a system, it faces a maze of documentation pages, API references, README files, and scattered comments—none of which are optimized for machine consumption.
              </p>
              
              <p>
                This creates inefficiency at scale. Every AI interaction wastes tokens on discovery. Every agent has to re-learn the same context. And because there's no standard format, different systems require different approaches to context gathering.
              </p>
              
              <p>
                We needed something analogous to robots.txt—a simple, standardized file that tells AI systems what they need to know about a project or service, in a format optimized for their consumption.
              </p>

              <h2 className="text-2xl font-bold text-foreground mt-12 mb-6 flex items-center gap-3">
                <Network className="w-6 h-6 text-primary" />
                Our Solution: The LLMs.txt Standard
              </h2>
              
              <p>
                LLMs.txt is a plaintext file placed at the root of a project or domain that provides structured context specifically for AI consumption. It's designed to be:
              </p>
              
              <ul className="space-y-4 my-6">
                <li><strong>Human-readable:</strong> Anyone can open and understand the file without special tools.</li>
                <li><strong>Machine-parseable:</strong> Consistent formatting allows AI systems to extract information reliably.</li>
                <li><strong>Lightweight:</strong> Token-efficient, avoiding the bloat of full documentation.</li>
                <li><strong>Extensible:</strong> Projects can add custom sections while maintaining core compatibility.</li>
              </ul>
              
              <p>
                A typical LLMs.txt file includes sections for: system identity, available capabilities, interaction conventions, constraints and boundaries, and pointers to deeper documentation when needed.
              </p>
              
              <div className="bg-card border border-border rounded-lg p-6 my-8">
                <h4 className="text-lg font-semibold text-foreground mb-4">Example LLMs.txt Structure</h4>
                <pre className="text-sm text-muted-foreground overflow-x-auto">
{`# System Identity
name: CMPSBL Substrate
version: v6.x.x
purpose: Evolving cognitive infrastructure

# Capabilities  
- Autonomous reflection cycles
- Multi-provider AI routing
- Governed self-modification

# Conventions
- Use formal language in outputs
- Respect confidence thresholds
- Log all significant decisions

# Constraints
- Never exceed cost governors
- Require approval for schema changes
- Preserve audit trail integrity`}
                </pre>
              </div>

              <h2 className="text-2xl font-bold text-foreground mt-12 mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-primary" />
                Why We Recommend Adoption
              </h2>
              
              <p>
                After using LLMs.txt internally for over a year, we've observed consistent benefits that we believe would extend to any project working with AI systems:
              </p>
              
              <p>
                <strong>Reduced Token Waste:</strong> AI agents can immediately understand context without crawling documentation. For high-volume systems, this translates to meaningful cost savings.
              </p>
              
              <p>
                <strong>Consistent Behavior:</strong> When context is explicitly defined, AI interactions become more predictable. The system knows what's expected of it from the first interaction.
              </p>
              
              <p>
                <strong>Simplified Onboarding:</strong> New team members (human or AI) can quickly understand system conventions by reading a single file.
              </p>
              
              <p>
                <strong>Governance Transparency:</strong> Constraints and boundaries are explicitly documented, making it clear what the AI should and shouldn't do.
              </p>
              
              <p>
                <strong>Future-Proofing:</strong> As AI agents become more prevalent in development workflows, having standardized context sharing will become increasingly valuable.
              </p>

              <h2 className="text-2xl font-bold text-foreground mt-12 mb-6">Implementation Guidance</h2>
              
              <p>
                If you're interested in adopting LLMs.txt for your project, here's our recommended approach:
              </p>
              
              <ol className="space-y-4 my-6 list-decimal list-inside">
                <li><strong>Start minimal:</strong> Include only the most essential context. You can expand later.</li>
                <li><strong>Focus on constraints:</strong> AI systems benefit most from knowing what they shouldn't do.</li>
                <li><strong>Keep it current:</strong> An outdated LLMs.txt is worse than none at all.</li>
                <li><strong>Test with real AI:</strong> Verify that AI agents can actually use the information provided.</li>
              </ol>
              
              <p>
                We've published our internal LLMs.txt specification and example files in our documentation. We encourage other projects to adopt compatible formats, contributing to an emerging standard for AI context sharing.
              </p>
              
              <p className="text-lg text-muted-foreground mt-8 p-6 border-l-4 border-blue-500 bg-blue-500/5">
                The web has robots.txt to guide search crawlers. The AI era needs LLMs.txt to guide language models. We're building that standard, and we invite others to join us.
              </p>
            </div>

            {/* Related Posts */}
            <div className="mt-16 pt-8 border-t border-border">
              <h3 className="text-xl font-bold text-foreground mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Link to="/blog/evolving-software-v6-breakthrough" className="group">
                  <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors">
                    <Badge variant="outline" className="mb-3">Pillar</Badge>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Evolving Software v6.x.x: The Breakthrough
                    </h4>
                  </div>
                </Link>
                <Link to="/blog/ai-governance-namespace-unified-terminology" className="group">
                  <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors">
                    <Badge variant="outline" className="mb-3">Governance</Badge>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      AI Governance Namespace: Unified Terminology
                    </h4>
                  </div>
                </Link>
              </div>
            </div>

            {/* Share */}
            <div className="mt-12 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Bookmark className="w-5 h-5" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <EnhancedFooter />
    </div>
  );
}
