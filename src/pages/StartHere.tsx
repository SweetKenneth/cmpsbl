/**
 * Start Here — Onboarding Landing Page
 * v10.5.4 ARCHITECT Epoch
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StartHere() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Start Here | Clockless — Build Self-Improving Software"
        description="New to CMPSBL? Start here. Learn how to build with composable artifacts, persistent memory, and self-improving pipelines — all on the free tier."
        canonical="https://cmpsbl.com/start-here"
        keywords={['CMPSBL getting started', 'start here', 'onboarding', 'composable artifacts', 'persistent memory']}
      />
      <PublicNav />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-20 max-w-3xl">
          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-8">
            Start Here
          </h1>

          {/* Body */}
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              CMPSBL is a composable software substrate for building systems that learn, evolve, and improve while running.
            </p>
            <p>
              If you're new, this page helps you get oriented and build something real quickly — no demos, no lockout.
            </p>

            {/* What you can do */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h2 className="text-xl font-semibold text-foreground">What you can do immediately</h2>
              <ul className="space-y-2 text-base">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Browse the Composable Artifacts store
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Build with real templates and capabilities
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Use persistent memory in live systems
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Compose and run pipelines
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Explore documentation, changelogs, and research artifacts
                </li>
              </ul>
            </div>

            <p className="text-foreground font-medium">
              Free users are first-class builders here.
            </p>

            {/* Next Steps */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild size="lg" className="rounded-xl font-semibold">
                <Link to="/store">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Explore the Artifact Store
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl font-semibold">
                <Link to="/pricing">
                  <Layers className="w-4 h-4 mr-2" />
                  View Pricing & Tiers
                </Link>
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground italic">
              Self-improving software works in CMPSBL because of the architecture, not a single feature.
            </p>
          </div>
        </div>
      </main>
      <EnhancedFooter />
    </div>
  );
}
