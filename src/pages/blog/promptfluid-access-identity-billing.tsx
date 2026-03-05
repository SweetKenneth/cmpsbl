import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Key, CreditCard, Users, ShieldCheck, ArrowLeft } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";

const PromptFluidAccess = () => {
  return (
    <>
      <Helmet>
        <title>ACCESS: Identity, Licensing & Billing | CMPSBL®</title>
        <meta 
          name="description" 
          content="CMPSBL's ACCESS system manages authentication, permissions, licensing, and billing with zero-password cryptographic identity and trust-based retention." 
        />
        <meta name="keywords" content="identity management, AI billing, authentication, licensing system, CMPSBL Access, zero-password auth" />
        <link rel="canonical" href="https://cmpsbl.com/blog/promptfluid-access-identity-billing" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": "ACCESS: Identity, Licensing & Billing",
            "description": "CMPSBL's ACCESS system manages authentication, permissions, licensing, and billing with zero-password cryptographic identity.",
            "author": {
              "@type": "Organization",
              "name": "CMPSBL Research Team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "CMPSBL",
              "logo": {
                "@type": "ImageObject",
                "url": "https://cmpsbl.com/logo.png"
              }
            },
            "datePublished": "2025-09-30",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://cmpsbl.com/blog/promptfluid-access-identity-billing"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <PublicNav />

        <article>
          {/* Hero Section */}
          <div className="relative py-24 px-4 border-b border-border bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto max-w-4xl">
              <Link to="/blog" className="inline-flex items-center gap-2 text-primary/80 hover:text-primary transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm tracking-wide">Back to Blog</span>
              </Link>

              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-primary/10">
                  <Key className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground tracking-wide uppercase">System Deep Dive</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
                ACCESS: Trust-Based Identity & Billing
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Explore ACCESS, the unified system managing authentication, permissions, licensing, and billing operations with human-centered policies that prioritize user trust over rigid enforcement.
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="py-24 px-4">
            <div className="container mx-auto max-w-3xl">
              <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-muted-foreground">
                
                <h2 className="text-3xl mt-20 mb-8 flex items-center gap-4">
                  <Key className="w-8 h-8 text-primary" />
                  What is ACCESS?
                </h2>

                <p className="text-xl leading-relaxed text-foreground font-light mb-12">
                  ACCESS serves as the authorization and monetization backbone of the CMPSBL Substrate, handling everything related to user identity, permissions, subscription management, and payment processing.
                </p>

                <p>
                  Unlike traditional systems that aggressively enforce payment collection, ACCESS implements trust-based retention—accounts never delete on payment failure, services continue during grace periods, and user relationships matter more than rigid policies.
                </p>

                <p>
                  Every user interaction with <Link to="/blog/cmpsbl-studio-build-apps-that-think" className="text-primary hover:underline">STUDIO</Link>, <Link to="/blog/cmpsbl-vision-unified-dashboard" className="text-primary hover:underline">VISION</Link>, or any substrate system passes through ACCESS for authentication and authorization.
                </p>

                <h2 className="text-3xl mt-20 mb-8">Core Capabilities</h2>

                <div className="not-prose space-y-8 my-12">
                  <div className="p-8 rounded-2xl bg-primary/5 border-l-4 border-primary">
                    <div className="flex items-center gap-4 mb-4">
                      <ShieldCheck className="w-8 h-8 text-primary" />
                      <h3 className="text-2xl font-bold">Multi-Factor Authentication</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Access supports multiple authentication methods—password-based login, OAuth integration with Google/GitHub/Microsoft, and time-based one-time passwords (TOTP) for enhanced security. Session management includes device fingerprinting through Defense integration, automatically detecting suspicious login attempts.
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-accent/5 border-l-4 border-accent">
                    <div className="flex items-center gap-4 mb-4">
                      <Users className="w-8 h-8 text-accent" />
                      <h3 className="text-2xl font-bold">Role-Based Access Control</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Organizations define custom roles with fine-grained permissions. Developers access Studio build environments while restricted from billing settings. Team leads view analytics in Vision while limiting other members to specific dashboards.
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-primary/5 border-l-4 border-primary">
                    <div className="flex items-center gap-4 mb-4">
                      <CreditCard className="w-8 h-8 text-primary" />
                      <h3 className="text-2xl font-bold">Flexible Billing System</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Access manages subscription tiers from free starter plans to custom Enterprise pricing. Token-based billing tracks AI usage, build operations, and storage consumption. Deferral credits enable temporary service continuation when payments fail.
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-muted/30 border-l-4 border-muted-foreground/30">
                    <h3 className="text-2xl font-bold mb-4">API Key Management</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Programmatic access requires API keys managed through Access. Generate keys with specific permission scopes, set expiration dates, and rotate credentials without service disruption.
                    </p>
                  </div>
                </div>

                <h2 className="text-3xl mt-20 mb-8">Trust-Based Retention Philosophy</h2>

                <p>
                  Most SaaS platforms immediately suspend services when payment methods fail or subscriptions expire. CMPSBL takes a different approach. When a payment fails, ACCESS enters a 7-day grace period where all services continue operating normally.
                </p>

                <p>
                  If payment still hasn't resolved after the grace period, ACCESS pauses new builds and high-cost operations but maintains existing deployments. Users can access historical projects, view analytics, and export data without artificial restrictions.
                </p>

                <p>
                  <strong className="text-foreground">Accounts never delete automatically.</strong> When users offboard, ACCESS archives their data for potential future reactivation and celebrates their usage streak—how long they've been part of the CMPSBL community.
                </p>

                <h2 className="text-3xl mt-20 mb-8">Current Subscription Tiers</h2>

                <div className="not-prose my-12 p-8 rounded-2xl bg-muted/30 border border-border">
                  <div className="space-y-6">
                    <div className="border-b border-border pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-foreground">Free — $0</span>
                        <span className="text-sm text-primary">✓ Live</span>
                      </div>
                      <p className="text-sm text-muted-foreground">First-class builder access, Artifact Store, persistent memory, essential integrations</p>
                    </div>
                    <div className="border-b border-border pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-foreground">Creator — $29/mo</span>
                        <span className="text-sm text-primary">✓ Live</span>
                      </div>
                      <p className="text-sm text-muted-foreground">All engines, templates, SDK/API access, 7 Experience Jewels, priority support</p>
                    </div>
                    <div className="border-b border-border pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-foreground">Architect — $79/mo</span>
                        <span className="text-sm text-primary">✓ Live</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Advanced CLM, cross-project learning, all 28 Experience Jewels, full substrate access</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-foreground">Enterprise — Custom</span>
                        <span className="text-sm text-muted-foreground">Contact Us</span>
                      </div>
                      <p className="text-sm text-muted-foreground">White-label deployment, private models, dedicated support, full integration</p>
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl mt-20 mb-8">Current Implementation Status</h2>

                <div className="not-prose my-12 p-8 rounded-2xl bg-muted/30 border border-border">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Authentication & Authorization</span>
                      <span className="text-sm text-primary font-semibold">✓ Live</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Subscription Management</span>
                      <span className="text-sm text-primary font-semibold">✓ Live</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Token-Based Billing</span>
                      <span className="text-sm text-primary font-semibold">✓ Live</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Trust-Based Retention</span>
                      <span className="text-sm text-primary font-semibold">✓ Live</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">API Key Management</span>
                      <span className="text-sm text-accent font-semibold">Beta</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Advanced RBAC</span>
                      <span className="text-sm text-accent font-semibold">Beta</span>
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl mt-20 mb-8">Why Trust-Based Retention Works</h2>

                <p>
                  The traditional SaaS approach treats users as risks to be mitigated through aggressive payment enforcement. CMPSBL recognizes that building long-term relationships generates more value than extracting maximum short-term revenue.
                </p>

                <p>
                  Users who experience grace during payment difficulties become loyal advocates. Those who offboard gracefully often return later with larger teams and budgets. Trust-based retention isn't just ethical—it's strategically advantageous in an industry where reputation and community drive growth.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-24 px-4 bg-muted/30 border-t border-border">
            <div className="container mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold mb-6">Experience Trust-Based Services</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join the CMPSBL ecosystem and experience authentication and billing that respects your relationship.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    <Key className="w-5 h-5" />
                    Get Started
                  </Button>
                </Link>
                <Link to="/blog">
                  <Button size="lg" variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    More Articles
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default PromptFluidAccess;
