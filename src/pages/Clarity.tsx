import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, CheckCircle, Heart, Accessibility, ArrowRight, Globe } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

const Clarity = () => {
  const openClarity = () => {
    window.open("https://clarity.promptfluid.com", "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="PTCHBL (Patchable) — Free AI Accessibility Scanner | WCAG Auto-Fix"
        description="100% free accessibility scanning and AI-powered fixes. Scan any website for WCAG 2.2 compliance and fix issues automatically. Accessibility should never be behind a paywall."
        canonical="https://www.promptfluid.com/clarity"
        keywords={[
          'free accessibility scanner',
          'WCAG compliance',
          'AI accessibility tool',
          'website accessibility',
          'WCAG 2.2 scanner'
        ]}
      />
      
      <PublicNav />

      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 h-[70vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 h-[70vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-red-500/30 text-red-500">
              <Heart className="w-3 h-3 mr-2" />
              100% Free — Always
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              PTCHBL (Patchable)
            </h1>
            
            <p className="text-2xl font-bold mb-4 text-foreground">
              Free Accessibility For All
            </p>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              We believe accessibility should never be locked behind a paywall. 
              Scan your website, get AI-powered fixes, and make the web work for everyone — completely free, forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={openClarity} className="bg-primary hover:bg-primary/90">
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

      {/* Metrics Bar */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">86+</div>
              <div className="text-sm text-muted-foreground">WCAG Checks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">Free</div>
              <div className="text-sm text-muted-foreground">Always</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">AI</div>
              <div className="text-sm text-muted-foreground">Powered Fixes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">No</div>
              <div className="text-sm text-muted-foreground">Signup Required</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Quote */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <Globe className="w-12 h-12 text-primary mx-auto mb-6" />
          <blockquote className="text-2xl md:text-3xl font-medium mb-6 text-foreground">
            "Accessibility is not a feature. It is a fundamental right. And rights should not have a price tag."
          </blockquote>
          <p className="text-muted-foreground">
            — Kenneth Sweet, Founder of PromptFluid
          </p>
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-4xl font-light text-white drop-shadow-lg">
              "Making the web work for everyone."
            </p>
          </blockquote>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-foreground">How It Works</h2>
          <p className="text-center text-muted-foreground mb-12">
            Three simple steps to a more accessible website — all completely free.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-card border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Scan Your Site</h3>
              <p className="text-muted-foreground">
                Enter any URL. PTCHBL analyzes your entire site for WCAG 2.2 compliance in seconds.
              </p>
            </Card>

            <Card className="p-8 bg-card border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Get Your Report</h3>
              <p className="text-muted-foreground">
                Receive a detailed accessibility report with your compliance score and issues found.
              </p>
            </Card>

            <Card className="p-8 bg-card border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Fix With AI</h3>
              <p className="text-muted-foreground">
                Use AI-powered auto-fix to remediate issues — real code fixes, not overlays.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Everything Included — Free</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card border-border">
                <Shield className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">Full WCAG 2.2 Coverage</h3>
                <p className="text-muted-foreground">
                  86 automated accessibility checks covering WCAG Level A, AA, and AAA criteria.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <Zap className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">Real Code Fixes</h3>
                <p className="text-muted-foreground">
                  Unlike overlays that just hide problems, PTCHBL actually fixes your HTML/DOM.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <CheckCircle className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">AI-Generated Alt Text</h3>
                <p className="text-muted-foreground">
                  Intelligent image descriptions that meet WCAG guidelines, generated automatically.
                </p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <Heart className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-foreground">Free Forever</h3>
                <p className="text-muted-foreground">
                  No premium tiers, no hidden costs. Accessibility tools should be free for everyone.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Ready to Make Your Site Accessible?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Make the web work for everyone with free accessibility scanning and AI-powered fixes. Free. Fast. The right thing to do.
          </p>
          <Button size="lg" onClick={openClarity} className="bg-primary hover:bg-primary/90">
            <Accessibility className="w-5 h-5 mr-2" />
            Start Free Scan Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-6">
            No signup required • Unlimited scans • AI-powered fixes included
          </p>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
};

export default Clarity;
