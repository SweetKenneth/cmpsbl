/**
 * Architecture — Single responsive component, all content on all viewports
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
import { cn } from "@/lib/utils";
import { TAXONOMY, TOTAL, ASCII_DIAGRAM } from "@/components/architecture/architectureData";

const FLOW_STEPS = [
  { step: '01', title: 'User sends a request', desc: 'The DECODE Agent interprets the intent and plans the execution.' },
  { step: '02', title: 'Agents invoke Engines', desc: 'BRAIN Organ reasons, CORTEX Agent orchestrates, MEMORY Organ retrieves — Engines do the heavy processing.' },
  { step: '03', title: 'Layers validate everything', desc: 'DEFENSE Layer checks for threats, GOVERNANCE Layer enforces policy, IMMUNITY Layer ensures resilience.' },
  { step: '04', title: 'Organs route & persist', desc: 'CORE Organ orchestrates lifecycle, NERVE Organ signals, AUDIT Agent logs, RELAY Organ dispatches — all invisible.' },
];

export default function ArchitecturePage() {
  return (
    <>
      <SEO
        title="Architecture — Agents, Engines, Layers & Organs | CMPSBL"
        description="Explore the complete 40-component substrate architecture organized into 4 categories: Agents that decide, Engines that process, Layers that protect, and Organs that power everything."
        image="https://cmpsbl.com/og/systems.jpg"
        keywords={['AI substrate architecture', 'cognitive agents', 'AI engines', 'composable AI', 'AI operating system']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Architecture', url: 'https://cmpsbl.com/architecture' },
        ]}
      />
      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-12 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="hidden md:block absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

          <div className="px-4 md:container md:mx-auto md:max-w-5xl md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 text-[10px] md:text-xs font-mono tracking-widest uppercase text-muted-foreground mb-3 md:mb-4 border border-border rounded-full px-3 md:px-4 py-1 md:py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {TOTAL} Components · 4 Categories
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-3 md:mb-4">
                <span className="text-foreground">Substrate</span>{' '}
                <span className="text-primary">Architecture</span>
              </h1>

              <p className="text-sm md:text-lg text-muted-foreground max-w-sm md:max-w-2xl mx-auto leading-relaxed mb-5 md:mb-8">
                {TOTAL} autonomous components organized into four categories:
                Agents that <em>decide</em>, Engines that <em>process</em>,
                Layers that <em>protect</em>, and Organs that <em>power everything</em>.
              </p>

              {/* Category pills — horizontal scroll on mobile, wrap on desktop */}
              <div className="flex items-center gap-2 overflow-x-auto md:overflow-visible scrollbar-hide md:flex-wrap md:justify-center -mx-4 px-4 md:mx-0 md:px-0 pb-1 md:pb-0">
                {TAXONOMY.map((cat, i) => (
                  <motion.a
                    key={cat.key}
                    href={`#${cat.key}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.3 }}
                    className={cn(
                      "text-[10px] md:text-xs font-mono px-3 py-1.5 rounded-full border shrink-0 active:scale-95 md:hover:bg-primary/10 md:hover:border-primary/30 transition-all",
                      cat.badgeColor
                    )}
                  >
                    {cat.entries.length} {cat.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ASCII Diagram — hidden on small screens, visible on md+ */}
        <section className="hidden md:block border-y border-border bg-muted/20">
          <div className="container mx-auto max-w-4xl px-6 py-8">
            <h2 className="text-sm font-mono font-bold text-muted-foreground mb-4 uppercase tracking-widest">System Topology</h2>
            <pre className="text-xs font-mono text-foreground/80 leading-relaxed whitespace-pre overflow-x-auto">
              {ASCII_DIAGRAM}
            </pre>
          </div>
        </section>

        {/* All Categories — responsive grid */}
        <div className="px-4 md:container md:mx-auto md:max-w-6xl md:px-6 py-8 md:py-12">
          <div className="space-y-12 md:space-y-16">
            {TAXONOMY.map((cat, catIdx) => (
              <motion.section
                key={cat.key}
                id={cat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: catIdx * 0.05 }}
              >
                {/* Category Header */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                    <span className={cn(
                      "text-[9px] md:text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-widest",
                      cat.badgeColor
                    )}>
                      {cat.key}
                    </span>
                    <h2 className={cn(
                      "text-xl md:text-2xl lg:text-3xl font-bold",
                      cat.textColor === 'text-muted-foreground' ? 'text-foreground' : cat.textColor
                    )}>
                      {cat.label}
                    </h2>
                    <span className="text-[10px] md:text-xs font-mono text-muted-foreground">{cat.entries.length} components</span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {cat.subtitle} — {cat.description}
                  </p>
                  <p className="hidden md:block text-xs text-muted-foreground/60 italic mt-1">{cat.philosophy}</p>
                </div>

                {/* Entry Cards — 1 col mobile, responsive multi-col desktop */}
                <div className={cn(
                  "grid gap-2 md:gap-3",
                  "grid-cols-1",
                  cat.entries.length <= 3 ? "md:grid-cols-2 lg:grid-cols-3" :
                  cat.entries.length <= 8 ? "md:grid-cols-2 lg:grid-cols-4" :
                  "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                )}>
                  {cat.entries.map((entry) => (
                    <Link
                      key={entry.id}
                      to={`/modules/${entry.slug}`}
                      className={cn(
                        "group relative flex items-center md:items-start gap-3 p-3.5 md:p-4 rounded-lg border",
                        "active:scale-[0.98] md:active:scale-100 md:hover:shadow-lg md:hover:-translate-y-0.5",
                        "transition-all duration-300",
                        cat.color, cat.borderColor, "md:hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        "bg-background/50 md:group-hover:bg-primary/10 transition-colors"
                      )}>
                        <entry.icon className={cn(
                          "w-4 h-4 transition-colors",
                          cat.textColor === 'text-muted-foreground' ? 'text-foreground/60' : cat.textColor,
                          "md:group-hover:text-primary"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-foreground">{entry.label}</h3>
                          <span className={cn(
                            "text-[10px] md:text-xs opacity-70 font-medium",
                            cat.textColor === 'text-muted-foreground' ? 'text-foreground/50' : cat.textColor
                          )}>
                            {entry.tagline}
                          </span>
                        </div>
                        <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-1 md:line-clamp-2 leading-relaxed">{entry.description}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 md:absolute md:top-4 md:right-3 md:text-primary md:opacity-0 md:group-hover:opacity-100 md:transition-opacity" />
                    </Link>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </div>

        {/* Summary */}
        <section className="border-t border-border bg-muted/20 px-4 md:px-0">
          <div className="md:container md:mx-auto md:max-w-4xl md:px-6 py-8 md:py-12">
            <h2 className="text-base md:text-xl font-bold mb-4 md:mb-6 text-foreground">Category Summary</h2>
            <div className="space-y-1.5 md:space-y-2">
              {TAXONOMY.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between py-1.5 md:py-2 border-b border-border/50">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className={cn("text-[9px] font-mono font-bold px-1.5 md:px-2 py-0.5 rounded border uppercase", cat.badgeColor)}>
                      {cat.key}
                    </span>
                    <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden md:inline text-xs text-muted-foreground">{cat.subtitle}</span>
                    <span className="text-sm font-mono text-primary font-bold">{cat.entries.length}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 md:py-3 border-t border-border mt-1 md:mt-2">
                <span className="text-sm font-bold text-foreground">TOTAL</span>
                <span className="text-sm font-mono font-bold text-primary">{TOTAL}</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Flows */}
        <section className="border-t border-border px-4 md:px-0">
          <div className="md:container md:mx-auto md:max-w-4xl md:px-6 py-8 md:py-12">
            <h2 className="text-base md:text-xl font-bold mb-4 md:mb-6 text-foreground">How It All Connects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4">
              {FLOW_STEPS.map((item) => (
                <div key={item.step} className="p-3.5 md:p-4 rounded-lg border border-border bg-muted/20">
                  <div className="text-[10px] md:text-xs font-mono text-primary font-bold mb-0.5 md:mb-1">STEP {item.step}</div>
                  <h3 className="font-bold text-sm text-foreground mb-0.5 md:mb-1">{item.title}</h3>
                  <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <AuthorityLinkBlock currentPath="/architecture" />
      <EnhancedFooter />
    </>
  );
}
