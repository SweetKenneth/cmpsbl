/**
 * Synergy & Depot CTA Section
 * Streamlined two-card showcase with premium glass styling
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Workflow, 
  Package, 
  ArrowRight, 
  Zap, 
  Shield, 
  Brain, 
  TrendingUp,
  Sparkles,
  Layers,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-black text-foreground">{value}</div>
      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}

export function SynergyDepotCTA() {
  return (
    <section className="relative z-10 px-4 py-12 sm:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Star className="w-3 h-3 mr-1" />
            Memories & Discoveries
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Extend Your{" "}
            <span 
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)))",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradientShift 4s ease-in-out infinite",
              }}
            >
              Substrate
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
             Pre-built orchestration memories and downloadable capability discoveries — ready for production AI systems.
           </p>
        </motion.div>

        {/* Two-Column Cards */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Synergy Memories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative"
          >
            <div className={cn(
              "h-full rounded-3xl overflow-hidden transition-all duration-500",
              "border border-border/50 bg-card/50 backdrop-blur-sm",
              "hover:shadow-2xl hover:shadow-violet-500/10 hover:border-violet-500/30"
            )}>
              {/* Gradient accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
              
              <div className="p-5 sm:p-8">
                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-6">
                  <motion.div 
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Workflow className="w-7 h-7 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                      Synergy Memories
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Multi-module orchestration workflows that chain capabilities across your substrate.
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-around py-5 mb-6 rounded-2xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/10">
                  <StatBadge value="300" label="Memories" />
                  <div className="w-px bg-violet-500/20" />
                  <StatBadge value="10" label="Entities" />
                  <div className="w-px bg-violet-500/20" />
                  <StatBadge value="6" label="Layers" />
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Brain, text: "Strategic Foresight" },
                    { icon: Shield, text: "Threat Anticipation" },
                    { icon: TrendingUp, text: "Cost Arbitrage" },
                    { icon: Zap, text: "Self-Scaling" },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                        <f.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-medium">{f.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button asChild className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20 transition-all">
                  <Link to="/explore">
                    Explore Memories
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Capabilities Depot */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="group relative"
          >
            <div className={cn(
              "h-full rounded-3xl overflow-hidden transition-all duration-500",
              "border border-border/50 bg-card/50 backdrop-blur-sm",
              "hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/30"
            )}>
              {/* Gradient accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
              
              <div className="p-5 sm:p-8">
                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-6">
                  <motion.div 
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Package className="w-7 h-7 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                      Capabilities Depot
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Downloadable discoveries and capabilities you deploy on your own infrastructure.
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-around py-5 mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10">
                  <StatBadge value="525+" label="Capabilities" />
                  <div className="w-px bg-emerald-500/20" />
                  <StatBadge value="7" label="Categories" />
                  <div className="w-px bg-emerald-500/20" />
                  <StatBadge value="4" label="Tiers" />
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Layers, text: "Production Entities" },
                    { icon: Shield, text: "Security Suite" },
                    { icon: Sparkles, text: "Intelligence Pack" },
                    { icon: Workflow, text: "Automation Kit" },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                        <f.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-medium">{f.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button asChild className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-lg shadow-emerald-500/20 transition-all">
                  <Link to="/explore">
                    Browse Artifacts
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
