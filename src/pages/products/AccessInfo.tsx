/**
 * Access Info — Accessibility Module Product Page
 * v9.3.0 ARCHITECT Epoch — Part of 21-module substrate
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accessibility, ScanEye, FileCheck, Shield, Zap, Award, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AccessInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Access Module — Website Accessibility Compliance & WCAG Testing | CMPSBL"
        description="Automated accessibility testing for WCAG 2.2, ADA, and Section 508. Part of CMPSBL's 21-module cognitive substrate with AI-powered scanning and fixes."
        canonical="https://cmpsbl.com/products/access"
        keywords={[
          'website accessibility testing',
          'WCAG compliance checker',
          'CMPSBL Access',
          'ADA compliance software',
          'accessibility audit tool',
          'automated accessibility fixes',
          'Section 508 compliance',
          'web accessibility scanner',
          'accessibility certification',
          'inclusive web design'
        ]}
      />

      <PublicNav />

      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Accessibility className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Access Module</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Accessible Websites.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              For Everyone.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ensure your website is accessible to everyone with automated WCAG 2.2 compliance testing. 
            Part of CMPSBL's 21-module cognitive substrate with AI-powered fixes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="group">
              Start Free Scan
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
              Get Certified
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 flex-1">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: ScanEye,
              title: "Automated Scanning",
              description: "Comprehensive accessibility audits that check for WCAG 2.2, ADA, and Section 508 compliance issues."
            },
            {
              icon: Zap,
              title: "AI-Powered Fixes",
              description: "Automatically fix common accessibility issues with one-click remediation powered by AI."
            },
            {
              icon: FileCheck,
              title: "Detailed Reports",
              description: "Get actionable reports with specific issues, severity levels, and step-by-step fix instructions."
            },
            {
              icon: Award,
              title: "Compliance Badges",
              description: "Earn verified accessibility badges to display on your website and build user trust."
            },
            {
              icon: Shield,
              title: "Ongoing Monitoring",
              description: "Continuous monitoring to catch new issues before they impact users or compliance."
            },
            {
              icon: Accessibility,
              title: "WCAG Coverage",
              description: "Test for Level A, AA, and AAA compliance across all WCAG 2.2 success criteria."
            }
          ].map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* What We Check */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comprehensive Accessibility Testing
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Visual Accessibility", items: ["Color contrast ratios", "Text size and readability", "Focus indicators", "Visual hierarchy"] },
              { title: "Screen Reader Support", items: ["Alt text for images", "Proper heading structure", "ARIA labels", "Semantic HTML"] },
              { title: "Keyboard Navigation", items: ["Tab order and flow", "Skip navigation links", "Keyboard shortcuts", "Focus management"] },
              { title: "Form Accessibility", items: ["Input labels and instructions", "Error messaging", "Field validation", "Required field indicators"] },
              { title: "Multimedia Compliance", items: ["Video captions", "Audio descriptions", "Transcript availability", "Media player controls"] },
              { title: "Mobile Accessibility", items: ["Touch target sizes", "Gesture alternatives", "Responsive design", "Screen orientation support"] }
            ].map((category, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Accessibility Matters
          </h2>
          <div className="space-y-6">
            {[
              "Reach 15% more users who rely on assistive technologies",
              "Reduce legal risk and stay compliant with ADA regulations",
              "Improve SEO rankings—Google rewards accessible websites",
              "Boost usability for all users, not just those with disabilities",
              "Demonstrate social responsibility and inclusive values",
              "Fix issues 10x faster with AI-powered automation"
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 glass p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent mb-2">
                1 in 4
              </div>
              <div className="text-muted-foreground">Adults Have a Disability</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary-variant to-accent bg-clip-text text-transparent mb-2">
                98%
              </div>
              <div className="text-muted-foreground">Of Sites Have Accessibility Issues</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                10x
              </div>
              <div className="text-muted-foreground">Faster Than Manual Testing</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center glass p-12 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Make Your Site Accessible?</h2>
          <p className="text-muted-foreground mb-6">
            Start with a free accessibility scan and see where you stand.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="group">
            Scan My Website Free
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
