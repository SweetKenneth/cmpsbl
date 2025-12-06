import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Accessibility, CheckCircle, Zap, Shield, Clock, TrendingUp, ArrowRight, Heart, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function ScanPage() {
  const openCMPTBL = () => {
    window.open("https://cmptbl.promptfluid.com", "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Free WCAG Accessibility Scanner | PromptFluid — Scan & Fix Your Site Free"
        description="100% free accessibility scanning and AI-powered fixes. Scan any website for WCAG 2.2 AA/AAA compliance, get instant results, and fix issues automatically. Accessibility should be free for all."
        canonical="https://promptfluid.com/scan"
        keywords={[
          'free accessibility scanner',
          'WCAG 2.2 compliance checker',
          'free accessibility fixes',
          'AI accessibility audit',
          'website accessibility test',
          'WCAG AA compliance',
          'free WCAG scanner',
          'accessibility for all',
          'free accessibility testing',
          'ADA compliance checker'
        ]}
      />

      <PublicNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 shadow-glow" variant="default">
              <Heart className="w-3 h-3 mr-1 text-red-500" />
              100% Free — The Way It Should Be
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Free Accessibility Scanning & Fixes
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We believe accessibility should never be locked behind a paywall. Scan your website, 
              get AI-powered fixes, and make the web work for everyone — completely free.
            </p>

            {/* Feature Strip */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium">86 WCAG Checks</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-medium">AI Auto-Fix</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">Unlimited Scans</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-medium">Free Forever</span>
              </div>
            </div>

            {/* Main CTA */}
            <Card className="p-8 glass border-primary/20 shadow-glow max-w-2xl mx-auto">
              <div className="text-center">
                <Accessibility className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Start Your Free Accessibility Scan</h2>
                <p className="text-muted-foreground mb-6">
                  Click below to open CMPTBL — our free accessibility scanning platform.
                </p>
                <Button 
                  size="lg" 
                  onClick={openCMPTBL}
                  className="shadow-glow hover:shadow-glow-lg text-lg px-8 py-6"
                >
                  <Accessibility className="w-5 h-5 mr-2" />
                  Scan Your Site Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-6 text-center">
                No signup required • No credit card • WCAG 2.2 compliant
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Globe className="w-12 h-12 text-primary mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl font-medium mb-6">
              "Accessibility is not a feature. It's a fundamental right. 
              And rights shouldn't have a price tag."
            </blockquote>
            <p className="text-muted-foreground">
              — Kenneth Sweet, Founder of PromptFluid
            </p>
            <Button variant="link" asChild className="mt-4">
              <Link to="/blog/accessibility-free-for-all">
                Read Our Full Mission Statement
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Three simple steps to a more accessible website — all completely free.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Scan Instantly</h3>
                <p className="text-muted-foreground">
                  Enter any website URL. CMPTBL analyzes your entire site for WCAG 2.2 AA/AAA compliance in seconds.
                </p>
              </Card>
              <Card className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Your Report</h3>
                <p className="text-muted-foreground">
                  Receive a detailed accessibility report with your compliance score, issues found, and how to fix them.
                </p>
              </Card>
              <Card className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Fix With AI</h3>
                <p className="text-muted-foreground">
                  Use our AI-powered auto-fix to remediate issues automatically — real code fixes, not overlays.
                </p>
              </Card>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">What Makes CMPTBL Different?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">100% Free</h4>
                    <p className="text-sm text-muted-foreground">No premium tiers, no hidden costs. Accessibility tools should be free for everyone.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Real Code Fixes</h4>
                    <p className="text-sm text-muted-foreground">No overlays or widgets—CMPTBL repairs your actual source code for permanent accessibility.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">AI-Powered Intelligence</h4>
                    <p className="text-sm text-muted-foreground">Contextual alt text generation, semantic HTML structure, and ARIA label optimization.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">No Account Required</h4>
                    <p className="text-sm text-muted-foreground">Just enter your URL and start scanning. No signup, no login, no friction.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary-variant/5 to-accent/10 border-primary/20 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Make Your Site Accessible?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of website owners making the web work for everyone. 
              It's free. It's fast. It's the right thing to do.
            </p>
            <Button size="lg" onClick={openCMPTBL} className="shadow-glow hover:shadow-glow-lg">
              <Accessibility className="w-5 h-5 mr-2" />
              Start Free Scan Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}