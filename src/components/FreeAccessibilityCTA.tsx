import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accessibility, ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

interface FreeAccessibilityCTAProps {
  variant?: "full" | "compact";
}

export function FreeAccessibilityCTA({ variant = "full" }: FreeAccessibilityCTAProps) {
  if (variant === "compact") {
    return (
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Accessibility className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Free Accessibility Scanning & Fixes</h3>
              <p className="text-sm text-muted-foreground">Powered by the INCLUSIVE Layer.</p>
            </div>
          </div>
          <Button asChild className="shadow-glow whitespace-nowrap">
            <Link to="/scanner">
              Scan Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <section className="py-16 px-4">
      <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary-variant/5 to-accent/10 border-primary/20 shadow-glow-lg">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
            <Heart className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium">Our Mission</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Accessibility Should Be{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Free For All
            </span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We believe accessibility is a fundamental right, not a premium feature. 
            Scan your website, get AI-powered fixes, and make the web work for everyone — 
            100% free, forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="shadow-glow hover:shadow-glow-lg">
              <Link to="/scanner">
                <Accessibility className="w-5 h-5 mr-2" />
                Free Accessibility Scan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/blog/inclusive-module-accessibility-mission">
                Read Our Mission
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No signup required • Unlimited scans • AI-powered fixes included
          </p>
        </div>
      </Card>
    </section>
  );
}
