import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Heart, Accessibility, ArrowLeft, CheckCircle, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function AccessibilityFreeForAll() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Accessibility for Everyone: A Free Mandate"
        description="Why web accessibility matters at planetary scale and how AI-powered automation makes compliance achievable for every website owner."
        type="article"
        publishedTime="2025-12-15"
        keywords={[
          "free accessibility scanner",
          "free WCAG compliance",
          "accessibility for all",
          "free website accessibility",
          "INCLUSIVE system"
        ]}
      />

      <PublicNav />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-20 md:pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Research
          </Link>
          
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-muted-foreground">Our Mission</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            We Made Accessibility Free For All
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            The way it should be.
          </p>

          <AuthorBio publishDate="2025-01-15" readTime="5 min read" />
        </div>
      </section>

      {/* Hero Visual */}
      <section className="relative w-full py-20 bg-gradient-to-b from-primary/5 via-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <Accessibility className="w-24 h-24 text-primary mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Scan & Fix Your Site — 100% Free</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            No signups. No credit cards. No "freemium" limitations. Just real accessibility tools that work.
          </p>
          <Link 
            to="/scan"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Accessibility className="w-5 h-5" />
            Start Free Scan
          </Link>
        </div>
      </section>

      {/* Content */}
      <article className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Why Accessibility Should Never Cost Money
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                When I started CMPSBL, I looked at the accessibility industry and saw something that bothered me deeply: 
                companies charging hundreds or thousands of dollars just to tell people their websites weren't usable by everyone.
              </p>

              <p>
                Think about that for a moment. We're charging people money to learn that their sites exclude 
                people with disabilities. And then charging them more to fix it.
              </p>

              <p>
                That's backwards. That's wrong. And that's why we're changing it.
              </p>
            </div>
          </section>

          {/* Features Grid */}
          <section className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2 text-foreground">Free Scanning</h3>
              <p className="text-sm text-muted-foreground">Unlimited WCAG 2.2 compliance checks</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2 text-foreground">Free Fixes</h3>
              <p className="text-sm text-muted-foreground">AI-powered accessibility remediation</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2 text-foreground">Free Forever</h3>
              <p className="text-sm text-muted-foreground">No hidden costs, no premium tiers</p>
            </div>
          </section>

          {/* Quote Break */}
          <section className="my-16 py-12 border-y border-border">
            <blockquote className="text-2xl md:text-3xl font-light text-center text-foreground">
              "Accessibility is not a feature. It's a fundamental right. And rights shouldn't have a price tag."
            </blockquote>
            <p className="text-center text-muted-foreground mt-4">— CMPSBL Team</p>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              The Web Should Work For Everyone
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Over 1 billion people worldwide live with some form of disability. That's 15% of the global population 
                who may struggle to use websites that don't follow accessibility standards.
              </p>

              <p>
                When we lock accessibility behind paywalls, we're effectively saying: "Your ability to make the web 
                inclusive depends on your ability to pay." That's not a web I want to build.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <Globe className="h-8 w-8 text-primary" />
              What We're Doing Differently
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                At CMPSBL, we've built the <strong className="text-foreground">INCLUSIVE</strong> — a completely free accessibility scanning and 
                remediation pipeline integrated into the CMPSBL substrate.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Full WCAG 2.2 AA/AAA Scanning</strong> — Comprehensive checks across 86+ accessibility criteria
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">AI-Powered Auto-Fix</strong> — Our BRAIN engine automatically generates fixes for common issues
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Detailed Reports</strong> — Understand exactly what's wrong and how to fix it
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">No Account Required</strong> — Just enter your URL and start scanning
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              How We Can Afford This
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                People ask us: "If it's free, how do you make money?" The answer is simple: we don't make money 
                on accessibility. We make money on other CMPSBL products — security, AI orchestration, 
                enterprise solutions.
              </p>

              <p>
                Accessibility is our contribution to making the web better. It's not a business unit. It's a mission.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-card border border-border rounded-lg p-8 text-center">
            <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4 text-foreground">Ready to Make Your Site Accessible?</h3>
            <p className="text-muted-foreground mb-6">
              Start making the web work for everyone with a free accessibility scan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/scan"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                <Accessibility className="w-5 h-5" />
                Free Accessibility Scan
              </Link>
              <Link 
                to="/cluster/inclusive-module-accessibility"
                className="inline-flex items-center justify-center gap-2 border border-border px-6 py-3 rounded-lg font-semibold hover:bg-accent transition-colors"
              >
                Learn About INCLUSIVE
              </Link>
            </div>
          </section>

        </div>
      </article>

      <EnhancedFooter />
    </div>
  );
}
