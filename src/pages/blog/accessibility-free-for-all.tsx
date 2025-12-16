import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Accessibility, ArrowRight, CheckCircle, Users, Globe, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function AccessibilityFreeForAll() {
  const openClarity = () => {
    window.open("https://clarity.promptfluid.com", "_blank");
  };

  return (
    <>
      <SEO
        title="We Made Accessibility Free For All | PromptFluid - The Way It Should Be"
        description="Accessibility should never be locked behind a paywall. PromptFluid is making WCAG scanning and fixing 100% free forever. Scan your site, fix issues, and make the web accessible to everyone."
        canonical="https://promptfluid.com/blog/accessibility-free-for-all"
        keywords={[
          "free accessibility scanner",
          "free WCAG compliance",
          "accessibility for all",
          "free website accessibility",
          "WCAG free tool",
          "accessibility should be free",
          "inclusive web design",
          "free accessibility testing"
        ]}
      />

      <div className="min-h-screen bg-background">
        <PublicNav />

        {/* Hero */}
        <article className="pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <header className="text-center mb-16">
              <Badge className="mb-6" variant="default">
                <Heart className="w-3 h-3 mr-1 text-red-500" />
                Our Mission
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent leading-tight">
                We Made Accessibility Free For All
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                The way it should be.
              </p>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>Kenneth Sweet</span>
                <span>•</span>
                <span>Founder, PromptFluid</span>
                <span>•</span>
                <time dateTime="2025-01-15">January 2025</time>
              </div>
            </header>

            {/* Featured CTA */}
            <Card className="p-8 mb-16 bg-gradient-to-br from-primary/10 via-primary-variant/5 to-accent/10 border-primary/30 shadow-glow">
              <div className="text-center">
                <Accessibility className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Scan & Fix Your Site — 100% Free</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  No signups. No credit cards. No "freemium" limitations. Just real accessibility tools that work.
                </p>
                <Button size="lg" onClick={openClarity} className="shadow-glow hover:shadow-glow-lg">
                  <Accessibility className="w-5 h-5 mr-2" />
                  Start Free Scan at Clarity
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-3xl font-bold mt-12 mb-6">Why Accessibility Should Never Cost Money</h2>
              
              <p className="text-lg leading-relaxed mb-6">
                When I started PromptFluid, I looked at the accessibility industry and saw something that bothered me deeply: 
                companies charging hundreds or thousands of dollars just to tell people their websites weren't usable by everyone.
              </p>

              <p className="text-lg leading-relaxed mb-6">
                Think about that for a moment. We're charging people money to learn that their sites exclude 
                people with disabilities. And then charging them more to fix it.
              </p>

              <p className="text-lg leading-relaxed mb-8">
                That's backwards. That's wrong. And that's why we're changing it.
              </p>

              <div className="grid md:grid-cols-3 gap-6 my-12">
                <Card className="p-6 text-center">
                  <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Free Scanning</h3>
                  <p className="text-sm text-muted-foreground">Unlimited WCAG 2.2 compliance checks</p>
                </Card>
                <Card className="p-6 text-center">
                  <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Free Fixes</h3>
                  <p className="text-sm text-muted-foreground">AI-powered accessibility remediation</p>
                </Card>
                <Card className="p-6 text-center">
                  <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Free Forever</h3>
                  <p className="text-sm text-muted-foreground">No hidden costs, no premium tiers</p>
                </Card>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">The Web Should Work For Everyone</h2>

              <p className="text-lg leading-relaxed mb-6">
                Over 1 billion people worldwide live with some form of disability. That's 15% of the global population 
                who may struggle to use websites that don't follow accessibility standards.
              </p>

              <p className="text-lg leading-relaxed mb-6">
                When we lock accessibility behind paywalls, we're effectively saying: "Your ability to make the web 
                inclusive depends on your ability to pay." That's not a web I want to build.
              </p>

              <blockquote className="border-l-4 border-primary pl-6 py-4 my-8 bg-primary/5 rounded-r-lg">
                <p className="text-xl italic mb-2">
                  "Accessibility is not a feature. It's a fundamental right. And rights shouldn't have a price tag."
                </p>
                <footer className="text-sm text-muted-foreground">— Kenneth Sweet, Founder</footer>
              </blockquote>

              <h2 className="text-3xl font-bold mt-12 mb-6">What We're Doing Differently</h2>

              <p className="text-lg leading-relaxed mb-6">
                At PromptFluid, we've built <strong>Clarity</strong> — a completely free accessibility scanning and 
                remediation platform. Here's what you get:
              </p>

              <ul className="space-y-4 my-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Full WCAG 2.2 AA/AAA Scanning</strong> — Comprehensive checks across 86+ accessibility criteria
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>AI-Powered Auto-Fix</strong> — Our Cascade AI automatically generates fixes for common issues
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Detailed Reports</strong> — Understand exactly what's wrong and how to fix it
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>No Account Required</strong> — Just enter your URL and start scanning
                  </div>
                </li>
              </ul>

              <h2 className="text-3xl font-bold mt-12 mb-6">How We Can Afford This</h2>

              <p className="text-lg leading-relaxed mb-6">
                People ask us: "If it's free, how do you make money?" The answer is simple: we don't make money 
                on accessibility. We make money on other PromptFluid products — security, AI orchestration, 
                enterprise solutions.
              </p>

              <p className="text-lg leading-relaxed mb-6">
                Accessibility is our contribution to making the web better. It's not a business unit. It's a mission.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">Join the Movement</h2>

              <p className="text-lg leading-relaxed mb-6">
                Every website that becomes accessible is a victory. Every barrier removed is someone's life made 
                a little bit easier. That's worth more than any subscription fee.
              </p>

              <p className="text-lg leading-relaxed mb-8">
                Scan your site today. Fix the issues. Make the web work for everyone.
              </p>
            </div>

            {/* Final CTA */}
            <Card className="p-8 mt-16 bg-gradient-to-br from-primary/10 via-primary-variant/5 to-accent/10 border-primary/30">
              <div className="text-center">
                <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Ready to Make Your Site Accessible?</h2>
                <p className="text-muted-foreground mb-6">
                  Start making the web work for everyone with a free accessibility scan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={openClarity} className="shadow-glow">
                    <Accessibility className="w-5 h-5 mr-2" />
                    Free Accessibility Scan
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/products/access">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Learn About Clarity
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Author */}
            <div className="mt-16 pt-8 border-t">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  KS
                </div>
                <div>
                  <h3 className="font-semibold">Kenneth Sweet</h3>
                  <p className="text-sm text-muted-foreground">Founder, PromptFluid</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Building AI that dreams, and making the web accessible to all.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <EnhancedFooter />
      </div>
    </>
  );
}
