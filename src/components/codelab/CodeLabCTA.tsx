/**
 * CodeLab CTA — Cinematic promotional block for homepage
 * Premium glass card with animated background
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Package, Layers, Sparkles, Unlock, Zap, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tools = [
  { icon: Package, label: "Templates", count: "200+", href: "/explore", color: "from-cyan-500 to-blue-500" },
  { icon: Zap, label: "Capabilities", count: "525+", href: "/explore", color: "from-violet-500 to-purple-500" },
  { icon: Layers, label: "Documentation", count: "SDK", href: "/documentation", color: "from-amber-500 to-orange-500" },
  { icon: Brain, label: "Memory", count: "∞", href: "/persistent-memory", color: "from-primary to-primary-variant" },
];

export function CodeLabCTA() {
  return (
    <section className="relative z-10 px-4 py-12 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        <div className="relative rounded-3xl overflow-hidden border border-border/50">
          {/* Multi-layer background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-card to-violet-500/8" />
          <div 
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px), 
                linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
          
          {/* Glow orbs */}
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary/15 blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-violet-500/15 blur-[100px]" />
          
          <div className="relative p-5 sm:p-10 md:p-14 lg:p-16">
            <div className="grid lg:grid-cols-[1fr,auto] gap-10 items-center">
              {/* Left content */}
              <div className="text-center lg:text-left">
                <Badge variant="outline" className="mb-5 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 gap-1.5">
                  <Unlock className="w-3 h-3" />
                  Free Tier — No Account Required
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight leading-[1.1]">
                  Build apps that{" "}
                  <span 
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-purple)), hsl(var(--neon-cyan)))",
                      backgroundSize: "200% 200%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "gradientShift 4s ease-in-out infinite",
                    }}
                  >
                    dream & evolve
                  </span>
                </h2>
                
                <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                   Free SDK, 30 production templates, orchestration memories, and persistent memory — 
                   no paywall between you and shipping AI that remembers.
                 </p>
                
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <Button asChild size="lg" className="px-8 h-13 text-base font-bold gap-2.5 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]">
                    <Link to="/codelab">
                      <Sparkles className="w-5 h-5" />
                      Enter CodeLab
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2 h-13 text-base font-semibold">
                    <Link to="/upgrade">
                      <Code className="w-4 h-4" />
                      View Pricing
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Right: Tool cards */}
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {tools.map((tool, idx) => (
                  <Link key={tool.label} to={tool.href}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + idx * 0.08 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      className={cn(
                        "relative p-5 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm",
                        "hover:border-primary/30 hover:shadow-lg transition-all duration-300",
                        "flex flex-col items-center gap-2 text-center cursor-pointer"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                        tool.color
                      )}>
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-xl font-black text-foreground">{tool.count}</div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tool.label}</div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
