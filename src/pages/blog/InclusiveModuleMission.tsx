/**
 * INCLUSIVE Module Mission — Human Compatibility Pipeline
 * CMPSBL®
 */

import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Users, Zap, Accessibility } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/blog/cmptbl-mission-accessibility.jpg";

const InclusiveModuleMission = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="INCLUSIVE Module: Accessibility at Scale"
        description="Our commitment to web accessibility through AI-powered WCAG automation — the INCLUSIVE module architecture and mission."
        type="article"
        publishedTime="2025-11-20"
        keywords={[
          "INCLUSIVE module",
          "AI accessibility mission",
          "WCAG automation",
          "web accessibility AI",
          "digital inclusion",
          "ADA compliance software"
        ]}
      />

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <header className="mb-12">
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-8">
            <img 
              src={heroImage} 
              alt="Universal web accessibility mission showing diverse people connecting through technology and WCAG compliance visualization"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            INCLUSIVE: The Mission to Make Every Digital Experience Accessible
          </h1>
          <p className="text-xl text-muted-foreground">
            How CMPSBL's INCLUSIVE module is using AI to eliminate digital barriers and create truly inclusive web experiences for everyone
          </p>
          
          <AuthorBio publishDate="2025-10-16" readTime="12 min read" />
        </header>

        <section className="prose prose-lg max-w-none mb-12">
          <p className="lead text-xl mb-8">
            Over 1 billion people worldwide live with some form of disability. Yet the digital world remains frustratingly inaccessible to millions. The INCLUSIVE module exists to change that reality through adaptive AI that makes accessibility automatic, comprehensive, and sustainable.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">The Accessibility Crisis Nobody Talks About</h2>
          <p className="mb-6">
            Every day, people encounter digital barriers that seem invisible to those without disabilities. A blind user navigates a website with a screen reader only to hit unlabeled buttons. A deaf individual watches a video lacking captions. Someone with motor impairments struggles with a form that requires precise mouse control. A person with cognitive disabilities faces walls of text without clear structure.
          </p>

          <p className="mb-6">
            These aren't edge cases or acceptable compromises. They're systematic failures that exclude millions from participating fully in the digital economy, education, healthcare, and civic life. The Web Content Accessibility Guidelines (WCAG) exist to address these issues, but compliance remains frustratingly low.
          </p>

          <Card className="p-6 mb-6 bg-destructive/10 border-destructive/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-destructive" />
              The Hard Truth About Digital Accessibility
            </h3>
            <ul className="space-y-3">
              <li><strong>97.4%</strong> of the top 1 million websites have detectable WCAG failures</li>
              <li><strong>70%</strong> of e-commerce sites have accessibility barriers in checkout flows</li>
              <li><strong>$6.9 billion</strong> in online sales are lost annually due to poor accessibility</li>
              <li><strong>10+ hours</strong> average time required for manual accessibility audit</li>
              <li><strong>$10,000+</strong> typical cost for professional WCAG remediation</li>
            </ul>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">Why Traditional Accessibility Approaches Fail</h2>
          <p className="mb-6">
            Organizations understand the importance of accessibility. Most genuinely want to do better. Yet compliance rates remain abysmal. The problem isn't lack of intention; it's the structural challenges inherent in conventional approaches.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">Manual Audits Are Expensive and Outdated Immediately</h3>
          <p className="mb-4">
            Traditional accessibility audits involve specialists manually testing every page with assistive technologies. This process is thorough but prohibitively expensive and slow. A comprehensive audit of a medium-sized website can cost $15,000-$50,000 and take weeks to complete.
          </p>
          <p className="mb-6">
            Worse, the audit is obsolete the moment developers push new code. Every update, new feature, or content change can introduce new accessibility issues. Organizations end up in an endless cycle of expensive audits and remediation efforts that never quite catch up.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">The INCLUSIVE Difference: Adaptive Accessibility Intelligence</h2>
          <p className="mb-6">
            The INCLUSIVE module takes a fundamentally different approach to accessibility. Rather than treating compliance as a one-time checklist or attempting to patch problems with client-side JavaScript, INCLUSIVE integrates deeply into the development workflow and continuously ensures accessibility at the source.
          </p>

          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Accessibility className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold mb-3">How INCLUSIVE Works</h3>
                <p className="text-muted-foreground">
                  INCLUSIVE combines real-time scanning, AI-powered remediation, and continuous monitoring to maintain WCAG compliance automatically
                </p>
              </div>
            </div>
            <ul className="space-y-4">
              <li>
                <strong className="text-primary">Intelligent Scanning:</strong> Analyzes every page using advanced heuristics that understand context, not just syntax
              </li>
              <li>
                <strong className="text-primary">AI-Powered Remediation:</strong> Automatically generates proper alt text, aria labels, and semantic structure improvements
              </li>
              <li>
                <strong className="text-primary">Continuous Monitoring:</strong> Watches for changes and immediately flags new accessibility issues before deployment
              </li>
              <li>
                <strong className="text-primary">Developer Integration:</strong> Provides actionable recommendations directly in the development workflow
              </li>
              <li>
                <strong className="text-primary">Learning System:</strong> Improves recommendations based on your site's patterns and accepted fixes
              </li>
            </ul>
          </Card>

          <h2 className="text-3xl font-bold mt-12 mb-6">INCLUSIVE Integration with CMPSBL Ecosystem</h2>
          <p className="mb-6">
            INCLUSIVE doesn't operate in isolation. As the 14th module of the <Link to="/solutions" className="text-primary hover:underline">CMPSBL Substrate</Link>, it benefits from and contributes to the broader adaptive intelligence platform.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">SYSTEM Integration: Audit Aggregation</h3>
          <p className="mb-6">
            INCLUSIVE connects to the SYSTEM module for centralized audit aggregation and health surfaces. Every scan, repair, and validation is logged and available through system.audit for comprehensive compliance tracking.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">BRAIN Integration: Improving Over Time</h3>
          <p className="mb-4">
            The BRAIN module learns from every accessibility scan and remediation. It identifies patterns specific to your industry, content types, and design approaches. Over time, recommendations become increasingly tailored and accurate.
          </p>
          <p className="mb-6">
            When developers accept or modify INCLUSIVE suggestions, the system learns these preferences and applies them to future recommendations. This creates a continuously improving accessibility intelligence that becomes more valuable with use.
          </p>

          <h3 className="text-2xl font-semibold mt-8 mb-4">DEFENSE Integration: Severity Escalation</h3>
          <p className="mb-6">
            High-severity accessibility violations are automatically escalated to the DEFENSE module's risk pipeline. Critical WCAG failures can trigger alerts or even block deployments until resolved.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">Built by CMPSBL®</h2>
          <p className="mb-6">
            The INCLUSIVE module is developed and maintained by CMPSBL®, the company behind the cognitive orchestration substrate. Our mission is to make AI accessible, composable, and beneficial for everyone—and that starts with making the digital world itself accessible.
          </p>

          <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-xl border border-border">
            <Heart className="w-12 h-12 text-destructive" />
            <div>
              <p className="font-semibold text-lg">Accessibility is a fundamental right, not a feature.</p>
              <p className="text-muted-foreground">— CMPSBL Team</p>
            </div>
          </div>
        </section>

        <section className="mt-16 p-8 bg-muted/30 rounded-xl border border-border">
          <h3 className="text-2xl font-bold mb-6">Related Content</h3>
          <div className="grid gap-4">
            <Link to="/solutions" className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors group">
              <span className="font-semibold">All Modules — Full Catalog</span>
              <Zap className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/use-cases" className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors group">
              <span className="font-semibold">Use Cases</span>
              <Zap className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/" className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors group">
              <span className="font-semibold">Home</span>
              <Zap className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
};

export default InclusiveModuleMission;
