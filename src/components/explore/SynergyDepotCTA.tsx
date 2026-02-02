/**
 * Synergy & Depot CTA Section
 * Showcase for Synergy Pipelines and Capabilities Depot
 * Placed after hero on Explore page
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
  CheckCircle2,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Feature item for the directory
function FeatureItem({ 
  icon: Icon, 
  title, 
  description, 
  color,
  delay = 0 
}: { 
  icon: React.ElementType;
  title: string; 
  description: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg",
        "bg-card/30 border border-border/30",
        "hover:bg-card/50 hover:border-current/20 transition-all",
        color
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h4 className="font-medium text-sm text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

// Stat badge
function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center px-4 py-2">
      <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}

export function SynergyDepotCTA() {
  // Synergy Pipeline highlights
  const synergyFeatures = [
    { icon: Brain, title: "Strategic Foresight", description: "Long-horizon scenario forecasting", color: "text-violet-500" },
    { icon: Shield, title: "Threat Anticipation", description: "Pre-zero-day defense intelligence", color: "text-amber-500" },
    { icon: TrendingUp, title: "Cost Arbitrage", description: "Autonomous price/performance optimization", color: "text-green-500" },
    { icon: Zap, title: "Self-Scaling Fabric", description: "Intelligence scales under load", color: "text-cyan-500" },
  ];

  // Capabilities Depot highlights
  const depotFeatures = [
    { icon: Layers, title: "86+ Artifacts", description: "Production-ready cognitive modules", color: "text-purple-500" },
    { icon: Shield, title: "Security Suite", description: "Threat prediction & compliance", color: "text-rose-500" },
    { icon: Sparkles, title: "Intelligence Pack", description: "Causal inference & pattern detection", color: "text-blue-500" },
    { icon: Workflow, title: "Automation Kit", description: "SLA monitoring & workflows", color: "text-emerald-500" },
  ];

  return (
    <section className="relative z-10 px-4 py-16 sm:py-24">
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
            Cognitive Marketplace
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Extend Your Substrate
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Discover pre-built synergy pipelines and downloadable capability artifacts. 
            Multi-module intelligence fusion and licensed cognitive tools for enterprise-grade AI systems.
          </p>
        </motion.div>

        {/* Two-Column CTA Grid */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Synergy Pipelines Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative"
          >
            <div className={cn(
              "h-full p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300",
              "bg-gradient-to-br from-violet-500/5 via-card/50 to-purple-500/5",
              "border-violet-500/20 hover:border-violet-500/40",
              "hover:shadow-xl hover:shadow-violet-500/10"
            )}>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Workflow className="w-6 h-6 text-violet-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    Synergy Pipelines
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    120 discovered multi-module cognitive fusion pipelines. 
                    S-tier intelligence for enterprise-grade autonomous systems.
                  </p>
                </div>
                <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20">
                  v7.5.0
                </Badge>
              </div>

              {/* Stats Row */}
              <div className="flex justify-around py-4 mb-6 rounded-xl bg-violet-500/5 border border-violet-500/10">
                <StatBadge value="120" label="Pipelines" />
                <StatBadge value="22" label="S-Tier" />
                <StatBadge value="98" label="Executors" />
              </div>

              {/* Feature Directory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {synergyFeatures.map((feature, idx) => (
                  <FeatureItem key={feature.title} {...feature} delay={idx * 0.05} />
                ))}
              </div>

              {/* CTA */}
              <Link to="/synergies">
                <Button className="w-full bg-violet-500 hover:bg-violet-600 text-white group/btn">
                  Explore Synergy Pipelines
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Capabilities Depot Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative"
          >
            <div className={cn(
              "h-full p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300",
              "bg-gradient-to-br from-emerald-500/5 via-card/50 to-cyan-500/5",
              "border-emerald-500/20 hover:border-emerald-500/40",
              "hover:shadow-xl hover:shadow-emerald-500/10"
            )}>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    Capabilities Depot
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Licensed cognitive artifacts for local execution. 
                    Download, deploy, and own your intelligence infrastructure.
                  </p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  v1.4.0
                </Badge>
              </div>

              {/* Stats Row */}
              <div className="flex justify-around py-4 mb-6 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <StatBadge value="86+" label="Artifacts" />
                <StatBadge value="7" label="Categories" />
                <StatBadge value="4" label="Tiers" />
              </div>

              {/* Feature Directory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {depotFeatures.map((feature, idx) => (
                  <FeatureItem key={feature.title} {...feature} delay={idx * 0.05} />
                ))}
              </div>

              {/* CTA */}
              <Link to="/capabilities">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white group/btn">
                  Browse Capabilities Depot
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom Element Directory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 sm:mt-12"
        >
          <div className="p-6 sm:p-8 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h4 className="text-lg font-semibold text-foreground mb-1">
                  What's the Difference?
                </h4>
                <p className="text-sm text-muted-foreground max-w-lg">
                  <strong className="text-violet-500">Synergy Pipelines</strong> are multi-module 
                  cognitive workflows that run within your substrate. <strong className="text-emerald-500">Capabilities</strong> are 
                  standalone artifacts you download and integrate into your own infrastructure.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/synergies">
                  <Button variant="outline" className="border-violet-500/30 text-violet-500 hover:bg-violet-500/10">
                    <Workflow className="w-4 h-4 mr-2" />
                    View Pipelines
                  </Button>
                </Link>
                <Link to="/capabilities">
                  <Button variant="outline" className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
                    <Package className="w-4 h-4 mr-2" />
                    View Artifacts
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Links Directory */}
            <div className="mt-6 pt-6 border-t border-border/30">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <Link to="/synergies" className="group">
                  <div className="p-3 rounded-lg hover:bg-violet-500/5 transition-colors">
                    <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-violet-500" />
                    <span className="text-xs text-muted-foreground group-hover:text-violet-500 transition-colors">
                      Intelligence Pipelines
                    </span>
                  </div>
                </Link>
                <Link to="/synergies" className="group">
                  <div className="p-3 rounded-lg hover:bg-amber-500/5 transition-colors">
                    <Shield className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                    <span className="text-xs text-muted-foreground group-hover:text-amber-500 transition-colors">
                      Security Synergies
                    </span>
                  </div>
                </Link>
                <Link to="/capabilities" className="group">
                  <div className="p-3 rounded-lg hover:bg-emerald-500/5 transition-colors">
                    <Layers className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                    <span className="text-xs text-muted-foreground group-hover:text-emerald-500 transition-colors">
                      Cognitive Artifacts
                    </span>
                  </div>
                </Link>
                <Link to="/capabilities" className="group">
                  <div className="p-3 rounded-lg hover:bg-cyan-500/5 transition-colors">
                    <Sparkles className="w-5 h-5 mx-auto mb-1 text-cyan-500" />
                    <span className="text-xs text-muted-foreground group-hover:text-cyan-500 transition-colors">
                      Premium Capabilities
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
