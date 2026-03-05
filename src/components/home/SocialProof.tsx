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
    author: "Engineering Lead",
    role: "Fortune 500 AI Team",
    rating: 5,
    highlight: "DREAM Cycles",
  },
  {
    quote: "Building on the substrate changed everything. Our agents adapt their routing in real-time, and EVOLUTION auto-patches drift before we even notice it. We just build — the substrate handles the rest.",
    author: "CTO",
    role: "Series B Startup",
    rating: 5,
    highlight: "EVOLUTION",
  },
  {
    quote: "Persistent memory and governed evolution gave us what we couldn't build ourselves — an AI system that remembers, adapts, and stays compliant. Every action is auditable.",
    author: "VP of Compliance",
    role: "Enterprise SaaS",
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
          <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold">Builders on the Substrate</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-3 tracking-tight">
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
              className="relative p-5 sm:p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 group shimmer-on-hover glass-edge"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <Quote className="w-8 h-8 text-primary/15 absolute top-4 right-4 group-hover:text-primary/25 transition-colors duration-500" />
              
              {/* Feature pill */}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/15 mb-3 text-[10px] font-semibold text-primary uppercase tracking-wider">
                {t.highlight}
              </div>
              
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary group-hover:drop-shadow-[0_0_3px_hsl(var(--primary)/0.4)] transition-all duration-500" style={{ transitionDelay: `${j * 50}ms` }} />
                ))}
              </div>
              <p className="text-sm text-foreground mb-4 leading-relaxed">"{t.quote}"</p>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t.author}</span> · {t.role}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
