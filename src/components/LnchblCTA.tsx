import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Rocket, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function LnchblCTA() {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 px-4 py-8 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/5">
          {/* Animated gradient border glow */}
          <div className="absolute inset-0 rounded-3xl opacity-60 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), transparent 40%, hsl(var(--neon-purple) / 0.1) 60%, transparent)",
            }}
          />
          
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-neon-purple to-primary" />
          
          {/* Glow orbs */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-neon-purple/10 blur-[80px] pointer-events-none" />
          
          <div className="relative p-5 sm:p-10 md:p-12">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-green/15 border border-neon-green/25 mb-6"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold tracking-wide text-primary">Available Now</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
              <span className="text-foreground">Deploy On </span>
              <span 
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-purple)), hsl(var(--primary)))",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "gradientShift 4s ease-in-out infinite",
                }}
              >
                Your Infrastructure
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
               The same cognitive runtime powering this substrate — deployable on your own servers.
               Persistent memory, NEXUS routing, and governed orchestration. Minutes to production.
             </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { icon: Rocket, text: "Full Substrate", color: "text-primary" },
                { icon: Download, text: "Free Download", color: "text-neon-green" },
                { icon: Sparkles, text: "Persistent Memory Included", color: "text-neon-purple" },
              ].map((pill) => (
                <div key={pill.text} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted/40 border border-border/50">
                  <pill.icon className={cn("w-4 h-4", pill.color)} />
                  <span className="text-sm font-medium text-foreground">{pill.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/lnchbl")}
                className="group text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14"
              >
                <Download className="w-5 h-5 mr-2" />
                Download LNCHBL
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/docs/lnchbl-setup")}
                className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14"
              >
                Setup Guide
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              No account required • Full substrate • Persistent memory in minutes • Powered by LNCHBL
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
