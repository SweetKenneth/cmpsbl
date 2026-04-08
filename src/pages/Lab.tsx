/**
 * Lab — Temporary scrapbook page for visual experiments.
 * noindex, nofollow — not for production.
 */

import { Helmet } from "react-helmet-async";
import { DualLayerAscensionVisual } from "@/components/lab/DualLayerAscensionVisual";

export default function Lab() {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Lab — Visual Experiments</title>
      </Helmet>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="text-center pt-16 pb-8 px-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-2 block">
            🧪 Experimental · Not Production
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-2">
            Visual Lab
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Prototype hero visuals here before touching the real homepage.
          </p>
        </div>

        {/* Experiment 1: Dual Layer Ascension */}
        <section className="px-4 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-1 block">
                Experiment #1
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                Dual-Layer Ascension Animation
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Layer 2 wraps Layer 1 in real time — governance, defense, and capability injection visible.
              </p>
            </div>

            <DualLayerAscensionVisual />
          </div>
        </section>

        {/* Divider for future experiments */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="border-t border-border/30" />
          <p className="text-center text-[10px] text-muted-foreground/40 font-mono mt-4">
            — add more experiments below —
          </p>
        </div>
      </div>
    </>
  );
}
