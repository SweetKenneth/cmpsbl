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
  { icon: Gamepad2, label: "Gaming", color: "text-purple-500 bg-purple-500/10 border-purple-500/20", hoverGlow: "hover:shadow-purple-500/20" },
  { icon: Building2, label: "Enterprise", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", hoverGlow: "hover:shadow-blue-500/20" },
  { icon: Stethoscope, label: "Healthcare", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", hoverGlow: "hover:shadow-emerald-500/20" },
  { icon: Scale, label: "Legal", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", hoverGlow: "hover:shadow-amber-500/20" },
  { icon: GraduationCap, label: "Education", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20", hoverGlow: "hover:shadow-cyan-500/20" },
  { icon: ShoppingCart, label: "Retail", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", hoverGlow: "hover:shadow-rose-500/20" },
  { icon: Phone, label: "Support", color: "text-violet-500 bg-violet-500/10 border-violet-500/20", hoverGlow: "hover:shadow-violet-500/20" },
  { icon: Factory, label: "Manufacturing", color: "text-orange-500 bg-orange-500/10 border-orange-500/20", hoverGlow: "hover:shadow-orange-500/20" },
  { icon: Plane, label: "Aviation", color: "text-sky-500 bg-sky-500/10 border-sky-500/20", hoverGlow: "hover:shadow-sky-500/20" },
  { icon: Car, label: "Automotive", color: "text-red-500 bg-red-500/10 border-red-500/20", hoverGlow: "hover:shadow-red-500/20" },
  { icon: Home, label: "Real Estate", color: "text-teal-500 bg-teal-500/10 border-teal-500/20", hoverGlow: "hover:shadow-teal-500/20" },
  { icon: Utensils, label: "Hospitality", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", hoverGlow: "hover:shadow-yellow-500/20" },
  { icon: Music, label: "Music", color: "text-pink-500 bg-pink-500/10 border-pink-500/20", hoverGlow: "hover:shadow-pink-500/20" },
  { icon: Film, label: "Media", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20", hoverGlow: "hover:shadow-indigo-500/20" },
  { icon: Dumbbell, label: "Fitness", color: "text-lime-500 bg-lime-500/10 border-lime-500/20", hoverGlow: "hover:shadow-lime-500/20" },
  { icon: Landmark, label: "Government", color: "text-slate-400 bg-slate-500/10 border-slate-500/20", hoverGlow: "hover:shadow-slate-500/20" },
  { icon: Truck, label: "Logistics", color: "text-amber-600 bg-amber-600/10 border-amber-600/20", hoverGlow: "hover:shadow-amber-600/20" },
  { icon: Leaf, label: "Agriculture", color: "text-green-600 bg-green-600/10 border-green-600/20", hoverGlow: "hover:shadow-green-600/20" },
  { icon: Shield, label: "Security", color: "text-red-600 bg-red-600/10 border-red-600/20", hoverGlow: "hover:shadow-red-600/20" },
  { icon: Wallet, label: "Finance", color: "text-emerald-600 bg-emerald-600/10 border-emerald-600/20", hoverGlow: "hover:shadow-emerald-600/20" },
  { icon: Brain, label: "Research", color: "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20", hoverGlow: "hover:shadow-fuchsia-500/20" },
  { icon: Bot, label: "Robotics", color: "text-cyan-600 bg-cyan-600/10 border-cyan-600/20", hoverGlow: "hover:shadow-cyan-600/20" },
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
          "hover:shadow-lg",
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
    <section className="relative py-16 sm:py-24 px-4 overflow-hidden bg-muted/20">
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
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-xs font-medium">Universal Infrastructure</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            One Substrate,{" "}
            <span 
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-purple)), hsl(var(--neon-magenta)))",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradientShift 4s ease-in-out infinite",
              }}
            >
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
            className="gap-2 h-12 px-8 font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
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
