/**
 * Social Proof / Testimonials
 * Balanced: Building on substrate + Memory Stream output
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
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "We plugged DREAM cycles into our agent fleet and within a week they were surfacing patterns we'd never have found manually. The substrate does the thinking while we sleep.",
    author: "J.L.",
    role: "",
    rating: 5,
    highlight: "DREAM Cycles",
  },
  {
    quote: "Building on the substrate changed everything. Our agents adapt their routing in real-time, and EVOLUTION auto-patches drift before we even notice it. We just build — the substrate handles the rest.",
    author: "M.K.",
    role: "",
    rating: 5,
    highlight: "EVOLUTION",
  },
  {
    quote: "Persistent memory and governed evolution gave us what we couldn't build ourselves — an AI system that remembers, adapts, and stays compliant. Every action is auditable.",
    author: "R.S.",
    role: "",
    rating: 5,
    highlight: "Governance",
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
          <div className="relative inline-block">
            <span className="section-ordinal absolute -top-10 left-1/2 -translate-x-1/2 hidden sm:block" aria-hidden="true">06</span>
          </div>
          <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold">Builders on the Substrate</span>
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-3 tracking-tight">
            What Teams Are{" "}
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-purple)))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Building
            </span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Teams using the substrate and Memory Stream to build intelligence that compounds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.highlight}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative p-5 sm:p-7 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group shimmer-on-hover glass-edge card-lift testimonial-border"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl overflow-hidden">
                <div className="h-full memory-stream-bar opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              </div>
              
              <Quote className="w-8 h-8 text-primary/10 absolute top-4 right-4 quote-glow transition-colors duration-500 group-hover:text-primary/20" />
              
              {/* Feature pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/15 mb-4 text-[10px] font-semibold text-primary uppercase tracking-wider group-hover:bg-primary/10 group-hover:border-primary/25 transition-all duration-300">
                <span className="w-1 h-1 rounded-full bg-primary/50" />
                {t.highlight}
              </div>
              
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary group-hover:drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)] transition-all duration-500" style={{ transitionDelay: `${j * 60}ms` }} />
                ))}
              </div>
              <p className="text-sm text-foreground/90 mb-5 leading-relaxed italic">"{t.quote}"</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border/30">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[10px] font-bold text-primary">{t.author.charAt(0)}</div>
                <div>
                  <span className="font-semibold text-foreground block leading-tight">{t.author}</span>
                  <span className="text-[11px] text-muted-foreground/60">{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
