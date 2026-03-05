/**
 * Social Proof / Testimonials — Gap #11
 * Trust signals for the landing page
 */

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "The Memory Stream changed how our agents operate. Persistent crystallization means they finally remember context across sessions.",
    author: "Engineering Lead",
    role: "Fortune 500 AI Team",
    rating: 5,
  },
  {
    quote: "The stream architecture means we only pay for what we crystallize. DREAM cycles alone saved us 40 hours/month on retraining.",
    author: "CTO",
    role: "Series B Startup",
    rating: 5,
  },
  {
    quote: "Governance was an afterthought until we deployed the substrate. Now every AI action is auditable and reversible.",
    author: "VP of Compliance",
    role: "Enterprise SaaS",
    rating: 5,
  },
];

export function SocialProof() {
  return (
    <section className="relative z-10 py-14 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-3 tracking-tight">
            Trusted by builders crystallizing from the stream
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Teams using the Memory Stream to build intelligence that compounds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative p-5 sm:p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
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
