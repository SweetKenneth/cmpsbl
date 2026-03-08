/**
 * Try It — No-signup interactive demo page
 */
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { TryItChat } from "@/components/demo/TryItChat";
import { InteractivePlayground } from "@/components/developer/InteractivePlayground";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain } from "lucide-react";
import { motion } from "framer-motion";

export default function TryIt() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Try CMPSBL — Live AI Demo"
        description="Talk to the CMPSBL substrate live. No signup required. Experience NEXUS routing, persistent memory, and cognitive infrastructure in action."
        keywords={["AI demo", "try CMPSBL", "NEXUS routing demo", "persistent memory demo"]}
      />
      <PublicNav />

      <main className="container mx-auto max-w-5xl px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold">Live Demo</span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Try CMPSBL</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            No signup. No API key. Talk to the substrate and watch it remember.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <TryItChat className="h-full" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <InteractivePlayground />
          </motion.div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
