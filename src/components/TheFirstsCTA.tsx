import { useNavigate } from "react-router-dom";
import { Layers, ArrowRight, Sparkles, Shield, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function TheFirstsCTA() {
  const navigate = useNavigate();

  const pillars = [
    { icon: Brain, label: "Memory" },
    { icon: Sparkles, label: "Learning" },
    { icon: Shield, label: "Defense" },
  ];

  return (
    <section className="relative z-10 container mx-auto px-4 py-24">
      <motion.div 
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Category-Defining Infrastructure</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="text-foreground">
            The First Cognitive Orchestration Substrate
          </span>
        </h2>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          14 integrated modules. 120 synergy pipelines. Self-evolving architecture. 
          Not a wrapper—a foundational layer for production AI.
        </p>

        {/* Pillar badges */}
        <div className="flex justify-center gap-3 mb-10">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border/50"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + idx * 0.1 }}
            >
              <pillar.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">{pillar.label}</span>
            </motion.div>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/substrate')}
            className="group text-lg px-8 py-6"
          >
            <span className="relative z-10">Explore the Substrate</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/investors')}
            className="text-lg px-8 py-6"
          >
            Acquisition Inquiry
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
