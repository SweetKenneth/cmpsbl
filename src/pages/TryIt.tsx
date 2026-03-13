/**
 * Try It — No-signup interactive demo page
 */
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { TryItChat } from "@/components/demo/TryItChat";
import { InteractivePlayground } from "@/components/developer/InteractivePlayground";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Zap, Brain, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Zap, label: "NEXUS Routing", desc: "Auto-selects the optimal AI provider per query" },
  { icon: Brain, label: "Persistent Memory", desc: "Remembers context across the conversation" },
  { icon: Shield, label: "No Signup", desc: "Zero authentication required to demo" },
];

export default function TryIt() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Try CMPSBL — Live AI Demo"
        description="Talk to the CMPSBL substrate live. No signup required. Experience NEXUS routing, persistent memory, and cognitive infrastructure in action."
        keywords={["AI demo", "try CMPSBL", "NEXUS routing demo", "persistent memory demo"]}
      />
      <PublicNav />

      <main className="container mx-auto max-w-5xl px-4 pt-24 pb-20">
        {/* ─── Hero ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold">Live Demo</span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            Try CMPSBL
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
            No signup. No API key. Talk to the substrate and watch it remember.
          </p>
        </motion.div>

        {/* ─── Feature pills ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm"
            >
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">{label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ─── Demo grid ─── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <TryItChat className="h-full" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <InteractivePlayground />
          </motion.div>
        </div>

        {/* ─── CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Ready to build with persistent memory and intelligent routing?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="gap-2 min-h-[44px]">
              <Link to="/auth">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2 min-h-[44px]">
              <Link to="/architecture">
                Explore Architecture
              </Link>
            </Button>
          </div>
        </motion.div>
      </main>

      <RelatedCapabilities />
      <EnhancedFooter />
    </div>
  );
}
