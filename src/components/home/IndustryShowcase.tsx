/**
 * Industry Showcase — Compact 2-column grid of industry chips
 * Mobile-first design with many industries visible
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
}

const industries: IndustryChip[] = [
  { icon: Gamepad2, label: "Gaming", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  { icon: Building2, label: "Enterprise", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { icon: Stethoscope, label: "Healthcare", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { icon: Scale, label: "Legal", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { icon: GraduationCap, label: "Education", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  { icon: ShoppingCart, label: "Retail", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  { icon: Phone, label: "Support", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  { icon: Factory, label: "Manufacturing", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  { icon: Plane, label: "Aviation", color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
  { icon: Car, label: "Automotive", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { icon: Home, label: "Real Estate", color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
  { icon: Utensils, label: "Food & Dining", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  { icon: Music, label: "Music & Audio", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
  { icon: Film, label: "Film & Media", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
  { icon: Dumbbell, label: "Fitness", color: "text-lime-500 bg-lime-500/10 border-lime-500/20" },
  { icon: Landmark, label: "Government", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
  { icon: Truck, label: "Logistics", color: "text-amber-600 bg-amber-600/10 border-amber-600/20" },
  { icon: Leaf, label: "Agriculture", color: "text-green-600 bg-green-600/10 border-green-600/20" },
  { icon: Shield, label: "Security", color: "text-red-600 bg-red-600/10 border-red-600/20" },
  { icon: Wallet, label: "Finance", color: "text-emerald-600 bg-emerald-600/10 border-emerald-600/20" },
  { icon: Brain, label: "Research", color: "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20" },
  { icon: Bot, label: "Robotics", color: "text-cyan-600 bg-cyan-600/10 border-cyan-600/20" },
];

function IndustryChipCard({ chip, delay }: { chip: IndustryChip; delay: number }) {
  const Icon = chip.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay, duration: 0.3 }}
    >
      <Link
        to="/use-cases"
        className={cn(
          "group flex items-center gap-2 p-3 rounded-xl border",
          "hover:scale-[1.02] hover:shadow-md transition-all duration-200",
          chip.color
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-foreground truncate">
          {chip.label}
        </span>
      </Link>
    </motion.div>
  );
}

export function IndustryShowcase() {
  return (
    <section className="relative py-16 sm:py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="mb-4 gap-1.5 px-4 py-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs">Universal Infrastructure</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            One CMPSBL,{" "}
            <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-600 bg-clip-text text-transparent">
              Every Industry
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Memory and dream cycles adapt to any domain—from game NPCs to enterprise automation.
          </p>
        </motion.div>
        
        {/* 2-Column Compact Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 mb-10">
          {industries.map((chip, idx) => (
            <IndustryChipCard 
              key={chip.label} 
              chip={chip} 
              delay={idx * 0.03} 
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
            className="gap-2 h-11 px-6"
          >
            <Link to="/use-cases">
              Explore All Use Cases
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
