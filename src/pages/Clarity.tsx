import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, CheckCircle, Heart, Accessibility, ArrowRight, Globe } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Link } from "react-router-dom";

const Clarity = () => {
  const openClarity = () => {
    window.open("https://clarity.promptfluid.com", "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="PromptFluid Clarity - Free AI Accessibility Scanner | WCAG Auto-Fix"
        description="100% free accessibility scanning and AI-powered fixes. Scan any website for WCAG 2.2 compliance and fix issues automatically. Accessibility should never be behind a paywall."
        canonical="https://www.promptfluid.com/clarity"
        keywords={[
          'free accessibility scanner',
          'free WCAG compliance',
          'free accessibility fixes',
          'AI accessibility tool free',
          'free website accessibility',
          'accessibility for all',
          'free WCAG 2.2 scanner',
          'free accessibility monitoring'
        ]}
      />
      
      <PublicNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-primary/20 border-primary/30" variant="outline">
              <Heart className="w-3 h-3 mr-1 text-red-500" />
              100% Free — The Way It Should Be
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              PromptFluid Clarity
            </h1>
            <p className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              Free Accessibility For All
            </p>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              We believe accessibility should never be locked behind a paywall. 
              Scan your website, get AI-powered fixes, and make the web work for everyone — 
              completely free, forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={openClarity} className="shadow-glow hover:shadow-glow-lg">
                <Accessibility className="w-4 h-4 mr-2" />
                Free Accessibility Scan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/blog/accessibility-free-for-all">
                  Read Our Mission
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "WCAG Checks", value: "86+" },
              { label: "Always", value: "Free" },
              { label: "AI-Powered", value: "Fixes" },
              { label: "No Signup", value: "Required" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Quote */}
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
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-center text-muted-foreground mb-12">
              Three simple steps to a more accessible website — all completely free.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Scan Your Site</h3>
                <p className="text-muted-foreground">
                  Enter any URL. Clarity analyzes your entire site for WCAG 2.2 compliance in seconds.
                </p>
              </Card>

              <Card className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Get Your Report</h3>
                <p className="text-muted-foreground">
                  Receive a detailed accessibility report with your compliance score and issues found.
                </p>
              </Card>

              <Card className="p-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Fix With AI</h3>
                <p className="text-muted-foreground">
                  Use AI-powered auto-fix to remediate issues — real code fixes, not overlays.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Everything Included — Free</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <Shield className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Full WCAG 2.2 Coverage</h3>
                <p className="text-muted-foreground">
                  86 automated accessibility checks covering WCAG Level A, AA, and AAA criteria.
                </p>
              </Card>

              <Card className="p-6">
                <Zap className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Real Code Fixes</h3>
                <p className="text-muted-foreground">
                  Unlike overlays that just hide problems, Clarity actually fixes your HTML/DOM.
                </p>
              </Card>

              <Card className="p-6">
                <CheckCircle className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">AI-Generated Alt Text</h3>
                <p className="text-muted-foreground">
                  Intelligent image descriptions that meet WCAG guidelines, generated automatically.
                </p>
              </Card>

              <Card className="p-6">
                <Heart className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-2xl font-bold mb-3">Free Forever</h3>
                <p className="text-muted-foreground">
                  No premium tiers, no hidden costs. Accessibility tools should be free for everyone.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary-variant/5 to-accent/10 border-primary/20 text-center">
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Make Your Site Accessible?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Make the web work for everyone with free accessibility scanning and AI-powered fixes.
              It's free. It's fast. It's the right thing to do.
            </p>
            <Button size="lg" onClick={openClarity} className="shadow-glow hover:shadow-glow-lg">
              <Accessibility className="w-5 h-5 mr-2" />
              Start Free Scan Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground mt-6">
              No signup required • Unlimited scans • AI-powered fixes included
            </p>
          </Card>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
};

export default Clarity;