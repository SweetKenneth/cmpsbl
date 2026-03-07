import { ArrowLeft, CheckCircle, Smartphone, Eye, Brain as BrainIcon, ExternalLink } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import heroImage from "@/assets/blog/wcag-2-2-wordpress-changes.jpg";

export default function WCAG22WordPressChanges() {
  return (
    <>
      <SEO
        title="WCAG 2.2 Changes: What Developers Need to Know"
        description="What WCAG 2.2 updates mean for developers — new success criteria, deprecated patterns, and how the INCLUSIVE node handles them."
        type="article"
        publishedTime="2025-12-05"
        keywords={['WCAG 2.2 changes', 'accessibility criteria', 'developer accessibility', 'INCLUSIVE node']}
      />
      <div className="min-h-screen bg-background">
        <PublicNav />
        
        <article>
          <div className="relative w-full h-[70vh] min-h-[500px]">
            <img 
              src={heroImage} 
              alt="WCAG 2.2 standards documentation with compliance requirements and accessibility guidelines"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 pb-16 pt-32">
              <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/blog/wordpress-accessibility-guide" className="inline-flex items-center gap-2 text-primary/80 hover:text-primary transition-colors mb-6">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm tracking-wide">Back to Main Guide</span>
                </Link>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight text-foreground">
                  WCAG 2.2 Changes: What Developers Need to Know
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8">
                  A detailed breakdown of WCAG 2.2's nine new success criteria and how the INCLUSIVE node in the substrate addresses each one.
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>Written by the CMPSBL team</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span>8 min read</span>
                </div>
              </div>
            </div>
          </div>

          <div className="py-24 px-4">
            <div className="container mx-auto max-w-3xl">
              <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-muted-foreground">
                <p className="text-xl leading-relaxed text-foreground font-light mb-12">
                  WCAG 2.2, published October 2023, introduces nine new success criteria that address critical gaps in mobile accessibility, cognitive disability support, and low vision accommodations. Here's what each means and how the substrate's INCLUSIVE node handles them.
                </p>

                <div className="not-prose my-16 p-8 rounded-2xl bg-primary/5 border border-primary/10">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    WCAG 2.2 Quick Facts
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li><strong className="text-foreground">Release Date:</strong> October 5, 2023</li>
                    <li><strong className="text-foreground">New Criteria:</strong> 9 new success criteria</li>
                    <li><strong className="text-foreground">Primary Focus:</strong> Mobile, cognitive disabilities, low vision</li>
                    <li><strong className="text-foreground">Backward Compatible:</strong> All WCAG 2.1 compliance carries forward</li>
                    <li><strong className="text-foreground">INCLUSIVE Coverage:</strong> The substrate node auto-detects and remediates 7 of 9 new criteria</li>
                  </ul>
                </div>

                <h2 className="text-3xl mt-20 mb-8">The Nine New Success Criteria</h2>

                <h3 className="text-2xl mt-16 mb-6">1. Focus Not Obscured (Minimum) — Level AA (2.4.11)</h3>
                <div className="not-prose mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-blue-500">Mobile Focus</span>
                  </div>
                </div>
                <p>
                  Focused elements must not be entirely hidden by sticky headers, cookie banners, or overlays. The INCLUSIVE node scans for z-index conflicts and scroll position issues that can obscure focused components.
                </p>

                <h3 className="text-2xl mt-16 mb-6">2. Focus Appearance — Level AAA (2.4.13)</h3>
                <div className="not-prose mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-purple-500">Visual Enhancement</span>
                  </div>
                </div>
                <p>
                  Focus indicators must meet minimum size and contrast requirements. The INCLUSIVE node validates focus styles and generates compliant alternatives when existing styles fail the 3:1 contrast threshold.
                </p>

                <h3 className="text-2xl mt-16 mb-6">3. Dragging Movements — Level AA (2.5.7)</h3>
                <p>
                  All drag-based functionality must have single-pointer alternatives. The INCLUSIVE node detects drag-only interfaces and flags them for remediation.
                </p>

                <h3 className="text-2xl mt-16 mb-6">4. Target Size (Minimum) — Level AA (2.5.8)</h3>
                <div className="not-prose mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-blue-500">Mobile Usability</span>
                  </div>
                </div>
                <p>
                  Interactive targets must be at least 24×24 CSS pixels. The INCLUSIVE node measures actual rendered sizes and flags undersized targets — particularly important for mobile-first substrate interfaces.
                </p>

                <h3 className="text-2xl mt-16 mb-6">5. Consistent Help — Level A (3.2.6)</h3>
                <p>
                  Help mechanisms must appear in the same relative order across pages. The INCLUSIVE node validates help element positioning consistency across all routes.
                </p>

                <h3 className="text-2xl mt-16 mb-6">6. Redundant Entry — Level A (3.3.7)</h3>
                <div className="not-prose mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                    <BrainIcon className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-purple-500">Cognitive Support</span>
                  </div>
                </div>
                <p>
                  Previously entered information must not be required again in the same process. The INCLUSIVE node flags multi-step forms that re-request data already provided.
                </p>

                <h3 className="text-2xl mt-16 mb-6">7. Accessible Authentication — Level AA (3.3.8)</h3>
                <p>
                  Authentication methods must not require cognitive function tests without alternatives. The substrate's IDENTITY node supports passwordless flows that satisfy this criterion by default.
                </p>

                <h2 className="text-3xl mt-20 mb-8">How the Substrate Handles Compliance</h2>
                <p>
                  The INCLUSIVE node doesn't just detect violations — it remediates them. When paired with the BRAIN node's contextual understanding, it generates fixes that respect design intent while achieving compliance. The GOVERNOR node ensures all automated changes pass governance review before deployment.
                </p>
              </div>
            </div>
          </div>

          <div className="py-24 px-4 bg-muted/30 border-t border-border">
            <div className="container mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold mb-6">Achieve WCAG 2.2 Compliance</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                The INCLUSIVE node automatically detects and fixes WCAG 2.2 violations across the substrate.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/scan" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Free Accessibility Scan
                </Link>
                <Link to="/blog/wordpress-accessibility-guide" className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Main Guide
                </Link>
              </div>
            </div>
          </div>
        </article>
        
        <EnhancedFooter />
      </div>
    </>
  );
}
