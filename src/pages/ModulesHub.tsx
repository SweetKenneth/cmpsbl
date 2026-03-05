/**
 * Systems Hub — Central index of all substrate execution surfaces
 * 1 Kernel + 9 Systems + 5 Mesh Overlays + 9 Hidden Zones
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
import { MODULE_REGISTRY, LAYER_COLORS, LAYER_LABELS, getPublicModules, getMeshOverlays } from "@/lib/modules/module-registry";
import { cn } from "@/lib/utils";

const DISPLAY_SECTIONS = [
  { key: 'public', label: 'Kernel & Systems', desc: 'The public execution surfaces — boot, cognition, orchestration, and connectivity', getter: getPublicModules },
  { key: 'mesh', label: 'Mesh Overlays', desc: 'Protective layers wrapping all systems: DEFENSE → IMMUNITY → EVOLUTION → INTENT → GOVERNANCE', getter: getMeshOverlays },
] as const;

export default function ModulesHub() {
  return (
    <>
      <SEO
        title="Substrate Systems — AI Architecture | CMPSBL"
        description="Browse all substrate execution surfaces — systems, mesh overlays, and hot-swappable zones powered by CORE kernel. Composable AI building blocks."
        image="https://cmpsbl.com/og/systems.jpg"
        keywords={['substrate systems', 'composable AI architecture', 'AI architecture layers', 'cognitive systems', 'composable AI']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Modules', url: 'https://cmpsbl.com/modules' },
        ]}
      />

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-14 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto max-w-5xl px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-3">
                Substrate Architecture
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Execution Surfaces.{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  One Intelligence.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Each surface is a specialized AI subsystem. Together, they form a cognitive operating system 
                that learns, adapts, and evolves — autonomously.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sections */}
        {DISPLAY_SECTIONS.map((section, sectionIdx) => {
          const items = section.getter();
          const colorKey = section.key === 'public' ? 'Module' : 'Mesh'; // internal key, not displayed
          return (
            <section key={section.key} className="py-8 sm:py-12">
              <div className="container mx-auto max-w-6xl px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: sectionIdx * 0.05 }}
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className={cn("h-8 w-1 rounded-full bg-gradient-to-b", LAYER_COLORS[colorKey])} />
                    <div>
                      <h2 className="text-2xl font-bold">{section.label}</h2>
                      <p className="text-sm text-muted-foreground">{section.desc}</p>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((mod) => (
                      <Link
                        key={mod.slug}
                        to={`/modules/${mod.slug}`}
                        className="group relative p-5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                            <mod.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-foreground">{mod.name}</h3>
                              <span className="text-[10px] font-mono text-muted-foreground">{mod.layer}</span>
                            </div>
                            <p className="text-sm font-medium text-primary/80 mb-2">{mod.tagline}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{mod.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Explore {mod.visibility === 'mesh' ? 'mesh' : 'system'} <ArrowRight className="w-3 h-3" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
          );
        })}
      </main>

      <AuthorityLinkBlock currentPath="/modules" />
      <EnhancedFooter />
    </>
  );
}
