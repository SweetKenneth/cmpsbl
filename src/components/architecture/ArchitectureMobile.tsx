/**
 * Architecture — Mobile Layout
 * Single-column cards, sticky category nav, no ASCII diagram
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
import { cn } from "@/lib/utils";
import { TAXONOMY, TOTAL } from "./architectureData";

export default function ArchitectureMobile() {
  return (
    <>
      <SEO
        title="Architecture — Agents, Engines, Layers & Organs | CMPSBL"
        description="Explore the complete 40-component substrate architecture organized into 4 categories."
        image="https://cmpsbl.com/og/systems.jpg"
        keywords={['AI substrate architecture', 'cognitive agents', 'AI engines', 'composable AI']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Architecture', url: 'https://cmpsbl.com/architecture' },
        ]}
      />
      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Compact Hero */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="px-4 relative">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-3 border border-border rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {TOTAL} Components
              </div>

              <h1 className="text-3xl font-bold tracking-tight mb-3">
                <span className="text-foreground">Substrate</span>{' '}
                <span className="text-primary">Architecture</span>
              </h1>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {TOTAL} autonomous components: Agents <em>decide</em>, Engines <em>process</em>,
                Layers <em>protect</em>, Organs <em>power</em>.
              </p>

              {/* Horizontal scroll category pills */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
                {TAXONOMY.map((cat) => (
                  <a
                    key={cat.key}
                    href={`#${cat.key}`}
                    className={cn(
                      "text-[10px] font-mono px-3 py-1.5 rounded-full border shrink-0 active:scale-95 transition-transform",
                      cat.badgeColor
                    )}
                  >
                    {cat.entries.length} {cat.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories — single column cards */}
        <div className="px-4 py-8 space-y-12">
          {TAXONOMY.map((cat) => (
            <section key={cat.key} id={cat.key}>
              {/* Category Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn(
                    "text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-widest",
                    cat.badgeColor
                  )}>
                    {cat.key}
                  </span>
                  <h2 className={cn(
                    "text-xl font-bold",
                    cat.textColor === 'text-muted-foreground' ? 'text-foreground' : cat.textColor
                  )}>
                    {cat.label}
                  </h2>
                  <span className="text-[10px] font-mono text-muted-foreground">{cat.entries.length}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
              </div>

              {/* Entry Cards — single column */}
              <div className="grid grid-cols-1 gap-2">
                {cat.entries.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/modules/${entry.slug}`}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-lg border active:scale-[0.98] transition-transform",
                      cat.color, cat.borderColor
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-background/50">
                      <entry.icon className={cn(
                        "w-4 h-4",
                        cat.textColor === 'text-muted-foreground' ? 'text-foreground/60' : cat.textColor
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">{entry.label}</h3>
                        <span className={cn(
                          "text-[10px] opacity-70",
                          cat.textColor === 'text-muted-foreground' ? 'text-foreground/50' : cat.textColor
                        )}>
                          {entry.tagline}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{entry.description}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Summary */}
        <section className="border-t border-border bg-muted/20 px-4 py-8">
          <h2 className="text-base font-bold mb-4 text-foreground">Summary</h2>
          <div className="space-y-1.5">
            {TAXONOMY.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between py-1.5 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase", cat.badgeColor)}>
                    {cat.key}
                  </span>
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                </div>
                <span className="text-sm font-mono text-primary font-bold">{cat.entries.length}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2 border-t border-border mt-1">
              <span className="text-sm font-bold text-foreground">TOTAL</span>
              <span className="text-sm font-mono font-bold text-primary">{TOTAL}</span>
            </div>
          </div>
        </section>

        {/* How It Flows — stacked */}
        <section className="border-t border-border px-4 py-8">
          <h2 className="text-base font-bold mb-4 text-foreground">How It Connects</h2>
          <div className="space-y-2.5">
            {[
              { step: '01', title: 'User sends a request', desc: 'DECODE interprets intent and plans execution.' },
              { step: '02', title: 'Agents invoke Engines', desc: 'BRAIN reasons, CORTEX orchestrates, Engines process.' },
              { step: '03', title: 'Layers validate', desc: 'DEFENSE checks threats, GOVERNANCE enforces policy.' },
              { step: '04', title: 'Organs route & persist', desc: 'CORE orchestrates, NERVE signals, AUDIT logs.' },
            ].map((item) => (
              <div key={item.step} className="p-3.5 rounded-lg border border-border bg-muted/20">
                <div className="text-[10px] font-mono text-primary font-bold mb-0.5">STEP {item.step}</div>
                <h3 className="font-bold text-sm text-foreground mb-0.5">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <AuthorityLinkBlock currentPath="/architecture" />
      <EnhancedFooter />
    </>
  );
}
