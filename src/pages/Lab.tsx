/**
 * Lab — Temporary scrapbook page for visual experiments.
 * noindex, nofollow — not for production.
 */

import { Helmet } from "react-helmet-async";
import { DualLayerAscensionVisual } from "@/components/lab/DualLayerAscensionVisual";
import { MagicalWrapVisual } from "@/components/lab/MagicalWrapVisual";
import { SplitPaneVisual } from "@/components/lab/SplitPaneVisual";
import { ConcentricShieldVisual } from "@/components/lab/ConcentricShieldVisual";

function ExperimentBlock({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-1 block">
            Experiment #{number}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">{title}</h2>
          <p className="text-xs text-muted-foreground font-medium">{description}</p>
        </div>
        {children}
      </div>
      <div className="max-w-3xl mx-auto mt-12">
        <div className="border-t border-border/20" />
      </div>
    </section>
  );
}

export default function Lab() {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Lab — Visual Experiments</title>
      </Helmet>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="text-center pt-16 pb-4 px-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-2 block">
            🧪 Experimental · Not Production
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-2">
            Visual Lab
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Four hero animation concepts for dual-layer ascension.
          </p>
        </div>

        <ExperimentBlock
          number={1}
          title="Terminal Scanner"
          description="Scan line sweeps Layer 1 while capability labels inject from the right."
        >
          <DualLayerAscensionVisual />
        </ExperimentBlock>

        <ExperimentBlock
          number={2}
          title="Magical Code Wrap"
          description="Enchanted runes orbit the legacy host while Layer 2 attachment glows into existence."
        >
          <MagicalWrapVisual />
        </ExperimentBlock>

        <ExperimentBlock
          number={3}
          title="Before / After Split"
          description="Side-by-side: unprotected code vs. ascended code with visible hardening annotations."
        >
          <SplitPaneVisual />
        </ExperimentBlock>

        <ExperimentBlock
          number={4}
          title="Concentric Shield Rings"
          description="Each Layer 2 primitive orbits the host as a protective ring — Defense, Governance, Beacon, Failsafe."
        >
          <ConcentricShieldVisual />
        </ExperimentBlock>

        <div className="text-center py-8">
          <p className="text-[10px] text-muted-foreground/40 font-mono">
            — end of experiments —
          </p>
        </div>
      </div>
    </>
  );
}
