/**
 * Architecture — Desktop Layout
 * Multi-column grids, ASCII diagram, spacious headers, hover effects
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
import { cn } from "@/lib/utils";
import { TAXONOMY, TOTAL, ASCII_DIAGRAM } from "./architectureData";

export default function ArchitectureDesktop() {
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
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

          <div className="container mx-auto max-w-5xl px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4 border border-border rounded-full px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {TOTAL} Components · 4 Categories
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <span className="text-foreground">Substrate</span>{' '}
                <span className="text-primary">Architecture</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                {TOTAL} autonomous components organized into four categories:
                Agents that <em>decide</em>, Engines that <em>process</em>,
                Layers that <em>protect</em>, and Organs that <em>power everything</em>.
              </p>

              {/* Category pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {TAXONOMY.map((cat, i) => (
                  <motion.a
                    key={cat.key}
                    href={`#${cat.key}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.3 }}
                    className={cn(
                      "text-xs font-mono px-3 py-1.5 rounded-full border transition-colors hover:bg-primary/10 hover:border-primary/30",
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

        {/* ASCII Diagram — desktop only */}
        <section className="border-y border-border bg-muted/20">
          <div className="container mx-auto max-w-4xl px-6 py-8">
            <h2 className="text-sm font-mono font-bold text-muted-foreground mb-4 uppercase tracking-widest">System Topology</h2>
            <pre className="text-xs font-mono text-foreground/80 leading-relaxed whitespace-pre">
              {ASCII_DIAGRAM}
            </pre>
          </div>
        </section>

        {/* All Categories — multi-column */}
        <div className="container mx-auto max-w-6xl px-6 py-12">
          <div className="space-y-16">
            {TAXONOMY.map((cat, catIdx) => (
              <motion.section
                key={cat.key}
                id={cat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: catIdx * 0.05 }}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-widest",
                      cat.badgeColor
                    )}>
                      {cat.key}
                    </span>
                    <h2 className={cn("text-2xl sm:text-3xl font-bold", cat.textColor === 'text-muted-foreground' ? 'text-foreground' : cat.textColor)}>
                      {cat.label}
                    </h2>
                    <span className="text-xs font-mono text-muted-foreground">{cat.entries.length} components</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{cat.subtitle} — {cat.description}</p>
                  <p className="text-xs text-muted-foreground/60 italic">{cat.philosophy}</p>
                </div>

                <div className={cn(
                  "grid gap-3",
                  cat.entries.length <= 3 ? "grid-cols-2 lg:grid-cols-3" :
                  cat.entries.length <= 8 ? "grid-cols-2 lg:grid-cols-4" :
                  "grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                )}>
                  {cat.entries.map((entry) => (
                    <Link
                      key={entry.id}
                      to={`/modules/${entry.slug}`}
                      className={cn(
                        "group relative p-4 rounded-lg border transition-all duration-300",
                        "hover:shadow-lg hover:-translate-y-0.5",
                        cat.color, cat.borderColor, "hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          "bg-background/50 group-hover:bg-primary/10 transition-colors"
                        )}>
                          <entry.icon className={cn(
                            "w-4 h-4 transition-colors",
                            cat.textColor === 'text-muted-foreground' ? 'text-foreground/60' : cat.textColor,
                            "group-hover:text-primary"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground mb-0.5">{entry.label}</h3>
                          <p className={cn(
                            "text-xs font-medium mb-1 opacity-80",
                            cat.textColor === 'text-muted-foreground' ? 'text-foreground/60' : cat.textColor
                          )}>{entry.tagline}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{entry.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="absolute top-4 right-3 w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        </div>

        {/* Summary */}
        <section className="border-t border-border bg-muted/20">
          <div className="container mx-auto max-w-4xl px-6 py-12">
            <h2 className="text-xl font-bold mb-6 text-foreground">Category Summary</h2>
            <div className="space-y-2">
              {TAXONOMY.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase",
                      cat.badgeColor
                    )}>{cat.key}</span>
                    <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{cat.subtitle}</span>
                    <span className="text-sm font-mono text-primary font-bold">{cat.entries.length}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 mt-2 border-t border-border">
                <span className="text-sm font-bold text-foreground">TOTAL</span>
                <span className="text-sm font-mono font-bold text-primary">{TOTAL}</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Flows — 2 column */}
        <section className="border-t border-border">
          <div className="container mx-auto max-w-4xl px-6 py-12">
            <h2 className="text-xl font-bold mb-6 text-foreground">How It All Connects</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { step: '01', title: 'User sends a request', desc: 'The DECODE Agent interprets the intent and plans the execution.' },
                { step: '02', title: 'Agents invoke Engines', desc: 'BRAIN Organ reasons, CORTEX Agent orchestrates, MEMORY Organ retrieves — Engines do the heavy processing.' },
                { step: '03', title: 'Layers validate everything', desc: 'DEFENSE Layer checks for threats, GOVERNANCE Layer enforces policy, IMMUNITY Layer ensures resilience.' },
                { step: '04', title: 'Organs route & persist', desc: 'CORE Organ orchestrates lifecycle, NERVE Organ signals, AUDIT Agent logs, RELAY Organ dispatches — all invisible.' },
              ].map((item) => (
                <div key={item.step} className="p-4 rounded-lg border border-border bg-muted/20">
                  <div className="text-xs font-mono text-primary font-bold mb-1">STEP {item.step}</div>
                  <h3 className="font-bold text-sm text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
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
