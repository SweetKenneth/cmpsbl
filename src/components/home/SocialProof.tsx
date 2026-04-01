/**
 * Social Proof / Testimonials
 * Color palette: Cyan / Purple / Magenta (matching CMPSBL hero gradient)
 */

import { motion } from 'framer-motion';
import { Quote, Star, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
  highlight: string;
  accentColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Building on the substrate changed everything. Our agents adapt in real time, and issues resolve before we even notice them. We just build — the system handles the rest.",
    author: "M.K.",
    role: "Platform Engineer",
    rating: 5,
    highlight: "EVOLUTION Layer",
    accentColor: "hsl(var(--neon-purple))",
  },
  {
    quote: "Persistent memory and governed evolution gave us something we couldn't build ourselves — a system that remembers, adapts, and stays compliant. Every action is auditable.",
    author: "R.S.",
    role: "CTO, Enterprise SaaS",
    rating: 5,
    highlight: "GOVERNANCE Layer",
    accentColor: "hsl(var(--neon-magenta))",
  },
];

export function SocialProof() {
  return (
    <section className="relative z-10 py-14 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <Badge variant="outline" className="mb-4 gap-1.5 border-[hsl(var(--neon-cyan)/0.3)] px-4 py-1.5">
            <Users className="w-3 h-3 text-[hsl(var(--neon-cyan))]" />
            <span className="text-xs font-semibold">Builders on the Substrate</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            What Teams Are{" "}
            <span className="text-[hsl(var(--neon-cyan))]">Building</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Teams using the substrate and Memory Stream to build intelligence that compounds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.highlight}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative p-5 sm:p-7 rounded-2xl bg-[hsl(var(--stream-slate))] backdrop-blur-sm border border-border/50 hover:border-[hsl(var(--neon-purple)/0.3)] hover:shadow-xl hover:shadow-[hsl(var(--neon-purple)/0.05)] transition-all duration-500 group shimmer-on-hover glass-edge card-lift testimonial-border"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl overflow-hidden">
                <div className="h-full memory-stream-bar opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              </div>
              
              <Quote className="w-8 h-8 text-[hsl(var(--neon-purple)/0.1)] absolute top-4 right-4 quote-glow transition-colors duration-500 group-hover:text-[hsl(var(--neon-purple)/0.2)]" />
              
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border mb-4 text-xs font-semibold uppercase tracking-wider group-hover:border-opacity-50 transition-all duration-300"
                style={{
                  backgroundColor: `color-mix(in srgb, ${t.accentColor} 8%, transparent)`,
                  borderColor: `color-mix(in srgb, ${t.accentColor} 25%, transparent)`,
                  color: t.accentColor,
                }}
              >
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: t.accentColor }} />
                {t.highlight}
              </div>
              
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-[hsl(var(--neon-cyan))] text-[hsl(var(--neon-cyan))] group-hover:drop-shadow-[0_0_4px_hsl(var(--neon-cyan)/0.5)] transition-all duration-500" style={{ transitionDelay: `${j * 60}ms` }} />
                ))}
              </div>
              <p className="text-sm text-foreground/90 mb-5 leading-relaxed italic">"{t.quote}"</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border/30">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--neon-purple)/0.2)] to-[hsl(var(--neon-cyan)/0.1)] flex items-center justify-center text-[10px] font-bold text-[hsl(var(--neon-purple))]">{t.author.charAt(0)}</div>
                <div>
                  <span className="font-semibold text-foreground block leading-tight">{t.author}</span>
                  {t.role && <span className="text-[11px] text-muted-foreground/60">{t.role}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}