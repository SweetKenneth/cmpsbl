/**
 * Industry Showcase — Premium chip grid with hover effects
 * Mobile-first design with industry icons
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Gamepad2,
  Building2,
  Stethoscope,
  Scale,
  GraduationCap,
  ShoppingCart,
  Phone,
  Factory,
  Sparkles,
  Plane,
  Car,
  Home,
  Utensils,
  Music,
  Film,
  Dumbbell,
  Landmark,
  Truck,
  Leaf,
  Shield,
  Wallet,
  Brain,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IndustryChip {
  icon: React.ElementType;
  label: string;
  color: string;
  hoverGlow: string;
}

const industries: IndustryChip[] = [
  { icon: Gamepad2, label: "Gaming", color: "text-[hsl(var(--neon-purple))] bg-[hsl(var(--neon-purple))]/10 border-[hsl(var(--neon-purple))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-purple))]/20" },
  { icon: Building2, label: "Enterprise", color: "text-primary bg-primary/10 border-primary/20", hoverGlow: "hover:shadow-primary/20" },
  { icon: Stethoscope, label: "Healthcare", color: "text-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan))]/10 border-[hsl(var(--neon-cyan))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-cyan))]/20" },
  { icon: Scale, label: "Legal", color: "text-[hsl(var(--neon-magenta))] bg-[hsl(var(--neon-magenta))]/10 border-[hsl(var(--neon-magenta))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-magenta))]/20" },
  { icon: GraduationCap, label: "Education", color: "text-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan))]/10 border-[hsl(var(--neon-cyan))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-cyan))]/20" },
  { icon: ShoppingCart, label: "Retail", color: "text-[hsl(var(--neon-magenta))] bg-[hsl(var(--neon-magenta))]/10 border-[hsl(var(--neon-magenta))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-magenta))]/20" },
  { icon: Phone, label: "Support", color: "text-[hsl(var(--neon-purple))] bg-[hsl(var(--neon-purple))]/10 border-[hsl(var(--neon-purple))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-purple))]/20" },
  { icon: Factory, label: "Manufacturing", color: "text-primary bg-primary/10 border-primary/20", hoverGlow: "hover:shadow-primary/20" },
  { icon: Plane, label: "Aviation", color: "text-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan))]/10 border-[hsl(var(--neon-cyan))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-cyan))]/20" },
  { icon: Car, label: "Automotive", color: "text-[hsl(var(--neon-magenta))] bg-[hsl(var(--neon-magenta))]/10 border-[hsl(var(--neon-magenta))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-magenta))]/20" },
  { icon: Home, label: "Real Estate", color: "text-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan))]/10 border-[hsl(var(--neon-cyan))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-cyan))]/20" },
  { icon: Utensils, label: "Hospitality", color: "text-primary bg-primary/10 border-primary/20", hoverGlow: "hover:shadow-primary/20" },
  { icon: Music, label: "Music", color: "text-[hsl(var(--neon-magenta))] bg-[hsl(var(--neon-magenta))]/10 border-[hsl(var(--neon-magenta))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-magenta))]/20" },
  { icon: Film, label: "Media", color: "text-[hsl(var(--neon-purple))] bg-[hsl(var(--neon-purple))]/10 border-[hsl(var(--neon-purple))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-purple))]/20" },
  { icon: Dumbbell, label: "Fitness", color: "text-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan))]/10 border-[hsl(var(--neon-cyan))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-cyan))]/20" },
  { icon: Landmark, label: "Government", color: "text-muted-foreground bg-muted/30 border-border/30", hoverGlow: "hover:shadow-muted/20" },
  { icon: Truck, label: "Logistics", color: "text-primary bg-primary/10 border-primary/20", hoverGlow: "hover:shadow-primary/20" },
  { icon: Leaf, label: "Agriculture", color: "text-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan))]/10 border-[hsl(var(--neon-cyan))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-cyan))]/20" },
  { icon: Shield, label: "Security", color: "text-[hsl(var(--neon-magenta))] bg-[hsl(var(--neon-magenta))]/10 border-[hsl(var(--neon-magenta))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-magenta))]/20" },
  { icon: Wallet, label: "Finance", color: "text-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan))]/10 border-[hsl(var(--neon-cyan))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-cyan))]/20" },
  { icon: Brain, label: "Research", color: "text-[hsl(var(--neon-purple))] bg-[hsl(var(--neon-purple))]/10 border-[hsl(var(--neon-purple))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-purple))]/20" },
  { icon: Bot, label: "Robotics", color: "text-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan))]/10 border-[hsl(var(--neon-cyan))]/20", hoverGlow: "hover:shadow-[hsl(var(--neon-cyan))]/20" },
];

function IndustryChipCard({ chip, delay }: { chip: IndustryChip; delay: number }) {
  const Icon = chip.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.03, y: -2 }}
    >
      <Link
        to="/use-cases"
        className={cn(
          "group relative flex items-center gap-2.5 p-3 sm:p-3.5 rounded-xl border",
          "backdrop-blur-sm transition-all duration-300",
          "hover:shadow-lg shimmer-on-hover card-lift",
          chip.color,
          chip.hoverGlow
        )}
      >
        <motion.div 
          className="w-9 h-9 rounded-lg bg-current/15 flex items-center justify-center shrink-0"
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-4 h-4" />
        </motion.div>
        <span className="text-sm font-medium text-foreground truncate">
          {chip.label}
        </span>
        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-200" />
      </Link>
    </motion.div>
  );
}

export function IndustryShowcase() {
  return (
    <section className="relative py-16 sm:py-24 px-4 overflow-hidden bg-gradient-to-b from-muted/10 via-muted/20 to-muted/10">
      {/* Background effects — CSS-only for mobile perf */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px] animate-hero-orb-1"
        />
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="relative inline-block">
            <span className="section-ordinal absolute -top-10 left-1/2 -translate-x-1/2 hidden sm:block" aria-hidden="true">08</span>
          </div>
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-xs font-semibold">Universal Infrastructure</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            One Substrate,{" "}
            <span className="text-[hsl(var(--neon-purple))]">
              Every Industry
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Build on the substrate with persistent memory, DREAM cycles, and the Memory Stream's self-optimization —
            crystallizing intelligence for any vertical, from immersive games to mission-critical enterprise systems.
          </p>
        </motion.div>
        
        {/* Chip Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3 mb-10 sm:mb-12">
          {industries.map((chip, idx) => (
            <IndustryChipCard 
              key={chip.label} 
              chip={chip} 
              delay={idx * 0.02} 
            />
          ))}
        </div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button 
            asChild 
            size="lg" 
            className="gap-2 h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Link to="/use-cases">
              Explore All Use Cases
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
