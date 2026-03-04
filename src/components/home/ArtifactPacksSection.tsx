/**
 * PipelinePacksSection — Clear explanation of the pack activation model
 * Free start → Packs activate capabilities → Slots create structure → Governance enforces boundaries
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, Layers, Shield, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRODUCT_TIERS } from "@/lib/quarry/types";
import {
  PIPELINE_PACKS_LABEL,
  PIPELINE_PACK_DESCRIPTION,
  PIPELINE_STEPS,
} from "@/lib/branding/memory-stream";

const stepIcons = [Sparkles, Package, Layers, Shield] as const;
const stepColors = [
  { color: "text-emerald-500", borderColor: "border-emerald-500/20", bg: "bg-emerald-500/5" },
  { color: "text-primary", borderColor: "border-primary/20", bg: "bg-primary/5" },
  { color: "text-violet-500", borderColor: "border-violet-500/20", bg: "bg-violet-500/5" },
  { color: "text-amber-500", borderColor: "border-amber-500/20", bg: "bg-amber-500/5" },
] as const;

const tiers = [
  { name: "Builder", slots: PRODUCT_TIERS.builder.slots, price: "Free", color: "from-emerald-500 to-emerald-600" },
  { name: "Creator", slots: PRODUCT_TIERS.operator.slots, price: "$29/mo", color: "from-violet-500 to-purple-500" },
  { name: "Architect", slots: PRODUCT_TIERS.architect.slots, price: "$79/mo", color: "from-amber-500 to-orange-500" },
];

export function ArtifactPacksSection() {
  return (
    <section className="relative z-10 py-16 sm:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 px-4 py-1.5">
            <Package className="w-3 h-3 mr-1.5 text-primary" />
            <span className="text-xs font-semibold">{PIPELINE_PACKS_LABEL}</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight">
            Activate What You{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-purple)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Need
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {PIPELINE_PACK_DESCRIPTION}
          </p>
        </motion.div>

        {/* How it works — 4 steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = stepIcons[idx];
            const colors = stepColors[idx];
            const number = String(idx + 1).padStart(2, "0");
            return (
              <motion.div
                key={number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "relative rounded-xl border p-5",
                  colors.borderColor, colors.bg
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={cn("text-2xl font-black font-mono opacity-30", colors.color)}>{number}</span>
                  <Icon className={cn("w-5 h-5", colors.color)} />
                </div>
                <h3 className="font-bold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Tier comparison — compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-3 gap-4 mb-8">
            {tiers.map((tier) => (
              <div key={tier.name} className="text-center rounded-xl border border-border/30 bg-card/50 p-5">
                <div className={cn("text-3xl sm:text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent", tier.color)}>
                  {tier.slots}
                </div>
                <div className="text-sm font-bold mt-1">{tier.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{tier.price}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2 px-6 sm:px-8 h-12 sm:h-13 font-bold text-sm sm:text-base">
              <Link to="/auth">
                <Sparkles className="w-4 h-4" />
                Start Free — 3 Slots
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 px-6 sm:px-8 h-12 sm:h-13 font-semibold text-sm sm:text-base">
              <Link to="/packs">
                <Package className="w-4 h-4" />
                Explore All Packs
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
