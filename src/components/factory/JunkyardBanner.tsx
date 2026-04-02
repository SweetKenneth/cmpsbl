/**
 * JunkyardBanner → OpenArchiveBanner — Promotional banner for the Open Archive (Raw-tier discoveries)
 * Used on the home page and catalog to advertise free access.
 * Lab glass treatment with shimmer and breathing border.
 */

import { Link } from "react-router-dom";
import { Archive, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JunkyardBanner() {
  return (
    <section className="relative z-10 px-3 sm:px-6 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm overflow-hidden p-6 sm:p-10 lab-card-glow lab-breathe">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "repeating-linear-gradient(45deg, hsl(var(--foreground)) 0px, transparent 2px, transparent 8px)",
          }} />

          {/* Top accent bar */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-accent/50 border border-accent/30 shrink-0 group hover:scale-110 transition-transform duration-300">
              <Archive className="w-7 h-7 text-accent-foreground" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-black text-foreground mb-1">
                The Open Archive
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                Every discovery scored below 68 lands here. Free to take. Unlimited copies. No certificate, no fingerprint — just raw potential. Some of them will surprise you.
              </p>
              <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-medium flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="w-1 h-1 rounded-full bg-neon-green lab-status-blink" />
                Unpolished builds. Zero cost. Start exploring.
              </p>
            </div>

            <Button asChild variant="outline" className="rounded-xl font-semibold shrink-0 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Link to="/foundry">
                Browse the Archive
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
