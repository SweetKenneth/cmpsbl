import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar, Share2, Bookmark, Globe, Scale, Link2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import governanceImg from "@/assets/blog/ai-governance-namespace-unified.jpg";

// Correct 12 namespace domains
const NAMESPACE_DOMAINS = [
  { name: "Governance", domain: "AIGVRN.com", subdomain: "governance.aigvrn.com", description: "Root governance namespace" },
  { name: "Standards", domain: "AISTNDRD.com", subdomain: "standards.aigvrn.com", description: "Technical specifications and benchmarks" },
  { name: "Certification", domain: "AICRTFY.com", subdomain: "certification.aigvrn.com", description: "Formal attestation processes" },
  { name: "Verification", domain: "AIVRFY.com", subdomain: "verification.aigvrn.com", description: "Confirming system properties" },
  { name: "Policy", domain: "AIPLCY.com", subdomain: "policy.aigvrn.com", description: "Organizational guidelines" },
  { name: "Compliance", domain: "AICMPLY.com", subdomain: "compliance.aigvrn.com", description: "Regulatory adherence" },
  { name: "Security", domain: "AISCRTY.com", subdomain: "security.aigvrn.com", description: "Threat protection" },
  { name: "Safety", domain: "AISFTY.com", subdomain: "safety.aigvrn.com", description: "Harm prevention" },
  { name: "Regulation", domain: "AIRGLTN.com", subdomain: "regulation.aigvrn.com", description: "Legal frameworks" },
  { name: "Sovereignty", domain: "AISVRGN.com", subdomain: "sovereignty.aigvrn.com", description: "Jurisdictional authority" },
  { name: "Privacy", domain: "AIPRVCY.com", subdomain: "privacy.aigvrn.com", description: "Data protection" },
  { name: "Control", domain: "AICNTRL.com", subdomain: "control.aigvrn.com", description: "Human oversight" },
];

export default function AIGovernanceNamespaceUnifiedTerminology() {
  const publishDate = "2026-01-30";
  const readTime = "12 min";

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="AI Governance Namespace: Unified Terminology for Cognitive Systems | CMPSBL"
        description="How CMPSBL established a unified AI governance vocabulary through strategic domain registration—the first comprehensive AI governance domain portfolio and namespace solution."
        canonical="https://cmpsbl.com/blog/ai-governance-namespace-unified-terminology"
        keywords={[
          'AI governance', 'AIGVRN', 'AI governance namespace', 'AI terminology',
          'unified vocabulary', 'AI standards', 'governance framework', 'cognitive systems',
          'AI domain registration', 'terminology standardization', 'AI governance lexicon'
        ]}
        type="article"
        image={governanceImg}
        publishedTime={publishDate}
        modifiedTime={publishDate}
        author="CMPSBL Research Team"
      />
      
      <PublicNav />

      {/* Hero */}
      <article className="relative">
        <div className="relative h-[50vh] overflow-hidden">
          <img 
            src={governanceImg} 
            alt="Network visualization of unified AI governance terminology and namespace architecture"
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
                
                <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                  Cluster: Governance
                </Badge>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  AI Governance Namespace: Unified Terminology for Cognitive Systems
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
            
            <div className="prose prose-lg prose-invert max-w-none space-y-6">
              <p className="text-xl text-muted-foreground leading-relaxed !mb-10">
                Language shapes thought. In the emerging field of autonomous AI systems, inconsistent terminology 
                creates real problems: miscommunication between teams, confusion in documentation, and ambiguity 
                in governance policies. At CMPSBL, we've addressed this by establishing a unified governance 
                vocabulary—the <strong>AI Governance Reference Namespace (AIGVRN)</strong>—backed by strategic 
                domain registrations to anchor these concepts in a persistent namespace.
              </p>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 !my-10">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">FIRST OF ITS KIND</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  CMPSBL is the <strong className="text-foreground">first organization</strong> to register a 
                  comprehensive portfolio of AI governance domains and the <strong className="text-foreground">first 
                  to propose a unified namespace solution</strong> for public use.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-foreground !mt-16 !mb-8 flex items-center gap-3">
                <Scale className="w-6 h-6 text-primary" />
                The Terminology Problem in AI Governance
              </h2>
              
              <p className="text-muted-foreground leading-relaxed">
                Consider how different teams might describe the same concept: one calls it "AI supervision," 
                another says "model oversight," a third uses "cognitive governance." Are these synonyms? 
                Slightly different concepts? It's often unclear. This ambiguity becomes dangerous when you're 
                writing policies that govern autonomous behavior.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                We encountered this problem internally as we developed the CMPSBL World Engine. Different modules 
                used different terms for the same governance concepts. Documentation became inconsistent. The 
                solution wasn't just creating a glossary—it was establishing authoritative definitions tied to 
                persistent identifiers through a structured namespace.
              </p>

              <h2 className="text-2xl font-bold text-foreground !mt-16 !mb-8 flex items-center gap-3">
                <Link2 className="w-6 h-6 text-primary" />
                The 12-Surface Namespace Architecture
              </h2>
              
              <p className="text-muted-foreground leading-relaxed">
                The AI Governance Reference Namespace comprises twelve semantically distinct surfaces, each 
                addressing a foundational area in AI governance. Each surface is backed by a dedicated registered 
                domain:
              </p>
              
              <div className="bg-card border border-border rounded-lg p-6 !my-10">
                <h4 className="text-lg font-semibold text-foreground mb-4">Registered Namespace Domains</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {NAMESPACE_DOMAINS.map((item) => (
                    <a 
                      key={item.domain}
                      href={`https://${item.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors group"
                    >
                      <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-sm text-foreground group-hover:text-primary transition-colors">
                          {item.domain}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">— {item.name}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                These domains serve as permanent reference points. The root domain{" "}
                <a href="https://aigvrn.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  AIGVRN.com
                </a>{" "}
                serves as the canonical entry point, with each surface accessible via subdomains 
                (e.g., <code className="text-xs bg-muted px-1.5 py-0.5 rounded">governance.aigvrn.com</code>,{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">standards.aigvrn.com</code>).
              </p>

              <h2 className="text-2xl font-bold text-foreground !mt-16 !mb-8 flex items-center gap-3">
                <Globe className="w-6 h-6 text-primary" />
                What Each Surface Covers
              </h2>
              
              <p className="text-muted-foreground leading-relaxed">
                Each surface provides three interpretive lenses:
              </p>
              
              <ul className="text-muted-foreground space-y-3 !my-6">
                <li><strong className="text-foreground">Policy language</strong> for institutional stakeholders</li>
                <li><strong className="text-foreground">Technical interpretation</strong> for developers and engineers</li>
                <li><strong className="text-foreground">Regulatory context</strong> referencing frameworks such as the EU AI Act, NIST AI RMF, and OECD AI Principles</li>
              </ul>
              
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Governance (AIGVRN.com):</strong> Institutional frameworks for 
                oversight and decision-making authority in AI systems.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Standards (AISTNDRD.com):</strong> Technical specifications and 
                procedural benchmarks for AI system development.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Verification (AIVRFY.com):</strong> Methods for confirming AI 
                system properties and behavioral claims.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Safety (AISFTY.com):</strong> Prevention of harm arising from 
                AI system operation and failure modes.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Control (AICNTRL.com):</strong> Mechanisms for human oversight 
                and intervention in AI operations.
              </p>

              <h2 className="text-2xl font-bold text-foreground !mt-16 !mb-8">Integration with the CMPSBL World Engine</h2>
              
              <p className="text-muted-foreground leading-relaxed">
                CMPSBL FNDTN v6 references this namespace as its governance semantics layer. The INCLUSIVE system 
                implements accessibility and alignment hooks that reference namespace surfaces for policy routing 
                and compliance checks. This creates a consistent vocabulary across the entire substrate architecture.
              </p>

              <h2 className="text-2xl font-bold text-foreground !mt-16 !mb-8">Our Hope for Broader Adoption</h2>
              
              <p className="text-muted-foreground leading-relaxed">
                We've established this namespace primarily to solve our own problems—but we believe the broader 
                AI community would benefit from terminological consistency. As more organizations build autonomous 
                systems, the lack of shared vocabulary will create increasing friction.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                We're not claiming ownership of these concepts. We're offering a starting point: a well-defined 
                vocabulary, backed by persistent identifiers, that others can adopt, adapt, or use as reference.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                The namespace is designed for citation in academic research, integration into technical 
                documentation, and reference in policy development processes. The goal isn't uniformity for its 
                own sake—it's clarity.
              </p>
              
              <div className="bg-card border border-border rounded-lg p-6 !my-10">
                <h4 className="text-lg font-semibold text-foreground mb-3">Archival Record</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  The AI Governance Lexicon is archived on Zenodo for permanent reference:
                </p>
                <a 
                  href="https://zenodo.org/records/18209222" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <span>DOI: 10.5281/zenodo.18209222</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              <p className="text-lg text-muted-foreground !mt-12 p-6 border-l-4 border-amber-500 bg-amber-500/5 rounded-r-lg">
                Language is infrastructure. As AI governance becomes increasingly critical, the terminology we 
                use to describe it matters. We've built our namespace—and we hope others will find it useful.
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
                <Link to="/blog/llms-txt-protocol-ai-context" className="group">
                  <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors">
                    <Badge variant="outline" className="mb-3">Protocol</Badge>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      LLMs.txt: The Protocol for AI Context Sharing
                    </h4>
                  </div>
                </Link>
              </div>
            </div>

            {/* Namespace Link */}
            <div className="mt-8 p-6 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <p className="text-muted-foreground mb-4">
                Explore the full AI Governance Reference Namespace
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  to="/namespace" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View Namespace Page
                </Link>
                <a 
                  href="https://aigvrn.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  Visit AIGVRN.com
                  <ExternalLink className="w-4 h-4" />
                </a>
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
