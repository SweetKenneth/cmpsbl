/**
 * CodeLab CTA — Promotional block for homepage
 * Updated with links to all free resources
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code, ArrowRight, Brain, Package, Layers, Sparkles, Unlock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CodeLabCTA() {
  return (
    <section className="relative z-10 px-4 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto"
      >
        <div className="relative p-6 sm:p-8 md:p-12 lg:p-16 rounded-3xl overflow-hidden border border-primary/20">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-cyan-500/5 to-violet-500/10" />
          
          {/* Static glow */}
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-[100px] animate-hero-glow-pulse"
          />
          <div
            className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyan-500/20 blur-[100px] animate-hero-glow-pulse"
            style={{ animationDelay: '2s' }}
          />
          
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Text content */}
            <div className="flex-1 text-center lg:text-left">
              <Badge variant="outline" className="mb-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Unlock className="w-3 h-3 mr-1" />
                All Free
              </Badge>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground leading-tight">
                Build apps that dream, remember, self-reflect, and defend themselves.
              </h2>
              
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 max-w-xl mx-auto lg:mx-0">
                Free SDK, 92+ templates, 269 capabilities, 147 pipelines — all unlocked.
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to="/codelab">
                  <Button 
                    size="lg" 
                    className="px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 transition-opacity"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    Enter CodeLab
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
                <Link to="/engines">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Code className="w-4 h-4" />
                    View Engines
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Feature icons - now link to free resources */}
            <div className="flex lg:flex-col gap-4 lg:gap-6 shrink-0">
              {[
                { icon: Package, label: "Templates", color: "text-cyan-500 bg-cyan-500/10", href: "/marketplace" },
                { icon: Zap, label: "Capabilities", color: "text-violet-500 bg-violet-500/10", href: "/capabilities" },
                { icon: Layers, label: "Pipelines", color: "text-amber-500 bg-amber-500/10", href: "/synergies" },
                { icon: Brain, label: "Memory", color: "text-primary bg-primary/10", href: "/persistent-memory" },
              ].map((item) => (
                <Link key={item.label} to={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center gap-1 ${item.color} cursor-pointer`}
                  >
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
