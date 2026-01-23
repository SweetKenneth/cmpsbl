/**
 * Built For Section — Shows who CMPSBL is designed for
 * Gaming, Developers, Enterprise with clear CTAs
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Gamepad2,
  Code,
  Building2,
  Brain,
  Moon,
  Zap,
  Shield,
  MessageSquare,
  Eye,
  Terminal,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const audiences = [
  {
    icon: Gamepad2,
    badge: "For Game Devs",
    title: "NPCs That Dream",
    description: "Give your NPCs persistent memory, emotional evolution, and the ability to learn from every player interaction. They remember. They grow.",
    features: [
      { icon: Brain, text: "3-tier NPC memory" },
      { icon: Moon, text: "Dream cycles for learning" },
      { icon: MessageSquare, text: "Context-aware dialogue" },
    ],
    cta: "Build Game AI",
    href: "/gaming",
    color: "text-purple-500",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    icon: Code,
    badge: "For Developers",
    title: "Apps That Think",
    description: "Add persistent memory, intelligent routing, and self-improvement to any application. 70+ templates. Full SDK. Production-ready.",
    features: [
      { icon: Zap, text: "Multi-provider routing" },
      { icon: Brain, text: "Memory persistence" },
      { icon: Eye, text: "Full observability" },
    ],
    cta: "Start Coding",
    href: "/developers",
    color: "text-cyan-500",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Building2,
    badge: "For Enterprise",
    title: "Operations That Learn",
    description: "Workflow memory, decision support, audit trails, and governance built-in. Deploy on your infrastructure with full control.",
    features: [
      { icon: Shield, text: "Security & compliance" },
      { icon: Brain, text: "Institutional memory" },
      { icon: Eye, text: "Audit everything" },
    ],
    cta: "Enterprise Solutions",
    href: "/use-cases",
    color: "text-amber-500",
    gradient: "from-amber-500 to-orange-600",
  },
];

function AudienceCard({ audience, index }: { audience: typeof audiences[0]; index: number }) {
  const Icon = audience.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="h-full"
    >
      <Card className={cn(
        "h-full border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden",
        "hover:border-current/30 transition-all duration-500 group",
        audience.color
      )}>
        <CardContent className="p-6 sm:p-8 h-full flex flex-col">
          {/* Badge */}
          <Badge 
            variant="outline" 
            className="w-fit mb-4 text-current border-current/30"
          >
            <Icon className="w-3 h-3 mr-1" />
            {audience.badge}
          </Badge>
          
          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 group-hover:text-current transition-colors">
            {audience.title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6 flex-grow">
            {audience.description}
          </p>
          
          {/* Features */}
          <div className="space-y-2 mb-6">
            {audience.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <feature.icon className="w-4 h-4 text-current opacity-70" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <Button asChild className={cn(
            "w-full gap-2 bg-gradient-to-r text-white border-0",
            audience.gradient
          )}>
            <Link to={audience.href}>
              {audience.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function BuiltForSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <Badge variant="outline" className="mb-4">Built For You</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Choose Your Path
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            The same cognitive infrastructure adapts to your use case. 
            Pre-configured packages for gaming, development, and enterprise.
          </p>
        </motion.div>
        
        {/* Audience Cards */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {audiences.map((audience, idx) => (
            <AudienceCard key={audience.title} audience={audience} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
