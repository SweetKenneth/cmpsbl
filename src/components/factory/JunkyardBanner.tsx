/**
 * JunkyardBanner — Promotional banner for the Junkyard (Raw-tier discoveries)
 * Used on the factory home page and showroom to advertise free access.
 */

import { Link } from "react-router-dom";
import { Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JunkyardBanner() {
  return (
    <section className="relative z-10 px-3 sm:px-6 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm overflow-hidden p-6 sm:p-10">
          {/* Rust texture overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "repeating-linear-gradient(45deg, hsl(var(--foreground)) 0px, transparent 2px, transparent 8px)",
          }} />

          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-accent/50 border border-accent/30 shrink-0">
              <Wrench className="w-7 h-7 text-accent-foreground" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-black text-foreground mb-1">
                The Junkyard
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                Every discovery scored below 68 lands here. Free to take. Unlimited copies. No certificate, no fingerprint — just raw potential. Some of them will surprise you.
              </p>
              <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-medium">
                The 1967 Shelby GT500 was found under a tarp in a barn. Start digging.
              </p>
            </div>

            <Button asChild variant="outline" className="rounded-xl font-semibold shrink-0">
              <Link to="/junkyard">
                Explore the Junkyard
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
