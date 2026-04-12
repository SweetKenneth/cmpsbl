/**
 * VerticalShowcase — displays the 12 industry vertical substrates
 */
import { motion } from "framer-motion";
import { 
  Shield, Landmark, Bot, Atom, Brain, Users, 
  Tv, Trophy, HeartPulse, Scale, Gamepad2, GraduationCap 
} from "lucide-react";

const VERTICALS = [
  { name: "Cybersecurity", icon: Shield, hue: "190 100% 50%", desc: "Threat detection, zero-trust, security orchestration" },
  { name: "Fintech", icon: Landmark, hue: "45 100% 50%", desc: "Payment rails, risk scoring, regulatory compliance" },
  { name: "Robotics", icon: Bot, hue: "200 80% 55%", desc: "Motion planning, sensor fusion, fleet management" },
  { name: "Quantum", icon: Atom, hue: "280 90% 60%", desc: "Circuit optimization, error correction, simulation" },
  { name: "LLM Ops", icon: Brain, hue: "160 80% 45%", desc: "Model routing, prompt governance, cost optimization" },
  { name: "Agency", icon: Users, hue: "220 80% 55%", desc: "Multi-agent coordination, task delegation, learning" },
  { name: "Media", icon: Tv, hue: "330 80% 55%", desc: "Content pipeline, audience analytics, distribution" },
  { name: "Ultimate", icon: Trophy, hue: "35 90% 50%", desc: "Full-spectrum access to all vertical capabilities" },
  { name: "Health", icon: HeartPulse, hue: "150 70% 45%", desc: "Clinical workflows, compliance, patient data security" },
  { name: "Legal", icon: Scale, hue: "230 40% 45%", desc: "Contract analysis, regulatory tracking, evidence chains" },
  { name: "Gaming", icon: Gamepad2, hue: "270 80% 60%", desc: "Game logic, matchmaking, anti-cheat, economy sim" },
  { name: "Education", icon: GraduationCap, hue: "175 70% 45%", desc: "Adaptive learning, assessment, curriculum generation" },
] as const;

export function VerticalShowcase({ compact = false }: { compact?: boolean }) {
  const items = compact ? VERTICALS.slice(0, 6) : VERTICALS;

  return (
    <div className={`grid ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"} gap-3`}>
      {items.map(({ name, icon: Icon, hue, desc }, i) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04, duration: 0.35 }}
          className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-2 hover:border-border/40 transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `hsl(${hue} / 0.12)` }}
            >
              <Icon className="w-4 h-4" style={{ color: `hsl(${hue})` }} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{name}</p>
            </div>
          </div>
          {!compact && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: `hsl(${hue})` }} />
            <span className="text-[9px] font-mono text-muted-foreground">40 Primitives · Live</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
